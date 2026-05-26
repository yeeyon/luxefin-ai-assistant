import DOMPurify from 'isomorphic-dompurify'

const CHAT_HTML_CONFIG = {
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'ul', 'ol', 'li',
    'b', 'strong', 'i', 'em', 'u', 'a', 'span', 'div', 'figure', 'figcaption', 'img',
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'rel', 'src', 'alt', 'width', 'height',
    'loading', 'decoding', 'title', 'referrerpolicy',
  ],
  ALLOW_DATA_ATTR: false,
}

const NON_VOID_TAGS = [
  'h[1-6]',
  'p',
  'ul',
  'ol',
  'li',
  'b',
  'strong',
  'i',
  'em',
  'u',
  'a',
  'span',
  'div',
  'figure',
  'figcaption',
].join('|')

const HTML_PAIR_RE = new RegExp(
  `<(${NON_VOID_TAGS})\\b[^>]*>[\\s\\S]*?<\\/\\1>`,
  'i'
)
const VOID_HTML_RE = /<(?:br|img)\b[^>]*\/?>/i
const PRESERVED_HTML_RE = /<\/?(?:h[1-6]|p|br|ul|ol|li|b|strong|i|em|u|a|span|div|figure|figcaption|img)\b/i

function hasAssistantHtml(content: string): boolean {
  return HTML_PAIR_RE.test(content) || VOID_HTML_RE.test(content)
}

function prepareAssistantContent(content: string): string {
  const trimmed = content.trim()
  if (!hasAssistantHtml(trimmed)) return trimmed

  return trimmed.replace(/\r\n/g, '\n').replace(/\n/g, '<br>')
}

/**
 * Sanitize assistant HTML when the response includes markup anywhere in the
 * string (not only when the entire message is a single HTML fragment). Plain
 * text and user messages stay on React's escaped text-rendering path.
 */
export function sanitizeAssistantHtml(content: string): string | null {
  const prepared = prepareAssistantContent(content)
  if (!hasAssistantHtml(prepared)) return null

  const sanitized = DOMPurify.sanitize(prepared, CHAT_HTML_CONFIG).trim()
  if (!sanitized) return null

  return PRESERVED_HTML_RE.test(sanitized) ? sanitized : null
}
