/* Navigation and route configuration for Tasty Plus
   Exports all 9 registered routes with path, title, and lazy-loaded component. */
import { lazy, type ComponentType } from 'react'

export interface RouteConfig {
  path: string
  title: string
  lazyComponent: ComponentType
  isNav?: boolean
  navLabel?: string
  requiredRole?: 'super_admin' | 'admin' | 'editor'
  allowedRoles?: ('super_admin' | 'admin' | 'editor')[]
}

export interface NavLinkItem {
  path: string
  label: string
}

export const routesConfig: RouteConfig[] = [
  {
    path: '/',
    title: 'Início',
    lazyComponent: lazy(() => import('@/pages/Home')),
    isNav: true,
    navLabel: 'Início',
  },
  {
    path: '/quem-somos',
    title: 'Quem Somos',
    lazyComponent: lazy(() => import('@/pages/QuemSomos')),
    isNav: true,
    navLabel: 'Quem Somos',
  },
  {
    path: '/produtos',
    title: 'Produtos',
    lazyComponent: lazy(() => import('@/pages/Produtos')),
    isNav: true,
    navLabel: 'Produtos',
  },
  {
    path: '/qualidade',
    title: 'Qualidade',
    lazyComponent: lazy(() => import('@/pages/Qualidade')),
    isNav: true,
    navLabel: 'Qualidade',
  },
  {
    path: '/representantes',
    title: 'Representantes',
    lazyComponent: lazy(() => import('@/pages/Representantes')),
    isNav: true,
    navLabel: 'Representantes',
  },
  {
    path: '/noticias',
    title: 'Notícias',
    lazyComponent: lazy(() => import('@/pages/Noticias')),
    isNav: true,
    navLabel: 'Notícias',
  },
  {
    path: '/noticias/:id',
    title: 'Notícia',
    lazyComponent: lazy(() => import('@/pages/NoticiaDetalhe')),
  },
  {
    path: '/contato',
    title: 'Contato',
    lazyComponent: lazy(() => import('@/pages/Contato')),
    isNav: true,
    navLabel: 'Contato',
  },
  {
    path: '/login',
    title: 'Login',
    lazyComponent: lazy(() => import('@/pages/Login')),
  },
  {
    path: '/reset-password',
    title: 'Redefinir Senha',
    lazyComponent: lazy(() => import('@/pages/ResetPassword')),
  },
  {
    path: '/admin',
    title: 'Admin',
    lazyComponent: lazy(() => import('@/pages/Admin')),
    requiredRole: 'admin',
  },
  {
    path: '/admin/noticias',
    title: 'Admin — Notícias',
    lazyComponent: lazy(() => import('@/pages/AdminNoticias')),
    allowedRoles: ['admin', 'editor'],
  },
]

export const mainNavLinks: NavLinkItem[] = [
  { path: '/', label: 'Início' },
  { path: '/quem-somos', label: 'Quem Somos' },
  { path: '/produtos', label: 'Produtos' },
  { path: '/qualidade', label: 'Qualidade' },
  { path: '/representantes', label: 'Representantes' },
  { path: '/noticias', label: 'Notícias' },
  { path: '/contato', label: 'Contato' },
]

export default routesConfig
