import type { ImgHTMLAttributes } from 'react'
import tastyLogoPng from '@/assets/image-e7d1c.png'

interface BrandLogoProps extends ImgHTMLAttributes<HTMLImageElement> {
  className?: string
  alt?: string
}

/**
 * Tasty Plus Official Brand Logo:
 * - Lettering script "Tasty" in dark purple-navy
 * - 8-petal vibrant red flower over the "y"
 * - Small cyan/teal circle to the right
 * - "aromas e sabores" descriptor below
 * - Transparent background
 */
export function BrandLogo({
  className = 'h-10 w-auto object-contain',
  alt = 'Tasty Aromas e Sabores',
  ...props
}: BrandLogoProps) {
  return <img src={tastyLogoPng} alt={alt} className={className} {...props} />
}

export default BrandLogo
