export interface Category {
  id: number
  name: string
  description: string
  color: string
  icon: string
  parentId?: number
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
  productCount: number
}

export interface CategoryFormData {
  name: string
  description: string
  color: string
  icon: string
  parentId?: number
  isActive: boolean
  sortOrder: number
}

export interface CategoryStats {
  totalCategories: number
  activeCategories: number
  inactiveCategories: number
  categoriesWithProducts: number
}
