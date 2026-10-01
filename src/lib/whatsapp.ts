export function formatPhoneMask(val: string): string {
  // Only keep digits
  const digits = val.replace(/\D/g, '').slice(0, 11)
  if (!digits) return ''
  if (digits.length <= 2) {
    return `(${digits}`
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }
  if (digits.length <= 10) {
    // Landline or short: (XX) XXXX-XXXX
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  // Mobile 11 digits: (XX) XXXXX-XXXX
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
}

export function buildWhatsAppLink(phone: string, text?: string): string {
  // Clean phone to only digits, ensure starts with 55 country code if not present
  const clean = phone.replace(/\D/g, '')
  let fullPhone = clean
  if (clean.length === 10 || clean.length === 11) {
    fullPhone = `55${clean}`
  }
  const base = `https://wa.me/${fullPhone}`
  if (text) {
    return `${base}?text=${encodeURIComponent(text)}`
  }
  return base
}
