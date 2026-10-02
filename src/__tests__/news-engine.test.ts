import { describe, it, expect } from 'vitest'
import {
  generateSlug,
  filterPublicNews,
  canViewNewsArticle,
  canAccessAdmin,
  canAccessEditorial,
  canManageInstitutional,
} from '@/lib/news-helpers'

describe('Unit Tests: News Engine Helpers', () => {
  describe('Slug Generator (generateSlug)', () => {
    it('converts spaces to hyphens', () => {
      const slug = generateSlug('novo produto tasty plus')
      expect(slug).toBe('novo-produto-tasty-plus')
    })

    it('removes accents and diacritics', () => {
      const slug = generateSlug('Recertificação de Padrão e Inovação Ecológica')
      expect(slug).toBe('recertificacao-de-padrao-e-inovacao-ecologica')
    })

    it('converts to lowercase', () => {
      const slug = generateSlug('AROMAS NATURAIS DE BAUNILHA')
      expect(slug).toBe('aromas-naturais-de-baunilha')
    })

    it('removes special characters and symbols', () => {
      const slug = generateSlug('Tasty Plus & Sabores @ 100% — Edição Especial!')
      expect(slug).toBe('tasty-plus-sabores-100-edicao-especial')
    })

    it('collapses multiple consecutive spaces and hyphens into a single hyphen', () => {
      const slug = generateSlug('artigo   com    muitos---espacos   e--tracos')
      expect(slug).toBe('artigo-com-muitos-espacos-e-tracos')
    })

    it('generates unique slugs when conflicts exist in existingSlugs list', () => {
      const existing = [
        'tasty-plus-recertificacao-iso-9001',
        'tasty-plus-recertificacao-iso-9001-2',
      ]
      const uniqueSlug = generateSlug('Tasty Plus Recertificação ISO 9001', existing)
      expect(uniqueSlug).toBe('tasty-plus-recertificacao-iso-9001-3')
    })

    it('returns fallback default slug if input is empty or invalid characters only', () => {
      expect(generateSlug('')).toBe('')
      expect(generateSlug('!!! ???')).toBe('noticia')
    })
  })

  describe('News Visibility Helper (filterPublicNews & canViewNewsArticle)', () => {
    it('filterPublicNews keeps only published items', () => {
      const items = [
        { id: '1', title: 'Artigo 1', slug: 'artigo-1', published: true },
        { id: '2', title: 'Rascunho 2', slug: 'rascunho-2', published: false },
        { id: '3', title: 'Artigo 3', slug: 'artigo-3', published: true },
      ]
      const publicItems = filterPublicNews(items)
      expect(publicItems).toHaveLength(2)
      expect(publicItems.map((i) => i.id)).toEqual(['1', '3'])
      expect(publicItems.every((i) => i.published)).toBe(true)
    })

    it('anonymous visitor cannot view unpublished draft article', () => {
      const draftArticle = { title: 'Rascunho Secreto', published: false }
      const canView = canViewNewsArticle(draftArticle, null)
      expect(canView).toBe(false)
    })

    it('anonymous visitor can view published article', () => {
      const publishedArticle = { title: 'Lançamento', published: true }
      const canView = canViewNewsArticle(publishedArticle, null)
      expect(canView).toBe(true)
    })

    it('editor, admin and super_admin roles can view unpublished draft in preview/editorial contexts', () => {
      const draftArticle = { title: 'Rascunho', published: false }
      expect(canViewNewsArticle(draftArticle, 'editor')).toBe(true)
      expect(canViewNewsArticle(draftArticle, 'admin')).toBe(true)
      expect(canViewNewsArticle(draftArticle, 'super_admin')).toBe(true)
    })

    it('returns false when article is null or undefined', () => {
      expect(canViewNewsArticle(null, 'admin')).toBe(false)
      expect(canViewNewsArticle(undefined, null)).toBe(false)
    })
  })

  describe('Role Guard Helper (canAccessAdmin, canAccessEditorial, canManageInstitutional)', () => {
    it('editor cannot access admin root/tabs', () => {
      expect(canAccessAdmin('editor')).toBe(false)
      expect(canManageInstitutional('editor')).toBe(false)
    })

    it('admin and super_admin can access admin root and institutional settings', () => {
      expect(canAccessAdmin('admin')).toBe(true)
      expect(canAccessAdmin('super_admin')).toBe(true)
      expect(canManageInstitutional('admin')).toBe(true)
      expect(canManageInstitutional('super_admin')).toBe(true)
    })

    it('editor, admin and super_admin can access editorial news section', () => {
      expect(canAccessEditorial('editor')).toBe(true)
      expect(canAccessEditorial('admin')).toBe(true)
      expect(canAccessEditorial('super_admin')).toBe(true)
    })

    it('unauthenticated or visitor has no access to admin or editorial', () => {
      expect(canAccessAdmin(null)).toBe(false)
      expect(canAccessEditorial(null)).toBe(false)
      expect(canManageInstitutional(null)).toBe(false)
      expect(canAccessAdmin(undefined)).toBe(false)
      expect(canAccessEditorial(undefined)).toBe(false)
    })
  })
})
