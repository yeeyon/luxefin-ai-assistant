import { createHmac, timingSafeEqual } from "crypto"
import { cookies } from "next/headers"

const SESSION_COOKIE = "admin_session"
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim() || process.env.ADMIN_PASSWORD?.trim()
  if (!secret) {
    throw new Error("ADMIN_PASSWORD or SESSION_SECRET must be configured")
  }
  return secret
}

function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD?.trim().replace(/\r?\n/g, "")
  if (!password) {
    throw new Error("ADMIN_PASSWORD is not configured")
  }
  return password
}

function signPayload(payload: string): string {
  const signature = createHmac("sha256", getSessionSecret()).update(payload).digest("base64url")
  return `${signature}.${Buffer.from(payload, "utf8").toString("base64url")}`
}

function verifySignedToken(token: string): string | null {
  const [signature, encodedPayload] = token.split(".")
  if (!signature || !encodedPayload) return null

  const payload = Buffer.from(encodedPayload, "base64url").toString("utf8")
  const expected = createHmac("sha256", getSessionSecret()).update(payload).digest("base64url")

  try {
    const valid = timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    if (!valid) return null
    return payload
  } catch {
    return null
  }
}

export function verifyAdminPassword(password: string): boolean {
  const expected = getAdminPassword()
  const provided = password.trim()

  if (expected.length !== provided.length) return false

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(provided))
  } catch {
    return false
  }
}

export function createSessionToken(): string {
  const payload = JSON.stringify({
    role: "admin",
    exp: Date.now() + SESSION_TTL_MS,
  })
  return signPayload(payload)
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false

  const payload = verifySignedToken(token)
  if (!payload) return false

  try {
    const parsed = JSON.parse(payload) as { role?: string; exp?: number }
    return parsed.role === "admin" && typeof parsed.exp === "number" && parsed.exp > Date.now()
  } catch {
    return false
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value)
}

export function getSessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  }
}
