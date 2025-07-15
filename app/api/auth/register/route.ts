import { NextResponse } from "next/server"
import { createUser, getUserByEmail } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, password, businessName, role } = await request.json()

    if (!firstName || !lastName || !email || !password || !businessName || !role) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 })
    }

    const newUser = await createUser({
      name: `${firstName} ${lastName}`,
      email,
      password, // In a real app, hash this password!
      role,
      permissions: role === "owner" || role === "admin" ? ["all"] : ["pos"], // Basic permission assignment
    })

    // In a real app, you'd generate a JWT here
    const token = "mock-auth-token-123" // Simplified token

    return NextResponse.json(
      {
        message: "Registration successful",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          permissions: newUser.permissions,
        },
        token,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
