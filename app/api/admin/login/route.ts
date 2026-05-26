import { NextResponse } from "next/server"
import { createSessionToken, getSessionCookieOptions, verifyAdminCredentials } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string }
    const email = body.email ?? ""
    const password = body.password ?? ""

    if (!verifyAdminCredentials(email, password)) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const response = NextResponse.json({ success: true })
    const cookie = getSessionCookieOptions()
    response.cookies.set(cookie.name, createSessionToken(), cookie)
    return response
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Login failed" },
      { status: 500 }
    )
  }
}
