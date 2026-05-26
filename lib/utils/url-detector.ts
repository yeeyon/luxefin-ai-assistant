const IMAGE_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
  '.bmp', '.ico', '.tiff', '.tif', '.avif'
];

const IMAGE_URL_PATTERNS = [
  /\/media\/File:/i,
  /\.wikimedia\.org.*\.(jpg|jpeg|png|gif|webp|svg)/i,
  /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff|tif|avif)(\?.*)?$/i
];

export function isImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();

    if (IMAGE_EXTENSIONS.some(ext => pathname.endsWith(ext))) return true;
    if (IMAGE_URL_PATTERNS.some(pattern => pattern.test(url))) return true;

    return false;
  } catch {
    return false;
  }
}

export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
}

export function isOnlyUrl(text: string): boolean {
  const trimmedText = text.trim();
  const urls = extractUrls(trimmedText);
  return urls.length === 1 && trimmedText === urls[0];
}

export interface ContentPart {
  type: 'text' | 'url';
  content: string;
  isImage?: boolean;
}

export function parseMessageContent(text: string): ContentPart[] {
  const parts: ContentPart[] = [];
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  let lastIndex = 0;
  let match;

  while ((match = urlRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const textContent = text.slice(lastIndex, match.index);
      if (textContent.trim()) {
        parts.push({ type: 'text', content: textContent });
      }
    }

    const url = match[0];
    parts.push({
      type: 'url',
      content: url,
      isImage: isImageUrl(url)
    });

    lastIndex = match.index + url.length;
  }

  if (lastIndex < text.length) {
    const textContent = text.slice(lastIndex);
    if (textContent.trim()) {
      parts.push({ type: 'text', content: textContent });
    }
  }

  if (parts.length === 0) {
    parts.push({ type: 'text', content: text });
  }

  return parts;
}
