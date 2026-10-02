export type ProductCategory = 'Aroma' | 'Extrato' | 'Aditivo' | 'Corante' | 'Outro'

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Aroma',
  'Extrato',
  'Aditivo',
  'Corante',
  'Outro',
]

/**
 * Cores padrão para cada categoria de produto em formato hex.
 * - Aroma: Vermelho acento da marca (#d62828 / #e11d48)
 * - Extrato: Navy institucional (#16233b)
 * - Aditivo: Roxo/Índigo escuro (#5b21b6)
 * - Corante: Âmbar/Laranja queimado (#d97706)
 * - Outro: Cinza neutro ardósia (#475569)
 */
export const DEFAULT_CATEGORY_COLORS: Record<ProductCategory, string> = {
  Aroma: '#e11d48',
  Extrato: '#16233b',
  Aditivo: '#5b21b6',
  Corante: '#d97706',
  Outro: '#475569',
}

/**
 * Valida se uma string é um hex color válido (#RGB ou #RRGGBB).
 */
export function isValidHexColor(color: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color.trim())
}

/**
 * Converte hex para {r, g, b}. Retorna null se inválido.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace('#', '').trim()
  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0] + cleaned[0], 16)
    const g = parseInt(cleaned[1] + cleaned[1], 16)
    const b = parseInt(cleaned[2] + cleaned[2], 16)
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null
    return { r, g, b }
  }
  if (cleaned.length === 6) {
    const r = parseInt(cleaned.slice(0, 2), 16)
    const g = parseInt(cleaned.slice(2, 4), 16)
    const b = parseInt(cleaned.slice(4, 6), 16)
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null
    return { r, g, b }
  }
  return null
}

/**
 * Normaliza um hex para 6 caracteres minúsculos (#rrggbb).
 */
export function normalizeHexColor(hex: string, fallback = '#e11d48'): string {
  if (!isValidHexColor(hex)) return fallback
  const cleaned = hex.replace('#', '').trim().toLowerCase()
  if (cleaned.length === 3) {
    return `#${cleaned[0]}${cleaned[0]}${cleaned[1]}${cleaned[1]}${cleaned[2]}${cleaned[2]}`
  }
  return `#${cleaned}`
}

/**
 * Retorna as variáveis de estilo (cor de fundo suave, cor de texto contrastante e borda)
 * para exibição em badges de acordo com a categoria e temas claro/escuro.
 * Garantindo contraste legível (≥ 4.5:1) mantendo a tonalidade viva da categoria.
 */
export interface CategoryBadgeStyle {
  baseColor: string
  // Estilo inline com CSS Variables para light e dark modes
  style: React.CSSProperties
  className: string
}

export function getCategoryColor(
  category: string | undefined | null,
  customColors?: Partial<Record<ProductCategory, string>> | null,
): string {
  if (!category || !(category in DEFAULT_CATEGORY_COLORS)) {
    return customColors?.Outro || DEFAULT_CATEGORY_COLORS.Outro
  }
  const cat = category as ProductCategory
  const custom = customColors?.[cat]
  if (custom && isValidHexColor(custom)) {
    return normalizeHexColor(custom)
  }
  return DEFAULT_CATEGORY_COLORS[cat]
}

export function getCategoryBadgeStyle(
  category: string | undefined | null,
  customColors?: Partial<Record<ProductCategory, string>> | null,
): {
  baseColor: string
  style: React.CSSProperties
} {
  const baseHex = getCategoryColor(category, customColors)
  const rgb = hexToRgb(baseHex) || { r: 225, g: 29, b: 72 }

  // Criamos cores seguras para fundo e texto
  // Light: background rgba(r,g,b, 0.12), border rgba(r,g,b, 0.28), text rgb ajustado para contraste escuro
  // Dark: background rgba(r,g,b, 0.22), border rgba(r,g,b, 0.45), text rgb clareado
  const lightBg = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`
  const lightBorder = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`

  return {
    baseColor: baseHex,
    style: {
      backgroundColor: lightBg,
      borderColor: lightBorder,
      color: baseHex,
    },
  }
}
