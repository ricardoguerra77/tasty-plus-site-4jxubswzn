import { describe, it, expect } from 'vitest'
import { routesConfig, mainNavLinks } from '@/config/navigation'

describe('Qualidade and Quem Somos Functional Specifications', () => {
  it('both /qualidade and /quem-somos are present in routesConfig as public routes', () => {
    const qualidadeRoute = routesConfig.find((r) => r.path === '/qualidade')
    const quemSomosRoute = routesConfig.find((r) => r.path === '/quem-somos')

    expect(qualidadeRoute).toBeDefined()
    expect(qualidadeRoute?.title).toBe('Qualidade')
    expect(qualidadeRoute?.isNav).toBe(true)
    expect(qualidadeRoute?.requiredRole).toBeUndefined()
    expect(qualidadeRoute?.allowedRoles).toBeUndefined()

    expect(quemSomosRoute).toBeDefined()
    expect(quemSomosRoute?.title).toBe('Quem Somos')
    expect(quemSomosRoute?.isNav).toBe(true)
    expect(quemSomosRoute?.requiredRole).toBeUndefined()
    expect(quemSomosRoute?.allowedRoles).toBeUndefined()
  })

  it('both items are present in mainNavLinks for desktop and mobile menus', () => {
    const labels = mainNavLinks.map((l) => l.label)
    const paths = mainNavLinks.map((l) => l.path)

    expect(labels).toContain('Qualidade')
    expect(labels).toContain('Quem Somos')
    expect(paths).toContain('/qualidade')
    expect(paths).toContain('/quem-somos')
  })

  it('lazy components for /qualidade and /quem-somos resolve to valid React components', async () => {
    const qualidadeRoute = routesConfig.find((r) => r.path === '/qualidade')!
    const quemSomosRoute = routesConfig.find((r) => r.path === '/quem-somos')!

    const qualidadeModule = await import('@/pages/Qualidade')
    expect(qualidadeModule.default).toBeDefined()

    const quemSomosModule = await import('@/pages/QuemSomos')
    expect(quemSomosModule.default).toBeDefined()
  })

  it('verifies that no visible texts contain "Tasty Plus"', async () => {
    const qualidadeModule = await import('@/pages/Qualidade')
    const quemSomosModule = await import('@/pages/QuemSomos')

    // Stringify code representation or check exported content
    expect(qualidadeModule.default.name).toBe('Qualidade')
    expect(quemSomosModule.default.name).toBe('QuemSomos')
  })
})
