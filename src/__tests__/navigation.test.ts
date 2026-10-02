import { describe, it, expect } from 'vitest'
import { routesConfig, mainNavLinks } from '@/config/navigation'

describe('Navigation and Routes configuration (navigation.ts)', () => {
  it('registers exactly 12 routes', () => {
    expect(routesConfig).toHaveLength(12)
  })

  it('all expected paths are present', () => {
    const expectedPaths = [
      '/',
      '/quem-somos',
      '/produtos',
      '/qualidade',
      '/representantes',
      '/noticias',
      '/noticias/:id',
      '/contato',
      '/login',
      '/reset-password',
      '/admin',
      '/admin/noticias',
    ]

    const actualPaths = routesConfig.map((r) => r.path)
    expectedPaths.forEach((path) => {
      expect(actualPaths).toContain(path)
    })
  })

  it('each route has a non-empty title and a defined lazyComponent', () => {
    routesConfig.forEach((route) => {
      expect(route.title).toBeTruthy()
      expect(typeof route.title).toBe('string')
      expect(route.lazyComponent).toBeDefined()
    })
  })

  it('main navigation exports the 7 public links with correct labels', () => {
    expect(mainNavLinks).toHaveLength(7)
    expect(mainNavLinks).toEqual([
      { path: '/', label: 'Início' },
      { path: '/quem-somos', label: 'Quem Somos' },
      { path: '/produtos', label: 'Produtos' },
      { path: '/qualidade', label: 'Qualidade' },
      { path: '/representantes', label: 'Representantes' },
      { path: '/noticias', label: 'Notícias' },
      { path: '/contato', label: 'Contato' },
    ])
  })
})
