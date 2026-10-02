export interface FormValidationRule {
  required?: boolean
  email?: boolean
  minLength?: number
  maxLength?: number
  allowedMimeTypes?: string[]
  maxSizeBytes?: number
}

export interface FileValidationResult {
  valid: boolean
  error?: string
}

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Validates text inputs with descriptive Portuguese error messages.
 */
export function validateRequired(value: unknown, fieldLabel = 'Campo'): string | null {
  if (value === undefined || value === null) {
    return `${fieldLabel} é obrigatório.`
  }
  if (typeof value === 'string' && value.trim() === '') {
    return `${fieldLabel} é obrigatório.`
  }
  return null
}

export function validateEmail(email: string): string | null {
  const reqError = validateRequired(email, 'E-mail')
  if (reqError) return reqError

  if (!EMAIL_REGEX.test(email.trim())) {
    return 'Insira um endereço de e-mail válido.'
  }
  return null
}

export function validateMinLength(
  value: string,
  minLength: number,
  fieldLabel = 'Campo',
): string | null {
  if (value && value.length < minLength) {
    return `${fieldLabel} deve conter no mínimo ${minLength} caracteres.`
  }
  return null
}

export function validatePassword(password: string): string | null {
  const reqError = validateRequired(password, 'Senha')
  if (reqError) return reqError
  if (password.length < 8) {
    return 'A senha deve ter pelo menos 8 caracteres.'
  }
  return null
}

export function validatePasswordMatch(password: string, confirmation: string): string | null {
  const confirmReq = validateRequired(confirmation, 'Confirmação de senha')
  if (confirmReq) return confirmReq
  if (password !== confirmation) {
    return 'As senhas não coincidem.'
  }
  return null
}

export function validateFile(
  file: File | null | undefined,
  options: {
    required?: boolean
    allowedMimeTypes?: string[]
    maxSizeBytes?: number
  } = {},
): FileValidationResult {
  const { required = false, allowedMimeTypes, maxSizeBytes = 5 * 1024 * 1024 } = options

  if (!file) {
    if (required) {
      return { valid: false, error: 'O envio de arquivo é obrigatório.' }
    }
    return { valid: true }
  }

  if (allowedMimeTypes && allowedMimeTypes.length > 0) {
    if (!allowedMimeTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Formato de arquivo não suportado (${file.type || 'desconhecido'}). Formatos aceitos: ${allowedMimeTypes.join(', ')}.`,
      }
    }
  }

  if (file.size > maxSizeBytes) {
    const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(1)
    return {
      valid: false,
      error: `O arquivo excede o tamanho limite permitido de ${maxSizeMB} MB.`,
    }
  }

  return { valid: true }
}

export function validateImageFile(
  file: File | null | undefined,
  options: { required?: boolean; maxSizeBytes?: number } = {},
): FileValidationResult {
  return validateFile(file, {
    required: options.required,
    allowedMimeTypes: ALLOWED_IMAGE_MIME_TYPES,
    maxSizeBytes: options.maxSizeBytes ?? MAX_IMAGE_SIZE_BYTES,
  })
}
