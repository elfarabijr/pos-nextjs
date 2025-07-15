import { NextResponse } from "next/server"
import { getCategories, createCategory } from "@/lib/db"

// Helper to simulate authentication (replace with actual auth middleware)
function isAuthenticated(request: Request) {
  const authHeader = request.headers.get("Authorization")
  return authHeader === "Bearer mock-auth-token-123" // Simplified check
}

export async function GET(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  try {
    const categories = await getCategories()
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ message: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await request.json()
    const newCategory = await createCategory(body)
    return NextResponse.json(newCategory, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ message: "Failed to create category" }, { status: 500 })
  }
}
