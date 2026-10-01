migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    // Name field: required: true
    const nameField = users.fields.getByName('name')
    if (nameField) {
      nameField.required = true
    } else {
      users.fields.add(
        new TextField({
          name: 'name',
          required: true,
        }),
      )
    }

    // Role field: Select with options "admin" and "editor", required, default "editor"
    if (!users.fields.getByName('role')) {
      users.fields.add(
        new SelectField({
          name: 'role',
          required: true,
          values: ['admin', 'editor'],
          maxSelect: 1,
        }),
      )
    }

    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const roleField = users.fields.getByName('role')
    if (roleField) {
      users.fields.removeByName('role')
    }
    const nameField = users.fields.getByName('name')
    if (nameField) {
      nameField.required = false
    }
    app.save(users)
  },
)
