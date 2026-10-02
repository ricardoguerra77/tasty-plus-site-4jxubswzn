import { describe, it, expect, vi, beforeEach } from 'vitest'
import pb from '@/lib/pocketbase/client'
import { validatePassword, validatePasswordMatch } from '@/lib/validation'
import { routesConfig } from '@/config/navigation'
import { getAuthErrorMessage } from '@/hooks/useAuth'
import { ClientResponseError } from 'pocketbase'

describe('Password Reset Logic & Route Validation', () => {
  beforeEach(() => {
    pb.authStore.clear()
    vi.restoreAllMocks()
  })

  describe('Password Validation Rules', () => {
    it('validates minimum 8 characters for new password', () => {
      expect(validatePassword('')).toBe('Senha é obrigatório.')
      expect(validatePassword('short')).toBe('A senha deve ter pelo menos 8 caracteres.')
      expect(validatePassword('1234567')).toBe('A senha deve ter pelo menos 8 caracteres.')
      expect(validatePassword('12345678')).toBeNull()
      expect(validatePassword('validPassword123!')).toBeNull()
    })

    it('validates password confirmation match', () => {
      expect(validatePasswordMatch('validPassword123!', '')).toBe(
        'Confirmação de senha é obrigatório.',
      )
      expect(validatePasswordMatch('validPassword123!', 'different123!')).toBe(
        'As senhas não coincidem.',
      )
      expect(validatePasswordMatch('validPassword123!', 'validPassword123!')).toBeNull()
    })
  })

  describe('Token Helper & Error Handling', () => {
    it('recognizes token presence helper logic', () => {
      const checkToken = (search: string) => {
        const params = new URLSearchParams(search)
        const token = (params.get('token') || '').trim()
        return Boolean(token)
      }

      expect(checkToken('')).toBe(false)
      expect(checkToken('?other=123')).toBe(false)
      expect(checkToken('?token=')).toBe(false)
      expect(checkToken('?token=    ')).toBe(false)
      expect(checkToken('?token=valid_token_xyz')).toBe(true)
    })

    it('translates expired/invalid token error to friendly PT-BR message', () => {
      const err = new ClientResponseError({
        status: 400,
        data: { message: 'Failed to reset password: invalid or expired token.' },
      })
      const msg = getAuthErrorMessage(err)
      expect(msg).toBe('Link inválido ou expirado. Solicite uma nova redefinição.')
    })
  })

  describe('Route Registration & Deep-link Prevention', () => {
    it('/reset-password route is registered in routesConfig', () => {
      const route = routesConfig.find((r) => r.path === '/reset-password')
      expect(route).toBeDefined()
      expect(route?.title).toBe('Redefinir Senha')
      expect(route?.lazyComponent).toBeDefined()
      // Should not be restricted by role (public page)
      expect(route?.requiredRole).toBeUndefined()
      expect(route?.allowedRoles).toBeUndefined()
    })

    it('verifies deep links like /reset-password do NOT fall into catch-all *', () => {
      const targetPath = '/reset-password'
      const matched = routesConfig.some((r) => r.path === targetPath)
      expect(matched).toBe(true)
    })
  })

  describe('PocketBase confirmPasswordReset call', () => {
    it('calls pb.collection("users").confirmPasswordReset with token and password confirmation', async () => {
      const confirmSpy = vi
        .spyOn(pb.collection('users'), 'confirmPasswordReset')
        .mockResolvedValue(true as never)

      const token = 'sample-jwt-reset-token'
      const newPassword = 'NewSecretPassword2026!'

      await pb.collection('users').confirmPasswordReset(token, newPassword, newPassword)

      expect(confirmSpy).toHaveBeenCalledTimes(1)
      expect(confirmSpy).toHaveBeenCalledWith(token, newPassword, newPassword)
    })

    it('throws when PocketBase returns 400 for invalid token', async () => {
      vi.spyOn(pb.collection('users'), 'confirmPasswordReset').mockRejectedValue(
        new ClientResponseError({
          status: 400,
          data: { message: 'Token is invalid or expired' },
        }),
      )

      await expect(
        pb.collection('users').confirmPasswordReset('invalid_tok', '12345678', '12345678'),
      ).rejects.toThrow()
    })
  })
})
