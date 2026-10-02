import { describe, it, expect } from 'vitest'
import {
  DEFAULT_HERO_OVERLAY_OPACITY,
  normalizeHeroOverlayPercent,
  getHeroOverlayDecimalOpacity,
} from '@/lib/hero-overlay'

describe('Hero Overlay Helper (hero-overlay)', () => {
  it('falls back to 45 when value is undefined, null, or NaN', () => {
    expect(normalizeHeroOverlayPercent(undefined)).toBe(DEFAULT_HERO_OVERLAY_OPACITY)
    expect(normalizeHeroOverlayPercent(null)).toBe(DEFAULT_HERO_OVERLAY_OPACITY)
    expect(normalizeHeroOverlayPercent(NaN)).toBe(DEFAULT_HERO_OVERLAY_OPACITY)

    expect(getHeroOverlayDecimalOpacity(undefined)).toBe(0.45)
    expect(getHeroOverlayDecimalOpacity(null)).toBe(0.45)
    expect(getHeroOverlayDecimalOpacity(NaN)).toBe(0.45)
  })

  it('converts 0% to 0 decimal opacity (image completely visible, no veil)', () => {
    expect(normalizeHeroOverlayPercent(0)).toBe(0)
    expect(getHeroOverlayDecimalOpacity(0)).toBe(0)
  })

  it('converts 100% to 1.0 decimal opacity (maximum darkness)', () => {
    expect(normalizeHeroOverlayPercent(100)).toBe(100)
    expect(getHeroOverlayDecimalOpacity(100)).toBe(1)
  })

  it('handles intermediate values accurately', () => {
    expect(normalizeHeroOverlayPercent(20)).toBe(20)
    expect(getHeroOverlayDecimalOpacity(20)).toBe(0.2)

    expect(normalizeHeroOverlayPercent(75)).toBe(75)
    expect(getHeroOverlayDecimalOpacity(75)).toBe(0.75)

    expect(normalizeHeroOverlayPercent(45)).toBe(45)
    expect(getHeroOverlayDecimalOpacity(45)).toBe(0.45)
  })

  it('clamps values below 0 to 0', () => {
    expect(normalizeHeroOverlayPercent(-10)).toBe(0)
    expect(normalizeHeroOverlayPercent(-999)).toBe(0)
    expect(getHeroOverlayDecimalOpacity(-15)).toBe(0)
  })

  it('clamps values above 100 to 100', () => {
    expect(normalizeHeroOverlayPercent(101)).toBe(100)
    expect(normalizeHeroOverlayPercent(250)).toBe(100)
    expect(getHeroOverlayDecimalOpacity(150)).toBe(1)
  })

  it('rounds decimal percentage input to integer', () => {
    expect(normalizeHeroOverlayPercent(45.4)).toBe(45)
    expect(normalizeHeroOverlayPercent(45.6)).toBe(46)
  })
})
