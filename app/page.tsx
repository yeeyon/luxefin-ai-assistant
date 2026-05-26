"use client"

import { ChatConfigRequired, ChatInterface, ChatLoadingState } from "@/components/chat-interface"
import { useAppConfig } from "@/hooks/use-app-config"

export default function HomePage() {
  const { config, loading, error } = useAppConfig()

  if (loading) return <ChatLoadingState />

  if (error || !config?.embedToken) {
    return <ChatConfigRequired />
  }

  return <ChatInterface config={config} />
}
