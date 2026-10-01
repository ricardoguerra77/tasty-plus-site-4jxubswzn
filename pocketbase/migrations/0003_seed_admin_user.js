migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const email = 'admin@tastyplus.com.br'

    try {
      app.findAuthRecordByEmail('_pb_users_auth_', email)
      return
    } catch (_) {}

    // Check if admin password secret is set, otherwise generate secure password
    const envPassword = $secrets.get('ADMIN_INITIAL_PASSWORD') || $secrets.get('ADMIN_PASSWORD')
    const password = envPassword || 'TastyPlus_' + $security.randomString(16) + '!'

    const record = new Record(users)
    record.setEmail(email)
    record.setPassword(password)
    record.setVerified(true)
    record.set('name', 'Administrador Tasty Plus')
    record.set('role', 'admin')

    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'admin@tastyplus.com.br')
      app.delete(record)
    } catch (_) {}
  },
)
