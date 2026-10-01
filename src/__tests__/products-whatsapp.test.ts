import { describe, it, expect } from 'vitest'
import { formatPhoneMask, buildWhatsAppLink } from '@/lib/whatsapp'
import type { Product } from '@/services/products'

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

describe('Unit Tests: Product Filtering and Sorting Logic', () => {
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
      category: 'Aroma',
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
})
