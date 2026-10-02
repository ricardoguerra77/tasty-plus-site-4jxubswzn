migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    // 1. Update role SelectField to include 'super_admin'
    // Current options: admin, editor -> now: super_admin, admin, editor
    const roleField = users.fields.getByName('role')
    if (roleField) {
      roleField.values = ['super_admin', 'admin', 'editor']
      roleField.maxSelect = 1
      roleField.required = true
    } else {
      users.fields.add(
        new SelectField({
          name: 'role',
          required: true,
          values: ['super_admin', 'admin', 'editor'],
          maxSelect: 1,
        }),
      )
    }

    // 2. Adjust collection rules:
    // listRule: users can see themselves, or super_admin can list all
    users.listRule = "id = @request.auth.id || @request.auth.role = 'super_admin'"
    // viewRule: users can view themselves, or super_admin can view any
    users.viewRule = "id = @request.auth.id || @request.auth.role = 'super_admin'"
    // createRule: only super_admin can create accounts
    users.createRule = "@request.auth.id != '' && @request.auth.role = 'super_admin'"
    // updateRule: users can update themselves, or super_admin can update anyone
    users.updateRule = "id = @request.auth.id || @request.auth.role = 'super_admin'"
    // deleteRule: only super_admin can delete users (and self-deletion / other super_admins protected via hook/rule)
    users.deleteRule =
      "@request.auth.id != '' && @request.auth.role = 'super_admin' && id != @request.auth.id && role != 'super_admin'"

    app.save(users)

    // 3. Update existing admin@tastyplus.com.br and ricardoguerra@outlook.com to role = "super_admin"
    // DO NOT touch other users (e.g. editor@tastyplus.com.br)
    const superAdminEmails = ['admin@tastyplus.com.br', 'ricardoguerra@outlook.com']
    for (const email of superAdminEmails) {
      try {
        const record = app.findAuthRecordByEmail('_pb_users_auth_', email)
        record.set('role', 'super_admin')
        app.save(record)
      } catch (_) {
        // user not found, skip
      }
    }
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const roleField = users.fields.getByName('role')
    if (roleField) {
      roleField.values = ['admin', 'editor']
    }
    users.listRule = 'id = @request.auth.id'
    users.viewRule = 'id = @request.auth.id'
    users.createRule = "@request.auth.id != '' && @request.auth.role = 'admin'"
    users.updateRule = 'id = @request.auth.id'
    users.deleteRule = 'id = @request.auth.id'
    app.save(users)
  },
)
