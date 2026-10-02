import { useState, useEffect, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import { ClientResponseError } from 'pocketbase'

export type UserRole = 'super_admin' | 'admin' | 'editor'

export interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  created: string
  updated: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthState {
  user: UserProfile | null
  token: string
  isValid: boolean
  isLoading: boolean
  isAdmin: boolean
  isEditor: boolean
  isSuperAdmin: boolean
}

export interface UseAuthReturn extends AuthState {
  login: (credentials: LoginCredentials) => Promise<UserProfile>
  logout: () => void
  refreshAuth: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  confirmPasswordReset: (token: string, password: string) => Promise<void>
}

/**
 * Extracts a normalized UserProfile from PocketBase AuthRecord model
 */
function extractUserProfile(model: unknown): UserProfile | null {
  if (!model || typeof model !== 'object') return null
  const record = model as Record<string, unknown>
  const id = typeof record.id === 'string' ? record.id : ''
  const email = typeof record.email === 'string' ? record.email : ''
  const name = typeof record.name === 'string' ? record.name : ''
  const rawRole = record.role
  let role: UserRole = 'editor'
  if (rawRole === 'super_admin') {
    role = 'super_admin'
  } else if (rawRole === 'admin') {
    role = 'admin'
  }
  const avatar = typeof record.avatar === 'string' ? record.avatar : undefined
  const created = typeof record.created === 'string' ? record.created : ''
  const updated = typeof record.updated === 'string' ? record.updated : ''

  if (!id) return null

  return {
    id,
    email,
    name,
    role,
    avatar,
    created,
    updated,
  }
}

/**
 * Translates PocketBase authentication error into user-friendly Portuguese message
 */
export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof ClientResponseError) {
    if (error.status === 0) {
      return 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.'
    }
    if (error.status === 400 || error.status === 404) {
      const dataMsg =
        typeof error.data?.message === 'string' ? error.data.message.toLowerCase() : ''
      const rawMsg = error.message.toLowerCase()
      if (
        dataMsg.includes('token') ||
        dataMsg.includes('reset') ||
        rawMsg.includes('token') ||
        rawMsg.includes('reset')
      ) {
        return 'Link inválido ou expirado. Solicite uma nova redefinição.'
      }
      return 'E-mail ou senha incorretos. Verifique suas credenciais.'
    }
    if (error.status === 403) {
      return 'Acesso não autorizado para esta conta.'
    }
    if (error.status >= 500) {
      return 'Erro interno no servidor. Tente novamente mais tarde.'
    }
    if (error.message) {
      return error.message
    }
  }

  if (error instanceof Error) {
    if (
      error.message.toLowerCase().includes('failed to fetch') ||
      error.message.toLowerCase().includes('network')
    ) {
      return 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.'
    }
    return error.message
  }

  return 'Ocorreu um erro inesperado ao realizar o login.'
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<UserProfile | null>(() => {
    return pb.authStore.isValid ? extractUserProfile(pb.authStore.record) : null
  })
  const [token, setToken] = useState<string>(() => pb.authStore.token)
  const [isValid, setIsValid] = useState<boolean>(() => pb.authStore.isValid)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Keep state synchronized with PocketBase AuthStore
  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((newToken, newModel) => {
      setToken(newToken)
      setIsValid(pb.authStore.isValid)
      setUser(extractUserProfile(newModel))
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const login = useCallback(async ({ email, password }: LoginCredentials): Promise<UserProfile> => {
    setIsLoading(true)
    try {
      const authData = await pb.collection('users').authWithPassword(email.trim(), password)
      const profile = extractUserProfile(authData.record)
      if (!profile) {
        throw new Error('Falha ao obter perfil do usuário.')
      }
      setUser(profile)
      setToken(authData.token)
      setIsValid(true)
      return profile
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback((): void => {
    pb.authStore.clear()
    setUser(null)
    setToken('')
    setIsValid(false)
  }, [])

  const refreshAuth = useCallback(async (): Promise<void> => {
    if (!pb.authStore.isValid) return
    try {
      await pb.collection('users').authRefresh()
    } catch {
      logout()
    }
  }, [logout])

  const isSuperAdmin = user?.role === 'super_admin'
  const isAdmin = user?.role === 'admin' || isSuperAdmin
  const isEditor = user?.role === 'editor' || isAdmin

  const requestPasswordReset = useCallback(async (resetEmail: string): Promise<void> => {
    setIsLoading(true)
    try {
      await pb.collection('users').requestPasswordReset(resetEmail.trim())
    } finally {
      setIsLoading(false)
    }
  }, [])

  const confirmPasswordReset = useCallback(
    async (resetToken: string, newPassword: string): Promise<void> => {
      setIsLoading(true)
      try {
        await pb
          .collection('users')
          .confirmPasswordReset(resetToken.trim(), newPassword, newPassword)
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  return {
    user,
    token,
    isValid,
    isLoading,
    isAdmin,
    isEditor,
    isSuperAdmin,
    login,
    logout,
    refreshAuth,
    requestPasswordReset,
    confirmPasswordReset,
  }
}

export default useAuth
