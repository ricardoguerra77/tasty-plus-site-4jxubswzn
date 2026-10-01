import { useState, useEffect, useMemo, useCallback, type JSX } from 'react'
import {
  Search,
  MessageCircle,
  Package,
  Layers,
  Sparkles,
  AlertTriangle,
  Tag,
  ArrowRight,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { listProducts, type Product, type ProductCategory } from '@/services/products'
import { getFileUrl } from '@/services/siteSettings'
import { buildWhatsAppLink } from '@/lib/whatsapp'
import { StateFeedback } from '@/components/StateFeedback'

const CATEGORY_TABS: { label: string; value: 'Todos' | ProductCategory }[] = [
  { label: 'Todos', value: 'Todos' },
  { label: 'Aromas', value: 'Aroma' },
  { label: 'Extratos', value: 'Extrato' },
  { label: 'Aditivos', value: 'Aditivo' },
  { label: 'Corantes', value: 'Corante' },
  { label: 'Outro', value: 'Outro' },
]

const DEFAULT_SALES_PHONE = '21 98883-1253'

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

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Must be published (service already filters published=true, but defensive check)
      if (p.published === false) return false

      const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory

      const matchesSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase().trim()))

      return matchesCategory && matchesSearch
    })
  }, [products, activeCategory, searchQuery])

  // Helper for snippet extraction from HTML description
  const extractSnippet = (htmlDesc?: string): string => {
    if (!htmlDesc)
      return 'Solução desenvolvida sob medida para a indústria com alto rendimento e pureza sensorial.'
    const text = htmlDesc.replace(/<[^>]*>?/gm, '').trim()
    if (!text)
      return 'Solução desenvolvida sob medida para a indústria com alto rendimento e pureza sensorial.'
    return text.length > 120 ? text.slice(0, 117) + '...' : text
  }

  // Category badge color mapper
  const getCategoryBadgeClass = (category: ProductCategory): string => {
    switch (category) {
      case 'Aroma':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
      case 'Extrato':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
      case 'Corante':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
      case 'Aditivo':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  // Private label whatsapp quote
  const privateLabelWhatsAppUrl = buildWhatsAppLink(
    DEFAULT_SALES_PHONE,
    'Olá! Tenho interesse na Marca própria de Whisky e Refrigerante de Cola para franquia.',
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-12 animate-fade-in">
      {/* Header & Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="outline" className="text-primary border-primary/30 font-semibold">
          Catálogo Industrial
        </Badge>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
          Nossos Produtos
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          Linhas completas de aromas, extratos vegetais concentrados, corantes e aditivos para a
          indústria de bebidas, alimentos e confeitaria.
        </p>
      </div>

      {/* PRIVATE LABEL BANNER */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 text-white p-6 md:p-8 border border-amber-500/30 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Oportunidade Exclusiva para Franquias & Distribuidores</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold leading-snug">
            Marca própria de Whisky e Refrigerante de Cola para ser franqueada — Consulte-nos!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Fornecemos formulações completas, bases industriais padronizadas e todo o suporte
            técnico para o lançamento da sua linha exclusiva.
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold whitespace-nowrap shadow-md flex-shrink-0"
        >
          <a href={privateLabelWhatsAppUrl} target="_blank" rel="noopener noreferrer">
            Consultar Franquia
            <ArrowRight className="w-4 h-4 ml-2" />
          </a>
        </Button>
      </div>

      {/* SEARCH AND CATEGORY FILTER TABS */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border w-full md:w-auto">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveCategory(tab.value)}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer flex-1 md:flex-initial text-center ${
                  activeCategory === tab.value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-foreground/80 hover:text-foreground hover:bg-background/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome ou sabor..."
              className="pl-9 text-sm rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* CONTENT: 4 STATES (LOADING / ERROR / EMPTY / SUCCESS) */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-5 space-y-4 animate-pulse"
            >
              <Skeleton className="h-44 w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
              <Skeleton className="h-10 w-full rounded-lg" />
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
        /* PRODUCT GRID (SUCCESS STATE) */
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>
              Exibindo <strong>{filteredProducts.length}</strong> produtos
              {activeCategory !== 'Todos' && ` em ${activeCategory}`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const imageUrl = product.image
                ? getFileUrl('products', product.id, product.image)
                : 'https://img.usecurling.com/p/400/300?q=beverage+flavor+bottle&color=slate'

              const whatsappUrl = buildWhatsAppLink(
                DEFAULT_SALES_PHONE,
                `Olá! Gostaria de solicitar cotação para o produto: ${product.name}.`,
              )

              return (
                <div
                  key={product.id}
                  className="rounded-2xl border border-border bg-card hover:border-primary/50 transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md group"
                >
                  {/* Image header */}
                  <div className="relative h-44 w-full bg-muted/40 overflow-hidden flex items-center justify-center">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge
                        variant="outline"
                        className={`font-semibold backdrop-blur-md ${getCategoryBadgeClass(
                          product.category,
                        )}`}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {product.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Body content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg text-foreground leading-snug group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {extractSnippet(product.description)}
                      </p>
                    </div>

                    {/* WhatsApp Quote Action */}
                    <div className="pt-2">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 font-semibold text-white bg-[#25D366] hover:bg-[#20ba59] active:scale-95 transition-all py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-sm"
                      >
                        <MessageCircle className="w-4 h-4 flex-shrink-0" />
                        <span>Solicitar Cotação</span>
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
