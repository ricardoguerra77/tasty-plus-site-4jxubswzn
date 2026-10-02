import { useState, useEffect, useMemo, useCallback, type JSX } from 'react'
import {
  Search,
  MessageCircle,
  Package,
  AlertTriangle,
  Tag,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import {
  listProducts,
  PRODUCT_CATEGORIES,
  type Product,
  type ProductCategory,
} from '@/services/products'
import { buildWhatsAppLink } from '@/lib/whatsapp'
import { StateFeedback } from '@/components/StateFeedback'

const DEFAULT_SALES_PHONE = '21 98883-1253'

const ALL_CATEGORY_CONFIG: { label: string; value: ProductCategory }[] = [
  { label: 'Aromas', value: 'Aroma' },
  { label: 'Extratos', value: 'Extrato' },
  { label: 'Aditivos', value: 'Aditivo' },
  { label: 'Corantes', value: 'Corante' },
  { label: 'Outro', value: 'Outro' },
]

export default function Produtos(): JSX.Element {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)
  const [activeCategory, setActiveCategory] = useState<'Todos' | ProductCategory>('Todos')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(false)
      const data = await listProducts({ all: false, sort: 'order,name' })
      setProducts(data)
    } catch {
      setError(true)
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar produtos',
        description: 'Não foi possível carregar o catálogo de produtos.',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Realtime subscription on products collection
  useRealtime('products', () => {
    fetchProducts()
  })

  // Derive categories that have at least one visible published product
  const availableCategories = useMemo(() => {
    const counts = new Map<ProductCategory, number>()
    PRODUCT_CATEGORIES.forEach((cat) => counts.set(cat, 0))

    products.forEach((p) => {
      if (p.published !== false && p.category) {
        counts.set(p.category, (counts.get(p.category) ?? 0) + 1)
      }
    })

    const tabs: { label: string; value: 'Todos' | ProductCategory; count?: number }[] = [
      {
        label: 'Todos',
        value: 'Todos',
        count: products.filter((p) => p.published !== false).length,
      },
    ]

    ALL_CATEGORY_CONFIG.forEach((cfg) => {
      const count = counts.get(cfg.value) ?? 0
      if (count > 0) {
        tabs.push({ label: cfg.label, value: cfg.value, count })
      }
    })

    return tabs
  }, [products])

  // If activeCategory becomes invalid because no products belong to it anymore, fallback to 'Todos'
  useEffect(() => {
    if (activeCategory !== 'Todos') {
      const exists = availableCategories.some((tab) => tab.value === activeCategory)
      if (!exists) {
        setActiveCategory('Todos')
      }
    }
  }, [availableCategories, activeCategory])

  // Filter products by category and search query
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.published === false) return false

      const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory

      const matchesSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase().trim()))

      return matchesCategory && matchesSearch
    })
  }, [products, activeCategory, searchQuery])

  // Helper for clean text snippet extraction from HTML description
  const extractSnippet = (htmlDesc?: string): string => {
    if (!htmlDesc) {
      return 'Solução desenvolvida sob medida para a indústria com alto rendimento e pureza sensorial.'
    }
    const text = htmlDesc.replace(/<[^>]*>?/gm, '').trim()
    if (!text) {
      return 'Solução desenvolvida sob medida para a indústria com alto rendimento e pureza sensorial.'
    }
    return text.length > 150 ? text.slice(0, 147) + '...' : text
  }

  // Private label franchise whatsapp link
  const privateLabelWhatsAppUrl = buildWhatsAppLink(
    DEFAULT_SALES_PHONE,
    'Olá! Tenho interesse na Marca própria de Whisky e Refrigerante de Cola para franquia.',
  )

  // Single general sales quotation link
  const generalQuoteWhatsAppUrl = useMemo(() => {
    const context =
      activeCategory !== 'Todos'
        ? ` sobre a linha de ${activeCategory}s`
        : searchQuery.trim()
          ? ` sobre itens relacionados a "${searchQuery.trim()}"`
          : ''
    return buildWhatsAppLink(
      DEFAULT_SALES_PHONE,
      `Olá! Gostaria de solicitar uma cotação comercial${context} da Tasty Aromas e Sabores.`,
    )
  }, [activeCategory, searchQuery])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-12 animate-fade-in">
      {/* Header & Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge className="bg-accent text-accent-foreground font-display font-semibold px-3 py-1 rounded-full shadow-sm">
          Catálogo Industrial
        </Badge>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-primary tracking-tight">
          Nossos Produtos
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          Linhas completas de aromas, extratos vegetais concentrados, corantes e aditivos para a
          indústria de bebidas, alimentos e confeitaria. Formulações com alto rendimento e
          estabilidade técnica.
        </p>
      </div>

      {/* PRIVATE LABEL BANNER */}
      <div className="rounded-2xl bg-[hsl(215,73%,14%)] text-white p-6 md:p-8 border border-primary/30 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-accent text-xs font-display font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Oportunidade Exclusiva para Franquias & Distribuidores</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold leading-snug">
            Marca própria de Whisky e Refrigerante de Cola para ser franqueada — Consulte-nos!
          </h2>
          <p className="text-xs sm:text-sm text-slate-200">
            Fornecemos formulações completas, bases industriais padronizadas e todo o suporte
            técnico para o lançamento da sua linha exclusiva.
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="bg-accent hover:bg-accent-dark text-accent-foreground font-display font-bold whitespace-nowrap shadow-md flex-shrink-0"
        >
          <a href={privateLabelWhatsAppUrl} target="_blank" rel="noopener noreferrer">
            Consultar Franquia
            <ArrowRight className="w-4 h-4 ml-2" />
          </a>
        </Button>
      </div>

      {/* SINGLE GENERAL QUOTE CTA BANNER */}
      <div
        data-testid="quote-cta-banner"
        className="rounded-2xl border border-accent/30 bg-gradient-to-r from-card via-card to-accent/5 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-display font-bold text-base sm:text-lg text-primary">
              Solicite uma cotação personalizada
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Atendimento técnico comercial direto via WhatsApp:{' '}
              <span className="font-semibold text-foreground">21 98883-1253</span>. Enviamos laudos,
              amostras e propostas sob medida.
            </p>
          </div>
        </div>
        <Button
          asChild
          size="lg"
          className="w-full sm:w-auto bg-accent hover:bg-accent-dark text-accent-foreground font-display font-bold shadow-sm whitespace-nowrap min-h-[44px] px-6"
        >
          <a
            href={generalQuoteWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4 flex-shrink-0" />
            <span>Solicitar Cotação</span>
          </a>
        </Button>
      </div>

      {/* SEARCH AND CATEGORY FILTER TABS */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Category Tabs (only categories with >= 1 product + Todos) */}
          <div
            role="tablist"
            aria-label="Filtro de categorias de produtos"
            className="flex flex-wrap items-center gap-1.5 p-1.5 bg-muted/60 rounded-xl border border-border w-full md:w-auto"
          >
            {availableCategories.map((tab) => {
              const isActive = activeCategory === tab.value
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveCategory(tab.value)}
                  className={`min-h-[44px] px-4 py-2 rounded-lg text-xs sm:text-sm font-display font-semibold transition-all cursor-pointer flex-1 md:flex-initial text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isActive
                      ? 'bg-accent text-accent-foreground shadow-sm'
                      : 'text-foreground/80 hover:text-foreground hover:bg-background/80'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome ou sabor..."
              aria-label="Buscar produtos por nome ou sabor"
              className="pl-10 h-11 text-sm rounded-xl border-border bg-card focus-visible:ring-accent"
            />
          </div>
        </div>
      </div>

      {/* CONTENT: 4 STATES (LOADING / ERROR / EMPTY / SUCCESS) */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-6 space-y-3.5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-6 w-3/4 rounded-md" />
              <div className="space-y-2 pt-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <StateFeedback
          icon={<AlertTriangle className="w-12 h-12 text-destructive" />}
          title="Erro ao carregar o catálogo de produtos"
          description="Não foi possível estabelecer conexão com o servidor. Por favor, tente novamente."
          actionLabel="Tentar novamente"
          onAction={fetchProducts}
        />
      ) : filteredProducts.length === 0 ? (
        <StateFeedback
          icon={<Package className="w-12 h-12 text-muted-foreground/60" />}
          title="Nenhum produto encontrado"
          description={
            searchQuery
              ? `Não foram encontrados produtos correspondentes à busca "${searchQuery}". Tente outros termos.`
              : `Não há produtos disponíveis na categoria selecionada.`
          }
          actionLabel="Limpar filtros"
          onAction={() => {
            setActiveCategory('Todos')
            setSearchQuery('')
          }}
        />
      ) : (
        /* PRODUCT GRID (SUCCESS STATE - COMPACT TEXT-FIRST CARDS) */
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground px-1">
            <span>
              Exibindo <strong className="text-foreground">{filteredProducts.length}</strong>{' '}
              {filteredProducts.length === 1 ? 'produto' : 'produtos'}
              {activeCategory !== 'Todos' && (
                <span>
                  {' '}
                  na categoria <strong className="text-foreground">{activeCategory}</strong>
                </span>
              )}
            </span>
          </div>

          <div
            data-testid="products-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filteredProducts.map((product) => {
              return (
                <article
                  key={product.id}
                  data-testid="product-card"
                  className="rounded-2xl border border-border bg-card p-5 sm:p-6 hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <Badge className="bg-accent/15 text-accent hover:bg-accent/20 border-transparent font-semibold rounded-full text-xs px-2.5 py-0.5 inline-flex items-center gap-1 shadow-none">
                        <Tag className="w-3 h-3 flex-shrink-0" />
                        <span>{product.category}</span>
                      </Badge>
                    </div>

                    <h3 className="font-display font-bold text-lg text-primary leading-snug group-hover:text-accent transition-colors">
                      {product.name}
                    </h3>

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {extractSnippet(product.description)}
                    </p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
