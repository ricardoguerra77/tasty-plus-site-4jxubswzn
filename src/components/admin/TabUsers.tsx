import { useState, useEffect, useCallback, type FormEvent, type JSX } from 'react'
import {
  Users,
  UserPlus,
  ShieldAlert,
  ShieldCheck,
  Edit2,
  Trash2,
  Loader2,
  RefreshCw,
  X,
  AlertCircle,
  KeyRound,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'
import { validateEmail, validateRequired, validateMinLength } from '@/lib/validation'
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  type ManagedUser,
  type CreateUserInput,
} from '@/services/users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Alert, AlertDescription } from '@/components/ui/alert'

export function TabUsers(): JSX.Element {
  const { user: currentUser, isSuperAdmin, requestPasswordReset } = useAuth()

  const [users, setUsers] = useState<ManagedUser[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [resettingUserId, setResettingUserId] = useState<string | null>(null)

  // Create User Modal State
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false)
  const [createForm, setCreateForm] = useState<CreateUserInput>({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    role: 'editor',
  })
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({})
  const [isSubmittingCreate, setIsSubmittingCreate] = useState<boolean>(false)

  // Edit User Modal State
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false)
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null)
  const [editName, setEditName] = useState<string>('')
  const [editRole, setEditRole] = useState<'admin' | 'editor'>('editor')
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})
  const [isSubmittingEdit, setIsSubmittingEdit] = useState<boolean>(false)

  // Delete Confirmation Alert State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false)
  const [deletingUser, setDeletingUser] = useState<ManagedUser | null>(null)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  const fetchUsersList = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const list = await listUsers()
      setUsers(list)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao carregar a lista de usuários.'
      setError(msg)
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar usuários',
        description: msg,
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isSuperAdmin) {
      fetchUsersList()
    }
  }, [isSuperAdmin, fetchUsersList])

  if (!isSuperAdmin) {
    return (
      <div className="p-8 text-center bg-card rounded-2xl border border-border">
        <ShieldAlert className="w-12 h-12 mx-auto text-destructive mb-3" />
        <h2 className="text-xl font-bold">Acesso Restrito</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Apenas Super Administradores têm permissão para acessar o gerenciamento de usuários.
        </p>
      </div>
    )
  }

  // Create validation and submit
  const handleOpenCreateModal = () => {
    setCreateForm({
      name: '',
      email: '',
      password: '',
      passwordConfirm: '',
      role: 'editor',
    })
    setCreateErrors({})
    setCreateModalOpen(true)
  }

  const handleSubmitCreate = async (e: FormEvent) => {
    e.preventDefault()
    const errors: Record<string, string> = {}

    const nameErr = validateRequired(createForm.name, 'Nome')
    if (nameErr) errors.name = nameErr

    const emailErr = validateEmail(createForm.email)
    if (emailErr) errors.email = emailErr

    const passReqErr = validateRequired(createForm.password, 'Senha')
    if (passReqErr) {
      errors.password = passReqErr
    } else {
      const passMinErr = validateMinLength(createForm.password, 8, 'Senha')
      if (passMinErr) errors.password = passMinErr
    }

    if (createForm.password !== createForm.passwordConfirm) {
      errors.passwordConfirm = 'As senhas não conferem.'
    }

    if (createForm.role !== 'admin' && createForm.role !== 'editor') {
      errors.role = 'Selecione um papel válido (Administrador ou Editor).'
    }

    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors)
      return
    }

    setCreateErrors({})
    setIsSubmittingCreate(true)

    try {
      await createUser(createForm)
      toast({
        title: 'Usuário criado com sucesso',
        description: `O usuário ${createForm.name} foi cadastrado como ${
          createForm.role === 'admin' ? 'Administrador' : 'Editor'
        }.`,
      })
      setCreateModalOpen(false)
      await fetchUsersList()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Não foi possível cadastrar o usuário.'
      toast({
        variant: 'destructive',
        title: 'Erro ao criar usuário',
        description: msg,
      })
    } finally {
      setIsSubmittingCreate(false)
    }
  }

  // Edit user handlers
  const handleOpenEditModal = (targetUser: ManagedUser) => {
    if (targetUser.role === 'super_admin') {
      toast({
        variant: 'destructive',
        title: 'Operação não permitida',
        description: 'Não é possível alterar as atribuições de outro Super Administrador.',
      })
      return
    }
    setEditingUser(targetUser)
    setEditName(targetUser.name)
    setEditRole(targetUser.role === 'admin' ? 'admin' : 'editor')
    setEditErrors({})
    setEditModalOpen(true)
  }

  const handleSubmitEdit = async (e: FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    const errors: Record<string, string> = {}
    const nameErr = validateRequired(editName, 'Nome')
    if (nameErr) errors.name = nameErr

    if (editRole !== 'admin' && editRole !== 'editor') {
      errors.role = 'Papel inválido.'
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors)
      return
    }

    setEditErrors({})
    setIsSubmittingEdit(true)

    try {
      await updateUser(editingUser.id, {
        name: editName,
        role: editRole,
      })
      toast({
        title: 'Usuário atualizado com sucesso',
        description: `Os dados de ${editName} foram atualizados.`,
      })
      setEditModalOpen(false)
      setEditingUser(null)
      await fetchUsersList()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao atualizar o usuário.'
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar',
        description: msg,
      })
    } finally {
      setIsSubmittingEdit(false)
    }
  }

  // Delete user handlers
  const handleOpenDeleteConfirm = (targetUser: ManagedUser) => {
    if (targetUser.id === currentUser?.id) {
      toast({
        variant: 'destructive',
        title: 'Operação negada',
        description: 'Você não pode excluir o seu próprio usuário.',
      })
      return
    }
    if (targetUser.role === 'super_admin') {
      toast({
        variant: 'destructive',
        title: 'Operação negada',
        description: 'Não é permitido excluir contas com papel Super Administrador.',
      })
      return
    }
    setDeletingUser(targetUser)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingUser) return
    setIsDeleting(true)

    try {
      await deleteUser(deletingUser.id)
      toast({
        title: 'Usuário excluído',
        description: `O acesso de ${deletingUser.name} foi removido com sucesso.`,
      })
      setDeleteConfirmOpen(false)
      setDeletingUser(null)
      await fetchUsersList()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao excluir o usuário.'
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir',
        description: msg,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Password reset handler per user row
  const handleSendPasswordReset = async (targetUser: ManagedUser) => {
    if (!targetUser.email) {
      toast({
        variant: 'destructive',
        title: 'E-mail não disponível',
        description: 'Este usuário não possui um endereço de e-mail cadastrado.',
      })
      return
    }

    setResettingUserId(targetUser.id)
    try {
      await requestPasswordReset(targetUser.email)
      toast({
        title: 'Link de redefinição enviado',
        description: `Link de redefinição enviado para ${targetUser.email}`,
      })
    } catch (err: unknown) {
      const rawMsg = err instanceof Error ? err.message.toLowerCase() : ''
      const isSmtpErr =
        rawMsg.includes('smtp') ||
        rawMsg.includes('mail') ||
        rawMsg.includes('email') ||
        rawMsg.includes('send')

      let description = 'Ocorreu um erro ao enviar o link de redefinição. Tente novamente.'
      if (isSmtpErr) {
        description =
          'O serviço de envio de e-mails não está configurado no servidor. Tente novamente mais tarde.'
      }

      toast({
        variant: 'destructive',
        title: 'Erro ao enviar redefinição',
        description,
      })
    } finally {
      setResettingUserId(null)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return (
          <Badge className="bg-amber-600/15 text-amber-600 dark:text-amber-400 border-amber-600/30 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            Super Admin
          </Badge>
        )
      case 'admin':
        return (
          <Badge className="bg-primary/10 text-primary border-primary/20 font-semibold">
            Administrador
          </Badge>
        )
      case 'editor':
        return (
          <Badge variant="secondary" className="font-semibold">
            Editor
          </Badge>
        )
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl font-bold">Gestão de Usuários</CardTitle>
            </div>
            <CardDescription className="mt-1">
              Gerencie as credenciais e níveis de acesso (Administrador e Editor) da plataforma.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUsersList}
              disabled={isLoading}
              className="gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </Button>
            <Button
              onClick={handleOpenCreateModal}
              size="sm"
              className="gap-2 cursor-pointer font-medium"
            >
              <UserPlus className="w-4 h-4" />
              <span>Novo Usuário</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm">Carregando usuários cadastrados...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Nenhum usuário encontrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/80 text-muted-foreground text-xs uppercase tracking-wider">
                    <th className="py-3 px-4 font-semibold">Nome</th>
                    <th className="py-3 px-4 font-semibold">E-mail</th>
                    <th className="py-3 px-4 font-semibold">Papel</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {users.map((u) => {
                    const isSelf = u.id === currentUser?.id
                    const isSuperAdminRow = u.role === 'super_admin'
                    const canEditOrDelete = !isSuperAdminRow && !isSelf

                    return (
                      <tr key={u.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            <span>{u.name}</span>
                            {isSelf && (
                              <Badge
                                variant="outline"
                                className="text-[10px] py-0 px-1.5 font-normal"
                              >
                                Você
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">{u.email}</td>
                        <td className="py-3.5 px-4">{getRoleBadge(u.role)}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            Ativo
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {u.email && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSendPasswordReset(u)}
                                disabled={resettingUserId === u.id}
                                className="h-8 px-2 cursor-pointer text-muted-foreground hover:text-primary gap-1.5"
                                title={`Enviar link de redefinição para ${u.email}`}
                              >
                                {resettingUserId === u.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                ) : (
                                  <KeyRound className="w-4 h-4" />
                                )}
                                <span className="hidden xl:inline text-xs">
                                  {resettingUserId === u.id ? 'Enviando...' : 'Redefinir senha'}
                                </span>
                                <span className="sr-only">Enviar link de redefinição</span>
                              </Button>
                            )}

                            {canEditOrDelete ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenEditModal(u)}
                                  className="h-8 w-8 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
                                  title="Editar usuário"
                                >
                                  <Edit2 className="w-4 h-4" />
                                  <span className="sr-only">Editar</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenDeleteConfirm(u)}
                                  className="h-8 w-8 p-0 cursor-pointer text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                                  title="Excluir usuário"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span className="sr-only">Excluir</span>
                                </Button>
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground italic px-2">
                                {isSelf ? 'Sua conta' : 'Protegido'}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CREATE USER DIALOG */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Novo Usuário</DialogTitle>
            <DialogDescription>
              Cadastre um novo usuário escolhendo entre as permissões de Administrador ou Editor.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitCreate} className="space-y-4 py-2" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="create-name">Nome Completo</Label>
              <Input
                id="create-name"
                placeholder="Ex: João da Silva"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                disabled={isSubmittingCreate}
              />
              {createErrors.name && <p className="text-xs text-destructive">{createErrors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-email">E-mail</Label>
              <Input
                id="create-email"
                type="email"
                placeholder="nome@tastyplus.com.br"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                disabled={isSubmittingCreate}
              />
              {createErrors.email && (
                <p className="text-xs text-destructive">{createErrors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-role">Papel / Nível de Acesso</Label>
              <Select
                value={createForm.role}
                onValueChange={(val: 'admin' | 'editor') =>
                  setCreateForm({ ...createForm, role: val })
                }
                disabled={isSubmittingCreate}
              >
                <SelectTrigger id="create-role">
                  <SelectValue placeholder="Selecione o papel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Editor (apenas Notícias)</SelectItem>
                  <SelectItem value="admin">Administrador (conteúdo geral e catálogo)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Super Administradores não podem criar outros Super Administradores.
              </p>
              {createErrors.role && <p className="text-xs text-destructive">{createErrors.role}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-password">Senha (mínimo 8 caracteres)</Label>
              <Input
                id="create-password"
                type="password"
                placeholder="••••••••"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                disabled={isSubmittingCreate}
              />
              {createErrors.password && (
                <p className="text-xs text-destructive">{createErrors.password}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-password-confirm">Confirmar Senha</Label>
              <Input
                id="create-password-confirm"
                type="password"
                placeholder="••••••••"
                value={createForm.passwordConfirm}
                onChange={(e) => setCreateForm({ ...createForm, passwordConfirm: e.target.value })}
                disabled={isSubmittingCreate}
              />
              {createErrors.passwordConfirm && (
                <p className="text-xs text-destructive">{createErrors.passwordConfirm}</p>
              )}
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                disabled={isSubmittingCreate}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmittingCreate} className="gap-2">
                {isSubmittingCreate ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  'Cadastrar Usuário'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT USER DIALOG */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Editar Usuário</DialogTitle>
            <DialogDescription>
              Altere o nome e o nível de acesso de {editingUser?.email}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitEdit} className="space-y-4 py-2" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Nome Completo</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                disabled={isSubmittingEdit}
              />
              {editErrors.name && <p className="text-xs text-destructive">{editErrors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-role">Papel</Label>
              <Select
                value={editRole}
                onValueChange={(val: 'admin' | 'editor') => setEditRole(val)}
                disabled={isSubmittingEdit}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Selecione o papel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
              {editErrors.role && <p className="text-xs text-destructive">{editErrors.role}</p>}
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                disabled={isSubmittingEdit}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmittingEdit} className="gap-2">
                {isSubmittingEdit ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION ALERT DIALOG */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold">Excluir Usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá permanentemente o acesso do usuário{' '}
              <strong>{deletingUser?.name}</strong> ({deletingUser?.email}). Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
