import { useState, useEffect, type JSX } from 'react'
import { Link } from 'react-router-dom'
import { listNews, type NewsArticle } from '@/services/news'
import { getFileUrl } from '@/services/siteSettings'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { StateFeedback } from '@/components/StateFeedback'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Calendar, User, Newspaper, ArrowRight } from 'lucide-react'

export default function Noticias(): JSX.Element {
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNews = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      // Only published articles are fetched for the public news grid
      const data = await listNews({ all: false, sort: '-publishedAt,-created' })
      setNews(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [])

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Data recente'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="min-h-screen py-10 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase mb-3">
            <Newspaper className="w-3.5 h-3.5" />
            <span>Notícias & Comunicados</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
            Notícias e Tendências em Aromas
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Acompanhe nossas novidades, certificações de qualidade, lançamentos industriais e
            participações nas principais feiras do setor de alimentos e bebidas.
          </p>
        </div>

        {/* State Feedbacks */}
        {loading && (
          <StateFeedback
            title="Carregando publicações"
            description="Buscando as notícias e comunicados mais recentes da Tasty Plus..."
          />
        )}

        {error && !loading && (
          <StateFeedback
            title="Erro ao carregar notícias"
            description={error}
            actionLabel="Tentar novamente"
            onAction={fetchNews}
          />
        )}

        {!loading && !error && news.length === 0 && (
          <StateFeedback
            title="Nenhuma publicação encontrada"
            description="No momento não há artigos publicados. Fique atento às nossas próximas atualizações industriais."
          />
        )}

        {/* News Grid */}
        {!loading && !error && news.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item) => {
              const imageUrl = item.image
                ? getFileUrl('news', item.id, item.image, '600x400')
                : null
              const articleUrl = `/noticias/${item.slug || item.id}`

              return (
                <Card
                  key={item.id}
                  className="flex flex-col overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-shadow group h-full"
                >
                  {/* Image Container */}
                  <Link
                    to={articleUrl}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="block relative aspect-[16/10] overflow-hidden bg-muted/50 focus:outline-none"
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-muted to-muted/80 text-muted-foreground">
                        <Newspaper className="w-12 h-12 stroke-[1.25] text-primary/40 mb-2" />
                        <span className="text-xs font-medium text-muted-foreground">
                          Tasty Plus
                        </span>
                      </div>
                    )}
                  </Link>

                  <CardHeader className="p-6 pb-2 space-y-2 flex-none">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span>{formatDate(item.publishedAt || item.created)}</span>
                      </span>
                      {item.author && (
                        <span className="inline-flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-muted-foreground/70" />
                          <span>{item.author}</span>
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      <Link
                        to={articleUrl}
                        className="focus:outline-none focus-visible:underline focus-visible:ring-2 focus-visible:ring-primary rounded"
                      >
                        {item.title}
                      </Link>
                    </h2>
                  </CardHeader>

                  <CardContent className="p-6 pt-2 pb-4 flex-1">
                    {item.excerpt ? (
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {item.excerpt}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed italic">
                        Confira o comunicado na íntegra para saber mais detalhes sobre esta
                        novidade.
                      </p>
                    )}
                  </CardContent>

                  <CardFooter className="p-6 pt-0 mt-auto">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all font-semibold"
                    >
                      <Link
                        to={articleUrl}
                        className="flex items-center justify-center gap-2"
                        aria-label={`Ler artigo completo: ${item.title}`}
                      >
                        <span>Ler artigo completo</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
