export interface AppSettings {
  appName: string
  tagline: string
  assistantTitle: string
  chatbotUrl: string
  embedToken: string
  siteOrigin: string
  updatedAt: string
}

export type PublicAppConfig = Pick<
  AppSettings,
  "appName" | "tagline" | "assistantTitle" | "chatbotUrl" | "embedToken" | "siteOrigin"
>

export const DEFAULT_CHATBOT_URL = "https://chatbot.therelah.com"

export const DEFAULT_SETTINGS: AppSettings = {
  appName: "Embed Chat",
  tagline: "Your intelligent AI assistant",
  assistantTitle: "AI Assistant",
  chatbotUrl: DEFAULT_CHATBOT_URL,
  embedToken: "",
  siteOrigin: "",
  updatedAt: new Date(0).toISOString(),
}
