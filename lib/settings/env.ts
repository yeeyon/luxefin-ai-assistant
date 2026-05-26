import { AppSettings, DEFAULT_CHATBOT_URL, DEFAULT_SETTINGS } from "./types"

function trimEnv(value: string | undefined): string {
  return value?.trim().replace(/\r?\n/g, "") ?? ""
}

export function getSettingsFromEnv(): AppSettings {
  const embedToken = trimEnv(process.env.NEXT_PUBLIC_AI_EMBED_TOKEN)
  const siteOrigin = trimEnv(process.env.NEXT_PUBLIC_AI_ORIGIN)
  const chatbotUrl = trimEnv(process.env.NEXT_PUBLIC_AI_CHATBOT_URL) || DEFAULT_CHATBOT_URL

  return {
    ...DEFAULT_SETTINGS,
    appName: trimEnv(process.env.APP_NAME) || DEFAULT_SETTINGS.appName,
    tagline: trimEnv(process.env.APP_TAGLINE) || DEFAULT_SETTINGS.tagline,
    assistantTitle: trimEnv(process.env.APP_ASSISTANT_TITLE) || DEFAULT_SETTINGS.assistantTitle,
    chatbotUrl,
    embedToken,
    siteOrigin,
    updatedAt: new Date().toISOString(),
  }
}
