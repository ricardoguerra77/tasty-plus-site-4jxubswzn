import { useState, useEffect, type JSX } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { mainNavLinks } from '@/config/navigation'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { BrandLogo } from '@/components/BrandLogo'
import { getSiteSettings, getFileUrl, type SiteSettings } from '@/services/siteSettings'
import { useRealtime } from '@/hooks/use-realtime'

export function Header(): JSX.Element {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)
  const [scrolled, setScrolled] = useState<boolean>(false)
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [isDark, setIsDark] = useState<boolean>(false)

  useEffect(() => {
    const handleScroll = (): void => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Listen to dark class mutations on document.documentElement
  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    checkDark()

    const observer = new MutationObserver(() => {
      checkDark()
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

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

  const closeMobileMenu = (): void => setMobileMenuOpen(false)

  // Use logoDark in dark mode (if present), else standard logo (if present)
  const chosenLogo = isDark && settings?.logoDark ? settings.logoDark : settings?.logo
  const logoUrl =
    settings && chosenLogo ? getFileUrl('site_settings', settings.id, chosenLogo) : null

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 bg-white/95 dark:bg-card/95 backdrop-blur-md border-b ${
        scrolled ? 'border-border shadow-sm py-2.5' : 'border-border/60 py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo brand block — Enlarged logo height and responsiveness */}
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-3.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl p-1"
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Tasty Aromas e Sabores"
                className="h-12 md:h-14 lg:h-16 w-auto max-w-[180px] md:max-w-[220px] object-contain flex-shrink-0 transition-transform group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex items-center flex-shrink-0">
                <BrandLogo
                  className="h-12 md:h-14 lg:h-16 w-auto max-w-[180px] md:max-w-[220px] object-contain drop-shadow-sm group-hover:opacity-95 transition-all group-hover:scale-[1.02]"
                  alt="Tasty Aromas e Sabores"
                />
                <span className="sr-only">TASTY</span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg md:text-xl lg:text-2xl text-primary leading-tight tracking-tight group-hover:text-accent transition-colors">
                Tasty Aromas e Sabores
              </span>
              <span className="hidden sm:inline text-xs md:text-sm text-muted-foreground font-medium leading-none mt-0.5">
                {settings?.tagline || 'A fórmula certa para a sua empresa'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav aria-label="Navegação principal" className="hidden lg:flex items-center space-x-1">
            {mainNavLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  `group relative px-3.5 py-2 text-sm font-display font-semibold transition-colors duration-200 ${
                    isActive
                      ? 'text-primary dark:text-foreground font-bold'
                      : 'text-foreground/85 hover:text-primary dark:hover:text-foreground'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{link.label}</span>
                    {/* Hover and Active Red Animated Underline Indicator */}
                    <span
                      aria-hidden="true"
                      className={`absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-accent rounded-full transition-all duration-300 ${
                        isActive
                          ? 'opacity-100 scale-x-100'
                          : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right cluster: Dark Mode + Hamburger (Header Fale Conosco button removed) */}
          <div className="flex items-center gap-2 md:gap-3">
            <DarkModeToggle />

            {/* Mobile Hamburger toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu de navegação'}
              aria-expanded={mobileMenuOpen}
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-border bg-card/80 text-foreground hover:bg-secondary transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-down Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background/98 backdrop-blur-md animate-fade-in shadow-xl">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            <nav aria-label="Navegação móvel" className="flex flex-col space-y-1">
              {mainNavLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `px-4 py-3 text-base font-display font-semibold rounded-xl transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-secondary text-primary dark:text-foreground border-l-4 border-accent pl-3'
                        : 'text-foreground/90 hover:bg-secondary/60'
                    }`
                  }
                >
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="pt-3 border-t border-border/70 flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground font-medium">Tema</span>
              <div className="flex items-center gap-2">
                <DarkModeToggle />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
