import { useState, useEffect, type JSX } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { mainNavLinks } from '@/config/navigation'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { WhatsAppButton } from '@/components/WhatsAppButton'

export function Header(): JSX.Element {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)
  const [scrolled, setScrolled] = useState<boolean>(false)

  useEffect(() => {
    const handleScroll = (): void => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeMobileMenu = (): void => setMobileMenuOpen(false)

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 bg-background/90 backdrop-blur-md border-b ${
        scrolled ? 'border-border shadow-sm py-2.5' : 'border-border/60 py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo brand block */}
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
          >
            <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-xs tracking-wider shadow-sm group-hover:opacity-95 transition-opacity flex-shrink-0">
              LOGO
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg md:text-xl text-foreground leading-tight tracking-tight group-hover:text-primary transition-colors">
                Tasty Plus
              </span>
              <span className="hidden sm:inline text-xs text-muted-foreground font-medium leading-none">
                A fórmula certa para a sua empresa
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
                  `px-3 py-2 text-sm font-semibold rounded-md transition-all relative ${
                    isActive
                      ? 'text-primary after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-primary after:rounded-full'
                      : 'text-foreground/80 hover:text-foreground hover:bg-secondary/60'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right cluster: Dark Mode + WhatsApp + Hamburger */}
          <div className="flex items-center gap-2 md:gap-3">
            <DarkModeToggle />
            <WhatsAppButton />

            {/* Mobile Hamburger toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu de navegação'}
              aria-expanded={mobileMenuOpen}
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-card/80 text-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-down Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-md animate-fade-in shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            <nav aria-label="Navegação móvel" className="flex flex-col space-y-1">
              {mainNavLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `px-4 py-3 text-base font-semibold rounded-lg transition-colors flex items-center justify-between ${
                      isActive
                        ? 'bg-secondary text-primary border-l-4 border-primary pl-3'
                        : 'text-foreground/90 hover:bg-secondary/60'
                    }`
                  }
                >
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="pt-3 border-t border-border/70 flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground font-medium">Tema & Atendimento</span>
              <div className="flex items-center gap-2">
                <DarkModeToggle />
                <WhatsAppButton iconOnlyOnMobile={false} />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
