"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, DollarSign, ShoppingCart, Package, Download, Filter, BarChart3 } from "lucide-react"
import { Layout } from "@/components/layout"
import { ExportDialog } from "@/components/export-dialog"

// Mock sales data
const mockSalesData = {
  daily: [
    { date: "2024-01-14", sales: 2450.75, transactions: 45, items: 128 },
    { date: "2024-01-13", sales: 1890.5, transactions: 38, items: 95 },
    { date: "2024-01-12", sales: 3200.25, transactions: 52, items: 156 },
    { date: "2024-01-11", sales: 2100.0, transactions: 41, items: 112 },
    { date: "2024-01-10", sales: 2750.8, transactions: 47, items: 134 },
  ],
  weekly: [
    { week: "Week 2 (Jan 8-14)", sales: 12391.3, transactions: 223, items: 625 },
    { week: "Week 1 (Jan 1-7)", sales: 10850.75, transactions: 198, items: 542 },
  ],
  monthly: [
    { month: "January 2024", sales: 23242.05, transactions: 421, items: 1167 },
    { month: "December 2023", sales: 28500.5, transactions: 485, items: 1342 },
  ],
}

const mockProductSales = [
  { name: "iPhone 15 Pro", category: "Electronics", quantity: 15, revenue: 14999.85, profit: 2250.0 },
  { name: "Samsung Galaxy S24", category: "Electronics", quantity: 12, revenue: 10799.88, profit: 1620.0 },
  { name: "Nike Air Max", category: "Footwear", quantity: 25, revenue: 3249.75, profit: 812.44 },
  { name: "MacBook Pro", category: "Electronics", quantity: 8, revenue: 15999.92, profit: 3200.0 },
  { name: "AirPods Pro", category: "Electronics", quantity: 30, revenue: 7499.7, profit: 1875.0 },
]

const mockCategorySales = [
  { category: "Electronics", sales: 49299.35, percentage: 68.5 },
  { category: "Footwear", sales: 12450.25, percentage: 17.3 },
  { category: "Clothing", sales: 8750.4, percentage: 12.2 },
  { category: "Accessories", sales: 1500.0, percentage: 2.0 },
]

export default function ReportsPage() {
  const [reportType, setReportType] = useState("daily")
  const [dateRange, setDateRange] = useState("last-7-days")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [exportReportType, setExportReportType] = useState<"sales" | "products" | "inventory" | "daily">("daily")

  const getCurrentData = () => {
    switch (reportType) {
      case "weekly":
        return mockSalesData.weekly
      case "monthly":
        return mockSalesData.monthly
      default:
        return mockSalesData.daily
    }
  }

  const getTotalSales = () => {
    return getCurrentData().reduce((sum, item) => sum + item.sales, 0)
  }

  const getTotalTransactions = () => {
    return getCurrentData().reduce((sum, item) => sum + item.transactions, 0)
  }

  const getAverageSale = () => {
    const total = getTotalSales()
    const transactions = getTotalTransactions()
    return transactions > 0 ? total / transactions : 0
  }

  const handleExportReport = (type: "sales" | "products" | "inventory" | "daily") => {
    setExportReportType(type)
    setShowExportDialog(true)
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Sales Reports</h1>
            <p className="text-muted-foreground">Analyze your sales performance and trends</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleExportReport("daily")} className="h-12 px-6 tech-button text-white">
              <Download className="mr-2 h-5 w-5" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Report Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label>Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                    <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                    <SelectItem value="last-90-days">Last 90 Days</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="footwear">Footwear</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Custom Date</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={dateRange !== "custom"}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${getTotalSales().toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">+12.5% from last period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTotalTransactions()}</div>
              <p className="text-xs text-muted-foreground">+8.2% from last period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${getAverageSale().toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">+3.8% from last period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getCurrentData().reduce((sum, item) => sum + item.items, 0)}</div>
              <p className="text-xs text-muted-foreground">+15.3% from last period</p>
            </CardContent>
          </Card>
        </div>

        {/* Sales Data Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Sales Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {reportType === "daily" ? "Date" : reportType === "weekly" ? "Week" : "Month"}
                    </TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Items Sold</TableHead>
                    <TableHead>Avg. Sale</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getCurrentData().map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.date || item.week || item.month}</TableCell>
                      <TableCell className="font-semibold text-green-600">${item.sales.toFixed(2)}</TableCell>
                      <TableCell>{item.transactions}</TableCell>
                      <TableCell>{item.items}</TableCell>
                      <TableCell>${(item.sales / item.transactions).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Product Performance and Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockProductSales.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {product.category} • {product.quantity} sold
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${product.revenue.toFixed(2)}</p>
                      <p className="text-sm text-green-600">+${product.profit.toFixed(2)} profit</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCategorySales.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{category.category}</span>
                      <span className="text-sm text-muted-foreground">{category.percentage}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">${category.sales.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        reportType={exportReportType}
        data={getCurrentData()}
      />
    </Layout>
  )
}
