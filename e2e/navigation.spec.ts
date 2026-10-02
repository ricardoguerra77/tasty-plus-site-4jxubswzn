import { test, expect } from '@playwright/test'

test.describe('Tasty Plus Institutional Website - Desktop Navigation & Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Set a desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 })
  })

  test('header renders 5 nav links and clicking "Produtos" navigates to /produtos with placeholder', async ({
    page,
  }) => {
    await page.goto('/')

    // Check header logo and wordmark
    await expect(page.getByText('Tasty Aromas e Sabores').first()).toBeVisible()
    await expect(page.getByAltText('Tasty Aromas e Sabores').first()).toBeVisible()

    // Assert the 5 main nav links are visible in desktop header
    const nav = page.getByRole('navigation', { name: 'Navegação principal' })
    await expect(nav.getByRole('link', { name: 'Início' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Produtos' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Representantes' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Notícias' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Contato' })).toBeVisible()

    // Click "Produtos"
    await nav.getByRole('link', { name: 'Produtos' }).click()

    // Assert URL change and products catalog page appears
    await expect(page).toHaveURL(/\/produtos/)
    await expect(page.getByRole('heading', { level: 1, name: 'Nossos Produtos' })).toBeVisible()
    await expect(page.getByText('Catálogo Industrial')).toBeVisible()
  })

  test('toggle dark mode applies and removes the "dark" class on the <html> element', async ({
    page,
  }) => {
    await page.goto('/')

    const html = page.locator('html')
    const toggleButton = page
      .getByRole('button', {
        name: /ativar modo escuro|ativar modo claro/i,
      })
      .first()

    await expect(toggleButton).toBeVisible()

    // Read initial state
    const initialClass = await html.getAttribute('class')
    const isInitiallyDark = initialClass?.includes('dark') ?? false

    // Click toggle
    await toggleButton.click()

    if (isInitiallyDark) {
      await expect(html).not.toHaveClass(/dark/)
    } else {
      await expect(html).toHaveClass(/dark/)
    }

    // Toggle again to verify return to prior state
    await toggleButton.click()
    if (isInitiallyDark) {
      await expect(html).toHaveClass(/dark/)
    } else {
      await expect(html).not.toHaveClass(/dark/)
    }
  })

  test('open /noticias and /contato and assert each renders without console errors', async ({
    page,
  }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Visit /noticias
    await page.goto('/noticias')
    await expect(page.getByRole('heading', { level: 1, name: 'Notícias' })).toBeVisible()
    await expect(page.getByText('(Conteúdo em breve)')).toBeVisible()

    // Visit dynamic news route /noticias/42
    await page.goto('/noticias/42')
    await expect(page.getByRole('heading', { level: 1, name: 'Notícia #42' })).toBeVisible()

    // Visit /contato
    await page.goto('/contato')
    await expect(page.getByRole('heading', { level: 1, name: 'Contato' })).toBeVisible()

    // Footer verification
    await expect(page.getByText(/Otacílio Roxo/i)).toBeVisible()
    await expect(page.getByText(/26\.030-800|Cerâmica/i)).toBeVisible()
    await expect(page.getByText('tasty@tastyplus.com.br')).toBeVisible()
    await expect(page.getByText(/Todos os direitos reservados/)).toBeVisible()

    // Ensure no uncaught browser errors
    expect(consoleErrors).toHaveLength(0)
  })

  test('mobile viewport collapses nav into hamburger and drawer navigates properly', async ({
    page,
  }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Desktop nav should be hidden
    const desktopNav = page.getByRole('navigation', { name: 'Navegação principal' })
    await expect(desktopNav).toBeHidden()

    // Hamburger button should be visible
    const hamburger = page.getByRole('button', { name: 'Abrir menu de navegação' })
    await expect(hamburger).toBeVisible()

    // Open drawer
    await hamburger.click()

    // Drawer nav should be visible with links
    const mobileNav = page.getByRole('navigation', { name: 'Navegação móvel' })
    await expect(mobileNav).toBeVisible()
    await expect(mobileNav.getByRole('link', { name: 'Representantes' })).toBeVisible()

    // Click link inside drawer
    await mobileNav.getByRole('link', { name: 'Representantes' }).click()

    // Assert URL and page content
    await expect(page).toHaveURL(/\/representantes/)
    await expect(page.getByRole('heading', { level: 1, name: 'Representantes' })).toBeVisible()
  })

  test('renders login page with Acesso Restrito for guarded routes', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { level: 2, name: 'Acesso Restrito' })).toBeVisible()

    // /admin redirects to /login when unauthenticated
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/login/)

    // /admin/noticias redirects to /login when unauthenticated
    await page.goto('/admin/noticias')
    await expect(page).toHaveURL(/\/login/)
  })
})
