import type { JSX } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Linkedin } from 'lucide-react'

export function Footer(): JSX.Element {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border bg-card/60 text-foreground transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
          {/* Col 1: Brand block */}
          <div className="space-y-3 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs tracking-wider">
                LOGO
              </div>
              <span className="font-bold text-lg text-foreground tracking-tight">Tasty Plus</span>
            </div>
            <p className="text-xs font-semibold text-primary">A fórmula certa para a sua empresa</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              [Sobre a Tasty Plus — texto institucional em breve]
            </p>
          </div>

          {/* Col 2: Endereço */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
              Endereço
            </h3>
            <p className="text-sm text-foreground/90 leading-relaxed">
              Rua Otacílio Roxo, 150, Bairro Cerâmica, Nova Iguaçu-RJ
            </p>
          </div>

          {/* Col 3: Telefones */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-primary flex-shrink-0" />
              Telefones
            </h3>
            <ul className="text-sm space-y-1.5 text-foreground/90">
              <li>
                <span className="font-medium text-muted-foreground text-xs">Fixo:</span>{' '}
                <a href="tel:+552126583517" className="hover:text-primary transition-colors">
                  21 2658-3517
                </a>
              </li>
              <li>
                <span className="font-medium text-muted-foreground text-xs">Vendas:</span>{' '}
                <a href="tel:+5521988831253" className="hover:text-primary transition-colors">
                  21 98883-1253
                </a>
              </li>
              <li>
                <span className="font-medium text-muted-foreground text-xs">Financeiro:</span>{' '}
                <a href="tel:+5521988358373" className="hover:text-primary transition-colors">
                  21 98835-8373
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: E-mail e Horários */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-primary flex-shrink-0" />
              E-mail & Horários
            </h3>
            <div className="text-sm space-y-2 text-foreground/90">
              <p>
                <a
                  href="mailto:tasty@tastyplus.com.br"
                  className="hover:text-primary transition-colors break-all"
                >
                  tasty@tastyplus.com.br
                </a>
              </p>
              <div className="text-xs text-muted-foreground space-y-1 pt-1 border-t border-border/40">
                <p className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span>Seg a Qui 07h30 às 17h30</span>
                </p>
                <p className="pl-5">Sex 07h30 às 16h30</p>
              </div>
            </div>
          </div>

          {/* Col 5: Redes Sociais */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Redes Sociais
            </h3>
            <div className="flex items-center gap-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="[Nossa página no Instagram]"
                className="w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center text-foreground hover:bg-secondary hover:text-primary transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="[Nossa página no Facebook]"
                className="w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center text-foreground hover:bg-secondary hover:text-primary transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="[Nossa página no LinkedIn]"
                className="w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center text-foreground hover:bg-secondary hover:text-primary transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>

            <div className="pt-2">
              <Link
                to="/login"
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                Acesso Restrito
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Reference */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {currentYear} Tasty Plus — Tasty Aromas e Sabores. Todos os direitos reservados.</p>
          <p>
            Referência:{' '}
            <a
              href="https://tastyplus.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors underline underline-offset-2"
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
