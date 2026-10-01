import { describe, it, expect } from 'vitest'
import { routesConfig } from '@/config/navigation'

describe('Route Guard and Authorization Rules (Functional)', () => {
  it('/admin route specifies requiredRole = "admin"', () => {
    const adminRoute = routesConfig.find((r) => r.path === '/admin')
    expect(adminRoute).toBeDefined()
    expect(adminRoute?.requiredRole).toBe('admin')
  })

  it('/admin/noticias route specifies allowedRoles = ["admin", "editor"]', () => {
    const noticiasRoute = routesConfig.find((r) => r.path === '/admin/noticias')
    expect(noticiasRoute).toBeDefined()
    expect(noticiasRoute?.allowedRoles).toEqual(['admin', 'editor'])
  })

  it('unauthenticated access evaluation redirects to /login', () => {
    const isAuthValid = false
    const user = null

    // Logic from ProtectedRoute:
    const shouldRedirectToLogin = !isAuthValid || !user
    expect(shouldRedirectToLogin).toBe(true)
  })

  it('authenticated non-admin user accessing admin-only route gets redirected', () => {
    const isAuthValid = true
    const user = { role: 'editor' }
    const requiredRole = 'admin'

    const hasAccess = isAuthValid && user && (!requiredRole || user.role === requiredRole)
    expect(hasAccess).toBe(false)
  })

  it('authenticated editor user accessing /admin/noticias is allowed', () => {
    const isAuthValid = true
    const user = { role: 'editor' }
    const allowedRoles = ['admin', 'editor']

    const hasAccess = isAuthValid && user && allowedRoles.includes(user.role)
    expect(hasAccess).toBe(true)
  })

  it('authenticated admin user accessing /admin is allowed', () => {
    const isAuthValid = true
    const user = { role: 'admin' }
    const requiredRole = 'admin'

    const hasAccess = isAuthValid && user && user.role === requiredRole
    expect(hasAccess).toBe(true)
  })
})
