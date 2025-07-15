import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import "jspdf-autotable"

// Extend jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

export interface SalesReportData {
  date: string
  transactionId: string
  customerName?: string
  items: Array<{
    name: string
    quantity: number
    price: number
    total: number
  }>
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentMethod: string
}

export interface ProductSalesData {
  name: string
  category: string
  quantitySold: number
  revenue: number
  profit: number
}

export interface DailySalesData {
  date: string
  sales: number
  transactions: number
  items: number
  averageSale: number
}

export class ExportService {
  static async exportSalesReportToXLSX(data: SalesReportData[], filename = "sales-report"): Promise<void> {
    try {
      // Create workbook
      const wb = XLSX.utils.book_new()

      // Sales Summary Sheet
      const summaryData = [
        ["Sales Report Summary"],
        ["Generated on:", new Date().toLocaleDateString()],
        [""],
        ["Total Transactions:", data.length],
        ["Total Revenue:", `$${data.reduce((sum, item) => sum + item.total, 0).toFixed(2)}`],
        ["Average Transaction:", `$${(data.reduce((sum, item) => sum + item.total, 0) / data.length || 0).toFixed(2)}`],
        [""],
      ]

      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(wb, summaryWs, "Summary")

      // Detailed Transactions Sheet
      const transactionData = data.map((transaction) => ({
        Date: transaction.date,
        "Transaction ID": transaction.transactionId,
        "Customer Name": transaction.customerName || "Walk-in",
        "Items Count": transaction.items.length,
        Subtotal: `$${transaction.subtotal.toFixed(2)}`,
        Discount: `$${transaction.discount.toFixed(2)}`,
        Tax: `$${transaction.tax.toFixed(2)}`,
        Total: `$${transaction.total.toFixed(2)}`,
        "Payment Method": transaction.paymentMethod,
      }))

      const transactionWs = XLSX.utils.json_to_sheet(transactionData)
      XLSX.utils.book_append_sheet(wb, transactionWs, "Transactions")

      // Item Details Sheet
      const itemDetails: any[] = []
      data.forEach((transaction) => {
        transaction.items.forEach((item) => {
          itemDetails.push({
            Date: transaction.date,
            "Transaction ID": transaction.transactionId,
            "Product Name": item.name,
            Quantity: item.quantity,
            "Unit Price": `$${item.price.toFixed(2)}`,
            Total: `$${item.total.toFixed(2)}`,
          })
        })
      })

      const itemWs = XLSX.utils.json_to_sheet(itemDetails)
      XLSX.utils.book_append_sheet(wb, itemWs, "Item Details")

      // Write file
      XLSX.writeFile(wb, `${filename}.xlsx`)
    } catch (error) {
      console.error("Error exporting to XLSX:", error)
      throw new Error("Failed to export XLSX file")
    }
  }

  static async exportSalesReportToPDF(data: SalesReportData[], filename = "sales-report"): Promise<void> {
    try {
      const doc = new jsPDF()

      // Header
      doc.setFontSize(20)
      doc.setTextColor(37, 99, 235) // Primary blue
      doc.text("Sales Report", 20, 20)

      doc.setFontSize(12)
      doc.setTextColor(100, 116, 139) // Secondary gray
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30)

      // Summary
      const totalRevenue = data.reduce((sum, item) => sum + item.total, 0)
      const averageTransaction = totalRevenue / data.length || 0

      doc.setFontSize(14)
      doc.setTextColor(15, 23, 42) // Dark text
      doc.text("Summary", 20, 45)

      doc.setFontSize(10)
      doc.text(`Total Transactions: ${data.length}`, 20, 55)
      doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 20, 62)
      doc.text(`Average Transaction: $${averageTransaction.toFixed(2)}`, 20, 69)

      // Transactions Table
      const tableData = data.map((transaction) => [
        transaction.date,
        transaction.transactionId,
        transaction.customerName || "Walk-in",
        transaction.items.length.toString(),
        `$${transaction.total.toFixed(2)}`,
        transaction.paymentMethod,
      ])

      doc.autoTable({
        head: [["Date", "Transaction ID", "Customer", "Items", "Total", "Payment"]],
        body: tableData,
        startY: 80,
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
      })

      // Save PDF
      doc.save(`${filename}.pdf`)
    } catch (error) {
      console.error("Error exporting to PDF:", error)
      throw new Error("Failed to export PDF file")
    }
  }

  static async exportProductSalesToXLSX(data: ProductSalesData[], filename = "product-sales-report"): Promise<void> {
    try {
      const wb = XLSX.utils.book_new()

      const productData = data.map((product) => ({
        "Product Name": product.name,
        Category: product.category,
        "Quantity Sold": product.quantitySold,
        Revenue: `$${product.revenue.toFixed(2)}`,
        Profit: `$${product.profit.toFixed(2)}`,
        "Profit Margin": `${((product.profit / product.revenue) * 100).toFixed(1)}%`,
      }))

      const ws = XLSX.utils.json_to_sheet(productData)
      XLSX.utils.book_append_sheet(wb, ws, "Product Sales")

      XLSX.writeFile(wb, `${filename}.xlsx`)
    } catch (error) {
      console.error("Error exporting product sales to XLSX:", error)
      throw new Error("Failed to export product sales XLSX file")
    }
  }

  static async exportDailySalesToPDF(data: DailySalesData[], filename = "daily-sales-report"): Promise<void> {
    try {
      const doc = new jsPDF()

      // Header
      doc.setFontSize(20)
      doc.setTextColor(37, 99, 235)
      doc.text("Daily Sales Report", 20, 20)

      doc.setFontSize(12)
      doc.setTextColor(100, 116, 139)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30)

      // Summary
      const totalSales = data.reduce((sum, day) => sum + day.sales, 0)
      const totalTransactions = data.reduce((sum, day) => sum + day.transactions, 0)
      const averageDailySales = totalSales / data.length || 0

      doc.setFontSize(14)
      doc.setTextColor(15, 23, 42)
      doc.text("Period Summary", 20, 45)

      doc.setFontSize(10)
      doc.text(`Total Sales: $${totalSales.toFixed(2)}`, 20, 55)
      doc.text(`Total Transactions: ${totalTransactions}`, 20, 62)
      doc.text(`Average Daily Sales: $${averageDailySales.toFixed(2)}`, 20, 69)

      // Daily Sales Table
      const tableData = data.map((day) => [
        day.date,
        `$${day.sales.toFixed(2)}`,
        day.transactions.toString(),
        day.items.toString(),
        `$${day.averageSale.toFixed(2)}`,
      ])

      doc.autoTable({
        head: [["Date", "Sales", "Transactions", "Items Sold", "Avg. Sale"]],
        body: tableData,
        startY: 80,
        styles: {
          fontSize: 9,
          cellPadding: 4,
        },
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
      })

      doc.save(`${filename}.pdf`)
    } catch (error) {
      console.error("Error exporting daily sales to PDF:", error)
      throw new Error("Failed to export daily sales PDF file")
    }
  }
}
