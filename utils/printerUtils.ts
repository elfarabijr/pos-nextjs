export interface PrinterInfo {
  id: string
  name: string
  type: "thermal" | "inkjet" | "laser" | "unknown"
  status: "ready" | "busy" | "offline" | "error"
  isDefault: boolean
  capabilities: {
    color: boolean
    duplex: boolean
    paperSizes: string[]
    maxWidth: number // in mm
    maxHeight: number // in mm
  }
}

export interface PrintJob {
  id: string
  printerId: string
  status: "pending" | "printing" | "completed" | "failed"
  createdAt: Date
  completedAt?: Date
  error?: string
  retryCount: number
}

export class PrinterService {
  private static instance: PrinterService
  private printers: PrinterInfo[] = []
  private printJobs: Map<string, PrintJob> = new Map()
  private eventListeners: Map<string, Function[]> = new Map()

  static getInstance(): PrinterService {
    if (!PrinterService.instance) {
      PrinterService.instance = new PrinterService()
    }
    return PrinterService.instance
  }

  async detectPrinters(): Promise<PrinterInfo[]> {
    try {
      // Check if Web Serial API is available (for thermal printers)
      if ("serial" in navigator) {
        await this.detectSerialPrinters()
      }

      // Check for system printers using Web Print API
      if ("print" in window) {
        await this.detectSystemPrinters()
      }

      // Mock printers for development/demo
      if (this.printers.length === 0) {
        this.addMockPrinters()
      }

      this.emit("printersDetected", this.printers)
      return this.printers
    } catch (error) {
      console.error("Error detecting printers:", error)
      throw new Error("Failed to detect printers")
    }
  }

  private async detectSerialPrinters(): Promise<void> {
    try {
      // Request access to serial ports (thermal printers)
      const ports = await (navigator as any).serial.getPorts()

      for (const port of ports) {
        const info = port.getInfo()
        this.printers.push({
          id: `serial-${info.usbVendorId}-${info.usbProductId}`,
          name: `Thermal Printer (USB)`,
          type: "thermal",
          status: "ready",
          isDefault: this.printers.length === 0,
          capabilities: {
            color: false,
            duplex: false,
            paperSizes: ["80mm", "58mm"],
            maxWidth: 80,
            maxHeight: 1000,
          },
        })
      }
    } catch (error) {
      console.warn("Serial printer detection failed:", error)
    }
  }

  private async detectSystemPrinters(): Promise<void> {
    try {
      // This would integrate with system printer APIs
      // For now, we'll simulate system printer detection
      const systemPrinters = [
        {
          id: "system-default",
          name: "Default System Printer",
          type: "inkjet" as const,
          status: "ready" as const,
          isDefault: this.printers.length === 0,
          capabilities: {
            color: true,
            duplex: true,
            paperSizes: ["A4", "Letter", "80mm"],
            maxWidth: 210,
            maxHeight: 297,
          },
        },
      ]

      this.printers.push(...systemPrinters)
    } catch (error) {
      console.warn("System printer detection failed:", error)
    }
  }

  private addMockPrinters(): void {
    const mockPrinters: PrinterInfo[] = [
      {
        id: "thermal-001",
        name: "EPSON TM-T88VI (Thermal)",
        type: "thermal",
        status: "ready",
        isDefault: true,
        capabilities: {
          color: false,
          duplex: false,
          paperSizes: ["80mm", "58mm"],
          maxWidth: 80,
          maxHeight: 1000,
        },
      },
      {
        id: "inkjet-001",
        name: "HP DeskJet 3755",
        type: "inkjet",
        status: "ready",
        isDefault: false,
        capabilities: {
          color: true,
          duplex: false,
          paperSizes: ["A4", "Letter"],
          maxWidth: 210,
          maxHeight: 297,
        },
      },
      {
        id: "laser-001",
        name: "Brother HL-L2350DW",
        type: "laser",
        status: "offline",
        isDefault: false,
        capabilities: {
          color: false,
          duplex: true,
          paperSizes: ["A4", "Letter", "Legal"],
          maxWidth: 210,
          maxHeight: 297,
        },
      },
    ]

    this.printers = mockPrinters
  }

  getPrinters(): PrinterInfo[] {
    return [...this.printers]
  }

  getPrinter(id: string): PrinterInfo | undefined {
    return this.printers.find((p) => p.id === id)
  }

  getDefaultPrinter(): PrinterInfo | undefined {
    return this.printers.find((p) => p.isDefault)
  }

  setDefaultPrinter(id: string): boolean {
    const printer = this.printers.find((p) => p.id === id)
    if (!printer) return false

    this.printers.forEach((p) => (p.isDefault = false))
    printer.isDefault = true

    this.emit("defaultPrinterChanged", printer)
    return true
  }

  async printReceipt(printerId: string, receiptData: any, template: any): Promise<string> {
    const printer = this.getPrinter(printerId)
    if (!printer) {
      throw new Error("Printer not found")
    }

    if (printer.status !== "ready") {
      throw new Error(`Printer is ${printer.status}`)
    }

    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const printJob: PrintJob = {
      id: jobId,
      printerId,
      status: "pending",
      createdAt: new Date(),
      retryCount: 0,
    }

    this.printJobs.set(jobId, printJob)
    this.emit("printJobCreated", printJob)

    try {
      // Update printer status
      printer.status = "busy"
      this.emit("printerStatusChanged", printer)

      // Generate print content based on printer type
      const printContent = await this.generatePrintContent(printer, receiptData, template)

      // Simulate printing process
      await this.executePrint(printer, printContent)

      // Update job status
      printJob.status = "completed"
      printJob.completedAt = new Date()

      printer.status = "ready"
      this.emit("printJobCompleted", printJob)
      this.emit("printerStatusChanged", printer)

      return jobId
    } catch (error) {
      printJob.status = "failed"
      printJob.error = error instanceof Error ? error.message : "Unknown error"
      printJob.completedAt = new Date()

      printer.status = "ready"
      this.emit("printJobFailed", printJob)
      this.emit("printerStatusChanged", printer)

      throw error
    }
  }

  private async generatePrintContent(printer: PrinterInfo, receiptData: any, template: any): Promise<string> {
    switch (printer.type) {
      case "thermal":
        return this.generateThermalContent(receiptData, template, printer.capabilities.maxWidth)
      case "inkjet":
      case "laser":
        return this.generateStandardContent(receiptData, template)
      default:
        return this.generateStandardContent(receiptData, template)
    }
  }

  private generateThermalContent(receiptData: any, template: any, maxWidth: number): string {
    // Generate ESC/POS commands for thermal printers
    let content = ""

    // Initialize printer
    content += "\x1B\x40" // ESC @ - Initialize printer
    content += "\x1B\x61\x01" // ESC a 1 - Center alignment

    // Process template components
    template.components.forEach((component: any) => {
      switch (component.type) {
        case "business-name":
          content += "\x1B\x21\x30" // ESC ! 48 - Double height and width
          content += component.props.text || receiptData.businessName
          content += "\n"
          content += "\x1B\x21\x00" // ESC ! 0 - Normal size
          break

        case "business-address":
          content += "\x1B\x61\x01" // Center alignment
          content += component.props.address || receiptData.businessAddress
          content += "\n"
          if (component.props.phone) {
            content += component.props.phone + "\n"
          }
          break

        case "divider":
          content += "\x1B\x61\x01" // Center alignment
          content += "-".repeat(maxWidth === 80 ? 48 : 32) + "\n"
          break

        case "transaction-id":
          content += "\x1B\x61\x00" // Left alignment
          content += `${component.props.label} ${receiptData.transactionId}\n`
          break

        case "date-time":
          content += "\x1B\x61\x00" // Left alignment
          content += receiptData.dateTime + "\n"
          break

        case "items-table":
          content += "\x1B\x61\x00" // Left alignment
          if (component.props.showHeaders) {
            content += this.formatThermalTableRow("Item", "Qty", "Price", "Total", maxWidth)
            content += "-".repeat(maxWidth === 80 ? 48 : 32) + "\n"
          }

          receiptData.items.forEach((item: any) => {
            content += this.formatThermalTableRow(
              item.name.substring(0, 20),
              item.quantity.toString(),
              `$${item.price.toFixed(2)}`,
              `$${item.total.toFixed(2)}`,
              maxWidth,
            )
          })
          break

        case "total":
          content += "\x1B\x61\x02" // Right alignment
          content += "\x1B\x21\x20" // ESC ! 32 - Double width
          content += `${component.props.label} $${receiptData.total.toFixed(2)}\n`
          content += "\x1B\x21\x00" // Normal size
          break

        case "footer-message":
          content += "\x1B\x61\x01" // Center alignment
          content += component.props.text + "\n"
          break
      }
    })

    // Cut paper
    content += "\x1D\x56\x41" // GS V A - Partial cut

    return content
  }

  private formatThermalTableRow(item: string, qty: string, price: string, total: string, maxWidth: number): string {
    const width = maxWidth === 80 ? 48 : 32
    const itemWidth = width - 16 // Reserve space for qty, price, total

    let row = item.padEnd(itemWidth).substring(0, itemWidth)
    row += qty.padStart(3)
    row += price.padStart(7)
    row += total.padStart(6)

    return row + "\n"
  }

  private generateStandardContent(receiptData: any, template: any): string {
    // Generate HTML content for standard printers
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Receipt</title>
        <style>
          body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 20px; }
          .receipt { max-width: 300px; margin: 0 auto; }
          .center { text-align: center; }
          .left { text-align: left; }
          .right { text-align: right; }
          .bold { font-weight: bold; }
          .large { font-size: 16px; }
          .divider { border-top: 1px solid #000; margin: 5px 0; }
          .items-table { width: 100%; border-collapse: collapse; }
          .items-table th, .items-table td { padding: 2px; text-align: left; }
          .items-table .qty, .items-table .price, .items-table .total { text-align: right; }
        </style>
      </head>
      <body>
        <div class="receipt">
    `

    template.components.forEach((component: any) => {
      const align = component.props.align || "left"
      const fontSize = component.props.fontSize || "medium"
      const bold = component.props.bold ? "bold" : ""
      const italic = component.props.italic ? "italic" : ""

      switch (component.type) {
        case "business-name":
          html += `<div class="${align} ${fontSize} ${bold}">${component.props.text || receiptData.businessName}</div>`
          break

        case "business-address":
          html += `<div class="${align}">`
          html += `<div>${component.props.address || receiptData.businessAddress}</div>`
          if (component.props.phone) html += `<div>${component.props.phone}</div>`
          if (component.props.email) html += `<div>${component.props.email}</div>`
          html += `</div>`
          break

        case "divider":
          html += `<div class="divider"></div>`
          break

        case "spacer":
          html += `<div style="height: ${component.props.height || 10}px;"></div>`
          break

        case "transaction-id":
          html += `<div class="${align}">${component.props.label} ${receiptData.transactionId}</div>`
          break

        case "date-time":
          html += `<div class="${align}">${receiptData.dateTime}</div>`
          break

        case "items-table":
          html += `<table class="items-table">`
          if (component.props.showHeaders) {
            html += `<tr><th>Item</th><th class="qty">Qty</th><th class="price">Price</th><th class="total">Total</th></tr>`
          }
          receiptData.items.forEach((item: any) => {
            html += `<tr>
              <td>${item.name}</td>
              <td class="qty">${item.quantity}</td>
              <td class="price">$${item.price.toFixed(2)}</td>
              <td class="total">$${item.total.toFixed(2)}</td>
            </tr>`
          })
          html += `</table>`
          break

        case "subtotal":
          html += `<div class="${align}"><span>${component.props.label}</span> <span style="float: right;">$${receiptData.subtotal.toFixed(2)}</span></div>`
          break

        case "tax":
          html += `<div class="${align}"><span>${component.props.label}</span> <span style="float: right;">$${receiptData.tax.toFixed(2)}</span></div>`
          break

        case "discount":
          if (receiptData.discount > 0) {
            html += `<div class="${align}"><span>${component.props.label}</span> <span style="float: right;">-$${receiptData.discount.toFixed(2)}</span></div>`
          }
          break

        case "total":
          html += `<div class="${align} ${fontSize} ${bold}"><span>${component.props.label}</span> <span style="float: right;">$${receiptData.total.toFixed(2)}</span></div>`
          break

        case "payment-method":
          html += `<div class="${align}">${component.props.label} ${receiptData.paymentMethod}</div>`
          break

        case "text":
        case "footer-message":
          html += `<div class="${align} ${fontSize} ${bold} ${italic}">${component.props.text}</div>`
          break
      }
    })

    html += `
        </div>
      </body>
      </html>
    `

    return html
  }

  private async executePrint(printer: PrinterInfo, content: string): Promise<void> {
    // Simulate printing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    if (printer.type === "thermal") {
      // For thermal printers, we would send ESC/POS commands to the printer
      // This would typically involve serial communication
      console.log("Sending thermal print data:", content)
    } else {
      // For standard printers, we would use the browser's print API
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(content)
        printWindow.document.close()
        printWindow.print()
        printWindow.close()
      }
    }

    // Simulate potential printing errors
    if (Math.random() < 0.1) {
      // 10% chance of error
      throw new Error("Paper jam detected")
    }
  }

  async retryPrintJob(jobId: string): Promise<void> {
    const job = this.printJobs.get(jobId)
    if (!job || job.status !== "failed") {
      throw new Error("Job not found or not in failed state")
    }

    if (job.retryCount >= 3) {
      throw new Error("Maximum retry attempts exceeded")
    }

    job.retryCount++
    job.status = "pending"
    delete job.error

    this.emit("printJobRetry", job)

    // This would re-execute the original print request
    // For now, we'll just simulate success
    setTimeout(() => {
      job.status = "completed"
      job.completedAt = new Date()
      this.emit("printJobCompleted", job)
    }, 1000)
  }

  getPrintJobs(): PrintJob[] {
    return Array.from(this.printJobs.values())
  }

  getPrintJob(jobId: string): PrintJob | undefined {
    return this.printJobs.get(jobId)
  }

  // Event system
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach((callback) => callback(data))
    }
  }
}

export const printerService = PrinterService.getInstance()
