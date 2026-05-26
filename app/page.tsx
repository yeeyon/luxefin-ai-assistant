"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAIAssistance } from "@/hooks/use-ai-assistance"
import { useAIInit } from "@/hooks/use-ai-init"
import { getAIAssistanceConfig } from "@/lib/utils/ai-assistance"
import { Send, MessageCircle, Bot, User, Sparkles, Clock, Star, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageContent } from "@/components/ui/message-content"

interface Message {
  id: number
  content: string
  sender: "user" | "bot"
  timestamp: string
}

const assistantFeatures = [
  { icon: Star, label: "Islamic finance guidance", color: "text-emerald-600" },
  { icon: Sparkles, label: "Investment recommendations", color: "text-blue-600" },
  { icon: Clock, label: "Zakat calculations", color: "text-purple-600" },
  { icon: MessageCircle, label: "Estate planning advice", color: "text-orange-600" },
  { icon: Bot, label: "24/7 availability", color: "text-green-600" },
]

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messageIdCounter = useRef<number>(0)

  const aiConfig = getAIAssistanceConfig()

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

  const {
    suggestedMessages,
    placeholder,
    avatars,
    isLoading: isInitLoading,
  } = useAIInit({
    embedToken: aiConfig?.embedToken || "",
    origin: aiConfig?.origin,
    onSuccess: (response) => {
      if (response.welcomeMessage) {
        messageIdCounter.current += 1
        setMessages([
          {
            id: messageIdCounter.current,
            content: response.welcomeMessage,
            sender: "bot",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ])
      }
    },
  })

  const { sendQuery, isLoading } = useAIAssistance({
    embedToken: aiConfig?.embedToken || "",
    origin: aiConfig?.origin,
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
    if (!inputMessage.trim() || isLoading || !aiConfig) return

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
    if (!aiConfig || isLoading || isInitLoading) return

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

  if (!aiConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-green-50/50 flex items-center justify-center p-6">
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
                Set these environment variables (see <code className="bg-gray-100 px-1 rounded">.env.example</code>):
                <code className="bg-gray-100 px-2 py-1 rounded mt-2 block text-xs">
                  NEXT_PUBLIC_AI_EMBED_TOKEN=your_embed_token
                  <br />
                  NEXT_PUBLIC_AI_ORIGIN=https://your-app.vercel.app
                </code>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-green-50/50">
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full shadow-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                Luxefin AI Assistant
              </h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Standalone wealth management companion
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <Card className="h-[650px] flex flex-col shadow-xl border-0 bg-white dark:bg-slate-800">
                <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-t-lg">
                  <CardTitle className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10 border-2 border-emerald-200">
                      {avatars?.ai && <AvatarImage src={avatars.ai} alt="AI Assistant" />}
                      <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-green-600">
                        <Bot className="w-5 h-5 text-white" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="text-lg font-semibold">Wealth Assistant</span>
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
                            <Avatar className="w-8 h-8 flex-shrink-0 shadow-md">
                              {message.sender === "user" ? (
                                <>
                                  {avatars?.user && <AvatarImage src={avatars.user} alt="User" />}
                                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600">
                                    <User className="w-4 h-4 text-white" />
                                  </AvatarFallback>
                                </>
                              ) : (
                                <>
                                  {avatars?.ai && <AvatarImage src={avatars.ai} alt="AI" />}
                                  <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-green-600">
                                    <Bot className="w-4 h-4 text-white" />
                                  </AvatarFallback>
                                </>
                              )}
                            </Avatar>
                            <div
                              className={`rounded-2xl p-4 shadow-sm ${
                                message.sender === "user"
                                  ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white"
                                  : "bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600"
                              }`}
                            >
                              <MessageContent content={message.content} sender={message.sender} />
                              <p
                                className={`text-xs mt-2 ${
                                  message.sender === "user" ? "text-emerald-100" : "text-gray-500"
                                }`}
                              >
                                {message.timestamp}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="flex items-start space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-green-600">
                                <Bot className="w-4 h-4 text-white" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="bg-white border rounded-2xl p-4">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                              </div>
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
                      className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-full"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="shadow-lg border-0 bg-white dark:bg-slate-800">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <span>Quick Questions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {isInitLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
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
                    <p className="text-center text-sm text-muted-foreground py-4">
                      No suggested questions available
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white dark:bg-slate-800">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Bot className="w-5 h-5 text-purple-600" />
                    <span>Assistant Features</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {assistantFeatures.map((feature, index) => {
                    const Icon = feature.icon
                    return (
                      <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                        <div className={`p-2 rounded-full bg-gray-100 ${feature.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{feature.label}</span>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
