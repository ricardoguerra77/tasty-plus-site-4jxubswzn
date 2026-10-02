import { describe, it, expect } from 'vitest'
import { resolveSiteLogoUrl, type SiteSettings } from '@/services/siteSettings'

describe('Site Logo Resolution Helper (resolveSiteLogoUrl)', () => {
  it('returns null when settings is null, undefined, or without id', () => {
    expect(resolveSiteLogoUrl(null, false)).toBeNull()
    expect(resolveSiteLogoUrl(null, true)).toBeNull()
    expect(resolveSiteLogoUrl(undefined, false)).toBeNull()
    expect(resolveSiteLogoUrl({ id: '' } as SiteSettings, false)).toBeNull()
  })

  it('in light mode: returns logo when present', () => {
    const settings: SiteSettings = {
      id: 'settings123',
      logo: 'logo_light.png',
      logoDark: 'logo_dark.png',
    }
    const url = resolveSiteLogoUrl(settings, false)
    expect(url).toBeTruthy()
    expect(url).toContain('logo_light.png')
    expect(url).toContain('settings123')
  })

  it('in light mode: falls back to logoDark if light logo is missing', () => {
    const settings: SiteSettings = {
      id: 'settings123',
      logoDark: 'logo_dark.png',
    }
    const url = resolveSiteLogoUrl(settings, false)
    expect(url).toBeTruthy()
    expect(url).toContain('logo_dark.png')
  })

  it('in dark mode: prioritizes logoDark when present', () => {
    const settings: SiteSettings = {
      id: 'settings123',
      logo: 'logo_light.png',
      logoDark: 'logo_dark.png',
    }
    const url = resolveSiteLogoUrl(settings, true)
    expect(url).toBeTruthy()
    expect(url).toContain('logo_dark.png')
    expect(url).toContain('settings123')
  })

  it('in dark mode: falls back to standard logo if logoDark is not set', () => {
    const settings: SiteSettings = {
      id: 'settings123',
      logo: 'logo_light.png',
    }
    const url = resolveSiteLogoUrl(settings, true)
    expect(url).toBeTruthy()
    expect(url).toContain('logo_light.png')
  })

  it('returns null if neither logo nor logoDark is set on settings', () => {
    const settings: SiteSettings = {
      id: 'settings123',
    }
    expect(resolveSiteLogoUrl(settings, false)).toBeNull()
    expect(resolveSiteLogoUrl(settings, true)).toBeNull()
  })
})
