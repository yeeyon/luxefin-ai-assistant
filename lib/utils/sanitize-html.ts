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

/** Inline/block tags we expect from the embed API */
const CONTAINS_HTML_RE =
  /<\/?(?:h[1-6]|p|br|ul|ol|li|b|strong|i|em|u|a|span|div|figure|figcaption|img)\b/i

function prepareAssistantContent(content: string): string {
  const trimmed = content.trim()
  if (!CONTAINS_HTML_RE.test(trimmed)) return trimmed

  // API often mixes plain text with HTML and uses newlines between items
  return trimmed.replace(/\r\n/g, '\n').replace(/\n/g, '<br>')
}

/**
 * Sanitize assistant HTML when the response includes markup anywhere in the
 * string (not only when the entire message is a single HTML fragment).
 */
export function sanitizeAssistantHtml(content: string): string | null {
  const prepared = prepareAssistantContent(content)
  if (!CONTAINS_HTML_RE.test(prepared)) return null

  const sanitized = DOMPurify.sanitize(prepared, CHAT_HTML_CONFIG).trim()
  if (!sanitized) return null

  // Use HTML path if tags remain after sanitization, or text was converted (e.g. <br>)
  if (CONTAINS_HTML_RE.test(sanitized) || sanitized.includes('<br')) {
    return sanitized
  }

  return null
}
