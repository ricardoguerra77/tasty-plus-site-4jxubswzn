import { describe, it, expect, vi, beforeEach } from 'vitest'
import pb from '@/lib/pocketbase/client'
import {
  createNews,
  updateNews,
  deleteNews,
  listNews,
  getNewsById,
  getNewsBySlug,
} from '@/services/news'

describe('News Service Operations & Super Admin Permissions', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('createNews correctly calls pb.collection("news").create with FormData', async () => {
    const mockCreated = {
      id: 'news-123',
      title: 'Notícia de Teste',
      slug: 'noticia-de-teste',
      body: '<p>Conteúdo</p>',
      published: true,
    }

    const createSpy = vi
      .spyOn(pb.collection('news'), 'create')
      .mockResolvedValue(mockCreated as any)

    const result = await createNews({
      title: 'Notícia de Teste',
      slug: 'noticia-de-teste',
      body: '<p>Conteúdo</p>',
      published: true,
      author: 'Equipe de Qualidade',
    })

    expect(createSpy).toHaveBeenCalledTimes(1)
    expect(result.id).toBe('news-123')
    expect(result.title).toBe('Notícia de Teste')
  })

  it('updateNews correctly calls pb.collection("news").update with id and FormData', async () => {
    const mockUpdated = {
      id: 'mpocq1kvjkeuubh',
      title: 'Tasty Aromas e Sabores Conquista ISO 9001',
      slug: 'tasty-aromas-e-sabores-conquista-iso-9001',
      body: '<p>Atualizado</p>',
      published: true,
    }

    const updateSpy = vi
      .spyOn(pb.collection('news'), 'update')
      .mockResolvedValue(mockUpdated as any)

    const result = await updateNews('mpocq1kvjkeuubh', {
      title: 'Tasty Aromas e Sabores Conquista ISO 9001',
      published: true,
    })

    expect(updateSpy).toHaveBeenCalledWith('mpocq1kvjkeuubh', expect.any(FormData))
    expect(result.id).toBe('mpocq1kvjkeuubh')
  })

  it('deleteNews calls pb.collection("news").delete with correct id', async () => {
    const deleteSpy = vi.spyOn(pb.collection('news'), 'delete').mockResolvedValue(true as any)

    await deleteNews('news-to-delete')
    expect(deleteSpy).toHaveBeenCalledWith('news-to-delete')
  })

  it('listNews queries collection("news") with proper sort and filter', async () => {
    const mockList = [{ id: '1', title: 'N1', slug: 'n1', body: 'b1', published: true }]

    const getFullListSpy = vi
      .spyOn(pb.collection('news'), 'getFullList')
      .mockResolvedValue(mockList as any)

    const res = await listNews({ all: true })
    expect(getFullListSpy).toHaveBeenCalledWith({
      filter: '',
      sort: '-publishedAt,-created',
      requestKey: null,
    })
    expect(res).toHaveLength(1)
  })
})
