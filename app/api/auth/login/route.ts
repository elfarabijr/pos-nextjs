import { NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    const user = await getUserByEmail(email)

    if (!user || user.password !== password) {
      // Simplified password check
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // In a real app, you'd generate a JWT here
    const token = "mock-auth-token-123" // Simplified token
    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
