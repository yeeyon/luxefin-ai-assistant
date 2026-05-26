import { promises as fs } from "fs"
import path from "path"
import { list, put } from "@vercel/blob"
import { AppSettings, DEFAULT_SETTINGS } from "./types"
import { getSettingsFromEnv } from "./env"

const SETTINGS_FILE = path.join(process.cwd(), "data", "settings.json")
const BLOB_PATHNAME = "app-settings.json"

function normalizeSettings(input: Partial<AppSettings>): AppSettings {
  const chatbotUrl = (input.chatbotUrl || DEFAULT_SETTINGS.chatbotUrl).replace(/\/$/, "")

  return {
    appName: input.appName?.trim() || DEFAULT_SETTINGS.appName,
    tagline: input.tagline?.trim() || DEFAULT_SETTINGS.tagline,
    assistantTitle: input.assistantTitle?.trim() || DEFAULT_SETTINGS.assistantTitle,
    chatbotUrl,
    embedToken: input.embedToken?.trim() || "",
    siteOrigin: input.siteOrigin?.trim() || "",
    updatedAt: new Date().toISOString(),
  }
}

async function readFromFile(): Promise<AppSettings | null> {
  try {
    const raw = await fs.readFile(SETTINGS_FILE, "utf8")
    return normalizeSettings(JSON.parse(raw) as Partial<AppSettings>)
  } catch {
    return null
  }
}

async function writeToFile(settings: AppSettings): Promise<void> {
  await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true })
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf8")
}

async function readFromBlob(): Promise<AppSettings | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null

  try {
    const { blobs } = await list({
      prefix: BLOB_PATHNAME,
      limit: 1,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
    const blob = blobs.find((item) => item.pathname === BLOB_PATHNAME) ?? blobs[0]
    if (!blob?.url) return null

    const response = await fetch(blob.url)
    if (!response.ok) return null
    return normalizeSettings((await response.json()) as Partial<AppSettings>)
  } catch {
    return null
  }
}

async function writeToBlob(settings: AppSettings): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured")
  }

  await put(BLOB_PATHNAME, JSON.stringify(settings), {
    access: "public",
    addRandomSuffix: false,
    token: process.env.BLOB_READ_WRITE_TOKEN,
    contentType: "application/json",
  })
}

export async function getAppSettings(): Promise<AppSettings> {
  const fromBlob = await readFromBlob()
  if (fromBlob?.embedToken) return fromBlob

  const fromFile = await readFromFile()
  if (fromFile?.embedToken) return fromFile

  const fromEnv = getSettingsFromEnv()
  if (fromEnv.embedToken) return fromEnv

  return fromBlob ?? fromFile ?? fromEnv
}

export async function saveAppSettings(input: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getAppSettings()
  const next = normalizeSettings({ ...current, ...input })

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await writeToBlob(next)
    return next
  }

  try {
    await writeToFile(next)
    return next
  } catch (error) {
    throw new Error(
      "Could not persist settings. Enable Vercel Blob (BLOB_READ_WRITE_TOKEN) or run locally with a writable data/ folder."
    )
  }
}

export function toPublicConfig(settings: AppSettings) {
  return {
    appName: settings.appName,
    tagline: settings.tagline,
    assistantTitle: settings.assistantTitle,
    chatbotUrl: settings.chatbotUrl,
    embedToken: settings.embedToken,
    siteOrigin: settings.siteOrigin || settings.chatbotUrl,
  }
}

export function isConfigured(settings: AppSettings): boolean {
  return Boolean(settings.embedToken.trim() && settings.chatbotUrl.trim())
}
