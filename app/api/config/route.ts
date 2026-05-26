import { NextResponse } from "next/server"
import { getAppSettings, isConfigured, toPublicConfig } from "@/lib/settings/store"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const settings = await getAppSettings()

    return NextResponse.json({
      configured: isConfigured(settings),
      config: toPublicConfig(settings),
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load config" },
      { status: 500 }
    )
  }
}
