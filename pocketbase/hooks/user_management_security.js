// Hook to enforce user management security rules server-side
onRecordCreateRequest((e) => {
  const auth = e.auth
  if (!auth) {
    throw new ForbiddenError('Acesso não autorizado.')
  }

  // Only super_admin can create users
  const authRole = auth.getString('role')
  if (authRole !== 'super_admin') {
    throw new ForbiddenError('Apenas super administradores podem criar novos usuários.')
  }

  // Super admin cannot create another super_admin
  const targetRole = e.record.getString('role')
  if (targetRole === 'super_admin') {
    throw new BadRequestError('Não é permitido criar usuários com papel super_admin.')
  }

  // Target role must be admin or editor
  if (targetRole !== 'admin' && targetRole !== 'editor') {
    throw new BadRequestError('O papel do novo usuário deve ser admin ou editor.')
  }

  e.next()
}, 'users')

onRecordUpdateRequest((e) => {
  const auth = e.auth
  if (!auth) {
    throw new ForbiddenError('Acesso não autorizado.')
  }

  const authRole = auth.getString('role')
  const isSuperAdmin = authRole === 'super_admin'
  const isSelf = auth.id === e.record.id

  // If not super_admin and not self, deny
  if (!isSuperAdmin && !isSelf) {
    throw new ForbiddenError('Acesso não autorizado.')
  }

  // If not super_admin (i.e. self update by admin or editor), they cannot change their role
  if (!isSuperAdmin) {
    const oldRole = e.record.original().getString('role')
    const newRole = e.record.getString('role')
    if (newRole !== oldRole) {
      throw new ForbiddenError('Você não tem permissão para alterar o seu próprio papel.')
    }
  }

  // If super_admin is updating:
  if (isSuperAdmin) {
    // If target user is super_admin and not self, cannot demote/change role
    const originalRole = e.record.original().getString('role')
    const newRole = e.record.getString('role')

    // Cannot promote anyone to super_admin via admin panel
    if (originalRole !== 'super_admin' && newRole === 'super_admin') {
      throw new BadRequestError(
        'Não é permitido atribuir o papel de super_admin a outros usuários.',
      )
    }

    // Cannot change another super_admin's role
    if (originalRole === 'super_admin' && !isSelf && newRole !== 'super_admin') {
      throw new ForbiddenError('Não é permitido alterar o papel de outro super administrador.')
    }
  }

  e.next()
}, 'users')

onRecordDeleteRequest((e) => {
  const auth = e.auth
  if (!auth) {
    throw new ForbiddenError('Acesso não autorizado.')
  }

  const authRole = auth.getString('role')
  if (authRole !== 'super_admin') {
    throw new ForbiddenError('Apenas super administradores podem excluir usuários.')
  }

  // Cannot delete self
  if (auth.id === e.record.id) {
    throw new BadRequestError('Não é permitido excluir o próprio usuário.')
  }

  // Cannot delete other super_admins
  const targetRole = e.record.getString('role')
  if (targetRole === 'super_admin') {
    throw new BadRequestError('Não é permitido excluir outro super administrador.')
  }

  e.next()
}, 'users')
