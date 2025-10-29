import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 })
    }

    // In a real app, you would verify against database
    // For now, we'll just return success
    const userId = Date.now().toString()
    const name = email.split("@")[0]

    return NextResponse.json({
      userId,
      name,
      email,
      message: "Login successful",
    })
  } catch (error) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
