import { describe, it, expect } from 'vitest'
import { routesConfig } from '@/config/navigation'

/**
 * Direct deep link routing verification for the required paths:
 * /, /quem-somos, /produtos, /qualidade, /representantes, /noticias, /contato, /login, /admin, /admin/noticias, /reset-password
 * Confirms each path is explicitly configured with a lazy-loaded component
 * and that only truly unknown paths hit NotFound / catch-all (*).
 */

describe('Deep Link Routing & Catch-All Verification', () => {
  const deepLinkPaths = [
    '/',
    '/quem-somos',
    '/produtos',
    '/qualidade',
    '/representantes',
    '/noticias',
    '/contato',
    '/login',
    '/admin',
    '/admin/noticias',
    '/reset-password',
  ]

  deepLinkPaths.forEach((targetPath) => {
    it(`resolves deep link "${targetPath}" to a registered route and not NotFound`, () => {
      const match = routesConfig.find((r) => r.path === targetPath)
      expect(match).toBeDefined()
      expect(match?.path).toBe(targetPath)
      expect(match?.lazyComponent).toBeDefined()
      expect(match?.title).toBeTruthy()
    })
  })

  it('correctly distinguishes unknown URLs and marks them for catch-all (*)', () => {
    const unknownPaths = [
      '/rota-inexistente',
      '/admin/usuarios-fake',
      '/pagina-qualquer-404',
      '/produtos/categoria/detalhes/inexistente',
    ]

    const registeredSet = new Set(routesConfig.map((r) => r.path))

    unknownPaths.forEach((path) => {
      expect(registeredSet.has(path)).toBe(false)
    })
  })
})
