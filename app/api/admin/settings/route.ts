import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/auth"
import { getAppSettings, isConfigured, saveAppSettings, toPublicConfig } from "@/lib/settings/store"
import type { AppSettings } from "@/lib/settings/types"

export const dynamic = "force-dynamic"

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const settings = await getAppSettings()
    return NextResponse.json({
      settings,
      configured: isConfigured(settings),
      publicConfig: toPublicConfig(settings),
      persistence: process.env.BLOB_READ_WRITE_TOKEN ? "vercel-blob" : "local-file",
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load settings" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = (await request.json()) as Partial<AppSettings>
    const settings = await saveAppSettings(body)

    return NextResponse.json({
      success: true,
      settings,
      publicConfig: toPublicConfig(settings),
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save settings" },
      { status: 500 }
    )
  }
}
