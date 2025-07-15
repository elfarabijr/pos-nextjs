import { NextResponse } from "next/server"
import { getProductById, updateProduct, deleteProduct } from "@/lib/db"

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
    const product = await getProductById(id)
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ message: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  try {
    const id = Number.parseInt(params.id)
    const body = await request.json()
    const updatedProduct = await updateProduct(id, body)
    if (!updatedProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }
    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ message: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  try {
    const id = Number.parseInt(params.id)
    const success = await deleteProduct(id)
    if (!success) {
      return NextResponse.json({ message: "Product not found or could not be deleted" }, { status: 404 })
    }
    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ message: "Failed to delete product" }, { status: 500 })
  }
}
