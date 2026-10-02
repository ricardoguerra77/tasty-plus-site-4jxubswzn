import { useState, useEffect, type JSX } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getNewsBySlug, getNewsById, type NewsArticle } from '@/services/news'
import { getFileUrl } from '@/services/siteSettings'
import { sanitizeHtml } from '@/lib/sanitize'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { useAuth } from '@/hooks/useAuth'
import { canViewNewsArticle } from '@/lib/news-helpers'
import { StateFeedback } from '@/components/StateFeedback'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, User, ArrowLeft, Newspaper, ShieldAlert } from 'lucide-react'

export default function NoticiaDetalhe(): JSX.Element {
  const { id } = useParams<{ id: string }>()
  const safeParam = (id ?? '').trim()
  const { user } = useAuth()

  const [article, setArticle] = useState<NewsArticle | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isUnauthorized, setIsUnauthorized] = useState<boolean>(false)

  useEffect(() => {
    let isCancelled = false

    const loadArticle = async (): Promise<void> => {
      if (!safeParam) {
        setLoading(false)
        setError('Publicação não especificada.')
        return
      }

      setLoading(true)
      setError(null)
      setIsUnauthorized(false)

      try {
        // First try finding by slug
        let found: NewsArticle | null = null
        try {
          found = await getNewsBySlug(safeParam)
        } catch {
          found = null
        }

        // If not found by slug, fallback to ID lookup
        if (!found) {
          try {
            found = await getNewsById(safeParam)
          } catch {
            found = null
          }
        }

        if (isCancelled) return

        if (!found) {
          setError('A notícia solicitada não foi encontrada ou não está disponível.')
          setArticle(null)
          return
        }

        // Enforce visibility check: drafts/unpublished must NOT reveal content to regular visitors
        const canView = canViewNewsArticle(found, user?.role)
        if (!canView) {
          setIsUnauthorized(true)
          setArticle(null)
          return
        }

        setArticle(found)
      } catch (err) {
        if (!isCancelled) {
          setError(getErrorMessage(err))
          setArticle(null)
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    loadArticle()

    return () => {
      isCancelled = true
    }
  }, [safeParam, user?.role])

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb / Back button */}
        <div className="mb-8">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground -ml-2"
          >
            <Link to="/noticias" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para todas as notícias</span>
            </Link>
          </Button>
        </div>

        {/* State Feedbacks */}
        {loading && (
          <StateFeedback
            title="Carregando publicação"
            description="Buscando os detalhes do artigo..."
          />
        )}

        {isUnauthorized && !loading && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-4 my-8">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Conteúdo não disponível</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Esta publicação está em modo rascunho ou foi despublicada e não pode ser visualizada
              publicamente.
            </p>
            <div className="pt-2">
              <Button asChild variant="outline">
                <Link to="/noticias">Ver outras notícias</Link>
              </Button>
            </div>
          </div>
        )}

        {error && !loading && !isUnauthorized && (
          <StateFeedback
            title="Publicação não encontrada"
            description={error}
            actionLabel="Voltar para Notícias"
            onAction={() => {
              window.location.href = '/noticias'
            }}
          />
        )}

        {/* Article Content */}
        {!loading && !error && !isUnauthorized && article && (
          <article className="space-y-8 animate-fade-in">
            {/* Header info */}
            <header className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline" className="text-primary border-primary/30">
                  {article.published ? 'Notícia Oficial' : 'Rascunho (Visualização)'}
                </Badge>
                {!article.published && (
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-800 border-amber-300"
                  >
                    Modo Editorial Privado
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-accent" />
                  <span>{formatDate(article.publishedAt || article.created)}</span>
                </span>
                {article.author && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <User className="w-4 h-4 text-muted-foreground/70" />
                    <span>{article.author}</span>
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-primary tracking-tight leading-tight">
                {article.title}
              </h1>

              {article.excerpt && (
                <p className="text-lg sm:text-xl text-muted-foreground font-normal leading-relaxed pt-1">
                  {article.excerpt}
                </p>
              )}
            </header>

            {/* Featured Image */}
            {article.image && (
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border shadow-sm bg-muted">
                <img
                  src={getFileUrl('news', article.id, article.image)}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Rich-Text Body */}
            <div
              className="prose prose-neutral dark:prose-invert max-w-none pt-4 text-foreground/90 leading-relaxed text-base sm:text-lg"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.body) }}
            />

            {/* Footer / CTA back to news */}
            <footer className="pt-10 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Newspaper className="w-5 h-5 text-accent" />
                <span>Tasty Aromas e Sabores — Soluções em Aromas, Extratos e Ingredientes</span>
              </div>
              <Button
                asChild
                variant="outline"
                className="font-display font-bold border-primary/30 text-primary hover:bg-accent hover:text-accent-foreground hover:border-accent"
              >
                <Link to="/noticias" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Ver todas as notícias</span>
                </Link>
              </Button>
            </footer>
          </article>
        )}
      </div>
    </div>
  )
}
