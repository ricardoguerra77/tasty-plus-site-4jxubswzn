import { useState, useEffect, type JSX, type FormEvent } from 'react'
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  PRODUCT_CATEGORIES,
  DEFAULT_CATEGORY_COLORS,
  isValidHexColor,
  normalizeHexColor,
  getCategoryBadgeStyle,
  type Product,
  type ProductCategory,
} from '@/services/products'
import { getFileUrl, getSiteSettings, saveSiteSettings } from '@/services/siteSettings'
import { sanitizeHtml } from '@/lib/sanitize'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { useAuth } from '@/hooks/useAuth'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Plus, Edit2, Trash2, Loader2, Package } from 'lucide-react'

export function TabProducts(): JSX.Element {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Form states
  const [name, setName] = useState<string>('')
  const [category, setCategory] = useState<ProductCategory>('Aroma')
  const [description, setDescription] = useState<string>('')
  const [order, setOrder] = useState<number>(0)
  const [published, setPublished] = useState<boolean>(true)
  const [imageFile, setImageFile] = useState<File | null | undefined>(undefined)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  // Category colors configuration state (site_settings)
  const { isAdmin } = useAuth()
  const [categoryColors, setCategoryColors] = useState<Record<ProductCategory, string>>({
    ...DEFAULT_CATEGORY_COLORS,
  })
  const [savingColors, setSavingColors] = useState<boolean>(false)

  const loadData = async (): Promise<void> => {
    try {
      setLoading(true)
      const data = await listProducts({ all: true })
      setProducts(data)
    } catch (err) {
      toast({
        title: 'Erro ao carregar produtos',
        description: getErrorMessage(err),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // Load category colors from site_settings
    getSiteSettings().then((settings) => {
      if (settings?.categoryColors && typeof settings.categoryColors === 'object') {
        const loaded: Partial<Record<ProductCategory, string>> = {}
        PRODUCT_CATEGORIES.forEach((cat) => {
          const val = settings.categoryColors?.[cat]
          if (val && isValidHexColor(val)) {
            loaded[cat] = normalizeHexColor(val)
          } else {
            loaded[cat] = DEFAULT_CATEGORY_COLORS[cat]
          }
        })
        setCategoryColors(loaded as Record<ProductCategory, string>)
      }
    })
  }, [])

  const handleColorChange = (cat: ProductCategory, newColor: string) => {
    setCategoryColors((prev) => ({
      ...prev,
      [cat]: newColor,
    }))
  }

  const handleResetColors = () => {
    setCategoryColors({ ...DEFAULT_CATEGORY_COLORS })
  }

  const handleSaveColors = async () => {
    if (!isAdmin) {
      toast({
        title: 'Permissão negada',
        description: 'Apenas administradores podem alterar as cores das categorias.',
        variant: 'destructive',
      })
      return
    }

    setSavingColors(true)
    try {
      await saveSiteSettings({
        categoryColors,
      })
      toast({
        title: 'Cores atualizadas',
        description: 'As cores das etiquetas de categorias foram salvas com sucesso.',
      })
    } catch (err) {
      toast({
        title: 'Erro ao salvar cores',
        description: getErrorMessage(err),
        variant: 'destructive',
      })
    } finally {
      setSavingColors(false)
    }
  }

  const handleOpenCreate = (): void => {
    setEditingProduct(null)
    setName('')
    setCategory('Aroma')
    setDescription('')
    setOrder(products.length + 1)
    setPublished(true)
    setImageFile(undefined)
    setDialogOpen(true)
  }

  const handleOpenEdit = (prod: Product): void => {
    setEditingProduct(prod)
    setName(prod.name)
    setCategory(prod.category)
    setDescription(prod.description || '')
    setOrder(prod.order ?? 0)
    setPublished(prod.published)
    setImageFile(undefined)
    setDialogOpen(true)
  }

  const handleSave = async (e: FormEvent): Promise<void> => {
    e.preventDefault()
    if (!name.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'O nome do produto é obrigatório.',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: name.trim(),
          category,
          description,
          order,
          published,
          image: imageFile,
        })
        toast({
          title: 'Produto atualizado',
          description: 'As alterações foram salvas com sucesso.',
        })
      } else {
        await createProduct({
          name: name.trim(),
          category,
          description,
          order,
          published,
          image: imageFile,
        })
        toast({
          title: 'Produto cadastrado',
          description: 'O produto foi adicionado com sucesso.',
        })
      }
      setDialogOpen(false)
      loadData()
    } catch (err) {
      toast({
        title: 'Erro ao salvar produto',
        description: getErrorMessage(err),
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (): Promise<void> => {
    if (!productToDelete) return
    try {
      await deleteProduct(productToDelete.id)
      toast({
        title: 'Produto excluído',
        description: 'O produto foi removido com sucesso.',
      })
      setDeleteDialogOpen(false)
      setProductToDelete(null)
      loadData()
    } catch (err) {
      toast({
        title: 'Erro ao excluir',
        description: getErrorMessage(err),
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Catálogo de Produtos</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie aromas, extratos, aditivos e corantes disponíveis no portfólio.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Produto</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Carregando produtos...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <Package className="h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium">Nenhum produto cadastrado</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
            Comece cadastrando os primeiros produtos do catálogo da empresa.
          </p>
          <Button onClick={handleOpenCreate} size="sm">
            Adicionar Produto
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 font-medium text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 w-16">Foto</th>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3 text-center">Ordem</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      {prod.image ? (
                        <img
                          src={getFileUrl('products', prod.id, prod.image, '100x100')}
                          alt={prod.name}
                          className="h-10 w-10 rounded-md object-cover border"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted/40 text-muted-foreground">
                          <Package className="h-5 w-5" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">
                      <div>{prod.name}</div>
                      {prod.description && (
                        <div
                          className="text-xs text-muted-foreground line-clamp-1 max-w-md"
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(prod.description) }}
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const badgeStyle = getCategoryBadgeStyle(prod.category, categoryColors)
                        return (
                          <Badge
                            variant="outline"
                            style={badgeStyle.style}
                            className="font-medium text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1 border"
                          >
                            <span
                              className="w-2 h-2 rounded-full inline-block flex-shrink-0"
                              style={{ backgroundColor: badgeStyle.baseColor }}
                            />
                            <span>{prod.category}</span>
                          </Badge>
                        )
                      })()}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-xs">{prod.order ?? 0}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={prod.published ? 'default' : 'secondary'}>
                        {prod.published ? 'Publicado' : 'Rascunho'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(prod)}
                          aria-label={`Editar ${prod.name}`}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setProductToDelete(prod)
                            setDeleteDialogOpen(true)
                          }}
                          aria-label={`Excluir ${prod.name}`}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SEÇÃO: CONFIGURAÇÃO DE CORES DAS ETIQUETAS POR CATEGORIA */}
      <div
        data-testid="category-colors-card"
        className="rounded-xl border bg-card p-5 sm:p-6 shadow-sm space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Cores das Etiquetas por Categoria
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Personalize a cor da etiqueta (badge) exibida nos cards de produto da página pública
              /produtos.
            </p>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetColors}
                disabled={savingColors}
                className="text-xs"
              >
                Restaurar Padrão
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveColors}
                disabled={savingColors}
                id="btn-save-category-colors"
                className="text-xs flex items-center gap-1.5"
              >
                {savingColors ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <span>Salvar Cores</span>
                )}
              </Button>
            </div>
          )}
        </div>

        {!isAdmin && (
          <p className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-md">
            Nota: Somente usuários administradores têm permissão para editar as cores das
            categorias.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {PRODUCT_CATEGORIES.map((cat) => {
            const currentColor = categoryColors[cat] || DEFAULT_CATEGORY_COLORS[cat]
            const badgeStyle = getCategoryBadgeStyle(cat, categoryColors)
            return (
              <div
                key={cat}
                data-testid={`category-color-item-${cat.toLowerCase()}`}
                className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-muted/20"
              >
                <div className="space-y-1.5 min-w-0">
                  <span className="text-xs font-semibold text-foreground block">{cat}</span>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      style={badgeStyle.style}
                      className="font-medium text-xs px-2.5 py-0.5 rounded-full border shadow-none"
                    >
                      {cat}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <input
                    type="color"
                    id={`color-picker-${cat}`}
                    aria-label={`Cor para categoria ${cat}`}
                    value={
                      isValidHexColor(currentColor)
                        ? normalizeHexColor(currentColor)
                        : DEFAULT_CATEGORY_COLORS[cat]
                    }
                    onChange={(e) => handleColorChange(cat, e.target.value)}
                    disabled={!isAdmin || savingColors}
                    className="w-9 h-9 rounded-md border border-input cursor-pointer disabled:cursor-not-allowed bg-transparent p-0.5"
                  />
                  <Input
                    type="text"
                    value={currentColor}
                    onChange={(e) => handleColorChange(cat, e.target.value)}
                    disabled={!isAdmin || savingColors}
                    aria-label={`Código hexadecimal para ${cat}`}
                    className="w-24 h-9 font-mono text-xs uppercase"
                    maxLength={7}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal de Criação / Edição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
            <DialogDescription>
              Preencha os detalhes técnicos e comerciais do item.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="prod-name">Nome do Produto *</Label>
                <Input
                  id="prod-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Aroma de Baunilha"
                  required
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prod-category">Categoria *</Label>
                <Select
                  value={category}
                  onValueChange={(val) => setCategory(val as ProductCategory)}
                  disabled={saving}
                >
                  <SelectTrigger id="prod-category">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="prod-order">Ordem de Exibição</Label>
                <Input
                  id="prod-order"
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="prod-published" className="text-sm font-semibold">
                    Publicado no Site
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Visível publicamente na página de produtos.
                  </p>
                </div>
                <Switch
                  id="prod-published"
                  checked={published}
                  onCheckedChange={setPublished}
                  disabled={saving}
                />
              </div>
            </div>

            <RichTextEditor
              id="prod-description"
              label="Descrição Detalhada / Aplicação"
              value={description}
              onChange={setDescription}
              disabled={saving}
              rows={4}
            />

            <ImageUploader
              label="Imagem do Produto"
              helperText="Foto nítida em alta definição do insumo ou embalagem"
              currentImageUrl={
                editingProduct?.image
                  ? getFileUrl('products', editingProduct.id, editingProduct.image)
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
                  'Salvar Produto'
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
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O produto <strong>{productToDelete?.name}</strong>{' '}
              será removido permanentemente do catálogo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
