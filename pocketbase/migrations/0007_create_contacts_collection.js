migrate(
  (app) => {
    // Check if contacts collection already exists
    try {
      app.findCollectionByNameOrId('contacts')
      return
    } catch (_) {}

    const contacts = new Collection({
      name: 'contacts',
      type: 'base',
      listRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      viewRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      createRule: '', // public can create or hook can save
      updateRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'phone', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'message', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(contacts)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('contacts')
      app.delete(col)
    } catch (_) {}
  },
)
