import { test, expect } from '@playwright/test'

/**
 * Functional Playwright Tests for Redesigned /produtos Page:
 * (a) The page renders products with name and description and WITHOUT <img> elements inside product cards.
 * (b) Category tabs filter products correctly, and tabs for categories with 0 products do NOT appear (derived filters).
 * (c) Exactly ONE quote CTA exists with wa.me link containing sales phone number 5521988831253.
 * (d) Name/flavor search input works dynamically.
 */

test.describe('Public Products Page (/produtos) Redesign Specification', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/produtos')
    // Wait until loading finishes and products or grid is rendered
    await expect(page.getByRole('heading', { level: 1, name: 'Nossos Produtos' })).toBeVisible()
    await expect(page.getByTestId('quote-cta-banner')).toBeVisible()
  })

  test('(a) renders products with name, description snippet and NO <img> elements in cards', async ({
    page,
  }) => {
    const cards = page.getByTestId('product-card')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)

    // Check the first card: has heading, description text, and NO img tag
    const firstCard = cards.first()
    await expect(firstCard.getByRole('heading', { level: 3 })).toBeVisible()
    await expect(firstCard.locator('p')).toBeVisible()

    // Assert NO <img> tag inside ANY product card
    const cardImages = page.locator('[data-testid="product-card"] img')
    await expect(cardImages).toHaveCount(0)

    // Assert NO individual "Solicitar Cotação" button in each card
    const buttonsInsideCards = page.locator(
      '[data-testid="product-card"] a:has-text("Solicitar Cotação"), [data-testid="product-card"] button:has-text("Solicitar Cotação")',
    )
    await expect(buttonsInsideCards).toHaveCount(0)
  })

  test('(b) category filter works and categories without products do not appear', async ({
    page,
  }) => {
    const tabList = page.getByRole('tablist', { name: 'Filtro de categorias de produtos' })
    await expect(tabList).toBeVisible()

    // "Todos" must always be visible
    const todosTab = tabList.getByRole('tab', { name: 'Todos' })
    await expect(todosTab).toBeVisible()

    // Aroma, Extrato, Corante exist in the database (we checked via db_query)
    await expect(tabList.getByRole('tab', { name: 'Aromas' })).toBeVisible()
    await expect(tabList.getByRole('tab', { name: 'Extratos' })).toBeVisible()
    await expect(tabList.getByRole('tab', { name: 'Corantes' })).toBeVisible()

    // Aditivos and Outro have 0 products in the database, so they must NOT appear
    await expect(tabList.getByRole('tab', { name: 'Aditivos' })).toHaveCount(0)
    await expect(tabList.getByRole('tab', { name: 'Outro' })).toHaveCount(0)

    // Clicking 'Extratos' tab filters to only Extrato products
    await tabList.getByRole('tab', { name: 'Extratos' }).click()
    const extratoCards = page.getByTestId('product-card')
    const extratoCount = await extratoCards.count()
    expect(extratoCount).toBeGreaterThan(0)

    // Every visible card badge must be "Extrato"
    const badges = page.locator('[data-testid="product-card"] span:has-text("Extrato")')
    await expect(badges).toHaveCount(extratoCount)
  })

  test('(c) exactly ONE quotation CTA banner exists with wa.me link containing 5521988831253', async ({
    page,
  }) => {
    // Locate all links with "Solicitar Cotação" text on the page
    const quoteLinks = page.locator('a:has-text("Solicitar Cotação")')
    await expect(quoteLinks).toHaveCount(1)

    // Verify WhatsApp URL
    const href = await quoteLinks.first().getAttribute('href')
    expect(href).toBeTruthy()
    expect(href).toContain('wa.me/5521988831253')
    expect(href).toContain('text=')

    // Also assert the private label franchise banner is maintained
    await expect(
      page.getByText('Marca própria de Whisky e Refrigerante de Cola para ser franqueada'),
    ).toBeVisible()
    await expect(page.getByRole('link', { name: 'Consultar Franquia' })).toBeVisible()
  })

  test('(d) name or flavor search input filters products dynamically', async ({ page }) => {
    const searchInput = page.getByRole('textbox', {
      name: 'Buscar produtos por nome ou sabor',
    })
    await expect(searchInput).toBeVisible()

    // Type a specific known product
    await searchInput.fill('Guaraná')

    const matchingCards = page.getByTestId('product-card')
    const count = await matchingCards.count()
    expect(count).toBeGreaterThan(0)

    // Verify all matching cards contain Guaraná
    for (let i = 0; i < count; i++) {
      const text = await matchingCards.nth(i).innerText()
      expect(text.toLowerCase()).toContain('guaraná')
    }

    // Type a query that yields no products
    await searchInput.fill('xyzprodutoinexistente999')
    await expect(page.getByText('Nenhum produto encontrado')).toBeVisible()
    await expect(
      page.getByText('Não foram encontrados produtos correspondentes à busca'),
    ).toBeVisible()
  })
})
