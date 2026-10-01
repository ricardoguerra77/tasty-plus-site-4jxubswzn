migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const editorEmail = 'editor@tastyplus.com.br'

    try {
      const existing = app.findAuthRecordByEmail('_pb_users_auth_', editorEmail)
      existing.setRole ? existing.setRole('editor') : existing.set('role', 'editor')
      existing.setVerified(true)
      app.save(existing)
      return
    } catch (_) {}

    const editorPassword = $secrets.get('EDITOR_PASSWORD') || 'TastyPlus_Editor2025!'

    const record = new Record(users)
    record.setEmail(editorEmail)
    record.setPassword(editorPassword)
    record.setVerified(true)
    record.set('name', 'Editor de Conteúdo Tasty Plus')
    record.set('role', 'editor')

    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'editor@tastyplus.com.br')
      app.delete(record)
    } catch (_) {}
  },
)
