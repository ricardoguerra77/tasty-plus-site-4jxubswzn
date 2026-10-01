import { describe, it, expect } from 'vitest'
import { routesConfig, mainNavLinks } from '@/config/navigation'

describe('Navigation and Routes configuration (navigation.ts)', () => {
  it('registers exactly 9 routes', () => {
    expect(routesConfig).toHaveLength(9)
  })

  it('all expected paths are present', () => {
    const expectedPaths = [
      '/',
      '/produtos',
      '/representantes',
      '/noticias',
      '/noticias/:id',
      '/contato',
      '/login',
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

  it('main navigation exports the 5 public links with correct labels', () => {
    expect(mainNavLinks).toHaveLength(5)
    expect(mainNavLinks).toEqual([
      { path: '/', label: 'Início' },
      { path: '/produtos', label: 'Produtos' },
      { path: '/representantes', label: 'Representantes' },
      { path: '/noticias', label: 'Notícias' },
      { path: '/contato', label: 'Contato' },
    ])
  })
})
