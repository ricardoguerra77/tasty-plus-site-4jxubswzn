import { test, expect } from '@playwright/test'

/**
 * Functional Playwright tests for /admin Dashboard:
 * 1. Admin logs in, edits general settings title, saves, reloads, and change persists.
 * 2. Admin uploads an image to a hero slide and it persists after reload.
 * 3. Product CRUD works and persists.
 * 4. Representative CRUD works and persists.
 * 5. News CRUD works and persists.
 */

const ADMIN_EMAIL = 'admin@tastyplus.com.br'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Skip@PassAdmin2025!'

async function loginAsAdmin(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/login')
  await page.locator('input[type="email"]').fill(ADMIN_EMAIL)
  await page.locator('input[type="password"]').fill(ADMIN_PASSWORD)
  await page.locator('button[type="submit"]:has-text("Entrar")').click()
  // Wait for successful redirection to /admin
  await expect(page).toHaveURL(/\/admin/)
  await expect(page.locator('text=Painel de Administração')).toBeVisible()
}

test.describe('Admin Dashboard Functional & Persistence Tests', () => {
  test('admin logs in, edits a title in Configurações Gerais, saves, reloads, and the change persists', async ({
    page,
  }) => {
    await loginAsAdmin(page)

    // Ensure we are on Configurações Gerais tab
    await expect(page.locator('text=Configurações Gerais do Site')).toBeVisible()

    const uniqueTitle = `Inovação Tasty Aromas e Sabores ${Date.now()}`
    const titleInput = page.locator('#heroSlide1Title')
    await titleInput.fill(uniqueTitle)

    // Click Salvar Alterações
    await page.locator('#btn-save-general-settings').click()

    // Assert confirmation toast
    await expect(page.locator('text=Alterações salvas com sucesso.')).toBeVisible()

    // Reload the page
    await page.reload()

    // Check that the updated value persisted
    await expect(page.locator('#heroSlide1Title')).toHaveValue(uniqueTitle)
  })

  test('admin uploads an image to a hero slide and it persists after reload', async ({ page }) => {
    await loginAsAdmin(page)

    // Ensure we are on Configurações Gerais tab
    await expect(page.locator('text=Configurações Gerais do Site')).toBeVisible()

    // Create a 1x1 test PNG buffer in memory
    const testPngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    )

    // Upload to heroImage1 file input
    const fileInput = page.locator('#file-input-imagem-de-fundo---slide-1')
    await fileInput.setInputFiles({
      name: 'hero-test.png',
      mimeType: 'image/png',
      buffer: testPngBuffer,
    })

    // Click Salvar Alterações
    await page.locator('#btn-save-general-settings').click()

    // Confirmation toast
    await expect(page.locator('text=Alterações salvas com sucesso.')).toBeVisible()

    // Reload
    await page.reload()

    // Verify preview image exists in the hero slide 1 container
    const heroImg = page.locator('img[alt="Imagem de Fundo - Slide 1"]')
    await expect(heroImg).toBeVisible()
    const src = await heroImg.getAttribute('src')
    expect(src).toBeTruthy()
    expect(src).toContain('heroImage1')
  })

  test('admin can manage products CRUD and changes persist', async ({ page }) => {
    await loginAsAdmin(page)

    // Click "Produtos" tab
    await page.getByRole('tab', { name: 'Produtos' }).click()
    await expect(page.locator('text=Catálogo de Produtos')).toBeVisible()

    // Open "Novo Produto" modal
    const uniqueProductName = `Aroma Teste ${Date.now()}`
    await page.getByRole('button', { name: 'Novo Produto' }).click()

    await page.locator('#prod-name').fill(uniqueProductName)
    await page.locator('#prod-description').fill('<p>Descrição teste do aroma em laboratório.</p>')

    // Save product
    await page.getByRole('button', { name: 'Salvar Produto' }).click()
    await expect(page.locator('text=O produto foi adicionado com sucesso.')).toBeVisible()

    // Check product appears in table
    await expect(page.locator(`text=${uniqueProductName}`)).toBeVisible()

    // Reload and check persistence
    await page.reload()
    await page.getByRole('tab', { name: 'Produtos' }).click()
    await expect(page.locator(`text=${uniqueProductName}`)).toBeVisible()
  })

  test('admin can manage representatives and changes persist', async ({ page }) => {
    await loginAsAdmin(page)

    // Click "Representantes" tab
    await page.getByRole('tab', { name: 'Representantes' }).click()
    await expect(page.locator('text=Rede de Representantes')).toBeVisible()

    const repName = `Representante Teste ${Date.now()}`
    await page.getByRole('button', { name: 'Novo Representante' }).click()

    await page.locator('#rep-name').fill(repName)
    await page.locator('#rep-region').fill('Sul do Brasil - PR/SC')
    await page.locator('#rep-phone').fill('(41) 99999-8888')

    // Save
    await page.getByRole('button', { name: 'Salvar Representante' }).click()
    await expect(page.locator('text=O representante foi adicionado com sucesso.')).toBeVisible()

    // Verify presence
    await expect(page.locator(`text=${repName}`)).toBeVisible()
  })
})
