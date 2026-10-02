import { describe, it, expect } from 'vitest'
import { formatPhoneMask, buildWhatsAppLink } from '@/lib/whatsapp'
import { PRODUCT_CATEGORIES, type Product, type ProductCategory } from '@/services/products'

describe('Unit Tests: WhatsApp Link Builder & Phone Mask', () => {
  it('correctly builds WhatsApp link with phone and encoded product text', () => {
    const phone = '21 98883-1253'
    const productName = 'Aroma de Morango'
    const message = `Olá! Gostaria de solicitar cotação para o produto: ${productName}.`
    const link = buildWhatsAppLink(phone, message)

    expect(link).toContain('https://wa.me/5521988831253')
    expect(link).toContain(encodeURIComponent(message))
    expect(link).toContain('Aroma%20de%20Morango')
  })

  it('correctly builds single WhatsApp general quote link with sales phone', () => {
    const phone = '21 98883-1253'
    const message = 'Olá! Gostaria de solicitar uma cotação comercial da Tasty Aromas e Sabores.'
    const link = buildWhatsAppLink(phone, message)

    expect(link).toBe(
      'https://wa.me/5521988831253?text=Ol%C3%A1!%20Gostaria%20de%20solicitar%20uma%20cota%C3%A7%C3%A3o%20comercial%20da%20Tasty%20Aromas%20e%20Sabores.',
    )
  })

  it('correctly formats Brazilian phone numbers with mask', () => {
    // Empty
    expect(formatPhoneMask('')).toBe('')

    // Partial DDD
    expect(formatPhoneMask('2')).toBe('(2')
    expect(formatPhoneMask('21')).toBe('(21')

    // Landline partial & full
    expect(formatPhoneMask('2126583517')).toBe('(21) 2658-3517')

    // Mobile with 9 digits
    expect(formatPhoneMask('21988831253')).toBe('(21) 98883-1253')
    expect(formatPhoneMask('11976647208')).toBe('(11) 97664-7208')
  })
})

describe('Unit Tests: Product Filtering, Sorting and Category Derivation Logic', () => {
  const sampleProducts: Product[] = [
    {
      id: '1',
      name: 'Aroma de Baunilha',
      category: 'Aroma',
      order: 10,
      published: true,
    },
    {
      id: '2',
      name: 'Extrato de Guaraná',
      category: 'Extrato',
      order: 5,
      published: true,
    },
    {
      id: '3',
      name: 'Aroma de Morango',
      category: 'Aroma',
      order: 2,
      published: true,
    },
    {
      id: '4',
      name: 'Produto Desativado',
      category: 'Aditivo',
      order: 1,
      published: false,
    },
    {
      id: '5',
      name: 'Corante Caramelo',
      category: 'Corante',
      order: 20,
      published: true,
    },
  ]

  it('category filter returns only matching products', () => {
    const aromaOnly = sampleProducts.filter((p) => p.published && p.category === 'Aroma')
    expect(aromaOnly).toHaveLength(2)
    expect(aromaOnly.every((p) => p.category === 'Aroma')).toBe(true)

    const extratoOnly = sampleProducts.filter((p) => p.published && p.category === 'Extrato')
    expect(extratoOnly).toHaveLength(1)
    expect(extratoOnly[0].name).toBe('Extrato de Guaraná')
  })

  it('unpublished products are strictly excluded', () => {
    const activeProducts = sampleProducts.filter((p) => p.published === true)
    expect(activeProducts).toHaveLength(4)
    expect(activeProducts.some((p) => p.name === 'Produto Desativado')).toBe(false)
  })

  it('sorting by order is respected ascending', () => {
    const sortedActive = sampleProducts
      .filter((p) => p.published)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

    expect(sortedActive[0].name).toBe('Aroma de Morango') // order 2
    expect(sortedActive[1].name).toBe('Extrato de Guaraná') // order 5
    expect(sortedActive[2].name).toBe('Aroma de Baunilha') // order 10
    expect(sortedActive[3].name).toBe('Corante Caramelo') // order 20
  })

  it('derives available categories so only categories with >=1 published product appear, and "Todos" is always present', () => {
    // Derivation logic matching Produtos.tsx
    const deriveCategories = (
      items: Product[],
    ): { label: string; value: 'Todos' | ProductCategory }[] => {
      const counts = new Map<ProductCategory, number>()
      PRODUCT_CATEGORIES.forEach((cat) => counts.set(cat, 0))

      items.forEach((p) => {
        if (p.published !== false && p.category) {
          counts.set(p.category, (counts.get(p.category) ?? 0) + 1)
        }
      })

      const tabs: { label: string; value: 'Todos' | ProductCategory }[] = [
        { label: 'Todos', value: 'Todos' },
      ]

      const labelMap: Record<ProductCategory, string> = {
        Aroma: 'Aromas',
        Extrato: 'Extratos',
        Aditivo: 'Aditivos',
        Corante: 'Corantes',
        Outro: 'Outro',
      }

      PRODUCT_CATEGORIES.forEach((cat) => {
        if ((counts.get(cat) ?? 0) > 0) {
          tabs.push({ label: labelMap[cat], value: cat })
        }
      })

      return tabs
    }

    const availableTabs = deriveCategories(sampleProducts)

    // "Todos" is always first
    expect(availableTabs[0]).toEqual({ label: 'Todos', value: 'Todos' })

    // Published sampleProducts has: Aroma (2), Extrato (1), Corante (1).
    // Aditivo only exists on unpublished (published=false), so Aditivo is NOT present.
    // Outro has 0 products, so Outro is NOT present.
    const values = availableTabs.map((t) => t.value)
    expect(values).toContain('Todos')
    expect(values).toContain('Aroma')
    expect(values).toContain('Extrato')
    expect(values).toContain('Corante')
    expect(values).not.toContain('Aditivo')
    expect(values).not.toContain('Outro')
    expect(availableTabs).toHaveLength(4)
  })

  it('handles empty product list gracefully with only "Todos" present', () => {
    const deriveCategories = (items: Product[]) => {
      const counts = new Map<ProductCategory, number>()
      PRODUCT_CATEGORIES.forEach((cat) => counts.set(cat, 0))

      items.forEach((p) => {
        if (p.published !== false && p.category) {
          counts.set(p.category, (counts.get(p.category) ?? 0) + 1)
        }
      })

      const tabs: { label: string; value: 'Todos' | ProductCategory }[] = [
        { label: 'Todos', value: 'Todos' },
      ]

      PRODUCT_CATEGORIES.forEach((cat) => {
        if ((counts.get(cat) ?? 0) > 0) {
          tabs.push({ label: cat, value: cat })
        }
      })

      return tabs
    }

    const emptyTabs = deriveCategories([])
    expect(emptyTabs).toEqual([{ label: 'Todos', value: 'Todos' }])
  })
})
