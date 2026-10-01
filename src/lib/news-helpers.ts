/**
 * Generates an SEO and URL-friendly slug from a text string.
 * - Accents and diacritics are removed (normalized NFD)
 * - Lowercased
 * - Spaces and consecutive hyphens become a single hyphen
 * - Special characters and non-alphanumeric chars removed
 * - Trimmed of leading/trailing hyphens
 * - Optional existingSlugs list can ensure uniqueness by appending a suffix (-2, -3, etc.)
 */
export function generateSlug(text: string, existingSlugs?: string[]): string {
  if (!text) return ''

  let base = text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumerics except spaces & hyphens
    .replace(/[\s_]+/g, '-') // replace spaces & underscores with hyphen
    .replace(/-+/g, '-') // collapse consecutive hyphens
    .replace(/^-+|-+$/g, '') // strip leading and trailing hyphens

  if (!base) {
    base = 'noticia'
  }

  if (!existingSlugs || existingSlugs.length === 0) {
    return base
  }

  const existingSet = new Set(existingSlugs.map((s) => s.toLowerCase()))
  if (!existingSet.has(base)) {
    return base
  }

  let counter = 2
  while (existingSet.has(`${base}-${counter}`)) {
    counter += 1
  }
  return `${base}-${counter}`
}

export interface NewsVisibilityItem {
  id?: string
  title: string
  slug: string
  published: boolean
  publishedAt?: string
}

/**
 * Filter items that are publicly visible according to business rules:
 * - Must be published (published === true)
 */
export function filterPublicNews<T extends { published: boolean }>(items: T[]): T[] {
  return items.filter((item) => item.published === true)
}

/**
 * Validates whether a specific news item can be viewed publicly by a visitor:
 * - When user is unauthenticated or has no staff role: published must be true.
 * - When user has 'admin' or 'editor' role: can access drafts as well in preview/editorial contexts.
 */
export function canViewNewsArticle(
  article: { published: boolean } | null | undefined,
  userRole?: 'admin' | 'editor' | null,
): boolean {
  if (!article) return false
  if (userRole === 'admin' || userRole === 'editor') return true
  return Boolean(article.published)
}

/**
 * Role guard helper for navigation and tab permissions
 */
export function canAccessAdmin(userRole?: string | null): boolean {
  return userRole === 'admin'
}

export function canAccessEditorial(userRole?: string | null): boolean {
  return userRole === 'admin' || userRole === 'editor'
}

export function canManageInstitutional(userRole?: string | null): boolean {
  return userRole === 'admin'
}
