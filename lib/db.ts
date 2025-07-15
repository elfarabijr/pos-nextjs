import type { User } from "@/app/users/page"
import type { Product } from "@/app/products/page"
import type { Category } from "@/types/category"

// --- Mock Data (Simulated Database) ---
let users: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    status: "Active",
    lastLogin: "2024-01-14 10:30 AM",
    permissions: ["all"],
    password: "password123", // For simulation
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Cashier",
    status: "Active",
    lastLogin: "2024-01-14 09:15 AM",
    permissions: ["pos", "products"],
    password: "password123",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@example.com",
    role: "Manager",
    status: "Active",
    lastLogin: "2024-01-13 04:45 PM",
    permissions: ["pos", "products", "inventory", "reports"],
    password: "password123",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah@example.com",
    role: "Cashier",
    status: "Inactive",
    lastLogin: "2024-01-10 02:20 PM",
    permissions: ["pos"],
    password: "password123",
  },
]

let products: Product[] = [
  {
    id: 1,
    name: "iPhone 15 Pro",
    price: 999.99,
    category: "Electronics",
    stock: 15,
    barcode: "123456789",
    description: "Latest iPhone model",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 2,
    name: "Samsung Galaxy S24",
    price: 899.99,
    category: "Electronics",
    stock: 12,
    barcode: "987654321",
    description: "Android flagship phone",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 3,
    name: "Nike Air Max",
    price: 129.99,
    category: "Footwear",
    stock: 25,
    barcode: "456789123",
    description: "Comfortable running shoes",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 4,
    name: "Adidas Hoodie",
    price: 79.99,
    category: "Clothing",
    stock: 18,
    barcode: "789123456",
    description: "Warm and comfortable hoodie",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 5,
    name: "MacBook Pro",
    price: 1999.99,
    category: "Electronics",
    stock: 8,
    barcode: "321654987",
    description: "Professional laptop",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 6,
    name: "AirPods Pro",
    price: 249.99,
    category: "Electronics",
    stock: 30,
    barcode: "654987321",
    description: "Wireless earbuds",
    image: "/placeholder.svg?height=100&width=100",
  },
]

let categories: Category[] = [
  {
    id: 1,
    name: "Electronics",
    description: "Electronic devices and accessories",
    color: "#3B82F6",
    icon: "smartphone",
    isActive: true,
    sortOrder: 1,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    productCount: 25,
  },
  {
    id: 2,
    name: "Smartphones",
    description: "Mobile phones and accessories",
    color: "#10B981",
    icon: "smartphone",
    parentId: 1,
    isActive: true,
    sortOrder: 1,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    productCount: 15,
  },
  {
    id: 3,
    name: "Laptops",
    description: "Portable computers",
    color: "#8B5CF6",
    icon: "laptop",
    parentId: 1,
    isActive: true,
    sortOrder: 2,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    productCount: 10,
  },
  {
    id: 4,
    name: "Clothing",
    description: "Apparel and fashion items",
    color: "#EC4899",
    icon: "shirt",
    isActive: true,
    sortOrder: 2,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    productCount: 18,
  },
  {
    id: 5,
    name: "Footwear",
    description: "Shoes and sandals",
    color: "#F59E0B",
    icon: "shoe",
    isActive: true,
    sortOrder: 3,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    productCount: 12,
  },
  {
    id: 6,
    name: "Accessories",
    description: "Various accessories",
    color: "#6B7280",
    icon: "bag",
    isActive: false,
    sortOrder: 4,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    productCount: 5,
  },
]

// --- Utility Functions for Mock DB ---

// Users
export const getUsers = async (): Promise<User[]> => {
  await new Promise((resolve) => setTimeout(resolve, 200)) // Simulate network delay
  return users
}

export const getUserById = async (id: number): Promise<User | undefined> => {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return users.find((user) => user.id === id)
}

export const getUserByEmail = async (email: string): Promise<User | undefined> => {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return users.find((user) => user.email === email)
}

export const createUser = async (newUser: Omit<User, "id" | "lastLogin" | "status">): Promise<User> => {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const id = Math.max(...users.map((u) => u.id), 0) + 1
  const user: User = {
    id,
    ...newUser,
    status: "Active",
    lastLogin: "Never",
  }
  users.push(user)
  return user
}

export const updateUser = async (id: number, updatedFields: Partial<User>): Promise<User | undefined> => {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const index = users.findIndex((user) => user.id === id)
  if (index !== -1) {
    users[index] = { ...users[index], ...updatedFields }
    return users[index]
  }
  return undefined
}

export const deleteUser = async (id: number): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const initialLength = users.length
  users = users.filter((user) => user.id !== id)
  return users.length < initialLength
}

// Products
export const getProducts = async (): Promise<Product[]> => {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return products
}

export const getProductById = async (id: number): Promise<Product | undefined> => {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return products.find((product) => product.id === id)
}

export const createProduct = async (newProduct: Omit<Product, "id">): Promise<Product> => {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const id = Math.max(...products.map((p) => p.id), 0) + 1
  const product: Product = { id, ...newProduct }
  products.push(product)

  // Update category product count
  const category = categories.find((c) => c.name === newProduct.category)
  if (category) {
    category.productCount++
  }

  return product
}

export const updateProduct = async (id: number, updatedFields: Partial<Product>): Promise<Product | undefined> => {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const index = products.findIndex((product) => product.id === id)
  if (index !== -1) {
    const oldCategoryName = products[index].category
    products[index] = { ...products[index], ...updatedFields }

    // Update category product counts if category changed
    if (updatedFields.category && updatedFields.category !== oldCategoryName) {
      const oldCategory = categories.find((c) => c.name === oldCategoryName)
      if (oldCategory) {
        oldCategory.productCount--
      }
      const newCategory = categories.find((c) => c.name === updatedFields.category)
      if (newCategory) {
        newCategory.productCount++
      }
    }
    return products[index]
  }
  return undefined
}

export const deleteProduct = async (id: number): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const productToDelete = products.find((p) => p.id === id)
  const initialLength = products.length
  products = products.filter((product) => product.id !== id)

  // Update category product count
  if (productToDelete) {
    const category = categories.find((c) => c.name === productToDelete.category)
    if (category) {
      category.productCount--
    }
  }

  return products.length < initialLength
}

// Categories
export const getCategories = async (): Promise<Category[]> => {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return categories
}

export const getCategoryById = async (id: number): Promise<Category | undefined> => {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return categories.find((category) => category.id === id)
}

export const createCategory = async (
  newCategory: Omit<Category, "id" | "createdAt" | "updatedAt" | "productCount">,
): Promise<Category> => {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const id = Math.max(...categories.map((c) => c.id), 0) + 1
  const category: Category = {
    id,
    ...newCategory,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    productCount: 0,
  }
  categories.push(category)
  return category
}

export const updateCategory = async (id: number, updatedFields: Partial<Category>): Promise<Category | undefined> => {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const index = categories.findIndex((category) => category.id === id)
  if (index !== -1) {
    categories[index] = { ...categories[index], ...updatedFields, updatedAt: new Date().toISOString() }
    return categories[index]
  }
  return undefined
}

export const deleteCategory = async (id: number): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const categoryToDelete = categories.find((c) => c.id === id)
  if (categoryToDelete && categoryToDelete.productCount > 0) {
    return false // Cannot delete category with products
  }
  const initialLength = categories.length
  categories = categories.filter((category) => category.id !== id && category.parentId !== id) // Also delete children
  return categories.length < initialLength
}
