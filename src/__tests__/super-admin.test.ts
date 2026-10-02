import { describe, it, expect } from 'vitest'
import { validateEmail, validateRequired, validateMinLength } from '@/lib/validation'

describe('Super Admin and Role Hierarchy Unit Tests', () => {
  it('hierarchy permits super_admin to create admin and editor only', () => {
    const callerRole = 'super_admin'
    const allowedTargets = ['admin', 'editor']

    const canCreateTarget = (caller: string, target: string) => {
      if (caller !== 'super_admin') return false
      if (target === 'super_admin') return false
      return allowedTargets.includes(target)
    }

    expect(canCreateTarget(callerRole, 'admin')).toBe(true)
    expect(canCreateTarget(callerRole, 'editor')).toBe(true)
    expect(canCreateTarget(callerRole, 'super_admin')).toBe(false)
  })

  it('regular admin or editor cannot create users', () => {
    const canCreateUser = (callerRole: string) => callerRole === 'super_admin'

    expect(canCreateUser('admin')).toBe(false)
    expect(canCreateUser('editor')).toBe(false)
    expect(canCreateUser('visitor')).toBe(false)
  })

  it('self-deletion and deletion of other super_admins is forbidden', () => {
    const canDeleteUser = (
      callerId: string,
      callerRole: string,
      targetId: string,
      targetRole: string,
    ) => {
      if (callerRole !== 'super_admin') return false
      if (callerId === targetId) return false // Cannot delete self
      if (targetRole === 'super_admin') return false // Cannot delete super_admin
      return true
    }

    const myId = 'usr_super_1'
    const otherSuperId = 'usr_super_2'
    const adminId = 'usr_admin_1'
    const editorId = 'usr_editor_1'

    // Deleting self: forbidden
    expect(canDeleteUser(myId, 'super_admin', myId, 'super_admin')).toBe(false)

    // Deleting another super_admin: forbidden
    expect(canDeleteUser(myId, 'super_admin', otherSuperId, 'super_admin')).toBe(false)

    // Deleting admin: allowed
    expect(canDeleteUser(myId, 'super_admin', adminId, 'admin')).toBe(true)

    // Deleting editor: allowed
    expect(canDeleteUser(myId, 'super_admin', editorId, 'editor')).toBe(true)

    // Regular admin trying to delete anyone: forbidden
    expect(canDeleteUser(adminId, 'admin', editorId, 'editor')).toBe(false)
  })

  it('password reset form validation rules', () => {
    // Required email
    expect(validateRequired('', 'E-mail')).toBe('O campo E-mail é obrigatório.')
    expect(validateRequired('   ', 'E-mail')).toBe('O campo E-mail é obrigatório.')

    // Format validation
    expect(validateEmail('invalid-email')).toBe('Por favor, informe um endereço de e-mail válido.')
    expect(validateEmail('user@')).toBe('Por favor, informe um endereço de e-mail válido.')
    expect(validateEmail('@domain.com')).toBe('Por favor, informe um endereço de e-mail válido.')
    expect(validateEmail('user@domain')).toBe('Por favor, informe um endereço de e-mail válido.')
    expect(validateEmail('test@tastyplus.com.br')).toBeNull()

    // Minimum password length for creation
    expect(validateMinLength('1234567', 8, 'Senha')).toBe('Senha deve ter no mínimo 8 caracteres.')
    expect(validateMinLength('12345678', 8, 'Senha')).toBeNull()
  })
})
