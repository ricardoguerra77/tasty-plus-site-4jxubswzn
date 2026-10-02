/**
 * Helper to normalize and convert heroOverlayOpacity (0–100) to decimal opacity (0.00–1.00)
 * Default: 45 (0.45)
 */

export const DEFAULT_HERO_OVERLAY_OPACITY = 45

/**
 * Normalizes an overlay percentage value between 0 and 100.
 * Falls back to DEFAULT_HERO_OVERLAY_OPACITY (45) if null, undefined or NaN.
 */
export function normalizeHeroOverlayPercent(val?: number | null): number {
  if (val === null || val === undefined || Number.isNaN(Number(val))) {
    return DEFAULT_HERO_OVERLAY_OPACITY
  }
  const num = Number(val)
  if (num < 0) return 0
  if (num > 100) return 100
  return Math.round(num)
}

/**
 * Returns a decimal opacity value between 0 and 1 suitable for CSS style (e.g. style={{ opacity }}).
 * 0% -> 0
 * 45% -> 0.45
 * 100% -> 1
 */
export function getHeroOverlayDecimalOpacity(val?: number | null): number {
  const percent = normalizeHeroOverlayPercent(val)
  return percent / 100
}
