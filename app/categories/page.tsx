"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Plus,
  Search,
  Grid3X3,
  List,
  FolderTree,
  Tag,
  Package,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { Layout } from "@/components/layout"
import { CategoryForm } from "@/components/category/category-form"
import { CategoryTree } from "@/components/category/category-tree"
import type { Category, CategoryFormData, CategoryStats } from "@/types/category"
import { sortCategories, filterCategories, categoryIcons } from "@/utils/categoryUtils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SupabaseAPI } from "@/lib/supabase-api"
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime"

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("sortOrder")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [viewMode, setViewMode] = useState<"list" | "grid" | "tree">("tree")
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [parentCategory, setParentCategory] = useState<Category | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Use real-time hook for categories
  const {
    data: categories,
    loading,
    refetch,
  } = useSupabaseRealtime(SupabaseAPI.getCategories, SupabaseAPI.subscribeToCategories)

  const filteredCategories = filterCategories(sortCategories(categories, sortBy, sortOrder), searchTerm, statusFilter)

  const stats: CategoryStats = {
    totalCategories: categories.length,
    activeCategories: categories.filter((c) => c.is_active).length,
    inactiveCategories: categories.filter((c) => !c.is_active).length,
    categoriesWithProducts: categories.filter((c) => c.product_count > 0).length,
  }

  const handleSubmit = async (formData: CategoryFormData) => {
    setIsSubmitting(true)
    setError(null)
    try {
      if (editingCategory) {
        await SupabaseAPI.updateCategory(editingCategory.id, {
          name: formData.name,
          description: formData.description,
          color: formData.color,
          icon: formData.icon,
          parent_id: formData.parentId,
          is_active: formData.isActive,
          sort_order: formData.sortOrder,
        })
      } else {
        await SupabaseAPI.createCategory({
          name: formData.name,
          description: formData.description,
          color: formData.color,
          icon: formData.icon,
          parent_id: parentCategory?.id || formData.parentId,
          is_active: formData.isActive,
          sort_order: formData.sortOrder,
        })
      }

      resetForm()
    } catch (err: any) {
      console.error("Failed to save category:", err)
      setError(err.message || "An unexpected error occurred while saving category.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setParentCategory(null)
    setShowForm(true)
  }

  const handleDelete = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return
    }
    setError(null)
    try {
      await SupabaseAPI.deleteCategory(category.id)
    } catch (err: any) {
      console.error("Failed to delete category:", err)
      setError(err.message || "An unexpected error occurred while deleting category.")
    }
  }

  const handleAddChild = (parent: Category) => {
    setParentCategory(parent)
    setEditingCategory(null)
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingCategory(null)
    setParentCategory(null)
  }

  const toggleCategoryStatus = async (category: Category) => {
    setError(null)
    try {
      await SupabaseAPI.updateCategory(category.id, { is_active: !category.is_active })
    } catch (err: any) {
      console.error("Failed to toggle category status:", err)
      setError(err.message || "An unexpected error occurred while toggling category status.")
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <span className="ml-3 text-lg text-muted-foreground">Loading categories...</span>
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
            <h1 className="text-3xl font-bold">Category Management</h1>
            <p className="text-muted-foreground">Organize and manage your product categories</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="h-12 px-6">
            <Plus className="mr-2 h-5 w-5" />
            Add Category
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCategories}</div>
              <p className="text-xs text-muted-foreground">All categories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
              <Eye className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeCategories}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Categories</CardTitle>
              <EyeOff className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.inactiveCategories}</div>
              <p className="text-xs text-muted-foreground">Currently inactive</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">With Products</CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.categoriesWithProducts}</div>
              <p className="text-xs text-muted-foreground">Have products assigned</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sortOrder">Sort Order</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="productCount">Product Count</SelectItem>
                    <SelectItem value="createdAt">Created Date</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="w-full sm:w-auto"
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === "tree" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("tree")}
                >
                  <FolderTree className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Categories Display */}
        {viewMode === "tree" && (
          <CategoryTree
            categories={filteredCategories}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddChild={handleAddChild}
          />
        )}

        {viewMode === "list" && (
          <Card>
            <CardHeader>
              <CardTitle>Categories ({filteredCategories.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sort Order</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.map((category) => {
                      const selectedIcon = categoryIcons.find((icon) => icon.value === category.icon)
                      const parent = categories.find((c) => c.id === category.parent_id)

                      return (
                        <TableRow key={category.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className="text-white"
                                style={{ backgroundColor: category.color }}
                              >
                                <span className="mr-1 text-sm">{selectedIcon?.icon}</span>
                                {category.name}
                              </Badge>
                            </div>
                            {category.description && (
                              <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            {parent ? (
                              <Badge variant="outline">{parent.name}</Badge>
                            ) : (
                              <span className="text-muted-foreground">Root</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={category.product_count > 0 ? "default" : "secondary"}>
                              {category.product_count}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => toggleCategoryStatus(category)}>
                              {category.is_active ? (
                                <Badge variant="default" className="bg-green-500">
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                            </Button>
                          </TableCell>
                          <TableCell>{category.sort_order}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(category)}
                                disabled={category.product_count > 0}
                                className="text-red-500 hover:text-red-700"
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCategories.map((category) => {
              const selectedIcon = categoryIcons.find((icon) => icon.value === category.icon)
              const parent = categories.find((c) => c.id === category.parent_id)

              return (
                <Card key={category.id} className={`${!category.is_active ? "opacity-60" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="secondary" className="text-white" style={{ backgroundColor: category.color }}>
                        <span className="mr-1 text-sm">{selectedIcon?.icon}</span>
                        {category.name}
                      </Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(category)} className="h-6 w-6 p-0">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category)}
                          disabled={category.product_count > 0}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {category.description && (
                      <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                    )}

                    <div className="space-y-2 text-sm">
                      {parent && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Parent:</span>
                          <Badge variant="outline" className="text-xs">
                            {parent.name}
                          </Badge>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Products:</span>
                        <Badge variant={category.product_count > 0 ? "default" : "secondary"}>
                          {category.product_count}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={category.is_active ? "default" : "secondary"}>
                          {category.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Category Form Dialog */}
        {showForm && (
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
              </DialogHeader>
              <CategoryForm
                onSubmit={handleSubmit}
                onCancel={resetForm}
                initialData={editingCategory}
                parentCategory={parentCategory}
                isSubmitting={isSubmitting}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  )
}
