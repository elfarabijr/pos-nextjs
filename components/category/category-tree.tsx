"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, ChevronDown, Edit, Trash2, Plus } from "lucide-react"
import type { Category } from "@/types/category"
import { buildCategoryTree, categoryIcons, getCategoryPath } from "@/utils/categoryUtils"
import { FolderTree } from "lucide-react" // Import FolderTree

interface CategoryTreeProps {
  categories: Category[]
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  onAddChild: (parent: Category) => void
}

interface CategoryNodeProps {
  category: Category & { children: Category[] }
  allCategories: Category[]
  level: number
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  onAddChild: (parent: Category) => void
}

const CategoryNode: React.FC<CategoryNodeProps> = ({
  category,
  allCategories,
  level,
  onEdit,
  onDelete,
  onAddChild,
}) => {
  const [isOpen, setIsOpen] = useState(true)
  const selectedIcon = categoryIcons.find((icon) => icon.value === category.icon)
  const categoryPath = getCategoryPath(allCategories, category.id)

  return (
    <div className="border-l border-primary-200 ml-4 pl-4">
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          {category.children.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="h-6 w-6 p-0">
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          )}
          <Badge variant="secondary" className="text-white" style={{ backgroundColor: category.color }}>
            <span className="mr-1 text-sm">{selectedIcon?.icon}</span>
            {category.name}
          </Badge>
          <span className="text-sm text-muted-foreground">({category.productCount} products)</span>
          {!category.isActive && <Badge variant="secondary">Inactive</Badge>}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onAddChild(category)} className="h-6 w-6 p-0">
            <Plus className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(category)} className="h-6 w-6 p-0">
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(category)}
            disabled={category.productCount > 0 || category.children.length > 0}
            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground ml-8">{categoryPath}</p>
      {isOpen && category.children.length > 0 && (
        <div className="mt-2">
          {category.children.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              allCategories={allCategories}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function CategoryTree({ categories, onEdit, onDelete, onAddChild }: CategoryTreeProps) {
  const tree = buildCategoryTree(categories)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderTree className="h-5 w-5" />
          Category Hierarchy
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {tree.length === 0 ? (
          <p className="text-muted-foreground">No categories to display in tree view.</p>
        ) : (
          <div className="space-y-2">
            {tree.map((category) => (
              <CategoryNode
                key={category.id}
                category={category}
                allCategories={categories}
                level={0}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddChild={onAddChild}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
