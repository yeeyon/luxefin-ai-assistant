"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAIAssistance } from "@/hooks/use-ai-assistance"
import { useAIInit } from "@/hooks/use-ai-init"
import { useAppConfig } from "@/hooks/use-app-config"
import { Send, MessageCircle, Bot, User, Sparkles, AlertCircle, Loader2, Settings } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageContent } from "@/components/ui/message-content"
import type { PublicAppConfig } from "@/lib/settings/types"

interface Message {
  id: number
  content: string
  sender: "user" | "bot"
  timestamp: string
}

interface ChatInterfaceProps {
  config: PublicAppConfig
}

export function ChatInterface({ config }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messageIdCounter = useRef<number>(0)

  const siteOrigin = config.siteOrigin || (typeof window !== "undefined" ? window.location.origin : "")

  const scrollMessagesToBottom = (behavior: ScrollBehavior = "smooth") => {
    const viewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLDivElement | null
    if (!viewport) return
    viewport.scrollTo({ top: viewport.scrollHeight, behavior })
  }

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      scrollMessagesToBottom(messages.length > 1 || isTyping ? "smooth" : "auto")
    })
    return () => window.cancelAnimationFrame(frameId)
  }, [messages, isTyping])

  const { welcomeMessage, suggestedMessages, placeholder, avatars, isLoading: isInitLoading } = useAIInit({
    embedToken: config.embedToken,
    chatbotUrl: config.chatbotUrl,
    origin: siteOrigin,
  })

  const welcomeSeededRef = useRef(false)
  useEffect(() => {
    if (!welcomeMessage || welcomeSeededRef.current) return
    welcomeSeededRef.current = true
    messageIdCounter.current += 1
    setMessages([
      {
        id: messageIdCounter.current,
        content: welcomeMessage,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ])
  }, [welcomeMessage])

  const { sendQuery, isLoading } = useAIAssistance({
    embedToken: config.embedToken,
    chatbotUrl: config.chatbotUrl,
    origin: siteOrigin,
    maxRetries: 1,
    onSuccess: (response) => {
      messageIdCounter.current += 1
      setMessages((prev) => [
        ...prev,
        {
          id: messageIdCounter.current,
          content: response.response,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ])
      setIsTyping(false)
    },
    onError: () => setIsTyping(false),
  })

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    messageIdCounter.current += 1
    setMessages((prev) => [
      ...prev,
      {
        id: messageIdCounter.current,
        content: inputMessage,
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ])
    const query = inputMessage
    setInputMessage("")
    setIsTyping(true)
    await sendQuery(query)
  }

  const handleQuickQuestion = async (question: string) => {
    if (isLoading || isInitLoading) return

    messageIdCounter.current += 1
    setMessages((prev) => [
      ...prev,
      {
        id: messageIdCounter.current,
        content: question,
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ])
    setIsTyping(true)
    await sendQuery(question)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/50">
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full shadow-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-700 bg-clip-text text-transparent">
                {config.appName}
              </h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">{config.tagline}</p>
            <Link href="/admin" className="inline-flex items-center text-xs text-indigo-600 hover:text-indigo-800">
              <Settings className="w-3 h-3 mr-1" />
              Admin CRM
            </Link>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <Card className="h-[650px] flex flex-col shadow-xl border-0 bg-white">
                <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-violet-50 rounded-t-lg">
                  <CardTitle className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10 border-2 border-indigo-200">
                      {avatars?.ai && <AvatarImage src={avatars.ai} alt="AI" />}
                      <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-violet-600">
                        <Bot className="w-5 h-5 text-white" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="text-lg font-semibold">{config.assistantTitle}</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs text-muted-foreground">Online</span>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 p-0 overflow-hidden">
                  <ScrollArea ref={scrollAreaRef} className="h-full">
                    <div className="p-4 space-y-6">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`flex items-start space-x-3 max-w-[85%] ${
                              message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                            }`}
                          >
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              {message.sender === "user" ? (
                                <>
                                  {avatars?.user && <AvatarImage src={avatars.user} alt="User" />}
                                  <AvatarFallback className="bg-gradient-to-r from-slate-500 to-slate-700">
                                    <User className="w-4 h-4 text-white" />
                                  </AvatarFallback>
                                </>
                              ) : (
                                <>
                                  {avatars?.ai && <AvatarImage src={avatars.ai} alt="AI" />}
                                  <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-violet-600">
                                    <Bot className="w-4 h-4 text-white" />
                                  </AvatarFallback>
                                </>
                              )}
                            </Avatar>
                            <div
                              className={`rounded-2xl p-4 shadow-sm ${
                                message.sender === "user"
                                  ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white"
                                  : "bg-white border border-gray-200"
                              }`}
                            >
                              <MessageContent content={message.content} sender={message.sender} />
                              <p className={`text-xs mt-2 ${message.sender === "user" ? "text-indigo-100" : "text-gray-500"}`}>
                                {message.timestamp}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-white border rounded-2xl p-4">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>

                <div className="border-t bg-gray-50/50 p-4 rounded-b-lg">
                  <div className="flex space-x-3">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder={placeholder || "Message..."}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      disabled={isLoading || isInitLoading}
                      className="flex-1 rounded-full"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={isLoading || !inputMessage.trim() || isInitLoading}
                      className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            <div>
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    <span>Quick Questions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {isInitLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                    </div>
                  ) : suggestedMessages.length > 0 ? (
                    suggestedMessages.map((message) => (
                      <Button
                        key={message.id}
                        variant="outline"
                        className="w-full text-left h-auto p-3 text-sm whitespace-normal break-words"
                        onClick={() => handleQuickQuestion(message.content)}
                        disabled={isLoading || isInitLoading}
                      >
                        {message.content}
                      </Button>
                    ))
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-4">No suggested questions</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ChatLoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  )
}

export function ChatConfigRequired() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            Configuration Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Sign in to the admin CRM and set your chatbot URL and embed token.
              <Link href="/admin/login" className="block mt-3 text-indigo-600 underline font-medium">
                Open Admin CRM →
              </Link>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
