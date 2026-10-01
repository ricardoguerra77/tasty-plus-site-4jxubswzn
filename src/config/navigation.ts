/* Navigation and route configuration for Tasty Plus
   Exports all 9 registered routes with path, title, and lazy-loaded component. */
import { lazy, type ComponentType } from 'react'

export interface RouteConfig {
  path: string
  title: string
  lazyComponent: ComponentType
  isNav?: boolean
  navLabel?: string
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
    path: '/produtos',
    title: 'Produtos',
    lazyComponent: lazy(() => import('@/pages/Produtos')),
    isNav: true,
    navLabel: 'Produtos',
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
    path: '/admin',
    title: 'Admin',
    lazyComponent: lazy(() => import('@/pages/Admin')),
  },
  {
    path: '/admin/noticias',
    title: 'Admin — Notícias',
    lazyComponent: lazy(() => import('@/pages/AdminNoticias')),
  },
]

export const mainNavLinks: NavLinkItem[] = [
  { path: '/', label: 'Início' },
  { path: '/produtos', label: 'Produtos' },
  { path: '/representantes', label: 'Representantes' },
  { path: '/noticias', label: 'Notícias' },
  { path: '/contato', label: 'Contato' },
]

export default routesConfig
