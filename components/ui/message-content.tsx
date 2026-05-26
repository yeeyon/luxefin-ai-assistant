"use client"

import { useMemo, useState } from "react"
import { parseMessageContent, isOnlyUrl, isImageUrl } from "@/lib/utils/url-detector"
import { sanitizeAssistantHtml } from "@/lib/utils/sanitize-html"
import { ExternalLink, ImageIcon } from "lucide-react"

interface MessageContentProps {
  content: string
  sender: "user" | "bot"
}

export function MessageContent({ content, sender }: MessageContentProps) {
  const [imageError, setImageError] = useState<Set<string>>(new Set())

  const sanitizedAssistantHtml = useMemo(() => {
    if (sender !== "bot") return null
    return sanitizeAssistantHtml(content)
  }, [content, sender])

  if (sanitizedAssistantHtml !== null) {
    return (
      <div
        className="chat-message-html text-sm leading-relaxed break-words text-gray-900 dark:text-slate-100"
        dangerouslySetInnerHTML={{ __html: sanitizedAssistantHtml }}
      />
    )
  }

  if (isOnlyUrl(content) && isImageUrl(content)) {
    return (
      <div className="space-y-2">
        <ImagePreview
          url={content}
          hasError={imageError.has(content)}
          onError={() => setImageError(prev => new Set(prev).add(content))}
        />
      </div>
    )
  }

  const parts = parseMessageContent(content)

  return (
    <div className="space-y-2">
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return (
            <p
              key={index}
              className={`text-sm leading-relaxed break-words whitespace-pre-wrap ${
                sender === "user" ? "text-white" : "text-gray-900 dark:text-slate-100"
              }`}
            >
              {part.content}
            </p>
          )
        }

        if (part.type === 'url' && part.isImage) {
          return (
            <ImagePreview
              key={index}
              url={part.content}
              hasError={imageError.has(part.content)}
              onError={() => setImageError(prev => new Set(prev).add(part.content))}
            />
          )
        }

        return (
          <a
            key={index}
            href={part.content}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 text-sm underline hover:no-underline ${
              sender === "user"
                ? "text-white hover:text-emerald-100"
                : "text-blue-600 dark:text-blue-400 hover:text-blue-800"
            }`}
          >
            {part.content}
            <ExternalLink className="w-3 h-3" />
          </a>
        )
      })}
    </div>
  )
}

function ImagePreview({
  url,
  hasError,
  onError,
}: {
  url: string
  hasError: boolean
  onError: () => void
}) {
  const [isLoading, setIsLoading] = useState(true)

  if (hasError) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-slate-700 rounded-lg">
        <ImageIcon className="w-4 h-4 text-gray-500" />
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 break-all">
          {url}
        </a>
      </div>
    )
  }

  return (
    <div className="relative max-w-sm rounded-lg overflow-hidden border border-gray-200 dark:border-slate-600">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      )}
      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="Shared image"
          className="w-full h-auto max-h-96 object-contain"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            onError()
          }}
        />
      </a>
    </div>
  )
}
