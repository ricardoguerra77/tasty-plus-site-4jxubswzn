migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const adminEmail = 'ricardoguerra@outlook.com'
    const adminName = 'Ricardo Guerra'

    // Strong initial password (16 chars with uppercase, lowercase, numbers, and special symbols)
    const envPassword =
      $secrets.get('RICARDO_ADMIN_PASSWORD') || $secrets.get('ADMIN_INITIAL_PASSWORD')
    const password = envPassword || 'TastyPlus#Guerra2025!'

    try {
      const existing = app.findAuthRecordByEmail('_pb_users_auth_', adminEmail)
      existing.setPassword(password)
      existing.setVerified(true)
      existing.set('role', 'admin')
      existing.set('name', adminName)
      app.save(existing)
      return
    } catch (_) {
      const record = new Record(users)
      record.setEmail(adminEmail)
      record.setPassword(password)
      record.setVerified(true)
      record.set('name', adminName)
      record.set('role', 'admin')
      app.save(record)
    }
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'ricardoguerra@outlook.com')
      app.delete(record)
    } catch (_) {}
  },
)
