import type { JSX } from 'react'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Linkedin } from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'
import { getSiteSettings, getFileUrl, type SiteSettings } from '@/services/siteSettings'
import { useRealtime } from '@/hooks/use-realtime'
import { buildWhatsAppLink } from '@/lib/whatsapp'

export function Footer(): JSX.Element {
  const currentYear = new Date().getFullYear()
  const [settings, setSettings] = useState<SiteSettings | null>(null)

  useEffect(() => {
    getSiteSettings().then((res) => {
      if (res) setSettings(res)
    })
  }, [])

  useRealtime('site_settings', () => {
    getSiteSettings().then((res) => {
      if (res) setSettings(res)
    })
  })

  // In dark footer background: prioritize logoDark if set, then normal logo, then fallback BrandLogo
  const footerLogoUrl =
    settings && settings.logoDark
      ? getFileUrl('site_settings', settings.id, settings.logoDark)
      : settings && settings.logo
        ? getFileUrl('site_settings', settings.id, settings.logo)
        : null

  const footerWhatsAppUrl = buildWhatsAppLink(
    '5521988831253',
    'Olá! Gostaria de mais informações sobre os produtos Tasty Aromas e Sabores.',
  )

  return (
    <footer className="mt-auto border-t border-primary/20 bg-[hsl(215,73%,14%)] text-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
          {/* Col 1: Brand block */}
          <div className="space-y-3 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center">
                {footerLogoUrl ? (
                  <img
                    src={footerLogoUrl}
                    alt="Tasty Aromas e Sabores"
                    className="h-9 w-auto max-w-[120px] object-contain drop-shadow"
                  />
                ) : (
                  <BrandLogo
                    className="h-9 w-auto max-w-[120px] object-contain drop-shadow"
                    alt="Tasty Aromas e Sabores"
                  />
                )}
                <span className="sr-only">TASTY</span>
              </div>
              <span className="font-display font-bold text-lg text-white tracking-tight">
                Tasty Aromas e Sabores
              </span>
            </div>
            <p className="text-xs font-semibold text-accent">A fórmula certa para a sua empresa</p>
            <p className="text-xs text-slate-300 leading-relaxed">
              Especializada em aromas e aditivos para alimentos e bebidas desde 1987. A fórmula
              certa para a sua empresa.
            </p>
            <div className="pt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-300">
              <Link
                to="/quem-somos"
                className="hover:text-accent transition-colors underline underline-offset-2"
              >
                Quem Somos
              </Link>
              <span className="text-slate-500">•</span>
              <Link
                to="/qualidade"
                className="hover:text-accent transition-colors underline underline-offset-2"
              >
                Qualidade
              </Link>
            </div>
          </div>

          {/* Col 2: Endereço */}
          <div className="space-y-3">
            <h3 className="text-xs font-display font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
              Endereço
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed">
              Rua Otacílio Roxo, 150, Bairro Cerâmica, Nova Iguaçu-RJ
            </p>
          </div>

          {/* Col 3: Telefones */}
          <div className="space-y-3">
            <h3 className="text-xs font-display font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-accent flex-shrink-0" />
              Telefones
            </h3>
            <ul className="text-sm space-y-1.5 text-slate-200">
              <li>
                <span className="font-medium text-slate-400 text-xs">Fixo:</span>{' '}
                <a href="tel:+552126583517" className="hover:text-accent transition-colors">
                  21 2658-3517
                </a>
              </li>
              <li>
                <span className="font-medium text-slate-400 text-xs">Vendas:</span>{' '}
                <a href="tel:+5521988831253" className="hover:text-accent transition-colors">
                  (21) 98883-1253
                </a>
              </li>
              <li>
                <span className="font-medium text-slate-400 text-xs">WhatsApp:</span>{' '}
                <a
                  href={footerWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors inline-flex items-center gap-1 font-semibold text-accent"
                >
                  (21) 98883-1253
                </a>
              </li>
              <li>
                <span className="font-medium text-slate-400 text-xs">Financeiro:</span>{' '}
                <a href="tel:+5521988358373" className="hover:text-accent transition-colors">
                  21 98835-8373
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: E-mail e Horários */}
          <div className="space-y-3">
            <h3 className="text-xs font-display font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-accent flex-shrink-0" />
              E-mail & Horários
            </h3>
            <div className="text-sm space-y-2 text-slate-200">
              <p>
                <a
                  href="mailto:tasty@tastyplus.com.br"
                  className="hover:text-accent transition-colors break-all"
                >
                  tasty@tastyplus.com.br
                </a>
              </p>
              <div className="text-xs text-slate-400 space-y-1 pt-1 border-t border-slate-700/60">
                <p className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  <span>Seg a Qui 07h30 às 17h30</span>
                </p>
                <p className="pl-5">Sex 07h30 às 16h30</p>
              </div>
            </div>
          </div>

          {/* Col 5: Redes Sociais */}
          <div className="space-y-3">
            <h3 className="text-xs font-display font-bold uppercase tracking-wider text-slate-400">
              Redes Sociais
            </h3>
            <div className="flex items-center gap-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="[Nossa página no Instagram]"
                className="w-9 h-9 rounded-full border border-slate-700 bg-slate-900/60 flex items-center justify-center text-slate-300 hover:bg-accent hover:border-accent hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="[Nossa página no Facebook]"
                className="w-9 h-9 rounded-full border border-slate-700 bg-slate-900/60 flex items-center justify-center text-slate-300 hover:bg-accent hover:border-accent hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="[Nossa página no LinkedIn]"
                className="w-9 h-9 rounded-full border border-slate-700 bg-slate-900/60 flex items-center justify-center text-slate-300 hover:bg-accent hover:border-accent hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>

            <div className="pt-2">
              <Link
                to="/login"
                className="text-xs text-slate-400 hover:text-accent underline underline-offset-4 transition-colors"
              >
                Acesso Restrito
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Reference */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {currentYear} Tasty Aromas e Sabores. Todos os direitos reservados.</p>
          <p>
            Referência:{' '}
            <a
              href="https://tastyplus.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors underline underline-offset-2"
            >
              tastyplus.com.br
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
