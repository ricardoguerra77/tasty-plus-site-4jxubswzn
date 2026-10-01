import { useState, useEffect, useCallback, type JSX } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Award,
  Sparkles,
  Coffee,
  Leaf,
  ShieldCheck,
  Target,
  Eye,
  HeartHandshake,
  Calendar,
  MessageCircle,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { getSiteSettings, getFileUrl, type SiteSettings } from '@/services/siteSettings'
import { buildWhatsAppLink } from '@/lib/whatsapp'
import { StateFeedback } from '@/components/StateFeedback'

const DEFAULT_SALES_PHONE = '21 98883-1253'

export default function Home(): JSX.Element {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)
  const [currentSlide, setCurrentSlide] = useState<number>(0)

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true)
      setError(false)
      const data = await getSiteSettings()
      setSettings(data)
    } catch {
      setError(true)
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar informações',
        description: 'Não foi possível carregar os dados institucionais.',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  // Realtime subscription on site_settings
  useRealtime('site_settings', () => {
    loadSettings()
  })

  // Prepare slides from settings or fallback
  const slides = [
    {
      title:
        settings?.heroSlide1Title ||
        'Mais de 30 anos de expertise em aromas e extratos industriais',
      subtitle:
        settings?.heroSlide1Subtitle ||
        'Desenvolvimento sob medida com tecnologia de ponta, alta concentração e padronização.',
      image:
        settings && settings.heroImage1
          ? getFileUrl('site_settings', settings.id, settings.heroImage1)
          : 'https://img.usecurling.com/p/1600/700?q=beverage+flavoring+laboratory&color=amber',
    },
    {
      title: settings?.heroSlide2Title || 'Qualidade Certificada e Rastreabilidade Total',
      subtitle:
        settings?.heroSlide2Subtitle ||
        'Processos certificados que asseguram segurança alimentar, rendimento superior e padrão incomparável.',
      image:
        settings && settings.heroImage2
          ? getFileUrl('site_settings', settings.id, settings.heroImage2)
          : 'https://img.usecurling.com/p/1600/700?q=food+science+factory&color=emerald',
    },
    {
      title: settings?.heroSlide3Title || 'Parceria Técnica Especializada para sua Indústria',
      subtitle:
        settings?.heroSlide3Subtitle ||
        'A fórmula certa para o sucesso do seu produto em bebidas, panificação, laticínios e suplementos.',
      image:
        settings && settings.heroImage3
          ? getFileUrl('site_settings', settings.id, settings.heroImage3)
          : 'https://img.usecurling.com/p/1600/700?q=natural+extracts+bottles&color=teal',
    },
  ]

  // Auto-cycle hero slider every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [slides.length])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  // WhatsApp link for Sample request
  const sampleWhatsAppUrl = buildWhatsAppLink(
    DEFAULT_SALES_PHONE,
    'Olá! Gostaria de solicitar minha amostra grátis do Adoçante Dietético Tasty Aromas e Sabores.',
  )

  // Floating WhatsApp link
  const floatingWhatsAppUrl = buildWhatsAppLink(
    DEFAULT_SALES_PHONE,
    'Olá! Gostaria de atendimento comercial da Tasty Aromas e Sabores.',
  )

  if (loading) {
    return (
      <div className="space-y-12 pb-16">
        {/* Hero Skeleton */}
        <div className="relative h-[480px] md:h-[560px] w-full bg-muted/60 animate-pulse flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
            <Skeleton className="h-10 md:h-14 w-3/4 mx-auto" />
            <Skeleton className="h-6 md:h-8 w-1/2 mx-auto" />
            <div className="flex justify-center gap-4 pt-4">
              <Skeleton className="h-12 w-44" />
              <Skeleton className="h-12 w-44" />
            </div>
          </div>
        </div>
        {/* Highlights Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error && !settings) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <StateFeedback
          icon={<AlertTriangle className="w-12 h-12 text-destructive" />}
          title="Erro ao carregar a página inicial"
          description="Ocorreu uma falha na comunicação com o servidor. Por favor, tente novamente."
          actionLabel="Tentar novamente"
          onAction={loadSettings}
        />
      </div>
    )
  }

  return (
    <div className="space-y-0 pb-0 animate-fade-in relative">
      {/* 1. HERO SLIDER */}
      <section className="relative overflow-hidden bg-[hsl(215,73%,14%)] text-white min-h-[540px] md:min-h-[640px] flex items-center">
        {/* Soft radial glow */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(225,29,72,0.18),rgba(255,255,255,0))]"
        />

        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background image with overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-7000 opacity-30"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(215,73%,12%)] via-[hsl(215,73%,14%)]/90 to-[hsl(215,73%,14%)]/60" />

            {/* Slide Content */}
            <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center py-24 md:py-32">
              <div className="max-w-3xl space-y-6">
                <Badge className="bg-accent text-accent-foreground text-xs md:text-sm font-display font-semibold px-4 py-1.5 rounded-full shadow-sm">
                  Mais de 30 anos de expertise
                </Badge>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-white drop-shadow-sm">
                  {slide.title}
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-slate-200 leading-relaxed max-w-2xl">
                  {slide.subtitle}
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-3">
                  <Button
                    asChild
                    size="lg"
                    className="font-display font-bold text-base shadow-lg bg-accent hover:bg-accent-dark text-accent-foreground px-6 py-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <Link to="/produtos">Conhecer Produtos</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="bg-transparent hover:bg-white/10 text-white border-2 border-white/80 font-display font-bold px-6 py-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <Link to="/contato">Fale Conosco</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel controls */}
        <div className="absolute bottom-8 right-8 z-30 flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={prevSlide}
            aria-label="Slide anterior"
            className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm border border-white/20"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-1.5 px-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentSlide(i)}
                aria-label={`Ir para o slide ${i + 1}`}
                className={`h-2.5 rounded-full transition-all ${
                  i === currentSlide ? 'w-8 bg-accent' : 'w-2.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={nextSlide}
            aria-label="Próximo slide"
            className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm border border-white/20"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* 2. DESTAQUES COMERCIAIS */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge className="bg-accent text-accent-foreground mb-3 font-display font-semibold px-3 py-1 rounded-full">
              Inovação e Rendimento
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary tracking-tight font-display">
              Destaques Comerciais Tasty Aromas e Sabores
            </h2>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base">
              Soluções inovadoras desenvolvidas para maximizar o rendimento, a rentabilidade e o
              sabor na sua linha de produção.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Card 1: Adoçante Dietético */}
            <div className="rounded-2xl border border-primary/20 bg-card p-6 md:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs font-display font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">
                Lançamento Especial
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-secondary text-primary flex items-center justify-center mb-2">
                  <Sparkles className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-2xl font-display font-bold text-primary">Adoçante Dietético</h3>
                <p className="text-xs uppercase font-display font-semibold text-accent tracking-wider">
                  Despacho para todo o Brasil
                </p>
                <div className="bg-secondary/50 rounded-xl p-4 space-y-2 text-sm text-foreground/90 border border-border/50">
                  <p className="font-semibold text-lg text-primary">
                    Caixa com 24 unidades{' '}
                    <span className="text-xs font-normal text-muted-foreground">por apenas</span>
                    <br />
                    <span className="text-2xl font-display font-extrabold text-primary">
                      R$ 600,00
                    </span>{' '}
                    <span className="text-xs text-accent font-bold">(Preço de lançamento)</span>
                  </p>
                  <div className="border-t border-border/40 pt-2 space-y-1.5 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <strong>Poder edulcorante:</strong> 1kg adoa de 2.000 a 3.000 litros
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <strong>Sem residual metálico:</strong> sabor limpo e arredondado
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <strong className="text-accent">50% de economia</strong> em relação ao açúcar
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <strong className="text-primary">25% de desconto</strong> para clientes de
                      aroma Tasty
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <a
                  href={sampleWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 font-display font-bold text-accent-foreground bg-accent hover:bg-accent-dark active:scale-95 transition-all p-3.5 rounded-xl shadow-md text-sm md:text-base text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <MessageCircle className="w-5 h-5 flex-shrink-0" />
                  <span>Peça já a sua amostra grátis aqui!</span>
                </a>
                <p className="text-[11px] text-center text-muted-foreground mt-2">
                  Atendimento direto WhatsApp: 21 98883-1253
                </p>
              </div>
            </div>

            {/* Card 2: Café-Cola Gelado Tasty */}
            <div className="rounded-2xl border border-primary/20 bg-card p-6 md:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-secondary text-primary flex items-center justify-center mb-2">
                  <Coffee className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-display font-bold text-primary">
                  Café-Cola Gelado Tasty
                </h3>
                <p className="text-sm text-muted-foreground">
                  Inovação refrescante unindo o melhor do café premium com a vibração da cola,
                  disponível para licenciamento exclusivo de marcas.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="p-3 rounded-lg bg-secondary/50 border border-border/50 flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Industrial</span>
                    <Badge className="font-mono font-bold bg-accent text-accent-foreground">
                      632x
                    </Badge>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50 border border-border/50 flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Comercial</span>
                    <Badge className="font-mono font-bold bg-accent text-accent-foreground">
                      100x
                    </Badge>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50 border border-border/50 flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Para o lar</span>
                    <Badge className="font-mono font-bold bg-accent text-accent-foreground">
                      10x
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground pt-1">
                  <strong>Licenciamento exclusivo:</strong> oportunidade única para engarrafadores e
                  marcas próprias.
                </p>
              </div>

              <div className="pt-6">
                <Button
                  asChild
                  variant="outline"
                  className="w-full font-display font-bold border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <a
                    href={buildWhatsAppLink(
                      DEFAULT_SALES_PHONE,
                      'Olá! Gostaria de consultar sobre o licenciamento do Café-Cola gelado Tasty.',
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Consultar Licenciamento
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Card 3: NATU-COLA */}
            <div className="rounded-2xl border border-primary/20 bg-card p-6 md:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-secondary text-primary flex items-center justify-center mb-2">
                  <Leaf className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-2xl font-display font-bold text-primary">NATU-COLA</h3>
                <Badge className="bg-accent text-accent-foreground hover:bg-accent-dark font-display font-semibold rounded-full w-fit">
                  100% Natural
                </Badge>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Sabor cola 100% autêntico e natural extraído diretamente da noz de cola. A
                  resposta perfeita para o mercado de refrigerantes artesanais, clean label e
                  bebidas premium.
                </p>

                <div className="bg-secondary/50 rounded-xl p-4 space-y-2 border border-border/50 text-xs text-muted-foreground">
                  <p>
                    ✓ <strong>Extrato de Noz de Cola</strong> certificado
                  </p>
                  <p>✓ Estabilidade térmica e sensorial comprovada</p>
                  <p>✓ Ideal para bebidas gaseificadas e xaropes artesanais</p>
                </div>
              </div>

              <div className="pt-6">
                <Button
                  asChild
                  variant="outline"
                  className="w-full font-display font-bold border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <a
                    href={buildWhatsAppLink(
                      DEFAULT_SALES_PHONE,
                      'Olá! Gostaria de cotação e ficha técnica do NATU-COLA Tasty Aromas e Sabores.',
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Solicitar Cotação NATU-COLA
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BANNER ISO 9001 (CONDICIONAL) */}
      {settings?.isoBadge && (
        <section className="py-8 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-secondary/80 border border-primary/20 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 shadow-md">
                  <Award className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-display font-bold text-primary">
                    Certificação de Qualidade ISO 9001
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                    Garantia de conformidade, padronização e rigoroso controle em todas as etapas de
                    produção e fracionamento.
                  </p>
                </div>
              </div>
              <Badge className="bg-accent text-accent-foreground font-display font-bold px-4 py-2 text-sm flex-shrink-0 rounded-full">
                <ShieldCheck className="w-4 h-4 mr-1.5" />
                Padrão Internacional
              </Badge>
            </div>
          </div>
        </section>
      )}

      {/* 4. SEÇÃO INSTITUCIONAL (EMPRESA, MISSÃO, VISÃO, VALORES) - alternating background */}
      <section className="py-16 md:py-24 bg-secondary/40 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-primary/20 bg-card p-8 md:p-12 space-y-12 shadow-sm">
            {/* Apresentação da empresa */}
            <div className="max-w-3xl space-y-4">
              <Badge className="bg-accent text-accent-foreground font-display font-semibold px-3 py-1 rounded-full">
                Sobre a Tasty Aromas e Sabores
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-primary">
                A fórmula certa para a sua empresa
              </h2>
              {settings?.companyIntro ? (
                <div
                  className="text-muted-foreground leading-relaxed text-base prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: settings.companyIntro }}
                />
              ) : (
                <p className="text-muted-foreground leading-relaxed text-base">
                  A Tasty Aromas e Sabores é referência nacional no desenvolvimento e fornecimento
                  de aromas, extratos, corantes e aditivos para a indústria de alimentos e bebidas.
                  Com mais de 30 anos de experiência no setor, combinamos rigor científico e
                  excelência operacional.
                </p>
              )}
            </div>

            {/* Grid: Missão, Visão, Valores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border">
              {/* Missão */}
              <div className="space-y-3 p-6 rounded-2xl bg-secondary/30 border border-border">
                <div className="w-10 h-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-display font-bold text-primary">Missão</h3>
                {settings?.mission ? (
                  <div
                    className="text-xs sm:text-sm text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: settings.mission }}
                  />
                ) : (
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Criar experiências sensoriais memoráveis fornecendo aromas e ingredientes de
                    altíssima qualidade e segurança alimentar.
                  </p>
                )}
              </div>

              {/* Visão */}
              <div className="space-y-3 p-6 rounded-2xl bg-secondary/30 border border-border">
                <div className="w-10 h-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-display font-bold text-primary">Visão</h3>
                {settings?.vision ? (
                  <div
                    className="text-xs sm:text-sm text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: settings.vision }}
                  />
                ) : (
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Ser a parceira mais confiável e inovadora da indústria alimentícia em soluções
                    de sabor no Brasil e América Latina.
                  </p>
                )}
              </div>

              {/* Valores */}
              <div className="space-y-3 p-6 rounded-2xl bg-secondary/30 border border-border">
                <div className="w-10 h-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-display font-bold text-primary">Valores</h3>
                {settings?.values ? (
                  <div
                    className="text-xs sm:text-sm text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: settings.values }}
                  />
                ) : (
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Inovação constante, rigor na qualidade, integridade nas relações comerciais e
                    respeito às pessoas e ao meio ambiente.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. LINHA DO TEMPO HISTÓRICA */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge className="bg-accent text-accent-foreground mb-3 font-display font-semibold px-3 py-1 rounded-full">
              Nossa Trajetória
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-primary">
              Linha do Tempo Tasty Aromas e Sabores
            </h2>
            <p className="mt-2 text-muted-foreground text-sm">
              Uma história de dedicação à inovação sensorial e química de alimentos.
            </p>
          </div>

          <div className="relative border-l-2 border-primary/20 ml-4 md:ml-32 space-y-10 pl-6 md:pl-10">
            {/* 1987 */}
            <div className="relative group">
              <div className="absolute -left-[31px] md:-left-[47px] top-1.5 w-6 h-6 rounded-full bg-accent border-4 border-background flex items-center justify-center text-white" />
              <div className="bg-card border border-primary/15 rounded-2xl p-6 shadow-sm hover:border-primary/40 transition-colors">
                <span className="inline-flex items-center gap-1.5 text-xs font-display font-bold text-accent mb-2">
                  <Calendar className="w-4 h-4" /> 1987
                </span>
                <h3 className="text-lg font-display font-bold text-primary mb-1">
                  Fundação & Expertise Sergio Becker
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Início das pesquisas pioneiras e desenvolvimento de formulações sob a liderança de
                  Sergio Becker, trazendo conhecimento técnico avançado em química de aromas e
                  sabores para a indústria nacional.
                </p>
              </div>
            </div>

            {/* 1994 */}
            <div className="relative group">
              <div className="absolute -left-[31px] md:-left-[47px] top-1.5 w-6 h-6 rounded-full bg-accent border-4 border-background flex items-center justify-center text-white" />
              <div className="bg-card border border-primary/15 rounded-2xl p-6 shadow-sm hover:border-primary/40 transition-colors">
                <span className="inline-flex items-center gap-1.5 text-xs font-display font-bold text-accent mb-2">
                  <Calendar className="w-4 h-4" /> 1994
                </span>
                <h3 className="text-lg font-display font-bold text-primary mb-1">
                  Especialização Industrial em Grande Escala
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Expansão e foco na especialização de extratos naturais concentrados e bases para
                  refrigerantes, licores, destilados e bebidas carbonatadas.
                </p>
              </div>
            </div>

            {/* 1999 */}
            <div className="relative group">
              <div className="absolute -left-[31px] md:-left-[47px] top-1.5 w-6 h-6 rounded-full bg-accent border-4 border-background flex items-center justify-center text-white" />
              <div className="bg-card border border-primary/15 rounded-2xl p-6 shadow-sm hover:border-primary/40 transition-colors">
                <span className="inline-flex items-center gap-1.5 text-xs font-display font-bold text-accent mb-2">
                  <Calendar className="w-4 h-4" /> 1999
                </span>
                <h3 className="text-lg font-display font-bold text-primary mb-1">
                  Unificação do Parque Fabril
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Consolidação fabril integrando laboratórios de aplicação de última geração,
                  fracionamento automatizado e capacidade ampliada para atendimento a todo o
                  território nacional.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BOTÃO FLUTUANTE WHATSAPP (CANTO INFERIOR DIREITO: 56px, círculo vermelho vibrante com ícone branco) */}
      <div className="fixed bottom-6 right-6 z-40">
        <a
          href={floatingWhatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Atendimento via WhatsApp Tasty Aromas e Sabores"
          className="w-14 h-14 rounded-full bg-accent hover:bg-accent-dark text-accent-foreground flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <MessageCircle className="w-7 h-7" />
        </a>
      </div>
    </div>
  )
}
