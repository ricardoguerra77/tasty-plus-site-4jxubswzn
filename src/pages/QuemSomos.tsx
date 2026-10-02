import { useState, useEffect, type JSX } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  FlaskConical,
  Award,
  ArrowRight,
  Target,
  Layers,
  MapPin,
  HeartHandshake,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BrandLogo } from '@/components/BrandLogo'
import { buildWhatsAppLink } from '@/lib/whatsapp'
import { getSiteSettings, resolveSiteLogoUrl, type SiteSettings } from '@/services/siteSettings'
import { useRealtime } from '@/hooks/use-realtime'

export default function QuemSomos(): JSX.Element {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [isDark, setIsDark] = useState<boolean>(false)

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

  const logoUrl = resolveSiteLogoUrl(settings, isDark)

  const whatsAppUrl = buildWhatsAppLink(
    '5521988831253',
    'Olá! Conheci a história da Tasty Aromas e Sabores no site e gostaria de solicitar atendimento.',
  )

  const productForms = [
    {
      title: 'Aromas',
      desc: 'Fundamental para dar ou realçar as características de sabor do produto final.',
      icon: <Sparkles className="w-5 h-5 text-accent" />,
    },
    {
      title: 'Extratos',
      desc: 'Importantes para atender a legislação e garantir autenticidade natural.',
      icon: <FlaskConical className="w-5 h-5 text-primary dark:text-blue-400" />,
    },
    {
      title: 'Bases',
      desc: 'Especialmente formuladas para fabricação ágil de refrescos e bebidas saborizadas.',
      icon: <Layers className="w-5 h-5 text-emerald-500" />,
    },
    {
      title: 'Aditivos',
      desc: 'Para complemento do produto: acidulante, conservante, corante, entre outros.',
      icon: <Target className="w-5 h-5 text-amber-500" />,
    },
  ]

  const applications = [
    'Refrigerantes e Refrescos',
    'Sucos e Néctares',
    'Sorvetes e Picolés',
    'Confeitaria e Panificação',
    'Bebidas Alcoólicas e Coquetéis',
    'Lácteos e Sobremesas',
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-16 animate-fade-in">
      {/* Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="flex justify-center mb-2">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Tasty Aromas e Sabores"
              className="h-16 md:h-20 w-auto max-w-[260px] object-contain drop-shadow-sm"
            />
          ) : (
            <BrandLogo
              className="h-16 md:h-20 w-auto object-contain drop-shadow-sm"
              alt="Tasty Aromas e Sabores"
            />
          )}
        </div>
        <Badge className="bg-primary/10 text-primary dark:bg-primary/25 border-primary/20 font-display font-semibold px-4 py-1.5 rounded-full text-xs uppercase tracking-wider">
          Desde 1987 • Tradição e Inovação
        </Badge>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-primary dark:text-foreground tracking-tight">
          Quem Somos
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
          Especializada no desenvolvimento e fornecimento de aromas e aditivos de alta performance
          para a indústria de alimentos e bebidas.
        </p>
      </section>

      {/* Main Reference Content Section: Conteúdo Real do tastyplus.com.br/quem-somos/ */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Coluna de Texto Principal (7 colunas) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent font-semibold text-xs tracking-wider uppercase">
            <HeartHandshake className="w-4 h-4" />
            <span>A Fórmula Certa Para a Sua Empresa</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-primary dark:text-foreground leading-tight">
            Mais de três décadas transformando o sabor da indústria brasileira
          </h2>

          <div className="space-y-4 text-foreground/85 text-base sm:text-lg leading-relaxed font-normal">
            <p>
              A <strong>Tasty</strong> atua no mercado desde <strong>1987</strong> sendo uma empresa
              especializada em aromas e aditivos para alimentos e bebidas saborizadas como
              refrigerantes, refrescos, sucos, sorvetes, picolés, confeitaria e bebidas alcoólicas.
            </p>
            <p>
              Sempre em busca da satisfação do cliente, a Tasty tem como diferencial a{' '}
              <strong className="text-primary dark:text-accent font-semibold">
                customização de fórmulas
              </strong>
              , ou seja, somente com a Tasty os clientes terão exatamente o produto final que
              buscam.{' '}
              <span className="font-semibold text-foreground">A Tasty se adapta ao cliente.</span>
            </p>
            <p>
              A Tasty desenvolve sabores, aromas, colorações, concentrações dos produtos e suas
              combinações conforme a necessidade de cada cliente.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-4">
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent-dark text-accent-foreground font-display font-bold rounded-xl shadow-md cursor-pointer"
            >
              <Link to="/produtos">
                Conheça nossos produtos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-xl border-border hover:bg-secondary cursor-pointer"
            >
              <Link to="/contato">Fale com um Especialista</Link>
            </Button>
          </div>
        </div>

        {/* Coluna Visual de Destaque / Estatísticas (5 colunas) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative rounded-3xl overflow-hidden border border-border shadow-2xl bg-gradient-to-br from-primary via-primary/95 to-slate-900 text-white p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-slate-300 font-bold">
                  Trajetória
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-accent text-[11px] font-bold text-accent-foreground">
                  35+ Anos
                </span>
              </div>

              <div className="space-y-2">
                <div className="text-5xl sm:text-6xl font-display font-extrabold text-white">
                  1987
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Ano de fundação pelo engenheiro industrial{' '}
                  <strong className="text-white">Sergio Becker</strong>, trazendo vasta experiência
                  de grandes multinacionais de bebidas.
                </p>
              </div>

              <div className="pt-4 border-t border-white/15 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Parque Fabril</span>
                  <span className="text-white font-semibold flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-accent" /> Nova Iguaçu - RJ
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Diferencial</span>
                  <span className="text-white font-semibold flex items-center gap-1 mt-0.5">
                    <Award className="w-3.5 h-3.5 text-accent" /> Fórmulas Sob Medida
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Aplicações Atendidas
            </h4>
            <div className="flex flex-wrap gap-2">
              {applications.map((app, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-secondary text-foreground border border-border/70"
                >
                  {app}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Seção Formas dos Produtos: Citação direta da página Quem Somos */}
      <section className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge className="bg-accent/15 text-accent border-accent/30 font-display font-semibold px-3 py-1 rounded-full text-xs">
            Portfólio de Soluções
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-primary dark:text-foreground tracking-tight">
            Formas em que nossos produtos são disponibilizados
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Desenvolvemos formulações sob medida para o processo industrial de cada parceiro, nas
            seguintes apresentações:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {productForms.map((item, idx) => (
            <Card
              key={idx}
              className="rounded-2xl border-border bg-card hover:border-accent/40 hover:shadow-lg transition-all"
            >
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="text-lg font-display font-bold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* História e Evolução (contexto institucional apurado) */}
      <section className="bg-secondary/40 dark:bg-card/50 rounded-3xl border border-border p-6 sm:p-10 md:p-12 space-y-6">
        <div className="max-w-3xl space-y-4">
          <Badge className="bg-primary/10 text-primary dark:bg-primary/20 border-primary/20 font-display font-semibold px-3 py-1 rounded-full text-xs">
            Nossa Trajetória
          </Badge>
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-primary dark:text-foreground tracking-tight">
            Da fundação à liderança em aromatização personalizada
          </h3>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Fundada pelo engenheiro Sergio Becker com bagagem de grupos globais de bebidas, a Tasty
            expandiu suas operações integrando escritório e parque fabril próprio em Nova Iguaçu-RJ.
            Com constante investimento em workshops, infraestrutura e qualificação profissional, a
            empresa se tornou parceira estratégica de fabricantes e envasadores em todo o território
            nacional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-card dark:bg-muted/40 p-5 rounded-2xl border border-border space-y-2">
            <span className="text-xs font-bold text-accent uppercase tracking-wider block">
              1. Customização Total
            </span>
            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
              Sabores, cores e concentrações ajustados conforme a identidade de cada cliente e
              demanda técnica de linha.
            </p>
          </div>
          <div className="bg-card dark:bg-muted/40 p-5 rounded-2xl border border-border space-y-2">
            <span className="text-xs font-bold text-accent uppercase tracking-wider block">
              2. Rigor em Qualidade
            </span>
            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
              Processos estruturados pelo Sistema de Gestão da Qualidade, com rastreabilidade,
              laudos técnicos e melhoria contínua.
            </p>
          </div>
          <div className="bg-card dark:bg-muted/40 p-5 rounded-2xl border border-border space-y-2">
            <span className="text-xs font-bold text-accent uppercase tracking-wider block">
              3. Parceria e Apoio
            </span>
            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
              Equipe técnica dedicada para suporte em testes industriais, formulações piloto e envio
              de amostras ágeis.
            </p>
          </div>
        </div>
      </section>

      {/* Banner / CTA Final */}
      <section className="rounded-3xl bg-gradient-to-r from-primary to-slate-900 text-white p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Pronto para encontrar a fórmula certa para o seu produto?
          </h3>
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
            Consulte nosso catálogo online ou fale diretamente com nossos especialistas para
            desenvolver uma solução personalizada para o seu negócio.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 w-full md:w-auto">
          <Button
            asChild
            size="lg"
            className="bg-accent hover:bg-accent-dark text-accent-foreground font-display font-bold rounded-xl shadow-md"
          >
            <Link to="/produtos">Ver Produtos</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl"
          >
            <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer">
              Falar no WhatsApp
            </a>
          </Button>
        </div>
      </section>
    </div>
  )
}
