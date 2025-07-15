import { NextResponse } from "next/server"
import { getUserById, updateUser, deleteUser } from "@/lib/db"

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
    const user = await getUserById(id)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }
    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ message: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  try {
    const id = Number.parseInt(params.id)
    const body = await request.json()
    const updatedUser = await updateUser(id, body)
    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ message: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  try {
    const id = Number.parseInt(params.id)
    const success = await deleteUser(id)
    if (!success) {
      return NextResponse.json({ message: "User not found or could not be deleted" }, { status: 404 })
    }
    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ message: "Failed to delete user" }, { status: 500 })
  }
}
