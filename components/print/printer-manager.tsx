"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Printer, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle, WifiOff } from "lucide-react"
import { printerService, type PrinterInfo, type PrintJob } from "@/utils/printerUtils"

interface PrinterManagerProps {
  isOpen: boolean
  onClose: () => void
  onPrinterSelected?: (printer: PrinterInfo) => void
}

export function PrinterManager({ isOpen, onClose, onPrinterSelected }: PrinterManagerProps) {
  const [printers, setPrinters] = useState<PrinterInfo[]>([])
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([])
  const [isDetecting, setIsDetecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPrinterId, setSelectedPrinterId] = useState<string>("")

  useEffect(() => {
    if (isOpen) {
      loadPrinters()
      loadPrintJobs()

      // Set up event listeners
      const handlePrinterStatusChanged = (printer: PrinterInfo) => {
        setPrinters((prev) => prev.map((p) => (p.id === printer.id ? printer : p)))
      }

      const handlePrintJobUpdate = () => {
        loadPrintJobs()
      }

      printerService.on("printerStatusChanged", handlePrinterStatusChanged)
      printerService.on("printJobCompleted", handlePrintJobUpdate)
      printerService.on("printJobFailed", handlePrintJobUpdate)
      printerService.on("printJobCreated", handlePrintJobUpdate)

      return () => {
        printerService.off("printerStatusChanged", handlePrinterStatusChanged)
        printerService.off("printJobCompleted", handlePrintJobUpdate)
        printerService.off("printJobFailed", handlePrintJobUpdate)
        printerService.off("printJobCreated", handlePrintJobUpdate)
      }
    }
  }, [isOpen])

  const loadPrinters = async () => {
    try {
      const detectedPrinters = await printerService.detectPrinters()
      setPrinters(detectedPrinters)

      const defaultPrinter = detectedPrinters.find((p) => p.isDefault)
      if (defaultPrinter) {
        setSelectedPrinterId(defaultPrinter.id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load printers")
    }
  }

  const loadPrintJobs = () => {
    const jobs = printerService.getPrintJobs()
    setPrintJobs(jobs.slice(-10)) // Show last 10 jobs
  }

  const handleDetectPrinters = async () => {
    setIsDetecting(true)
    setError(null)

    try {
      await loadPrinters()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to detect printers")
    } finally {
      setIsDetecting(false)
    }
  }

  const handleSetDefault = (printerId: string) => {
    printerService.setDefaultPrinter(printerId)
    setPrinters((prev) => prev.map((p) => ({ ...p, isDefault: p.id === printerId })))
  }

  const handleSelectPrinter = () => {
    const printer = printers.find((p) => p.id === selectedPrinterId)
    if (printer && onPrinterSelected) {
      onPrinterSelected(printer)
      onClose()
    }
  }

  const handleRetryJob = async (jobId: string) => {
    try {
      await printerService.retryPrintJob(jobId)
      loadPrintJobs()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to retry print job")
    }
  }

  const getStatusIcon = (status: PrinterInfo["status"]) => {
    switch (status) {
      case "ready":
        return <CheckCircle className="h-4 w-4 text-success-500" />
      case "busy":
        return <Clock className="h-4 w-4 text-warning-500" />
      case "offline":
        return <WifiOff className="h-4 w-4 text-secondary-400" />
      case "error":
        return <XCircle className="h-4 w-4 text-destructive-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-warning-500" />
    }
  }

  const getStatusBadge = (status: PrinterInfo["status"]) => {
    const variants = {
      ready: "default",
      busy: "secondary",
      offline: "secondary",
      error: "destructive",
    } as const

    return (
      <Badge
        variant={variants[status]}
        className={
          status === "ready" ? "bg-success-500 text-white" : status === "busy" ? "bg-warning-500 text-white" : ""
        }
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getJobStatusIcon = (status: PrintJob["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive-500" />
      case "printing":
        return <Clock className="h-4 w-4 text-warning-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-secondary-400" />
      default:
        return <AlertTriangle className="h-4 w-4 text-warning-500" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-primary-200 shadow-tech-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-secondary-800">
            <Printer className="h-5 w-5 text-primary-600" />
            Printer Management
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert className="border-destructive-200 bg-destructive-50">
              <AlertTriangle className="h-4 w-4 text-destructive-600" />
              <AlertDescription className="text-destructive-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Printer Detection */}
          <Card className="tech-card">
            <CardHeader className="border-b border-primary-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-secondary-800">Available Printers</CardTitle>
                <Button
                  onClick={handleDetectPrinters}
                  disabled={isDetecting}
                  variant="outline"
                  size="sm"
                  className="border-primary-200 text-primary-700 hover:bg-primary-50 bg-transparent"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isDetecting ? "animate-spin" : ""}`} />
                  {isDetecting ? "Detecting..." : "Refresh"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {printers.length === 0 ? (
                <div className="text-center py-8 text-secondary-500">
                  <Printer className="h-12 w-12 mx-auto mb-4 text-secondary-300" />
                  <p>No printers detected</p>
                  <p className="text-sm">Click "Refresh" to detect printers</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {printers.map((printer) => (
                    <div
                      key={printer.id}
                      className={`p-4 border rounded-lg transition-all duration-200 ${
                        selectedPrinterId === printer.id
                          ? "border-primary-500 bg-primary-50"
                          : "border-primary-200 hover:border-primary-300"
                      }`}
                      onClick={() => setSelectedPrinterId(printer.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            {getStatusIcon(printer.status)}
                          </div>
                          <div>
                            <h3 className="font-medium text-secondary-800 flex items-center gap-2">
                              {printer.name}
                              {printer.isDefault && (
                                <Badge variant="secondary" className="bg-accent-100 text-accent-700 text-xs">
                                  Default
                                </Badge>
                              )}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-secondary-600">
                              <span className="capitalize">{printer.type}</span>
                              <span>•</span>
                              <span>{printer.capabilities.maxWidth}mm width</span>
                              {printer.capabilities.color && (
                                <>
                                  <span>•</span>
                                  <span>Color</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(printer.status)}
                          {!printer.isDefault && printer.status === "ready" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSetDefault(printer.id)
                              }}
                              className="text-xs border-primary-200 text-primary-700 hover:bg-primary-50"
                            >
                              Set Default
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Print Jobs */}
          <Card className="tech-card">
            <CardHeader className="border-b border-primary-100">
              <CardTitle className="text-secondary-800">Recent Print Jobs</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {printJobs.length === 0 ? (
                <div className="text-center py-4 text-secondary-500">
                  <p>No recent print jobs</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {printJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-3 border border-primary-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getJobStatusIcon(job.status)}
                        <div>
                          <p className="text-sm font-medium text-secondary-800">Job #{job.id.split("-")[1]}</p>
                          <p className="text-xs text-secondary-500">
                            {job.createdAt.toLocaleString()}
                            {job.error && ` • ${job.error}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            job.status === "completed"
                              ? "default"
                              : job.status === "failed"
                                ? "destructive"
                                : "secondary"
                          }
                          className={job.status === "completed" ? "bg-success-500 text-white" : ""}
                        >
                          {job.status}
                        </Badge>
                        {job.status === "failed" && job.retryCount < 3 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRetryJob(job.id)}
                            className="text-xs border-primary-200 text-primary-700 hover:bg-primary-50"
                          >
                            Retry
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Printer Selection */}
          {onPrinterSelected && (
            <Card className="tech-card">
              <CardHeader className="border-b border-primary-100">
                <CardTitle className="text-secondary-800">Select Printer for Receipt</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Select value={selectedPrinterId} onValueChange={setSelectedPrinterId}>
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
                  <Button
                    onClick={handleSelectPrinter}
                    disabled={!selectedPrinterId}
                    className="tech-button text-white"
                  >
                    Select Printer
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-primary-200 text-primary-700 hover:bg-primary-50 bg-transparent"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
