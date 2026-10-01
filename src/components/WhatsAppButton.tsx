import type { JSX } from 'react'
import { MessageCircle } from 'lucide-react'

interface WhatsAppButtonProps {
  className?: string
  iconOnlyOnMobile?: boolean
  phoneNumber?: string
}

export function WhatsAppButton({
  className = '',
  iconOnlyOnMobile = true,
  phoneNumber = '5521988831253',
}: WhatsAppButtonProps): JSX.Element {
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent('Olá! Gostaria de mais informações sobre os produtos Tasty Plus.')}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar no WhatsApp"
      className={`inline-flex items-center justify-center gap-2 font-semibold text-white bg-[#25D366] hover:bg-[#20ba59] active:scale-95 transition-all shadow-sm rounded-lg ${
        iconOnlyOnMobile ? 'w-10 h-10 md:w-auto md:px-4 md:py-2 text-sm' : 'px-4 py-2 text-sm'
      } ${className}`}
    >
      <MessageCircle className="w-5 h-5 flex-shrink-0" />
      <span className={iconOnlyOnMobile ? 'hidden md:inline' : 'inline'}>Fale Conosco</span>
    </a>
  )
}

export default WhatsAppButton
