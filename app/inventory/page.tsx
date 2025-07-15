"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Package, TrendingDown, TrendingUp, Plus, Minus, RefreshCw } from "lucide-react"
import { Layout } from "@/components/layout"

// Mock inventory data
const initialInventory = [
  {
    id: 1,
    name: "iPhone 15 Pro",
    currentStock: 2,
    minStock: 5,
    maxStock: 20,
    category: "Electronics",
    lastRestocked: "2024-01-10",
  },
  {
    id: 2,
    name: "Samsung Galaxy S24",
    currentStock: 12,
    minStock: 8,
    maxStock: 25,
    category: "Electronics",
    lastRestocked: "2024-01-12",
  },
  {
    id: 3,
    name: "Nike Air Max",
    currentStock: 1,
    minStock: 10,
    maxStock: 30,
    category: "Footwear",
    lastRestocked: "2024-01-08",
  },
  {
    id: 4,
    name: "Adidas Hoodie",
    currentStock: 18,
    minStock: 15,
    maxStock: 40,
    category: "Clothing",
    lastRestocked: "2024-01-11",
  },
  {
    id: 5,
    name: "MacBook Pro",
    currentStock: 8,
    minStock: 5,
    maxStock: 15,
    category: "Electronics",
    lastRestocked: "2024-01-09",
  },
  {
    id: 6,
    name: "AirPods Pro",
    currentStock: 30,
    minStock: 20,
    maxStock: 50,
    category: "Electronics",
    lastRestocked: "2024-01-13",
  },
]

interface InventoryItem {
  id: number
  name: string
  currentStock: number
  minStock: number
  maxStock: number
  category: string
  lastRestocked: string
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [adjustmentQuantity, setAdjustmentQuantity] = useState("")
  const [adjustmentReason, setAdjustmentReason] = useState("")
  const [showAdjustment, setShowAdjustment] = useState(false)

  const lowStockItems = inventory.filter((item) => item.currentStock <= item.minStock)
  const overstockItems = inventory.filter((item) => item.currentStock >= item.maxStock)
  const totalValue = inventory.reduce((sum, item) => sum + item.currentStock * 100, 0) // Mock price calculation

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock <= item.minStock) return "low"
    if (item.currentStock >= item.maxStock) return "high"
    return "normal"
  }

  const getStockBadge = (item: InventoryItem) => {
    const status = getStockStatus(item)
    switch (status) {
      case "low":
        return <Badge variant="destructive">Low Stock</Badge>
      case "high":
        return <Badge variant="secondary">Overstock</Badge>
      default:
        return <Badge variant="default">Normal</Badge>
    }
  }

  const handleStockAdjustment = (type: "add" | "remove") => {
    if (!selectedItem || !adjustmentQuantity) return

    const quantity = Number.parseInt(adjustmentQuantity)
    const newStock = type === "add" ? selectedItem.currentStock + quantity : selectedItem.currentStock - quantity

    if (newStock < 0) return

    setInventory(
      inventory.map((item) =>
        item.id === selectedItem.id
          ? { ...item, currentStock: newStock, lastRestocked: new Date().toISOString().split("T")[0] }
          : item,
      ),
    )

    setSelectedItem(null)
    setAdjustmentQuantity("")
    setAdjustmentReason("")
    setShowAdjustment(false)
  }

  const openAdjustment = (item: InventoryItem) => {
    setSelectedItem(item)
    setShowAdjustment(true)
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Monitor and manage your stock levels</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventory.length}</div>
              <p className="text-xs text-muted-foreground">Products in inventory</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{lowStockItems.length}</div>
              <p className="text-xs text-muted-foreground">Items need restocking</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overstock Items</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{overstockItems.length}</div>
              <p className="text-xs text-muted-foreground">Items overstocked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Estimated inventory value</p>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-5 w-5" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{item.name}</h4>
                      <Badge variant="destructive">{item.currentStock} left</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Minimum: {item.minStock} | Current: {item.currentStock}
                    </p>
                    <Button size="sm" onClick={() => openAdjustment(item)} className="w-full">
                      Restock Now
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Inventory Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Min/Max</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Restocked</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-lg font-semibold">{item.currentStock}</span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.minStock} / {item.maxStock}
                      </TableCell>
                      <TableCell>{getStockBadge(item)}</TableCell>
                      <TableCell>{item.lastRestocked}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => openAdjustment(item)}>
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Adjust
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Adjustment Dialog */}
      <Dialog open={showAdjustment} onOpenChange={setShowAdjustment}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Stock - {selectedItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Current Stock</p>
              <p className="text-3xl font-bold">{selectedItem?.currentStock}</p>
            </div>

            <div>
              <Label htmlFor="quantity">Adjustment Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={adjustmentQuantity}
                onChange={(e) => setAdjustmentQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>

            <div>
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Input
                id="reason"
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder="e.g., Restock, Damaged goods, etc."
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={() => handleStockAdjustment("add")} disabled={!adjustmentQuantity} className="flex-1">
                <Plus className="h-4 w-4 mr-1" />
                Add Stock
              </Button>
              <Button
                onClick={() => handleStockAdjustment("remove")}
                disabled={!adjustmentQuantity}
                variant="destructive"
                className="flex-1"
              >
                <Minus className="h-4 w-4 mr-1" />
                Remove Stock
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}
