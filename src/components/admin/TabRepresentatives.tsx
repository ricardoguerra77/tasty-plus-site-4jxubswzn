import { useState, useEffect, type JSX, type FormEvent } from 'react'
import {
  listRepresentatives,
  createRepresentative,
  updateRepresentative,
  deleteRepresentative,
  REPRESENTATIVE_ROLES,
  type Representative,
  type RepresentativeRole,
} from '@/services/representatives'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Plus, Edit2, Trash2, Loader2, Users, Phone, MessageSquare } from 'lucide-react'

export function TabRepresentatives(): JSX.Element {
  const { toast } = useToast()
  const [reps, setReps] = useState<Representative[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [editingRep, setEditingRep] = useState<Representative | null>(null)

  // Form states
  const [name, setName] = useState<string>('')
  const [region, setRegion] = useState<string>('')
  const [role, setRole] = useState<RepresentativeRole>('Representante')
  const [phone, setPhone] = useState<string>('')
  const [whatsapp, setWhatsapp] = useState<string>('')
  const [order, setOrder] = useState<number>(0)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [repToDelete, setRepToDelete] = useState<Representative | null>(null)

  const loadData = async (): Promise<void> => {
    try {
      setLoading(true)
      const data = await listRepresentatives()
      setReps(data)
    } catch (err) {
      toast({
        title: 'Erro ao carregar representantes',
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
    setEditingRep(null)
    setName('')
    setRegion('')
    setRole('Representante')
    setPhone('')
    setWhatsapp('')
    setOrder(reps.length + 1)
    setDialogOpen(true)
  }

  const handleOpenEdit = (rep: Representative): void => {
    setEditingRep(rep)
    setName(rep.name)
    setRegion(rep.region)
    setRole(rep.role)
    setPhone(rep.phone || '')
    setWhatsapp(rep.whatsapp || '')
    setOrder(rep.order ?? 0)
    setDialogOpen(true)
  }

  const handleSave = async (e: FormEvent): Promise<void> => {
    e.preventDefault()
    if (!name.trim() || !region.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Nome e Região são obrigatórios.',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      if (editingRep) {
        await updateRepresentative(editingRep.id, {
          name: name.trim(),
          region: region.trim(),
          role,
          phone: phone.trim(),
          whatsapp: whatsapp.trim(),
          order,
        })
        toast({
          title: 'Representante atualizado',
          description: 'Os dados foram salvos com sucesso.',
        })
      } else {
        await createRepresentative({
          name: name.trim(),
          region: region.trim(),
          role,
          phone: phone.trim(),
          whatsapp: whatsapp.trim(),
          order,
        })
        toast({
          title: 'Representante cadastrado',
          description: 'O representante foi adicionado com sucesso.',
        })
      }
      setDialogOpen(false)
      loadData()
    } catch (err) {
      toast({
        title: 'Erro ao salvar representante',
        description: getErrorMessage(err),
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (): Promise<void> => {
    if (!repToDelete) return
    try {
      await deleteRepresentative(repToDelete.id)
      toast({
        title: 'Representante excluído',
        description: 'O representante foi removido com sucesso.',
      })
      setDeleteDialogOpen(false)
      setRepToDelete(null)
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
          <h2 className="text-xl font-bold tracking-tight">Rede de Representantes</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie os contatos comerciais por região e distribuidores autorizados.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Representante</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Carregando representantes...</span>
        </div>
      ) : reps.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <Users className="h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium">Nenhum representante cadastrado</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
            Cadastre os representantes comerciais e distribuidores para exibição na página de
            contato.
          </p>
          <Button onClick={handleOpenCreate} size="sm">
            Adicionar Representante
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 font-medium text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Região / Atuação</th>
                  <th className="px-4 py-3">Tipo / Cargo</th>
                  <th className="px-4 py-3">Contatos</th>
                  <th className="px-4 py-3 text-center">Ordem</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reps.map((rep) => (
                  <tr key={rep.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-semibold text-foreground">{rep.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{rep.region}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          rep.role === 'Representante Distribuidor' ? 'secondary' : 'outline'
                        }
                      >
                        {rep.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 text-xs">
                        {rep.phone && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="h-3 w-3" /> {rep.phone}
                          </span>
                        )}
                        {rep.whatsapp && (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <MessageSquare className="h-3 w-3" /> {rep.whatsapp}
                          </span>
                        )}
                        {!rep.phone && !rep.whatsapp && (
                          <span className="text-muted-foreground italic">Sem telefone</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-xs">{rep.order ?? 0}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(rep)}
                          aria-label={`Editar ${rep.name}`}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setRepToDelete(rep)
                            setDeleteDialogOpen(true)
                          }}
                          aria-label={`Excluir ${rep.name}`}
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

      {/* Modal de Criação / Edição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRep ? 'Editar Representante' : 'Novo Representante'}</DialogTitle>
            <DialogDescription>
              Dados de contato e área territorial do parceiro comercial.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rep-name">Nome Completo / Razão Social *</Label>
              <Input
                id="rep-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Carlos Alberto ou ABC Representações"
                required
                disabled={saving}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rep-region">Região de Atuação *</Label>
                <Input
                  id="rep-region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="Ex: Rio de Janeiro e Espírito Santo"
                  required
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rep-role">Tipo / Cargo *</Label>
                <Select
                  value={role}
                  onValueChange={(val) => setRole(val as RepresentativeRole)}
                  disabled={saving}
                >
                  <SelectTrigger id="rep-role">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPRESENTATIVE_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rep-phone">Telefone</Label>
                <Input
                  id="rep-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rep-whatsapp">WhatsApp</Label>
                <Input
                  id="rep-whatsapp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="(11) 98765-4321"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rep-order">Ordem de Exibição</Label>
              <Input
                id="rep-order"
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                disabled={saving}
              />
            </div>

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
                  'Salvar Representante'
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
            <AlertDialogTitle>Excluir representante?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O representante <strong>{repToDelete?.name}</strong>{' '}
              será removido permanentemente da listagem.
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
