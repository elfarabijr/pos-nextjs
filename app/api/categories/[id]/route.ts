import { NextResponse } from "next/server"
import { getCategoryById, updateCategory, deleteCategory } from "@/lib/db"

// Helper to simulate authentication (replace with actual auth middleware)
function isAuthenticated(request: Request) {
  const authHeader = request.headers.get("Authorization")
  return authHeader === "Bearer mock-auth-token-123" // Simplified check
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  try {
    const id = Number.parseInt(params.id)
    const category = await getCategoryById(id)
    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 })
    }
    return NextResponse.json(category)
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json({ message: "Failed to fetch category" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  try {
    const id = Number.parseInt(params.id)
    const body = await request.json()
    const updatedCategory = await updateCategory(id, body)
    if (!updatedCategory) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 })
    }
    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json({ message: "Failed to update category" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  try {
    const id = Number.parseInt(params.id)
    const success = await deleteCategory(id)
    if (!success) {
      return NextResponse.json({ message: "Category not found or contains products" }, { status: 400 })
    }
    return NextResponse.json({ message: "Category deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ message: "Failed to delete category" }, { status: 500 })
  }
}
