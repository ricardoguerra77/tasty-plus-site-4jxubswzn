import { useState, useEffect, type JSX, type FormEvent } from 'react'
import { listNews, createNews, updateNews, deleteNews, type NewsArticle } from '@/services/news'
import { getFileUrl } from '@/services/siteSettings'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { generateSlug } from '@/lib/news-helpers'
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Newspaper,
  Calendar,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react'

export function TabNews(): JSX.Element {
  const { toast } = useToast()
  const [newsList, setNewsList] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null)

  // Form states
  const [title, setTitle] = useState<string>('')
  const [slug, setSlug] = useState<string>('')
  const [excerpt, setExcerpt] = useState<string>('')
  const [body, setBody] = useState<string>('')
  const [author, setAuthor] = useState<string>('')
  const [publishedAt, setPublishedAt] = useState<string>('')
  const [published, setPublished] = useState<boolean>(true)
  const [imageFile, setImageFile] = useState<File | null | undefined>(undefined)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [articleToDelete, setArticleToDelete] = useState<NewsArticle | null>(null)

  const [deleting, setDeleting] = useState<boolean>(false)

  const loadData = async (): Promise<void> => {
    try {
      setLoading(true)
      const data = await listNews({ all: true, sort: '-publishedAt,-created' })
      setNewsList(data)
    } catch (err) {
      toast({
        title: 'Erro ao carregar notícias',
        description: getErrorMessage(err),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenCreate = (): void => {
    setEditingArticle(null)
    setTitle('')
    setSlug('')
    setExcerpt('')
    setBody('')
    setAuthor('Tasty Plus')
    setPublishedAt(new Date().toISOString().slice(0, 10))
    setPublished(true)
    setImageFile(undefined)
    setDialogOpen(true)
  }

  const handleOpenEdit = (article: NewsArticle): void => {
    setEditingArticle(article)
    setTitle(article.title)
    setSlug(article.slug)
    setExcerpt(article.excerpt || '')
    setBody(article.body)
    setAuthor(article.author || '')
    setPublishedAt(article.publishedAt ? article.publishedAt.slice(0, 10) : '')
    setPublished(article.published)
    setImageFile(undefined)
    setDialogOpen(true)
  }

  const handleTitleChange = (val: string): void => {
    setTitle(val)
    if (!editingArticle) {
      const otherSlugs = newsList.map((n) => n.slug)
      setSlug(generateSlug(val, otherSlugs))
    }
  }

  const handleSave = async (e: FormEvent): Promise<void> => {
    e.preventDefault()
    if (!title.trim() || !slug.trim() || !body.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Título, slug e conteúdo são obrigatórios.',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      if (editingArticle) {
        await updateNews(editingArticle.id, {
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt.trim(),
          body,
          author: author.trim(),
          publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
          published,
          image: imageFile,
        })
        toast({
          title: 'Notícia atualizada',
          description: 'A notícia foi atualizada com sucesso.',
        })
      } else {
        await createNews({
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt.trim(),
          body,
          author: author.trim(),
          publishedAt: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
          published,
          image: imageFile,
        })
        toast({
          title: 'Notícia cadastrada',
          description: 'A nova publicação foi criada com sucesso.',
        })
      }
      setDialogOpen(false)
      loadData()
    } catch (err) {
      toast({
        title: 'Erro ao salvar notícia',
        description: getErrorMessage(err),
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePublish = async (article: NewsArticle): Promise<void> => {
    try {
      setTogglingId(article.id)
      const nextStatus = !article.published
      await updateNews(article.id, { published: nextStatus })
      toast({
        title: nextStatus ? 'Notícia publicada' : 'Notícia despublicada',
        description: nextStatus
          ? `"${article.title}" agora está visível publicamente no portal.`
          : `"${article.title}" foi alterada para rascunho e oculta ao público.`,
      })
      setNewsList((prev) =>
        prev.map((item) => (item.id === article.id ? { ...item, published: nextStatus } : item)),
      )
    } catch (err) {
      toast({
        title: 'Erro ao alternar publicação',
        description: getErrorMessage(err),
        variant: 'destructive',
      })
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async (): Promise<void> => {
    if (!articleToDelete) return
    try {
      setDeleting(true)
      await deleteNews(articleToDelete.id)
      toast({
        title: 'Notícia excluída',
        description: 'A publicação foi removida com sucesso.',
      })
      setDeleteDialogOpen(false)
      setArticleToDelete(null)
      loadData()
    } catch (err) {
      toast({
        title: 'Erro ao excluir',
        description: getErrorMessage(err),
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Gerenciador de Notícias</h2>
          <p className="text-sm text-muted-foreground">
            Artigos, comunicados técnicos e novidades institucionais.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Notícia</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Carregando notícias...</span>
        </div>
      ) : newsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <Newspaper className="h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium">Nenhuma notícia publicada</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
            Crie publicações informativas para manter os clientes atualizados sobre produtos e
            certificações.
          </p>
          <Button onClick={handleOpenCreate} size="sm">
            Criar Primeira Notícia
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 font-semibold text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 w-20">
                    Imagem
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Título
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Data
                  </th>
                  <th scope="col" className="px-4 py-3 text-center">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {newsList.map((item) => {
                  const isToggling = togglingId === item.id
                  return (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        {item.image ? (
                          <img
                            src={getFileUrl('news', item.id, item.image, '120x80')}
                            alt={item.title}
                            className="h-12 w-16 rounded-md object-cover border"
                          />
                        ) : (
                          <div className="flex h-12 w-16 items-center justify-center rounded-md border bg-muted/40 text-muted-foreground">
                            <Newspaper className="h-5 w-5" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground text-base leading-snug">
                          {item.title}
                        </div>
                        {item.excerpt && (
                          <div className="text-xs text-muted-foreground line-clamp-1 max-w-md mt-0.5">
                            {item.excerpt}
                          </div>
                        )}
                        <div className="text-[11px] text-muted-foreground/70 font-mono mt-0.5">
                          /noticias/{item.slug}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        <span className="flex items-center gap-1.5 text-xs">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          {item.publishedAt
                            ? new Date(item.publishedAt).toLocaleDateString('pt-BR')
                            : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <Badge
                          variant={item.published ? 'default' : 'secondary'}
                          className={
                            item.published
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-muted text-muted-foreground border-border'
                          }
                        >
                          {item.published ? 'Publicado' : 'Rascunho'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTogglePublish(item)}
                            disabled={isToggling}
                            aria-label={
                              item.published
                                ? `Despublicar ${item.title}`
                                : `Publicar ${item.title}`
                            }
                            className="min-h-[40px] px-2.5 text-xs flex items-center gap-1.5 cursor-pointer"
                            title={item.published ? 'Alternar para rascunho' : 'Publicar notícia'}
                          >
                            {isToggling ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : item.published ? (
                              <>
                                <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="hidden sm:inline">Despublicar</span>
                              </>
                            ) : (
                              <>
                                <Eye className="h-3.5 w-3.5 text-emerald-600" />
                                <span className="hidden sm:inline text-emerald-600 font-medium">
                                  Publicar
                                </span>
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(item)}
                            aria-label={`Editar ${item.title}`}
                            className="min-h-[40px] px-2.5 text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setArticleToDelete(item)
                              setDeleteDialogOpen(true)
                            }}
                            aria-label={`Excluir ${item.title}`}
                            className="min-h-[40px] px-2 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                            title="Excluir notícia"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Criação / Edição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingArticle ? 'Editar Notícia' : 'Nova Notícia'}</DialogTitle>
            <DialogDescription>
              Crie comunicados informativos com imagens e formatação avançada.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="news-title">Título *</Label>
                <Input
                  id="news-title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Ex: Novo aroma natural lançado"
                  required
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="news-slug">Slug (URL amigável) *</Label>
                <Input
                  id="news-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="novo-aroma-natural-lancado"
                  required
                  disabled={saving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="news-excerpt">Resumo / Subtítulo</Label>
              <Input
                id="news-excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Breve resumo exibido nos cards da listagem"
                disabled={saving}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="news-author">Autor</Label>
                <Input
                  id="news-author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Tasty Plus"
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="news-publishedAt">Data de Publicação</Label>
                <Input
                  id="news-publishedAt"
                  type="date"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="news-published" className="text-sm font-semibold">
                    Publicar
                  </Label>
                  <p className="text-[11px] text-muted-foreground">Visível no portal</p>
                </div>
                <Switch
                  id="news-published"
                  checked={published}
                  onCheckedChange={setPublished}
                  disabled={saving}
                />
              </div>
            </div>

            <RichTextEditor
              id="news-body"
              label="Conteúdo da Notícia *"
              value={body}
              onChange={setBody}
              disabled={saving}
              rows={6}
            />

            <ImageUploader
              label="Imagem de Capa"
              helperText="Foto de destaque exibida no cabeçalho da notícia (máx. 5MB)"
              previewAspect="banner"
              currentImageUrl={
                editingArticle?.image
                  ? getFileUrl('news', editingArticle.id, editingArticle.image)
                  : undefined
              }
              onFileSelect={(file) => setImageFile(file)}
              disabled={saving}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Notícia'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir notícia?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A publicação{' '}
              <strong>{articleToDelete?.title}</strong> será excluída permanentemente do banco de
              dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Excluindo...
                </>
              ) : (
                'Excluir Notícia'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
