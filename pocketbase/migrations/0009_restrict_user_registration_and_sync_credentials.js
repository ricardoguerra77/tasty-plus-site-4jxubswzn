migrate(
  (app) => {
    // 1. Restrict users collection createRule so only authenticated admins can create accounts.
    // Anonymous auto-registration is strictly forbidden.
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.createRule = "@request.auth.id != '' && @request.auth.role = 'admin'"
    app.save(users)

    // 2. Ensure admin user exists with valid role and deterministic initial/secret password
    const adminEmail = 'admin@tastyplus.com.br'
    const envAdminPass = $secrets.get('ADMIN_PASSWORD') || $secrets.get('ADMIN_INITIAL_PASSWORD')
    const adminPassword = envAdminPass || 'Skip@PassAdmin2025!'

    try {
      const adminRecord = app.findAuthRecordByEmail('_pb_users_auth_', adminEmail)
      adminRecord.setPassword(adminPassword)
      adminRecord.setVerified(true)
      adminRecord.set('role', 'admin')
      if (!adminRecord.get('name')) {
        adminRecord.set('name', 'Administrador Tasty Plus')
      }
      app.save(adminRecord)
    } catch (_) {
      const newAdmin = new Record(users)
      newAdmin.setEmail(adminEmail)
      newAdmin.setPassword(adminPassword)
      newAdmin.setVerified(true)
      newAdmin.set('name', 'Administrador Tasty Plus')
      newAdmin.set('role', 'admin')
      app.save(newAdmin)
    }

    // 3. Ensure editor user exists with role editor
    const editorEmail = 'editor@tastyplus.com.br'
    const envEditorPass = $secrets.get('EDITOR_PASSWORD')
    const editorPassword = envEditorPass || 'TastyPlus_Editor2025!'

    try {
      const editorRecord = app.findAuthRecordByEmail('_pb_users_auth_', editorEmail)
      editorRecord.setPassword(editorPassword)
      editorRecord.setVerified(true)
      editorRecord.set('role', 'editor')
      if (!editorRecord.get('name')) {
        editorRecord.set('name', 'Editor de Conteúdo Tasty Plus')
      }
      app.save(editorRecord)
    } catch (_) {
      const newEditor = new Record(users)
      newEditor.setEmail(editorEmail)
      newEditor.setPassword(editorPassword)
      newEditor.setVerified(true)
      newEditor.set('name', 'Editor de Conteúdo Tasty Plus')
      newEditor.set('role', 'editor')
      app.save(newEditor)
    }
  },
  (app) => {
    // Revert createRule back to empty string if needed
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.createRule = ''
    app.save(users)
  },
)
