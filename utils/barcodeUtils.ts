export interface BarcodeResult {
  code: string
  format: string
  isValid: boolean
}

export interface BarcodeFormat {
  name: string
  pattern: RegExp
  length: number[]
  checkDigit?: boolean
}

export const BARCODE_FORMATS: Record<string, BarcodeFormat> = {
  EAN13: {
    name: "EAN-13",
    pattern: /^\d{13}$/,
    length: [13],
    checkDigit: true,
  },
  EAN8: {
    name: "EAN-8",
    pattern: /^\d{8}$/,
    length: [8],
    checkDigit: true,
  },
  UPC: {
    name: "UPC-A",
    pattern: /^\d{12}$/,
    length: [12],
    checkDigit: true,
  },
  CODE128: {
    name: "Code 128",
    pattern: /^[\x00-\x7F]+$/,
    length: [1, 48], // Variable length
  },
  CODE39: {
    name: "Code 39",
    pattern: /^[A-Z0-9\-. $/+%]+$/,
    length: [1, 43], // Variable length
  },
}

export function validateBarcode(code: string): BarcodeResult {
  if (!code || code.trim().length === 0) {
    return { code, format: "Unknown", isValid: false }
  }

  const cleanCode = code.trim().toUpperCase()

  // Check each format
  for (const [formatKey, format] of Object.entries(BARCODE_FORMATS)) {
    if (format.pattern.test(cleanCode)) {
      const length = cleanCode.length
      const validLength =
        format.length.length === 2
          ? length >= format.length[0] && length <= format.length[1]
          : format.length.includes(length)

      if (validLength) {
        // Additional validation for formats with check digits
        if (format.checkDigit && formatKey === "EAN13") {
          const isValidCheckDigit = validateEAN13CheckDigit(cleanCode)
          return { code: cleanCode, format: format.name, isValid: isValidCheckDigit }
        }

        return { code: cleanCode, format: format.name, isValid: true }
      }
    }
  }

  return { code: cleanCode, format: "Unknown", isValid: false }
}

export function validateEAN13CheckDigit(code: string): boolean {
  if (code.length !== 13) return false

  const digits = code.split("").map(Number)
  const checkDigit = digits.pop()!

  let sum = 0
  for (let i = 0; i < digits.length; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3)
  }

  const calculatedCheckDigit = (10 - (sum % 10)) % 10
  return calculatedCheckDigit === checkDigit
}

export function generateEAN13CheckDigit(code: string): string {
  if (code.length !== 12) return code

  const digits = code.split("").map(Number)
  let sum = 0

  for (let i = 0; i < digits.length; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3)
  }

  const checkDigit = (10 - (sum % 10)) % 10
  return code + checkDigit
}

export function formatBarcodeForDisplay(code: string, format: string): string {
  switch (format) {
    case "EAN-13":
      if (code.length === 13) {
        return `${code.slice(0, 1)} ${code.slice(1, 7)} ${code.slice(7, 13)}`
      }
      break
    case "EAN-8":
      if (code.length === 8) {
        return `${code.slice(0, 4)} ${code.slice(4, 8)}`
      }
      break
    case "UPC-A":
      if (code.length === 12) {
        return `${code.slice(0, 1)} ${code.slice(1, 6)} ${code.slice(6, 11)} ${code.slice(11, 12)}`
      }
      break
  }
  return code
}

export function generateRandomBarcode(format: "EAN13" | "EAN8" | "UPC" = "EAN13"): string {
  switch (format) {
    case "EAN13":
      const ean13Base = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("")
      return generateEAN13CheckDigit(ean13Base)

    case "EAN8":
      const ean8Base = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10)).join("")
      // Simplified check digit for EAN8
      return ean8Base + Math.floor(Math.random() * 10)

    case "UPC":
      return Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("")

    default:
      return Array.from({ length: 13 }, () => Math.floor(Math.random() * 10)).join("")
  }
}
