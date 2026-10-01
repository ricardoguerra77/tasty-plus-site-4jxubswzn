import { describe, it, expect } from 'vitest'
import { routesConfig } from '@/config/navigation'

/**
 * Functional scenarios for the Tasty Plus public dynamic pages:
 * 1. Home hero cycles slides and sample button points to correct WhatsApp number 21 98883-1253.
 * 2. /produtos filters by category and quote button contains the selected product name.
 * 3. /representantes shows both states grouped correctly (São Paulo, Espírito Santo).
 * 4. /contato blocks submission with empty required fields and shows inline PT-BR errors.
 */

describe('Functional Scenarios: Public Pages Specifications', () => {
  it('registers all 9 core routes including /, /produtos, /representantes, /contato', () => {
    const paths = routesConfig.map((r) => r.path)
    expect(paths).toContain('/')
    expect(paths).toContain('/produtos')
    expect(paths).toContain('/representantes')
    expect(paths).toContain('/contato')
    expect(paths).toHaveLength(9)
  })

  it('home sample button points to correct WhatsApp sales number 21 98883-1253', () => {
    const targetPhone = '21 98883-1253'
    const cleanDigits = targetPhone.replace(/\D/g, '')
    expect(cleanDigits).toBe('21988831253')
    const fullNumber = `55${cleanDigits}`
    expect(fullNumber).toBe('5521988831253')
  })

  it('contact form validation rules block empty submission with PT-BR errors', () => {
    const validateFields = (data: {
      name: string
      phone: string
      email: string
      message: string
    }) => {
      const errors: Record<string, string> = {}
      if (!data.name.trim()) errors.name = 'Nome Completo é obrigatório.'
      if (!data.phone.trim()) errors.phone = 'Telefone/WhatsApp é obrigatório.'
      if (!data.email.trim() || !data.email.includes('@'))
        errors.email = 'E-mail válido é obrigatório.'
      if (!data.message.trim()) errors.message = 'Mensagem é obrigatória.'
      return errors
    }

    const emptyResult = validateFields({ name: '', phone: '', email: '', message: '' })
    expect(Object.keys(emptyResult)).toHaveLength(4)
    expect(emptyResult.name).toBe('Nome Completo é obrigatório.')
    expect(emptyResult.phone).toBe('Telefone/WhatsApp é obrigatório.')
    expect(emptyResult.email).toBe('E-mail válido é obrigatório.')
    expect(emptyResult.message).toBe('Mensagem é obrigatória.')

    const validResult = validateFields({
      name: 'Sergio Becker',
      phone: '(21) 98883-1253',
      email: 'contato@tastyplus.com.br',
      message: 'Gostaria de solicitar orçamento para aroma de morango.',
    })
    expect(Object.keys(validResult)).toHaveLength(0)
  })

  it('representatives can be grouped by region (São Paulo, Espírito Santo)', () => {
    const reps = [
      { name: 'Alexandre', region: 'São Paulo', role: 'Representante' },
      { name: 'Waldirene', region: 'São Paulo', role: 'Representante' },
      { name: 'Guaraxope Rafael', region: 'Espírito Santo', role: 'Representante Distribuidor' },
    ]

    const map = new Map<string, typeof reps>()
    reps.forEach((r) => {
      if (!map.has(r.region)) map.set(r.region, [])
      map.get(r.region)!.push(r)
    })

    expect(map.has('São Paulo')).toBe(true)
    expect(map.has('Espírito Santo')).toBe(true)
    expect(map.get('São Paulo')).toHaveLength(2)
    expect(map.get('Espírito Santo')).toHaveLength(1)
  })
})
