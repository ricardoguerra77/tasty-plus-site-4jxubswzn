import { describe, it, expect } from 'vitest'
import { validateEmail, validateRequired, validateMinLength, validateFile } from '@/lib/validation'

describe('Form Validation Utilities (lib/validation.ts)', () => {
  describe('validateRequired', () => {
    it('returns error when value is empty or undefined', () => {
      expect(validateRequired('', 'Nome')).toBe('Nome é obrigatório.')
      expect(validateRequired('   ', 'Campo')).toBe('Campo é obrigatório.')
      expect(validateRequired(null, 'E-mail')).toBe('E-mail é obrigatório.')
      expect(validateRequired(undefined, 'Senha')).toBe('Senha é obrigatório.')
    })

    it('returns null when valid value is present', () => {
      expect(validateRequired('Texto válido', 'Nome')).toBeNull()
      expect(validateRequired('0', 'Número')).toBeNull()
    })
  })

  describe('validateEmail', () => {
    it('returns required error for empty email', () => {
      expect(validateEmail('')).toBe('E-mail é obrigatório.')
    })

    it('returns error for invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe('Insira um endereço de e-mail válido.')
      expect(validateEmail('user@')).toBe('Insira um endereço de e-mail válido.')
      expect(validateEmail('@domain.com')).toBe('Insira um endereço de e-mail válido.')
      expect(validateEmail('user@domain')).toBe('Insira um endereço de e-mail válido.')
    })

    it('returns null for valid emails', () => {
      expect(validateEmail('admin@tastyplus.com.br')).toBeNull()
      expect(validateEmail('contato@empresa.com')).toBeNull()
    })
  })

  describe('validateMinLength', () => {
    it('returns error when length is less than requirement', () => {
      expect(validateMinLength('12345', 8, 'Senha')).toBe(
        'Senha deve conter no mínimo 8 caracteres.',
      )
    })

    it('returns null when length is sufficient', () => {
      expect(validateMinLength('12345678', 8, 'Senha')).toBeNull()
      expect(validateMinLength('supersecret', 8, 'Senha')).toBeNull()
    })
  })

  describe('validateFile', () => {
    it('returns valid when file is optional and null', () => {
      const result = validateFile(null, { required: false })
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('returns error when file is required but null', () => {
      const result = validateFile(null, { required: true })
      expect(result.valid).toBe(false)
      expect(result.error).toBe('O envio de arquivo é obrigatório.')
    })

    it('validates allowed mime types in Portuguese', () => {
      const mockFile = new File(['content'], 'document.txt', { type: 'text/plain' })
      const result = validateFile(mockFile, {
        allowedMimeTypes: ['image/jpeg', 'image/png'],
      })
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Formato de arquivo não suportado')
      expect(result.error).toContain('image/jpeg, image/png')
    })

    it('validates maximum file size limit in Portuguese', () => {
      // 6 MB file
      const largeBlob = new Blob([new Uint8Array(6 * 1024 * 1024)], { type: 'image/png' })
      const mockFile = new File([largeBlob], 'large-image.png', { type: 'image/png' })
      const result = validateFile(mockFile, {
        maxSizeBytes: 5 * 1024 * 1024,
      })
      expect(result.valid).toBe(false)
      expect(result.error).toContain('O arquivo excede o tamanho limite permitido de 5.0 MB.')
    })

    it('accepts file within constraints', () => {
      const validBlob = new Blob([new Uint8Array(1024)], { type: 'image/png' })
      const mockFile = new File([validBlob], 'logo.png', { type: 'image/png' })
      const result = validateFile(mockFile, {
        allowedMimeTypes: ['image/png', 'image/jpeg'],
        maxSizeBytes: 5 * 1024 * 1024,
      })
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })
  })
})
