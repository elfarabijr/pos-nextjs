"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import type { Category, CategoryFormData } from "@/types/category"
import { categoryColors, categoryIcons } from "@/utils/categoryUtils"

interface CategoryFormProps {
  category?: Category
  categories: Category[] // All categories for parent selection
  onSubmit: (formData: CategoryFormData) => void
  onCancel: () => void
  isSubmitting: boolean
}

export function CategoryForm({ category, categories, onSubmit, onCancel, isSubmitting }: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    color: categoryColors[0].value,
    icon: categoryIcons[0].value,
    parentId: undefined,
    isActive: true,
    sortOrder: 0,
  })

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description,
        color: category.color,
        icon: category.icon,
        parentId: category.parentId,
        isActive: category.isActive,
        sortOrder: category.sortOrder,
      })
    } else {
      // Reset form for new category
      setFormData({
        name: "",
        description: "",
        color: categoryColors[0].value,
        icon: categoryIcons[0].value,
        parentId: undefined,
        isActive: true,
        sortOrder: 0,
      })
    }
  }, [category])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  // Filter out the current category and its children from parent options
  const getAvailableParents = () => {
    if (!category) return categories.filter((c) => c.isActive) // All active categories for new

    const excludedIds = new Set<number>()
    excludedIds.add(category.id)

    // Recursively add children to excluded list
    const addChildren = (catId: number) => {
      categories.forEach((c) => {
        if (c.parentId === catId) {
          excludedIds.add(c.id)
          addChildren(c.id)
        }
      })
    }
    addChildren(category.id)

    return categories.filter((c) => !excludedIds.has(c.id) && c.isActive)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="color">Color</Label>
          <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select color" />
            </SelectTrigger>
            <SelectContent>
              {categoryColors.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.value }} />
                    {c.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="icon">Icon</Label>
          <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select icon" />
            </SelectTrigger>
            <SelectContent>
              {categoryIcons.map((i) => (
                <SelectItem key={i.value} value={i.value}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{i.icon}</span>
                    {i.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="parentId">Parent Category</Label>
        <Select
          value={formData.parentId?.toString() || "none"}
          onValueChange={(value) =>
            setFormData({ ...formData, parentId: value === "none" ? undefined : Number.parseInt(value) })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="No parent (root category)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No parent (root category)</SelectItem>
            {getAvailableParents().map((p) => (
              <SelectItem key={p.id} value={p.id.toString()}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input
            id="sortOrder"
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: Number.parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="flex items-center justify-between pt-6">
          <Label htmlFor="isActive">Active</Label>
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {category ? "Update" : "Add"} Category
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
