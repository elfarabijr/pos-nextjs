"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Plus, Search, Edit, Trash2, Package, Loader2, AlertTriangle, Camera, Scan, WifiOff } from "lucide-react"
import { Layout } from "@/components/layout"
import { ImageUpload } from "@/components/image-upload"
import { BarcodeInput } from "@/components/barcode/barcode-input"
import type { Category } from "@/types/category"
import { categoryIcons } from "@/utils/categoryUtils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { offlineAPI } from "@/lib/offline-api"
import { useOfflineMode } from "@/hooks/useOfflineMode"

// Define Product type
export interface Product {
  id: number
  name: string
  price: number
  category: string
  stock: number
  barcode: string
  description: string
  image?: string
  syncStatus?: "synced" | "pending" | "conflict"
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const activeCategories = categories.filter((cat) => cat.is_active)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    barcode: "",
    description: "",
    image: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { isOnline, updatePendingCount } = useOfflineMode()

  const fetchProductsAndCategories = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [productsData, categoriesData] = await Promise.all([offlineAPI.getProducts(), offlineAPI.getCategories()])

      setProducts(productsData)
      setCategories(categoriesData)
    } catch (err) {
      console.error("Failed to fetch data:", err)
      setError("Failed to load products or categories. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProductsAndCategories()
  }, [fetchProductsAndCategories])

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.barcode.includes(searchTerm)
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleImageUpload = (imageUrl: string, file: File) => {
    setFormData({ ...formData, image: imageUrl })
  }

  const handleImageRemove = () => {
    setFormData({ ...formData, image: "" })
  }

  const handleBarcodeChange = (barcode: string) => {
    setFormData({ ...formData, barcode })
  }

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      category: "",
      stock: "",
      barcode: "",
      description: "",
      image: "",
    })
    setEditingProduct(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const productPayload = {
        name: formData.name,
        price: Number.parseFloat(formData.price),
        category: formData.category,
        stock: Number.parseInt(formData.stock),
        barcode: formData.barcode,
        description: formData.description,
        image: formData.image,
      }

      if (editingProduct) {
        await offlineAPI.updateProduct(editingProduct.id, productPayload)
      } else {
        await offlineAPI.createProduct(productPayload)
      }

      await fetchProductsAndCategories()
      await updatePendingCount()
      resetForm()
      setShowAddDialog(false)
    } catch (err: any) {
      console.error("Failed to save product:", err)
      setError(err.message || "An unexpected error occurred while saving product.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      barcode: product.barcode,
      description: product.description,
      image: product.image || "",
    })
    setShowAddDialog(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return
    }
    setError(null)
    try {
      await offlineAPI.deleteProduct(id)
      await fetchProductsAndCategories()
      await updatePendingCount()
    } catch (err: any) {
      console.error("Failed to delete product:", err)
      setError(err.message || "An unexpected error occurred while deleting product.")
    }
  }

  const getSyncStatusBadge = (syncStatus?: string) => {
    if (!syncStatus || syncStatus === "synced") return null

    return (
      <Badge variant="outline" className="ml-2 text-xs">
        {syncStatus === "pending" ? "Pending Sync" : "Conflict"}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <span className="ml-3 text-lg text-muted-foreground">Loading products...</span>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              Products
              {!isOnline && <WifiOff className="h-6 w-6 text-orange-500" />}
            </h1>
            <p className="text-muted-foreground">
              Manage your product inventory
              {!isOnline && " (Offline Mode)"}
            </p>
          </div>
          <Dialog
            open={showAddDialog}
            onOpenChange={(open) => {
              setShowAddDialog(open)
              if (!open) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button className="h-12 px-6">
                <Plus className="mr-2 h-5 w-5" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0">
              <DialogHeader className="px-6 py-4 border-b">
                <DialogTitle className="text-xl font-semibold">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                  {!isOnline && (
                    <Badge variant="outline" className="ml-2">
                      Offline
                    </Badge>
                  )}
                </DialogTitle>
              </DialogHeader>

              <ScrollArea className="max-h-[calc(90vh-120px)]">
                <div className="px-6 py-4">
                  {error && (
                    <Alert variant="destructive" className="mb-6">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {!isOnline && (
                    <Alert className="mb-6 border-orange-200 bg-orange-50">
                      <WifiOff className="h-4 w-4 text-orange-500" />
                      <AlertDescription className="text-orange-800">
                        Working offline. Changes will sync when you're back online.
                      </AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Package className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-medium">Basic Information</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Label htmlFor="name" className="text-sm font-medium">
                            Product Name *
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter product name"
                            className="mt-1"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="price" className="text-sm font-medium">
                            Price *
                          </Label>
                          <div className="relative mt-1">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                              $
                            </span>
                            <Input
                              id="price"
                              type="number"
                              step="0.01"
                              min="0"
                              value={formData.price}
                              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                              placeholder="0.00"
                              className="pl-8"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="stock" className="text-sm font-medium">
                            Stock Quantity *
                          </Label>
                          <Input
                            id="stock"
                            type="number"
                            min="0"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            placeholder="0"
                            className="mt-1"
                            required
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label htmlFor="category" className="text-sm font-medium">
                            Category *
                          </Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {activeCategories.map((category) => (
                                <SelectItem key={category.id} value={category.name}>
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                                    <span className="text-sm">
                                      {categoryIcons.find((icon) => icon.value === category.icon)?.icon}
                                    </span>
                                    {category.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Barcode Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Scan className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-medium">Barcode</h3>
                      </div>

                      <div>
                        <Label htmlFor="barcode" className="text-sm font-medium">
                          Barcode *
                        </Label>
                        <BarcodeInput
                          value={formData.barcode}
                          onChange={handleBarcodeChange}
                          placeholder="Enter or scan barcode"
                          className="mt-1"
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          You can manually enter a barcode or use the scan button to scan one
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Product Image Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Camera className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-medium">Product Image</h3>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Upload Image</Label>
                        <div className="mt-1">
                          <ImageUpload
                            onImageUpload={handleImageUpload}
                            onImageRemove={handleImageRemove}
                            currentImage={formData.image}
                            maxSize={5}
                            acceptedFormats={["image/jpeg", "image/png", "image/webp"]}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Supported formats: JPEG, PNG, WebP. Max size: 5MB
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Description Section */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="description" className="text-sm font-medium">
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Enter product description (optional)"
                          rows={4}
                          className="mt-1 resize-none"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Provide additional details about the product
                        </p>
                      </div>
                    </div>
                  </form>
                </div>
              </ScrollArea>

              {/* Fixed Footer with Action Buttons */}
              <div className="px-6 py-4 border-t bg-background">
                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                    disabled={isSubmitting}
                    className="min-w-[100px]"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting} className="min-w-[120px]">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingProduct ? "Updating..." : "Adding..."}
                      </>
                    ) : (
                      <>{editingProduct ? "Update Product" : "Add Product"}</>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {activeCategories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                        <span className="text-sm">
                          {categoryIcons.find((icon) => icon.value === category.icon)?.icon}
                        </span>
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Products ({filteredProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Barcode</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {product.image && (
                            <img
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover border border-primary-200"
                            />
                          )}
                          <div>
                            <div className="font-medium flex items-center">
                              {product.name}
                              {getSyncStatusBadge(product.syncStatus)}
                            </div>
                            <div className="text-sm text-muted-foreground">{product.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const category = categories.find((cat) => cat.name === product.category)
                          const selectedIcon = categoryIcons.find((icon) => icon.value === category?.icon)

                          return (
                            <Badge
                              variant="secondary"
                              className="text-white"
                              style={{ backgroundColor: category?.color || "#6B7280" }}
                            >
                              {selectedIcon && <span className="mr-1 text-sm">{selectedIcon.icon}</span>}
                              {product.category}
                            </Badge>
                          )
                        })()}
                      </TableCell>
                      <TableCell className="font-medium">${product.price}</TableCell>
                      <TableCell>
                        <Badge
                          variant={product.stock > 10 ? "default" : product.stock > 5 ? "secondary" : "destructive"}
                        >
                          {product.stock}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{product.barcode}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
