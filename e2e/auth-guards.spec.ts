import { test, expect } from '@playwright/test'

/**
 * Functional tests for Tasty Plus authentication route guards
 */
test.describe('Authentication and Route Guards', () => {
  test('unauthenticated user visiting /admin is redirected to /login', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/login/)
    await expect(page.locator('text=Acesso Restrito')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('unauthenticated user visiting /admin/noticias is redirected to /login', async ({
    page,
  }) => {
    await page.goto('/admin/noticias')
    await expect(page).toHaveURL(/\/login/)
    await expect(page.locator('text=Acesso Restrito')).toBeVisible()
  })

  test('non-admin authenticated user cannot access /admin and is redirected', async ({ page }) => {
    // Inject mock editor auth token into PocketBase localStorage auth store
    await page.addInitScript(() => {
      const authData = {
        token: 'mock-editor-token',
        record: {
          id: 'mock_editor_id',
          email: 'editor@tastyplus.com.br',
          name: 'Editor Notícias',
          role: 'editor',
        },
      }
      localStorage.setItem('pocketbase_auth', JSON.stringify(authData))
    })

    await page.goto('/admin')
    // Editor role lacks admin privilege for /admin and must be redirected to /login
    await expect(page).toHaveURL(/\/login/)
  })

  test('public routes render normally without redirection', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/')
    await expect(page.locator('text=Tasty Plus')).toBeVisible()

    await page.goto('/produtos')
    await expect(page).toHaveURL('/produtos')

    await page.goto('/noticias')
    await expect(page).toHaveURL('/noticias')

    await page.goto('/contato')
    await expect(page).toHaveURL('/contato')
  })
})
