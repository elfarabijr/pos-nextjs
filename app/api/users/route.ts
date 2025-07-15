import { NextResponse } from "next/server"
import { getUsers, createUser } from "@/lib/db"

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
    const users = await getUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ message: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await request.json()
    const newUser = await createUser(body)
    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ message: "Failed to create user" }, { status: 500 })
  }
}
