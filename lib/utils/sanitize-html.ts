import DOMPurify from 'isomorphic-dompurify'

const CHAT_HTML_CONFIG = {
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'ul', 'ol', 'li',
    'b', 'strong', 'i', 'em', 'u', 'a', 'span', 'div', 'figure', 'figcaption', 'img',
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'rel', 'class', 'src', 'alt', 'width', 'height',
    'loading', 'decoding', 'title', 'referrerpolicy',
  ],
  ALLOW_DATA_ATTR: false,
}

const HTML_FRAGMENT_START_RE =
  /^<(?:h[1-6]|p|br|ul|ol|li|b|strong|i|em|u|a|span|div|figure|figcaption|img)(?:\s|>|\/)/i

export function sanitizeAssistantHtml(content: string): string | null {
  const trimmed = content.trim()

  if (!trimmed.startsWith('<') || !trimmed.endsWith('>')) return null

  const sanitized = DOMPurify.sanitize(trimmed, CHAT_HTML_CONFIG).trim()
  if (!sanitized) return null

  return HTML_FRAGMENT_START_RE.test(sanitized) ? sanitized : null
}
