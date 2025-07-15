"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Scan, Check, X } from "lucide-react"
import { BarcodeScanner } from "./barcode-scanner"
import { validateBarcode, formatBarcodeForDisplay, type BarcodeResult } from "@/utils/barcodeUtils"
import { cn } from "@/lib/utils"

interface BarcodeInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  required?: boolean
  disabled?: boolean
}

export function BarcodeInput({
  value,
  onChange,
  placeholder = "Enter barcode",
  className,
  required,
  disabled,
}: BarcodeInputProps) {
  const [showScanner, setShowScanner] = useState(false)
  const [validation, setValidation] = useState<BarcodeResult | null>(null)

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue)

    if (inputValue.trim()) {
      const result = validateBarcode(inputValue)
      setValidation(result)
    } else {
      setValidation(null)
    }
  }

  const handleScan = (result: BarcodeResult) => {
    if (result.isValid) {
      onChange(result.code)
      setValidation(result)
      setShowScanner(false)
    }
  }

  const getValidationColor = () => {
    if (!validation) return ""
    return validation.isValid ? "text-green-600" : "text-red-600"
  }

  const getValidationIcon = () => {
    if (!validation) return null
    return validation.isValid ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-red-600" />
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              className,
              validation && !validation.isValid && "border-red-300 focus:border-red-500 focus:ring-red-500",
            )}
            required={required}
            disabled={disabled}
          />
          {validation && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">{getValidationIcon()}</div>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowScanner(true)}
          disabled={disabled}
          className="px-3"
        >
          <Scan className="h-4 w-4" />
        </Button>
      </div>

      {validation && (
        <div className="flex items-center gap-2 text-sm">
          <Badge
            variant={validation.isValid ? "default" : "destructive"}
            className={validation.isValid ? "bg-green-100 text-green-800" : ""}
          >
            {validation.format}
          </Badge>
          {validation.isValid && value && (
            <span className="text-muted-foreground">{formatBarcodeForDisplay(value, validation.format)}</span>
          )}
          {!validation.isValid && <span className="text-red-600 text-xs">Invalid barcode format</span>}
        </div>
      )}

      <BarcodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScan}
        title="Scan Barcode"
      />
    </div>
  )
}
