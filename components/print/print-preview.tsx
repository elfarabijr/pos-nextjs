"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Printer, Eye, CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react"
import { printerService, type PrinterInfo } from "@/utils/printerUtils"

interface PrintPreviewProps {
  isOpen: boolean
  onClose: () => void
  receiptData: any
  template: any
}

export function PrintPreview({ isOpen, onClose, receiptData, template }: PrintPreviewProps) {
  const [selectedPrinter, setSelectedPrinter] = useState<PrinterInfo | null>(null)
  const [printers, setPrinters] = useState<PrinterInfo[]>([])
  const [isPrinting, setIsPrinting] = useState(false)
  const [printProgress, setPrintProgress] = useState(0)
  const [printStatus, setPrintStatus] = useState<"idle" | "printing" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  useState(() => {
    if (isOpen) {
      loadPrinters()
    }
  }, [isOpen])

  const loadPrinters = async () => {
    try {
      const detectedPrinters = await printerService.detectPrinters()
      setPrinters(detectedPrinters)

      const defaultPrinter = detectedPrinters.find((p) => p.isDefault && p.status === "ready")
      if (defaultPrinter) {
        setSelectedPrinter(defaultPrinter)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load printers")
    }
  }

  const handlePrint = async () => {
    if (!selectedPrinter) {
      setError("Please select a printer")
      return
    }

    setIsPrinting(true)
    setPrintStatus("printing")
    setPrintProgress(0)
    setError(null)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setPrintProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const jobId = await printerService.printReceipt(selectedPrinter.id, receiptData, template)

      setPrintProgress(100)
      setPrintStatus("success")

      setTimeout(() => {
        setIsPrinting(false)
        setPrintProgress(0)
        setPrintStatus("idle")
        onClose()
      }, 2000)
    } catch (err) {
      setPrintStatus("error")
      setError(err instanceof Error ? err.message : "Print failed")
      setIsPrinting(false)
      setPrintProgress(0)
    }
  }

  const handlePreviewPrint = () => {
    if (previewRef.current) {
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        const content = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Receipt Preview</title>
            <style>
              body { font-family: 'Courier New', monospace; font-size: 12px; margin: 20px; }
              .receipt { max-width: 300px; margin: 0 auto; }
              .center { text-align: center; }
              .left { text-align: left; }
              .right { text-align: right; }
              .bold { font-weight: bold; }
              .large { font-size: 16px; }
              .divider { border-top: 1px solid #000; margin: 5px 0; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            ${previewRef.current.innerHTML}
          </body>
          </html>
        `
        printWindow.document.write(content)
        printWindow.document.close()
        printWindow.print()
        printWindow.close()
      }
    }
  }

  const renderReceiptPreview = () => {
    if (!template || !receiptData) return null

    return (
      <div className="font-mono text-sm space-y-1">
        {template.components.map((component: any, index: number) => {
          const align = component.props.align || "left"
          const fontSize = component.props.fontSize || "medium"
          const bold = component.props.bold ? "font-bold" : ""
          const italic = component.props.italic ? "italic" : ""

          const alignClass = {
            left: "text-left",
            center: "text-center",
            right: "text-right",
          }[align]

          const sizeClass = {
            small: "text-xs",
            medium: "text-sm",
            large: "text-lg",
            xl: "text-xl",
          }[fontSize]

          switch (component.type) {
            case "business-name":
              return (
                <div key={index} className={`${alignClass} ${sizeClass} ${bold}`}>
                  {component.props.text || receiptData.businessName}
                </div>
              )

            case "business-address":
              return (
                <div key={index} className={`${alignClass} text-xs space-y-0.5`}>
                  <div>{component.props.address || receiptData.businessAddress}</div>
                  {component.props.phone && <div>{component.props.phone}</div>}
                  {component.props.email && <div>{component.props.email}</div>}
                </div>
              )

            case "divider":
              return <div key={index} className="border-t border-gray-400 my-2" />

            case "spacer":
              return <div key={index} style={{ height: component.props.height || 10 }} />

            case "transaction-id":
              return (
                <div key={index} className={alignClass}>
                  {component.props.label} {receiptData.transactionId}
                </div>
              )

            case "date-time":
              return (
                <div key={index} className={alignClass}>
                  {receiptData.dateTime}
                </div>
              )

            case "cashier":
              return (
                <div key={index} className={alignClass}>
                  {component.props.label} {receiptData.cashier}
                </div>
              )

            case "items-table":
              return (
                <div key={index} className="space-y-1">
                  {component.props.showHeaders && (
                    <div className="flex justify-between border-b border-gray-300 pb-1">
                      <span className="flex-1">Item</span>
                      <span className="w-12 text-center">Qty</span>
                      <span className="w-16 text-right">Price</span>
                      <span className="w-16 text-right">Total</span>
                    </div>
                  )}
                  {receiptData.items.map((item: any, itemIndex: number) => (
                    <div key={itemIndex} className="flex justify-between">
                      <span className="flex-1 truncate">{item.name}</span>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <span className="w-16 text-right">${item.price.toFixed(2)}</span>
                      <span className="w-16 text-right">${item.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )

            case "subtotal":
              return (
                <div key={index} className="flex justify-between">
                  <span>{component.props.label}</span>
                  <span>${receiptData.subtotal.toFixed(2)}</span>
                </div>
              )

            case "tax":
              return (
                <div key={index} className="flex justify-between">
                  <span>{component.props.label}</span>
                  <span>${receiptData.tax.toFixed(2)}</span>
                </div>
              )

            case "discount":
              return receiptData.discount > 0 ? (
                <div key={index} className="flex justify-between">
                  <span>{component.props.label}</span>
                  <span>-${receiptData.discount.toFixed(2)}</span>
                </div>
              ) : null

            case "total":
              return (
                <div key={index} className={`flex justify-between ${sizeClass} ${bold} border-t border-gray-300 pt-1`}>
                  <span>{component.props.label}</span>
                  <span>${receiptData.total.toFixed(2)}</span>
                </div>
              )

            case "payment-method":
              return (
                <div key={index} className={alignClass}>
                  {component.props.label} {receiptData.paymentMethod}
                </div>
              )

            case "text":
            case "footer-message":
              return (
                <div key={index} className={`${alignClass} ${sizeClass} ${bold} ${italic}`}>
                  {component.props.text}
                </div>
              )

            default:
              return null
          }
        })}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-primary-200 shadow-tech-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-secondary-800">
            <Eye className="h-5 w-5 text-primary-600" />
            Print Preview
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Receipt Preview */}
          <Card className="tech-card">
            <CardHeader className="border-b border-primary-100">
              <CardTitle className="text-secondary-800">Receipt Preview</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 max-w-sm mx-auto shadow-inner">
                <div ref={previewRef}>{renderReceiptPreview()}</div>
              </div>
              <div className="flex justify-center mt-4">
                <Button
                  onClick={handlePreviewPrint}
                  variant="outline"
                  size="sm"
                  className="border-primary-200 text-primary-700 hover:bg-primary-50 bg-transparent"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Print
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Print Settings */}
          <div className="space-y-4">
            {/* Printer Selection */}
            <Card className="tech-card">
              <CardHeader className="border-b border-primary-100">
                <CardTitle className="text-secondary-800">Printer Settings</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-secondary-700 mb-2 block">Select Printer</label>
                  <Select
                    value={selectedPrinter?.id || ""}
                    onValueChange={(value) => {
                      const printer = printers.find((p) => p.id === value)
                      setSelectedPrinter(printer || null)
                    }}
                  >
                    <SelectTrigger className="border-primary-200 focus:border-primary-500 focus:ring-primary-500">
                      <SelectValue placeholder="Choose a printer" />
                    </SelectTrigger>
                    <SelectContent>
                      {printers
                        .filter((p) => p.status === "ready")
                        .map((printer) => (
                          <SelectItem key={printer.id} value={printer.id}>
                            <div className="flex items-center gap-2">
                              <span>{printer.name}</span>
                              {printer.isDefault && (
                                <Badge variant="secondary" className="bg-accent-100 text-accent-700 text-xs">
                                  Default
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPrinter && (
                  <div className="p-3 bg-primary-50 rounded-lg border border-primary-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Printer className="h-4 w-4 text-primary-600" />
                      <span className="font-medium text-primary-800">{selectedPrinter.name}</span>
                    </div>
                    <div className="text-sm text-primary-700 space-y-1">
                      <div>Type: {selectedPrinter.type}</div>
                      <div>Width: {selectedPrinter.capabilities.maxWidth}mm</div>
                      <div>Color: {selectedPrinter.capabilities.color ? "Yes" : "No"}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Print Status */}
            {(isPrinting || printStatus !== "idle") && (
              <Card className="tech-card">
                <CardHeader className="border-b border-primary-100">
                  <CardTitle className="text-secondary-800">Print Status</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {isPrinting && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
                        <span className="text-sm text-secondary-700">Printing receipt...</span>
                      </div>
                      <Progress value={printProgress} className="w-full" />
                      <div className="text-xs text-secondary-500 text-center">{printProgress}% complete</div>
                    </div>
                  )}

                  {printStatus === "success" && (
                    <div className="flex items-center gap-2 text-success-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Receipt printed successfully!</span>
                    </div>
                  )}

                  {printStatus === "error" && error && (
                    <Alert className="border-destructive-200 bg-destructive-50">
                      <XCircle className="h-4 w-4 text-destructive-600" />
                      <AlertDescription className="text-destructive-800">{error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Error Display */}
            {error && printStatus === "idle" && (
              <Alert className="border-destructive-200 bg-destructive-50">
                <AlertTriangle className="h-4 w-4 text-destructive-600" />
                <AlertDescription className="text-destructive-800">{error}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handlePrint}
                disabled={!selectedPrinter || isPrinting}
                className="flex-1 tech-button text-white"
              >
                {isPrinting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Printing...
                  </>
                ) : (
                  <>
                    <Printer className="h-4 w-4 mr-2" />
                    Print Receipt
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isPrinting}
                className="border-primary-200 text-primary-700 hover:bg-primary-50 bg-transparent"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
