import type { JSX } from 'react'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Clock, Instagram, Facebook } from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'
import { getSiteSettings, getFileUrl, type SiteSettings } from '@/services/siteSettings'
import { useRealtime } from '@/hooks/use-realtime'
import { buildWhatsAppLink } from '@/lib/whatsapp'

export function Footer(): JSX.Element {
  const currentYear = new Date().getFullYear()
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    getSiteSettings()
      .then((res) => {
        setSettings(res)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useRealtime('site_settings', () => {
    getSiteSettings().then((res) => {
      setSettings(res)
    })
  })

  // In dark footer background: prioritize logoDark if set, then normal logo, then fallback BrandLogo
  const footerLogoUrl =
    settings && settings.logoDark
      ? getFileUrl('site_settings', settings.id, settings.logoDark)
      : settings && settings.logo
        ? getFileUrl('site_settings', settings.id, settings.logo)
        : null

  // WhatsApp link: use direct URL if set, otherwise build from phoneSales or whatsapp phone
  const rawWhatsapp = settings?.whatsapp?.trim()
  const rawSalesPhone = settings?.phoneSales?.trim()
  const rawFixedPhone = settings?.phoneFixed?.trim()
  const rawFinancePhone = settings?.phoneFinance?.trim()
  const rawEmail = settings?.email?.trim()
  const rawHoursWeek = settings?.hoursWeek?.trim()
  const rawHoursFriday = settings?.hoursFriday?.trim()
  const rawAddress = settings?.address?.trim()

  const footerWhatsAppHref = rawWhatsapp
    ? rawWhatsapp
    : rawSalesPhone
      ? buildWhatsAppLink(
          rawSalesPhone,
          'Olá! Gostaria de mais informações sobre os produtos Tasty Aromas e Sabores.',
        )
      : ''

  // Has at least one telephone?
  const hasPhones = Boolean(rawFixedPhone || rawSalesPhone || rawFinancePhone || footerWhatsAppHref)
  // Has at least one email or hours?
  const hasEmailOrHours = Boolean(rawEmail || rawHoursWeek || rawHoursFriday)
  // Has at least one social?
  const hasSocials = Boolean(
    settings?.facebook?.trim() || settings?.instagram?.trim() || settings?.whatsapp?.trim(),
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
          {loading ? (
            <div className="space-y-3" data-testid="footer-col-address-loading">
              <div className="h-4 w-24 bg-slate-800 rounded animate-pulse" />
              <div className="h-12 w-full bg-slate-850 bg-slate-800/60 rounded animate-pulse" />
            </div>
          ) : rawAddress ? (
            <div className="space-y-3" data-testid="footer-col-address">
              <h3 className="text-xs font-display font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                Endereço
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {rawAddress}
              </p>
            </div>
          ) : null}

          {/* Col 3: Telefones */}
          {loading ? (
            <div className="space-y-3" data-testid="footer-col-phones-loading">
              <div className="h-4 w-24 bg-slate-800 rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-slate-800/60 rounded animate-pulse" />
                <div className="h-4 w-36 bg-slate-800/60 rounded animate-pulse" />
                <div className="h-4 w-36 bg-slate-800/60 rounded animate-pulse" />
                <div className="h-4 w-32 bg-slate-800/60 rounded animate-pulse" />
              </div>
            </div>
          ) : hasPhones ? (
            <div className="space-y-3" data-testid="footer-col-phones">
              <h3 className="text-xs font-display font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-accent flex-shrink-0" />
                Telefones
              </h3>
              <ul className="text-sm space-y-1.5 text-slate-200">
                {rawFixedPhone && (
                  <li>
                    <span className="font-medium text-slate-400 text-xs">Fixo:</span>{' '}
                    <a
                      href={`tel:+55${rawFixedPhone.replace(/\D/g, '')}`}
                      className="hover:text-accent transition-colors"
                    >
                      {rawFixedPhone}
                    </a>
                  </li>
                )}
                {rawSalesPhone && (
                  <li>
                    <span className="font-medium text-slate-400 text-xs">Vendas:</span>{' '}
                    <a
                      href={`tel:+55${rawSalesPhone.replace(/\D/g, '')}`}
                      className="hover:text-accent transition-colors"
                    >
                      {rawSalesPhone}
                    </a>
                  </li>
                )}
                {(rawSalesPhone || rawWhatsapp) && footerWhatsAppHref && (
                  <li>
                    <span className="font-medium text-slate-400 text-xs">WhatsApp:</span>{' '}
                    <a
                      href={footerWhatsAppHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-accent transition-colors inline-flex items-center gap-1 font-semibold text-accent"
                    >
                      {rawSalesPhone ||
                        (rawWhatsapp.includes('wa.me/')
                          ? rawWhatsapp.split('wa.me/')[1]?.replace(/\D/g, '')
                          : 'WhatsApp')}
                    </a>
                  </li>
                )}
                {rawFinancePhone && (
                  <li>
                    <span className="font-medium text-slate-400 text-xs">Financeiro:</span>{' '}
                    <a
                      href={`tel:+55${rawFinancePhone.replace(/\D/g, '')}`}
                      className="hover:text-accent transition-colors"
                    >
                      {rawFinancePhone}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          ) : null}

          {/* Col 4: E-mail e Horários */}
          {loading ? (
            <div className="space-y-3" data-testid="footer-col-hours-loading">
              <div className="h-4 w-32 bg-slate-800 rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-40 bg-slate-800/60 rounded animate-pulse" />
                <div className="h-8 w-44 bg-slate-800/60 rounded animate-pulse" />
              </div>
            </div>
          ) : hasEmailOrHours ? (
            <div className="space-y-3" data-testid="footer-col-hours">
              <h3 className="text-xs font-display font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-accent flex-shrink-0" />
                E-mail & Horários
              </h3>
              <div className="text-sm space-y-2 text-slate-200">
                {rawEmail && (
                  <p>
                    <a
                      href={`mailto:${rawEmail}`}
                      className="hover:text-accent transition-colors break-all"
                    >
                      {rawEmail}
                    </a>
                  </p>
                )}
                {(rawHoursWeek || rawHoursFriday) && (
                  <div className="text-xs text-slate-400 space-y-1 pt-1 border-t border-slate-700/60">
                    {rawHoursWeek && (
                      <p className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                        <span>{rawHoursWeek}</span>
                      </p>
                    )}
                    {rawHoursFriday && (
                      <p className={rawHoursWeek ? 'pl-5' : 'flex items-center gap-1.5'}>
                        {!rawHoursWeek && (
                          <Clock className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                        )}
                        <span>{rawHoursFriday}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Col 5: Redes Sociais */}
          <div className="space-y-3">
            <h3 className="text-xs font-display font-bold uppercase tracking-wider text-slate-400">
              Redes Sociais
            </h3>
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-slate-800 animate-pulse" />
                <div className="w-9 h-9 rounded-full bg-slate-800 animate-pulse" />
                <div className="w-9 h-9 rounded-full bg-slate-800 animate-pulse" />
              </div>
            ) : hasSocials ? (
              <div className="flex items-center gap-2">
                {settings?.facebook?.trim() && (
                  <a
                    href={settings.facebook.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Nossa página no Facebook"
                    className="w-9 h-9 rounded-full border border-slate-700 bg-slate-900/60 flex items-center justify-center text-slate-300 hover:bg-accent hover:border-accent hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {settings?.instagram?.trim() && (
                  <a
                    href={settings.instagram.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Nossa página no Instagram"
                    className="w-9 h-9 rounded-full border border-slate-700 bg-slate-900/60 flex items-center justify-center text-slate-300 hover:bg-accent hover:border-accent hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {settings?.whatsapp?.trim() && (
                  <a
                    href={settings.whatsapp.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Fale conosco no WhatsApp"
                    className="w-9 h-9 rounded-full border border-slate-700 bg-slate-900/60 flex items-center justify-center text-slate-300 hover:bg-accent hover:border-accent hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <svg aria-hidden="true" className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.89.87-.89 2.12s.91 2.46 1.04 2.63c.13.17 1.79 2.73 4.33 3.83.61.26 1.08.42 1.45.54.61.19 1.17.17 1.61.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.07-.1-.23-.17-.48-.29" />
                    </svg>
                  </a>
                )}
              </div>
            ) : null}

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

        {/* Bottom Bar: Copyright */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {currentYear} Tasty Aromas e Sabores. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
