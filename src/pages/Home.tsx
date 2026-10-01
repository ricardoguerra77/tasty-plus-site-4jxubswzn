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
    'Olá! Gostaria de solicitar minha amostra grátis do Adoçante Dietético Tasty Plus.',
  )

  // Floating WhatsApp link
  const floatingWhatsAppUrl = buildWhatsAppLink(
    DEFAULT_SALES_PHONE,
    'Olá! Gostaria de atendimento comercial da Tasty Plus.',
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
    <div className="space-y-16 lg:space-y-24 pb-20 animate-fade-in relative">
      {/* 1. HERO SLIDER */}
      <section className="relative overflow-hidden bg-slate-950 text-white min-h-[500px] md:min-h-[580px] flex items-center">
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background image with overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-7000"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/40" />

            {/* Slide Content */}
            <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center py-20">
              <div className="max-w-2xl space-y-6">
                <Badge className="bg-primary/90 text-primary-foreground text-xs md:text-sm font-semibold px-3 py-1">
                  Mais de 30 anos de expertise
                </Badge>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight drop-shadow-md">
                  {slide.title}
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-slate-200 leading-relaxed drop-shadow">
                  {slide.subtitle}
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Button asChild size="lg" className="font-bold text-base shadow-lg">
                    <Link to="/produtos">Conhecer Produtos</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm font-semibold"
                  >
                    <Link to="/contato">Fale Conosco</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel controls */}
        <div className="absolute bottom-6 right-6 z-30 flex items-center gap-2">
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
                  i === currentSlide ? 'w-8 bg-primary' : 'w-2.5 bg-white/40 hover:bg-white/70'
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="outline" className="text-primary border-primary/30 mb-2 font-semibold">
            Inovação e Rendimento
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            Destaques Comerciais Tasty Plus
          </h2>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base">
            Soluções inovadoras desenvolvidas para maximizar o rendimento, a rentabilidade e o sabor
            na sua linha de produção.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card 1: Adoçante Dietético */}
          <div className="rounded-2xl border-2 border-primary/40 bg-gradient-to-b from-card to-card/60 p-6 md:p-8 flex flex-col justify-between shadow-md relative overflow-hidden group hover:border-primary transition-all">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">
              Lançamento Especial
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Adoçante Dietético</h3>
              <p className="text-xs uppercase font-semibold text-primary tracking-wider">
                Despacho para todo o Brasil
              </p>
              <div className="bg-muted/40 rounded-xl p-4 space-y-2 text-sm text-foreground/90 border border-border/50">
                <p className="font-semibold text-lg text-primary">
                  Caixa com 24 unidades{' '}
                  <span className="text-xs font-normal text-muted-foreground">por apenas</span>
                  <br />
                  <span className="text-2xl font-extrabold text-foreground">R$ 600,00</span>{' '}
                  <span className="text-xs text-primary font-bold">(Preço de lançamento)</span>
                </p>
                <div className="border-t border-border/40 pt-2 space-y-1.5 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <strong>Poder edulcorante:</strong> 1kg adoa de 2.000 a 3.000 litros
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <strong>Sem residual metálico:</strong> sabor limpo e arredondado
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      50% de economia
                    </strong>{' '}
                    em relação ao açúcar
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <strong className="text-primary">25% de desconto</strong> para clientes de aroma
                    Tasty
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <a
                href={sampleWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 font-bold text-white bg-[#25D366] hover:bg-[#20ba59] active:scale-95 transition-all p-3.5 rounded-xl shadow-md text-sm md:text-base text-center"
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
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
                <Coffee className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Café-Cola Gelado Tasty</h3>
              <p className="text-sm text-muted-foreground">
                Inovação refrescante unindo o melhor do café premium com a vibração da cola,
                disponível para licenciamento exclusivo de marcas.
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-lg bg-muted/40 border border-border/50 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Industrial</span>
                  <Badge variant="secondary" className="font-mono font-bold">
                    632x
                  </Badge>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border border-border/50 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Comercial</span>
                  <Badge variant="secondary" className="font-mono font-bold">
                    100x
                  </Badge>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border border-border/50 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Para o lar</span>
                  <Badge variant="secondary" className="font-mono font-bold">
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
              <Button asChild variant="outline" className="w-full font-semibold">
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
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">NATU-COLA</h3>
              <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">100% Natural</Badge>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sabor cola 100% autêntico e natural extraído diretamente da noz de cola. A resposta
                perfeita para o mercado de refrigerantes artesanais, clean label e bebidas premium.
              </p>

              <div className="bg-muted/40 rounded-xl p-4 space-y-2 border border-border/50 text-xs text-muted-foreground">
                <p>
                  ✓ <strong>Extrato de Noz de Cola</strong> certificado
                </p>
                <p>✓ Estabilidade térmica e sensorial comprovada</p>
                <p>✓ Ideal para bebidas gaseificadas e xaropes artesanais</p>
              </div>
            </div>

            <div className="pt-6">
              <Button asChild variant="outline" className="w-full font-semibold">
                <a
                  href={buildWhatsAppLink(
                    DEFAULT_SALES_PHONE,
                    'Olá! Gostaria de cotação e ficha técnica do NATU-COLA Tasty Plus.',
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
      </section>

      {/* 3. BANNER ISO 9001 (CONDICIONAL) */}
      {settings?.isoBadge && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-background border border-primary/20 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 shadow-md">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-foreground">
                  Certificação de Qualidade ISO 9001
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                  Garantia de conformidade, padronização e rigoroso controle em todas as etapas de
                  produção e fracionamento.
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="border-primary text-primary font-bold px-4 py-2 text-sm flex-shrink-0"
            >
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              Padrão Internacional
            </Badge>
          </div>
        </section>
      )}

      {/* 4. SEÇÃO INSTITUCIONAL (EMPRESA, MISSÃO, VISÃO, VALORES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-card/60 p-8 md:p-12 space-y-12 shadow-sm">
          {/* Apresentação da empresa */}
          <div className="max-w-3xl space-y-4">
            <Badge variant="outline" className="text-primary border-primary/30 font-semibold">
              Sobre a Tasty Plus
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              A fórmula certa para a sua empresa
            </h2>
            {settings?.companyIntro ? (
              <div
                className="text-muted-foreground leading-relaxed text-base prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: settings.companyIntro }}
              />
            ) : (
              <p className="text-muted-foreground leading-relaxed text-base">
                A Tasty Plus é referência nacional no desenvolvimento e fornecimento de aromas,
                extratos, corantes e aditivos para a indústria de alimentos e bebidas. Com mais de
                30 anos de experiência no setor, combinamos rigor científico e excelência
                operacional.
              </p>
            )}
          </div>

          {/* Grid: Missão, Visão, Valores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border">
            {/* Missão */}
            <div className="space-y-3 p-6 rounded-2xl bg-background/80 border border-border/60">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Missão</h3>
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
            <div className="space-y-3 p-6 rounded-2xl bg-background/80 border border-border/60">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Visão</h3>
              {settings?.vision ? (
                <div
                  className="text-xs sm:text-sm text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: settings.vision }}
                />
              ) : (
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Ser a parceira mais confiável e inovadora da indústria alimentícia em soluções de
                  sabor no Brasil e América Latina.
                </p>
              )}
            </div>

            {/* Valores */}
            <div className="space-y-3 p-6 rounded-2xl bg-background/80 border border-border/60">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Valores</h3>
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
      </section>

      {/* 5. LINHA DO TEMPO HISTÓRICA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="outline" className="text-primary border-primary/30 mb-2 font-semibold">
            Nossa Trajetória
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            Linha do Tempo Tasty Plus
          </h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Uma história de dedicação à inovação sensorial e química de alimentos.
          </p>
        </div>

        <div className="relative border-l-2 border-primary/30 ml-4 md:ml-32 space-y-10 pl-6 md:pl-10">
          {/* 1987 */}
          <div className="relative group">
            <div className="absolute -left-[31px] md:-left-[47px] top-1.5 w-6 h-6 rounded-full bg-primary border-4 border-background flex items-center justify-center text-white" />
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-primary/50 transition-colors">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary mb-2">
                <Calendar className="w-4 h-4" /> 1987
              </span>
              <h3 className="text-lg font-bold text-foreground mb-1">
                Fundação & Expertise Sergio Becker
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Início das pesquisas pioneiras e desenvolvimento de formulações sob a liderança de
                Sergio Becker, trazendo conhecimento técnico avançado em química de aromas e sabores
                para a indústria nacional.
              </p>
            </div>
          </div>

          {/* 1994 */}
          <div className="relative group">
            <div className="absolute -left-[31px] md:-left-[47px] top-1.5 w-6 h-6 rounded-full bg-primary border-4 border-background flex items-center justify-center text-white" />
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-primary/50 transition-colors">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary mb-2">
                <Calendar className="w-4 h-4" /> 1994
              </span>
              <h3 className="text-lg font-bold text-foreground mb-1">
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
            <div className="absolute -left-[31px] md:-left-[47px] top-1.5 w-6 h-6 rounded-full bg-primary border-4 border-background flex items-center justify-center text-white" />
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-primary/50 transition-colors">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary mb-2">
                <Calendar className="w-4 h-4" /> 1999
              </span>
              <h3 className="text-lg font-bold text-foreground mb-1">
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
      </section>

      {/* 6. BOTÃO FLUTUANTE WHATSAPP (CANTO INFERIOR DIREITO) */}
      <div className="fixed bottom-6 right-6 z-40 animate-bounce hover:animate-none">
        <a
          href={floatingWhatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Atendimento via WhatsApp Tasty Plus"
          className="flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold px-4 py-3 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          <MessageCircle className="w-6 h-6 fill-current" />
          <span className="hidden sm:inline text-sm font-semibold">Atendimento Rápido</span>
        </a>
      </div>
    </div>
  )
}
