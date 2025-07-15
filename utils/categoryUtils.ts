import type { Category } from "@/types/category"

export const categoryIcons = [
  { value: "smartphone", label: "Smartphone", icon: "📱" },
  { value: "laptop", label: "Laptop", icon: "💻" },
  { value: "headphones", label: "Headphones", icon: "🎧" },
  { value: "camera", label: "Camera", icon: "📷" },
  { value: "watch", label: "Watch", icon: "⌚" },
  { value: "shoe", label: "Shoe", icon: "👟" },
  { value: "shirt", label: "Shirt", icon: "👕" },
  { value: "bag", label: "Bag", icon: "👜" },
  { value: "book", label: "Book", icon: "📚" },
  { value: "game", label: "Game", icon: "🎮" },
  { value: "food", label: "Food", icon: "🍔" },
  { value: "drink", label: "Drink", icon: "🥤" },
  { value: "home", label: "Home", icon: "🏠" },
  { value: "car", label: "Car", icon: "🚗" },
  { value: "health", label: "Health", icon: "💊" },
  { value: "beauty", label: "Beauty", icon: "💄" },
  { value: "sports", label: "Sports", icon: "⚽" },
  { value: "music", label: "Music", icon: "🎵" },
  { value: "tools", label: "Tools", icon: "🔧" },
  { value: "gift", label: "Gift", icon: "🎁" },
]

export const categoryColors = [
  { value: "#3B82F6", label: "Blue" },
  { value: "#EF4444", label: "Red" },
  { value: "#10B981", label: "Green" },
  { value: "#F59E0B", label: "Yellow" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#EC4899", label: "Pink" },
  { value: "#06B6D4", label: "Cyan" },
  { value: "#84CC16", label: "Lime" },
  { value: "#F97316", label: "Orange" },
  { value: "#6B7280", label: "Gray" },
]

export const sortCategories = (categories: Category[], sortBy: string, sortOrder: "asc" | "desc") => {
  return [...categories].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name)
        break
      case "productCount":
        comparison = a.productCount - b.productCount
        break
      case "createdAt":
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      case "sortOrder":
        comparison = a.sortOrder - b.sortOrder
        break
      default:
        comparison = a.name.localeCompare(b.name)
    }

    return sortOrder === "desc" ? -comparison : comparison
  })
}

export const filterCategories = (categories: Category[], searchTerm: string, statusFilter: string) => {
  return categories.filter((category) => {
    const matchesSearch =
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && category.isActive) ||
      (statusFilter === "inactive" && !category.isActive)

    return matchesSearch && matchesStatus
  })
}

export const buildCategoryTree = (categories: Category[]): Category[] => {
  const categoryMap = new Map<number, Category & { children: Category[] }>()
  const rootCategories: (Category & { children: Category[] })[] = []

  // Create map with children array
  categories.forEach((category) => {
    categoryMap.set(category.id, { ...category, children: [] })
  })

  // Build tree structure
  categories.forEach((category) => {
    const categoryWithChildren = categoryMap.get(category.id)!
    if (category.parentId && categoryMap.has(category.parentId)) {
      categoryMap.get(category.parentId)!.children.push(categoryWithChildren)
    } else {
      rootCategories.push(categoryWithChildren)
    }
  })

  return rootCategories
}

export const getCategoryPath = (categories: Category[], categoryId: number): string => {
  const category = categories.find((c) => c.id === categoryId)
  if (!category) return ""

  if (category.parentId) {
    const parentPath = getCategoryPath(categories, category.parentId)
    return parentPath ? `${parentPath} > ${category.name}` : category.name
  }

  return category.name
}
