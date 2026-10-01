import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getTheme, applyTheme, toggleTheme, initTheme, THEME_STORAGE_KEY } from '@/lib/theme'

describe('Theme utility (theme.ts)', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    vi.restoreAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
  })

  it('getTheme defaults to light when localStorage is empty and system preference is light', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    expect(getTheme()).toBe('light')
  })

  it('getTheme defaults to light even when system prefers dark if localStorage is empty', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    expect(getTheme()).toBe('light')
  })

  it('getTheme prioritizes localStorage over system preference', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    expect(getTheme()).toBe('dark')

    localStorage.setItem(THEME_STORAGE_KEY, 'light')
    expect(getTheme()).toBe('light')
  })

  it('applyTheme adds dark class when theme is dark', () => {
    applyTheme('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('applyTheme removes dark class when theme is light', () => {
    document.documentElement.classList.add('dark')
    applyTheme('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('toggleTheme flips theme, persists to localStorage, and updates DOM class', () => {
    // Starts as light
    localStorage.setItem(THEME_STORAGE_KEY, 'light')
    document.documentElement.classList.remove('dark')

    const toggledToDark = toggleTheme()
    expect(toggledToDark).toBe('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    const toggledToLight = toggleTheme()
    expect(toggledToLight).toBe('light')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('initTheme hydrates and applies dark class before first paint when stored', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    const applied = initTheme()
    expect(applied).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('initTheme hydrates and removes dark class when stored as light', () => {
    document.documentElement.classList.add('dark')
    localStorage.setItem(THEME_STORAGE_KEY, 'light')
    const applied = initTheme()
    expect(applied).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
