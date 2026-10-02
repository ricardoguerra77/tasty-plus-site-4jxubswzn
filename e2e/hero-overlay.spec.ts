import { test, expect } from '@playwright/test'

/**
 * Functional Playwright tests for Hero Overlay Opacity:
 * 1) Admin defines the opacity in /admin -> Configurações Gerais, saves, reloads, and the value persists;
 * 2) On public home, the overlay veil style reflects the configured value (computed style / inline opacity);
 * 3) With absent value, the overlay uses the default (45% -> opacity: 0.45).
 */

const ADMIN_EMAIL = 'admin@tastyplus.com.br'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Skip@PassAdmin2025!'

async function loginAsAdmin(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/login')
  await page.locator('input[type="email"]').fill(ADMIN_EMAIL)
  await page.locator('input[type="password"]').fill(ADMIN_PASSWORD)
  await page.locator('button[type="submit"]:has-text("Entrar")').click()
  await expect(page).toHaveURL(/\/admin/)
  await expect(page.locator('text=Painel de Administração')).toBeVisible()
}

test.describe('Hero Overlay Opacity Configuration and Rendering', () => {
  test('1) admin defines opacity in /admin -> Configurações Gerais, saves, reloads and value persists', async ({
    page,
  }) => {
    await loginAsAdmin(page)

    // Ensure we are on Configurações Gerais tab
    await expect(page.locator('text=Configurações Gerais do Site')).toBeVisible()
    await expect(page.locator('text=Escurecimento das imagens do carrossel (%)')).toBeVisible()

    const slider = page.locator('#heroOverlayOpacity')
    await expect(slider).toBeVisible()

    // Move slider or set value via keyboard / slider interaction
    await slider.focus()
    // Press right arrow several times or set directly
    await slider.press('ArrowRight')
    await slider.press('ArrowRight')

    // Read display value
    const display = page.locator('#hero-overlay-opacity-display')
    await expect(display).toBeVisible()
    const currentText = await display.innerText()
    const targetValue = parseInt(currentText.replace('%', ''), 10)

    // Save changes
    await page.locator('#btn-save-general-settings').click()
    await expect(page.locator('text=Alterações salvas com sucesso.')).toBeVisible()

    // Reload page
    await page.reload()
    await expect(page.locator('text=Configurações Gerais do Site')).toBeVisible()

    // Verify value persisted in display
    await expect(page.locator('#hero-overlay-opacity-display')).toHaveText(`${targetValue}%`)
  })

  test('2) on public home, the overlay veil reflects the configured opacity', async ({ page }) => {
    // First, set a known opacity value (e.g. 60%) via admin
    await loginAsAdmin(page)
    const slider = page.locator('#heroOverlayOpacity')
    await slider.focus()
    // We can evaluate slider value change
    await page.evaluate(() => {
      // Direct update of the site_settings record to 60 for reliable functional test
      const auth = JSON.parse(localStorage.getItem('pocketbase_auth') || '{}')
      return fetch('/api/collections/site_settings/records', {
        headers: { Authorization: auth.token || '' },
      })
        .then((r) => r.json())
        .then((data) => {
          const rec = data.items?.[0]
          if (!rec) return
          return fetch(`/api/collections/site_settings/records/${rec.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: auth.token || '',
            },
            body: JSON.stringify({ heroOverlayOpacity: 60 }),
          })
        })
    })

    // Now visit public home page
    await page.goto('/')
    await expect(page.locator('h1').first()).toBeVisible()

    // Find the overlay veil
    const overlayVeil = page.locator('[data-testid="hero-overlay-veil"]').first()
    await expect(overlayVeil).toBeVisible()

    // Check computed opacity style is 0.6
    const opacityValue = await overlayVeil.evaluate((el) => {
      return window.getComputedStyle(el).opacity
    })
    expect(Number(opacityValue)).toBeCloseTo(0.6, 1)
  })

  test('3) with absent / default value, the overlay uses the 45% default (opacity: 0.45)', async ({
    page,
  }) => {
    // Reset heroOverlayOpacity to null/default in database
    await loginAsAdmin(page)
    await page.evaluate(() => {
      const auth = JSON.parse(localStorage.getItem('pocketbase_auth') || '{}')
      return fetch('/api/collections/site_settings/records', {
        headers: { Authorization: auth.token || '' },
      })
        .then((r) => r.json())
        .then((data) => {
          const rec = data.items?.[0]
          if (!rec) return
          return fetch(`/api/collections/site_settings/records/${rec.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: auth.token || '',
            },
            body: JSON.stringify({ heroOverlayOpacity: null }),
          })
        })
    })

    // Visit home page
    await page.goto('/')
    await expect(page.locator('h1').first()).toBeVisible()

    const overlayVeil = page.locator('[data-testid="hero-overlay-veil"]').first()
    await expect(overlayVeil).toBeVisible()

    const opacityValue = await overlayVeil.evaluate((el) => {
      return window.getComputedStyle(el).opacity
    })
    // 45% is 0.45
    expect(Number(opacityValue)).toBeCloseTo(0.45, 1)
  })
})
