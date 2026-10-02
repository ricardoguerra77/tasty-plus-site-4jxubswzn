/**
 * Safe HTML Sanitizer for public renderers.
 * Strips script tags, onerror/onclick handlers, javascript: URIs, iframes, etc.
 * Preserves safe formatting tags (p, strong, em, u, h1-h6, ul, ol, li, a, br, span, blockquote).
 */

const ALLOWED_TAGS = new Set([
  'p',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'strike',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'a',
  'br',
  'span',
  'blockquote',
  'hr',
  'sub',
  'sup',
])

const ALLOWED_ATTRS = new Set(['href', 'title', 'target', 'rel', 'class'])

export function sanitizeHtml(dirtyHtml: string | null | undefined): string {
  if (!dirtyHtml) return ''

  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    // Basic regex fallback for server / test environments without DOM
    return dirtyHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript:/gi, '')
  }

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(dirtyHtml, 'text/html')

    const cleanNode = (node: Node): void => {
      // Remove comments and processing instructions
      if (
        node.nodeType === Node.COMMENT_NODE ||
        node.nodeType === Node.PROCESSING_INSTRUCTION_NODE
      ) {
        node.parentNode?.removeChild(node)
        return
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement
        const tagName = el.tagName.toLowerCase()

        if (!ALLOWED_TAGS.has(tagName)) {
          // Replace unsupported/dangerous tag with its text contents or remove
          if (
            tagName === 'script' ||
            tagName === 'style' ||
            tagName === 'iframe' ||
            tagName === 'object' ||
            tagName === 'embed'
          ) {
            el.parentNode?.removeChild(el)
            return
          }
          // Unwrap tag
          const parent = el.parentNode
          if (parent) {
            while (el.firstChild) {
              parent.insertBefore(el.firstChild, el)
            }
            parent.removeChild(el)
          }
          return
        }

        // Clean attributes
        const attrs = Array.from(el.attributes)
        for (const attr of attrs) {
          const attrName = attr.name.toLowerCase()
          if (!ALLOWED_ATTRS.has(attrName) || attrName.startsWith('on')) {
            el.removeAttribute(attr.name)
            continue
          }

          if (attrName === 'href') {
            const val = attr.value.trim().toLowerCase()
            if (
              val.startsWith('javascript:') ||
              val.startsWith('data:') ||
              val.startsWith('vbscript:')
            ) {
              el.removeAttribute(attr.name)
            } else if (val.startsWith('http://') || val.startsWith('https://')) {
              el.setAttribute('target', '_blank')
              el.setAttribute('rel', 'noopener noreferrer')
            }
          }
        }
      }

      // Recursively clean children
      const children = Array.from(node.childNodes)
      for (const child of children) {
        cleanNode(child)
      }
    }

    cleanNode(doc.body)
    return doc.body.innerHTML
  } catch {
    return dirtyHtml
  }
}
