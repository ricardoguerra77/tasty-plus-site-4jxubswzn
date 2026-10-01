import pb from '@/lib/pocketbase/client'

export interface SiteSettings {
  id: string
  logo?: string
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
  created?: string
  updated?: string
}

export interface SiteSettingsUpdateInput {
  logo?: File | string | null
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
  filename: string,
  thumb?: string,
): string {
  if (!filename) return ''
  return pb.files.getURL({ id: recordId, collectionName: collectionNameOrId }, filename, { thumb })
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
    } else if (typeof val === 'string') {
      formData.append(key, val)
    }
  }

  if (existing) {
    return await pb.collection('site_settings').update<SiteSettings>(existing.id, formData)
  }

  return await pb.collection('site_settings').create<SiteSettings>(formData)
}
