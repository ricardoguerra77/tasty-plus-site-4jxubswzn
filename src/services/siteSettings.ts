import pb from '@/lib/pocketbase/client'

export interface SiteSettings {
  id: string
  logo?: string
  logoDark?: string
  tagline?: string
  heroSlide1Title?: string
  heroSlide1Subtitle?: string
  heroImage1?: string
  heroSlide2Title?: string
  heroSlide2Subtitle?: string
  heroImage2?: string
  heroSlide3Title?: string
  heroSlide3Subtitle?: string
  heroImage3?: string
  heroOverlayOpacity?: number
  categoryColors?: Record<string, string>
  companyIntro?: string
  mission?: string
  vision?: string
  values?: string
  history?: string
  isoBadge?: boolean
  address?: string
  phoneFixed?: string
  phoneSales?: string
  phoneFinance?: string
  email?: string
  hoursWeek?: string
  hoursFriday?: string
  mapEmbed?: string
  facebook?: string
  instagram?: string
  whatsapp?: string
  orgChartImage?: string
  flowChartImage?: string
  created?: string
  updated?: string
}

export interface SiteSettingsUpdateInput {
  logo?: File | string | null
  logoDark?: File | string | null
  tagline?: string
  heroSlide1Title?: string
  heroSlide1Subtitle?: string
  heroImage1?: File | string | null
  heroSlide2Title?: string
  heroSlide2Subtitle?: string
  heroImage2?: File | string | null
  heroSlide3Title?: string
  heroSlide3Subtitle?: string
  heroImage3?: File | string | null
  heroOverlayOpacity?: number
  categoryColors?: Record<string, string> | null
  companyIntro?: string
  mission?: string
  vision?: string
  values?: string
  history?: string
  isoBadge?: boolean
  address?: string
  phoneFixed?: string
  phoneSales?: string
  phoneFinance?: string
  email?: string
  hoursWeek?: string
  hoursFriday?: string
  mapEmbed?: string
  facebook?: string
  instagram?: string
  whatsapp?: string
  orgChartImage?: File | string | null
  flowChartImage?: File | string | null
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const records = await pb.collection('site_settings').getList<SiteSettings>(1, 1, {
      requestKey: null,
    })
    return records.items[0] ?? null
  } catch {
    return null
  }
}

export function getFileUrl(
  collectionNameOrId: string,
  recordId: string,
  filename?: string,
  thumb?: string,
): string {
  if (!filename) return ''
  return pb.files.getURL({ id: recordId, collectionName: collectionNameOrId }, filename, { thumb })
}

/**
 * Resolves the appropriate logo URL from site_settings based on the active theme mode.
 * - In dark mode: returns logoDark if configured, falling back to standard logo.
 * - In light mode: returns standard logo if configured, falling back to logoDark if standard is not set.
 * Returns null if neither is configured.
 */
export function resolveSiteLogoUrl(
  settings: SiteSettings | null | undefined,
  isDark: boolean,
): string | null {
  if (!settings || !settings.id) return null

  if (isDark) {
    if (settings.logoDark) {
      return getFileUrl('site_settings', settings.id, settings.logoDark)
    }
    if (settings.logo) {
      return getFileUrl('site_settings', settings.id, settings.logo)
    }
    return null
  }

  if (settings.logo) {
    return getFileUrl('site_settings', settings.id, settings.logo)
  }
  if (settings.logoDark) {
    return getFileUrl('site_settings', settings.id, settings.logoDark)
  }
  return null
}

export async function saveSiteSettings(data: SiteSettingsUpdateInput): Promise<SiteSettings> {
  const existing = await getSiteSettings()
  const formData = new FormData()

  // Process all keys
  for (const [key, val] of Object.entries(data)) {
    if (val === undefined) continue
    if (val !== null && typeof val === 'object' && val instanceof File) {
      formData.append(key, val)
    } else if (val === null) {
      formData.append(key, '')
    } else if (typeof val === 'boolean') {
      formData.append(key, String(val))
    } else if (typeof val === 'number') {
      formData.append(key, String(val))
    } else if (typeof val === 'object') {
      // JSON objects like categoryColors
      formData.append(key, JSON.stringify(val))
    } else if (typeof val === 'string') {
      formData.append(key, val)
    }
  }

  if (existing) {
    return await pb.collection('site_settings').update<SiteSettings>(existing.id, formData)
  }

  return await pb.collection('site_settings').create<SiteSettings>(formData)
}
