/* Theme utility for Tasty Plus: getTheme, applyTheme, toggleTheme, initTheme */

export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'theme'

/**
 * Gets the current theme from localStorage or system preference.
 * Defaults to 'light' if not specified or system preference is light.
 */
export function getTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'dark' || stored === 'light') {
    return stored
  }

  if (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark'
  }

  return 'light'
}

/**
 * Applies the given theme to document.documentElement by adding or removing the 'dark' class.
 */
export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') {
    return
  }

  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

/**
 * Toggles the theme between light and dark, persists to localStorage, and updates DOM.
 */
export function toggleTheme(): Theme {
  const current = getTheme()
  const next: Theme = current === 'dark' ? 'light' : 'dark'

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(THEME_STORAGE_KEY, next)
  }

  applyTheme(next)
  return next
}

/**
 * Hydrate/init function: reads stored or system theme and applies it before first paint.
 */
export function initTheme(): Theme {
  const initial = getTheme()
  applyTheme(initial)
  return initial
}
