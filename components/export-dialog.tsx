"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { FileSpreadsheet, FileText, Download, Calendar, Filter } from "lucide-react"
import { ExportService } from "@/utils/exportUtils"

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
  reportType: "sales" | "products" | "inventory" | "daily"
  data: any[]
}

export function ExportDialog({ isOpen, onClose, reportType, data }: ExportDialogProps) {
  const [exportFormat, setExportFormat] = useState<"xlsx" | "pdf">("xlsx")
  const [dateRange, setDateRange] = useState("last-30-days")
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")
  const [includeDetails, setIncludeDetails] = useState(true)
  const [includeSummary, setIncludeSummary] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [filename, setFilename] = useState(`${reportType}-report-${new Date().toISOString().split("T")[0]}`)

  const handleExport = async () => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 20
        })
      }, 200)

      // Filter data based on date range if needed
      let filteredData = data

      if (dateRange === "custom" && customStartDate && customEndDate) {
        const startDate = new Date(customStartDate)
        const endDate = new Date(customEndDate)

        filteredData = data.filter((item) => {
          const itemDate = new Date(item.date || item.lastRestocked || Date.now())
          return itemDate >= startDate && itemDate <= endDate
        })
      }

      // Export based on format and type
      if (exportFormat === "xlsx") {
        if (reportType === "sales") {
          await ExportService.exportSalesReportToXLSX(filteredData, filename)
        } else if (reportType === "products") {
          await ExportService.exportProductSalesToXLSX(filteredData, filename)
        }
      } else {
        if (reportType === "sales" || reportType === "daily") {
          await ExportService.exportDailySalesToPDF(filteredData, filename)
        }
      }

      setExportProgress(100)

      setTimeout(() => {
        setIsExporting(false)
        setExportProgress(0)
        onClose()
      }, 1000)
    } catch (error) {
      console.error("Export failed:", error)
      setIsExporting(false)
      setExportProgress(0)
      alert("Export failed. Please try again.")
    }
  }

  const getReportTitle = () => {
    switch (reportType) {
      case "sales":
        return "Sales Report"
      case "products":
        return "Product Sales Report"
      case "inventory":
        return "Inventory Report"
      case "daily":
        return "Daily Sales Report"
      default:
        return "Report"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white border-primary-200 shadow-tech-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-secondary-800">
            <Download className="h-5 w-5 text-primary-600" />
            Export {getReportTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Format */}
          <div className="grid grid-cols-2 gap-4">
            <Card
              className={`cursor-pointer transition-all duration-200 ${
                exportFormat === "xlsx"
                  ? "border-primary-500 bg-primary-50 shadow-tech"
                  : "border-primary-200 hover:border-primary-300"
              }`}
              onClick={() => setExportFormat("xlsx")}
            >
              <CardContent className="p-4 text-center">
                <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-success-600" />
                <p className="font-medium text-secondary-800">Excel (XLSX)</p>
                <p className="text-xs text-secondary-500">Spreadsheet format</p>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all duration-200 ${
                exportFormat === "pdf"
                  ? "border-primary-500 bg-primary-50 shadow-tech"
                  : "border-primary-200 hover:border-primary-300"
              }`}
              onClick={() => setExportFormat("pdf")}
            >
              <CardContent className="p-4 text-center">
                <FileText className="h-8 w-8 mx-auto mb-2 text-destructive-500" />
                <p className="font-medium text-secondary-800">PDF</p>
                <p className="text-xs text-secondary-500">Document format</p>
              </CardContent>
            </Card>
          </div>

          {/* Filename */}
          <div className="space-y-2">
            <Label htmlFor="filename" className="text-secondary-700 font-medium">
              Filename
            </Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="border-primary-200 focus:border-primary-500 focus:ring-primary-500"
              placeholder="Enter filename"
            />
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label className="text-secondary-700 font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date Range
            </Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="border-primary-200 focus:border-primary-500 focus:ring-primary-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                <SelectItem value="last-90-days">Last 90 Days</SelectItem>
                <SelectItem value="current-month">Current Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range */}
          {dateRange === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-secondary-700 font-medium">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="border-primary-200 focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-secondary-700 font-medium">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="border-primary-200 focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>
          )}

          {/* Export Options */}
          <div className="space-y-3">
            <Label className="text-secondary-700 font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Include in Export
            </Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="summary"
                  checked={includeSummary}
                  onCheckedChange={(checked) => setIncludeSummary(checked as boolean)}
                />
                <Label htmlFor="summary" className="text-sm text-secondary-600">
                  Summary information
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="details"
                  checked={includeDetails}
                  onCheckedChange={(checked) => setIncludeDetails(checked as boolean)}
                />
                <Label htmlFor="details" className="text-sm text-secondary-600">
                  Detailed transaction data
                </Label>
              </div>
            </div>
          </div>

          {/* Export Progress */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-secondary-700">Exporting...</span>
                <span className="text-secondary-500">{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="w-full" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleExport}
              disabled={isExporting || !filename.trim()}
              className="flex-1 tech-button text-white font-semibold"
            >
              {isExporting ? "Exporting..." : `Export ${exportFormat.toUpperCase()}`}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isExporting}
              className="flex-1 border-primary-200 text-primary-700 hover:bg-primary-50 bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
