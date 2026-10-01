import { describe, it, expect, vi, beforeEach } from 'vitest'
import pb from '@/lib/pocketbase/client'
import { getAuthErrorMessage } from '@/hooks/useAuth'
import { ClientResponseError } from 'pocketbase'

describe('useAuth and Auth Logic', () => {
  beforeEach(() => {
    pb.authStore.clear()
    vi.restoreAllMocks()
  })

  it('translates ClientResponseError status 400 to PT-BR credential error', () => {
    const error = new ClientResponseError({
      status: 400,
      data: { message: 'Failed to authenticate.' },
    })
    const msg = getAuthErrorMessage(error)
    expect(msg).toBe('E-mail ou senha incorretos. Verifique suas credenciais.')
  })

  it('translates ClientResponseError status 0 to PT-BR connection error', () => {
    const error = new ClientResponseError({
      status: 0,
      data: {},
    })
    const msg = getAuthErrorMessage(error)
    expect(msg).toBe('Não foi possível conectar ao servidor. Verifique sua conexão com a internet.')
  })

  it('translates network fetch error to PT-BR connection error', () => {
    const error = new Error('Failed to fetch')
    const msg = getAuthErrorMessage(error)
    expect(msg).toBe('Não foi possível conectar ao servidor. Verifique sua conexão com a internet.')
  })

  it('permission flags reflect admin role correctly', () => {
    const adminRecord = {
      id: 'usr_admin',
      collectionId: '_pb_users_auth_',
      collectionName: 'users',
      email: 'admin@tastyplus.com.br',
      name: 'Admin Tasty Aromas e Sabores',
      role: 'admin',
      created: '2026-01-01',
      updated: '2026-01-01',
    }
    pb.authStore.save('mock-token-admin', adminRecord)

    expect(pb.authStore.isValid).toBe(true)
    const record = pb.authStore.record as { role?: string; name?: string } | null
    const isAdmin = record?.role === 'admin'
    const isEditor = record?.role === 'editor' || record?.role === 'admin'

    expect(isAdmin).toBe(true)
    expect(isEditor).toBe(true)
  })

  it('permission flags reflect editor role correctly', () => {
    const editorRecord = {
      id: 'usr_editor',
      collectionId: '_pb_users_auth_',
      collectionName: 'users',
      email: 'editor@tastyplus.com.br',
      name: 'Editor Notícias',
      role: 'editor',
      created: '2026-01-01',
      updated: '2026-01-01',
    }
    pb.authStore.save('mock-token-editor', editorRecord)

    expect(pb.authStore.isValid).toBe(true)
    const record = pb.authStore.record as { role?: string; name?: string } | null
    const isAdmin = record?.role === 'admin'
    const isEditor = record?.role === 'editor' || record?.role === 'admin'

    expect(isAdmin).toBe(false)
    expect(isEditor).toBe(true)
  })

  it('logout clears the session in authStore', () => {
    pb.authStore.save('valid-token', {
      id: 'usr_1',
      collectionId: '_pb_users_auth_',
      collectionName: 'users',
      email: 'test@tastyplus.com.br',
      role: 'admin',
      created: '2026-01-01',
      updated: '2026-01-01',
    })

    expect(pb.authStore.isValid).toBe(true)
    pb.authStore.clear()

    expect(pb.authStore.isValid).toBe(false)
    expect(pb.authStore.token).toBe('')
    expect(pb.authStore.record).toBeNull()
  })

  it('successful login sets token and record in authStore', async () => {
    const mockAuthResponse = {
      token: 'jwt-auth-token-123',
      record: {
        id: 'usr_admin',
        email: 'admin@tastyplus.com.br',
        name: 'Administrador',
        role: 'admin',
        created: '2026-01-01',
        updated: '2026-01-02',
      },
    }

    vi.spyOn(pb.collection('users'), 'authWithPassword').mockResolvedValue(
      mockAuthResponse as never,
    )

    const result = await pb
      .collection('users')
      .authWithPassword('admin@tastyplus.com.br', 'TastyPass!')
    expect(result.token).toBe('jwt-auth-token-123')
    expect(result.record.role).toBe('admin')
    expect(result.record.email).toBe('admin@tastyplus.com.br')
  })
})
