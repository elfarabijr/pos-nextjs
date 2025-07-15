"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, QrCode, Mail, Settings } from "lucide-react"
import { Layout } from "@/components/layout"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PrinterManager } from "@/components/print/printer-manager"
import { PrintPreview } from "@/components/print/print-preview"
import { BarcodeScanner } from "@/components/barcode/barcode-scanner"
import { SupabaseAPI } from "@/lib/supabase-api"
import type { BarcodeResult } from "@/utils/barcodeUtils"

// Mock products data
const mockProducts = [
  { id: 1, name: "iPhone 15 Pro", price: 999.99, category: "Electronics", stock: 15, barcode: "123456789" },
  { id: 2, name: "Samsung Galaxy S24", price: 899.99, category: "Electronics", stock: 12, barcode: "987654321" },
  { id: 3, name: "Nike Air Max", price: 129.99, category: "Footwear", stock: 25, barcode: "456789123" },
  { id: 4, name: "Adidas Hoodie", price: 79.99, category: "Clothing", stock: 18, barcode: "789123456" },
  { id: 5, name: "MacBook Pro", price: 1999.99, category: "Electronics", stock: 8, barcode: "321654987" },
  { id: 6, name: "AirPods Pro", price: 249.99, category: "Electronics", stock: 30, barcode: "654987321" },
]

// Mock receipt template
const mockTemplate = {
  components: [
    {
      id: "1",
      type: "business-name",
      props: { text: "RetailPOS Store", fontSize: "large", align: "center", bold: true },
    },
    {
      id: "2",
      type: "business-address",
      props: { address: "123 Main Street\nCity, State 12345", phone: "(555) 123-4567", align: "center" },
    },
    { id: "3", type: "divider", props: { style: "solid", thickness: 1 } },
    { id: "4", type: "transaction-id", props: { label: "Transaction #:", align: "left" } },
    { id: "5", type: "date-time", props: { format: "MM/DD/YYYY HH:mm", align: "left" } },
    { id: "6", type: "cashier", props: { label: "Served by:", align: "left" } },
    { id: "7", type: "divider", props: { style: "solid", thickness: 1 } },
    {
      id: "8",
      type: "items-table",
      props: { showHeaders: true, columns: ["item", "qty", "price", "total"], borders: false },
    },
    { id: "9", type: "divider", props: { style: "solid", thickness: 1 } },
    { id: "10", type: "subtotal", props: { label: "Subtotal:", align: "right" } },
    { id: "11", type: "tax", props: { label: "Tax:", align: "right" } },
    { id: "12", type: "total", props: { label: "TOTAL:", align: "right", bold: true, fontSize: "large" } },
    { id: "13", type: "divider", props: { style: "solid", thickness: 1 } },
    { id: "14", type: "payment-method", props: { label: "Payment:", align: "left" } },
    { id: "15", type: "spacer", props: { height: 20 } },
    {
      id: "16",
      type: "footer-message",
      props: { text: "Thank you for your business!", align: "center", italic: true },
    },
  ],
}

const categories = ["All", "Electronics", "Footwear", "Clothing"]

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  stock: number
}

export default function POSPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [cart, setCart] = useState<CartItem[]>([])
  const [discount, setDiscount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [showPayment, setShowPayment] = useState(false)
  const [showPrinterManager, setShowPrinterManager] = useState(false)
  const [showPrintPreview, setShowPrintPreview] = useState(false)
  const [receiptData, setReceiptData] = useState<any>(null)
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [barcodeSearchTerm, setBarcodeSearchTerm] = useState("")
  const [scanningEnabled, setScanningEnabled] = useState(true)

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addToCart = (product: (typeof mockProducts)[0]) => {
    const existingItem = cart.find((item) => item.id === product.id)
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)))
      }
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          stock: product.stock,
        },
      ])
    }
  }

  const updateQuantity = (id: number, change: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === id) {
            const newQuantity = item.quantity + change
            if (newQuantity <= 0) {
              return null
            }
            if (newQuantity <= item.stock) {
              return { ...item, quantity: newQuantity }
            }
          }
          return item
        })
        .filter(Boolean) as CartItem[],
    )
  }

  const removeFromCart = (id: number) => {
    setCart(cart.filter((item) => item.id !== id))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discountAmount = subtotal * (discount / 100)
  const tax = (subtotal - discountAmount) * 0.08 // 8% tax
  const total = subtotal - discountAmount + tax

  const generateReceiptData = () => {
    return {
      businessName: "RetailPOS Store",
      businessAddress: "123 Main Street\nCity, State 12345",
      businessPhone: "(555) 123-4567",
      businessEmail: "info@retailpos.com",
      transactionId: `TXN-${Date.now().toString().slice(-6)}`,
      dateTime: new Date().toLocaleString(),
      cashier: "John Doe",
      items: cart.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      })),
      subtotal,
      tax,
      discount: discountAmount,
      total,
      paymentMethod: paymentMethod || "Cash",
    }
  }

  const processPayment = () => {
    if (!paymentMethod) return

    const receipt = generateReceiptData()
    setReceiptData(receipt)

    // Show print preview
    setShowPayment(false)
    setShowPrintPreview(true)
  }

  const handlePrintComplete = () => {
    // Clear cart after successful payment and print
    setCart([])
    setDiscount(0)
    setPaymentMethod("")
    setReceiptData(null)
  }

  const handleBarcodeSearch = async (barcode: string) => {
    if (!barcode.trim()) return

    try {
      const product = await SupabaseAPI.getProductByBarcode(barcode)
      if (product) {
        addToCart(product)
        setBarcodeSearchTerm("")
        // Show success feedback
        setTimeout(() => {
          setSearchTerm("")
        }, 100)
      } else {
        // Show not found message
        alert(`Product with barcode ${barcode} not found`)
      }
    } catch (error) {
      console.error("Barcode search error:", error)
      alert("Error searching for product")
    }
  }

  const handleBarcodeScan = (result: BarcodeResult) => {
    if (result.isValid) {
      handleBarcodeSearch(result.code)
      setShowBarcodeScanner(false)
    }
  }

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-secondary-400" />
              <Input
                placeholder="Search products or scan barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg border-primary-200 focus:border-primary-500 focus:ring-primary-500 shadow-tech"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowBarcodeScanner(true)}
                className="h-12 px-4 border-primary-200 hover:bg-primary-50 text-primary-700"
              >
                <QrCode className="h-5 w-5 mr-2" />
                Scan
              </Button>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48 h-12 border-primary-200 focus:border-primary-500 focus:ring-primary-500 shadow-tech">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto max-h-[calc(100vh-12rem)]">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="tech-card cursor-pointer hover:shadow-tech-lg transition-all duration-200 hover:scale-105"
                onClick={() => addToCart(product)}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg leading-tight text-secondary-800">{product.name}</h3>
                      <Badge
                        variant={product.stock > 10 ? "default" : "destructive"}
                        className={product.stock > 10 ? "bg-success-500" : "bg-warning-500"}
                      >
                        {product.stock}
                      </Badge>
                    </div>
                    <p className="text-sm text-secondary-500">{product.category}</p>
                    <p className="text-2xl font-bold text-primary-600">${product.price}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div className="space-y-4">
          <Card className="tech-card h-full flex flex-col shadow-tech-lg">
            <CardHeader className="border-b border-primary-100">
              <CardTitle className="flex items-center justify-between text-secondary-800">
                Shopping Cart
                <Badge variant="secondary" className="bg-primary-100 text-primary-700">
                  {cart.length} items
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-6">
              <div className="flex-1 space-y-4 overflow-y-auto max-h-64">
                {cart.length === 0 ? (
                  <p className="text-center text-secondary-500 py-8">Cart is empty</p>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border border-primary-100 rounded-lg bg-primary-50/30"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-secondary-800">{item.name}</h4>
                        <p className="text-sm text-secondary-500">${item.price} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="border-primary-200"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, 1)}
                          disabled={item.quantity >= item.stock}
                          className="border-primary-200"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => removeFromCart(item.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Separator className="my-4 bg-primary-200" />

              {/* Discount */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-secondary-700">Discount (%)</label>
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  placeholder="0"
                  min="0"
                  max="100"
                  className="border-primary-200 focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <Separator className="my-4 bg-primary-200" />

              {/* Totals */}
              <div className="space-y-2 p-4 bg-primary-50/50 rounded-lg">
                <div className="flex justify-between text-secondary-700">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success-600">
                    <span>Discount ({discount}%):</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-secondary-700">
                  <span>Tax (8%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator className="bg-primary-200" />
                <div className="flex justify-between text-lg font-bold text-secondary-800">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                className="w-full mt-4 h-12 text-lg tech-button text-white font-semibold"
                disabled={cart.length === 0}
                onClick={() => setShowPayment(true)}
              >
                Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="sm:max-w-md bg-white border-primary-200 shadow-tech-lg">
          <DialogHeader>
            <DialogTitle className="text-secondary-800">Payment - ${total.toFixed(2)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant={paymentMethod === "cash" ? "default" : "outline"}
                onClick={() => setPaymentMethod("cash")}
                className={`h-16 text-lg ${paymentMethod === "cash" ? "tech-button text-white" : "border-primary-200 text-primary-700 hover:bg-primary-50"}`}
              >
                <Banknote className="mr-2 h-6 w-6" />
                Cash
              </Button>
              <Button
                variant={paymentMethod === "card" ? "default" : "outline"}
                onClick={() => setPaymentMethod("card")}
                className={`h-16 text-lg ${paymentMethod === "card" ? "tech-button text-white" : "border-primary-200 text-primary-700 hover:bg-primary-50"}`}
              >
                <CreditCard className="mr-2 h-6 w-6" />
                Card
              </Button>
              <Button
                variant={paymentMethod === "qr" ? "default" : "outline"}
                onClick={() => setPaymentMethod("qr")}
                className={`h-16 text-lg ${paymentMethod === "qr" ? "tech-button text-white" : "border-primary-200 text-primary-700 hover:bg-primary-50"}`}
              >
                <QrCode className="mr-2 h-6 w-6" />
                QR Code
              </Button>
            </div>

            <div className="flex gap-2">
              <Button onClick={processPayment} disabled={!paymentMethod} className="flex-1 tech-button text-white">
                Process Payment
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPrinterManager(true)}
                className="flex-1 border-primary-200 text-primary-700 hover:bg-primary-50 bg-transparent"
              >
                <Settings className="mr-2 h-4 w-4" />
                Printer Settings
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-primary-200 text-primary-700 hover:bg-primary-50 bg-transparent"
              >
                <Mail className="mr-2 h-4 w-4" />
                Email Receipt
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Printer Manager Dialog */}
      <PrinterManager isOpen={showPrinterManager} onClose={() => setShowPrinterManager(false)} />

      {/* Print Preview Dialog */}
      <PrintPreview
        isOpen={showPrintPreview}
        onClose={() => {
          setShowPrintPreview(false)
          handlePrintComplete()
        }}
        receiptData={receiptData}
        template={mockTemplate}
      />

      {/* Barcode Scanner Dialog */}
      <BarcodeScanner
        isOpen={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onScan={handleBarcodeScan}
        title="Scan Product Barcode"
      />
    </Layout>
  )
}
