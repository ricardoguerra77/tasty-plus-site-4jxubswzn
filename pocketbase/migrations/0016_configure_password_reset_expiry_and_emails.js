migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    // 1. Set passwordResetToken duration to 600 seconds (10 minutes)
    if (users.passwordResetToken) {
      users.passwordResetToken.duration = 600
    }

    // 2. Set resetPasswordTemplate in PT-BR emphasizing 10 minutes limit
    users.resetPasswordTemplate = {
      subject: 'Redefinição de senha — Tasty Aromas e Sabores',
      body:
        '<p>Olá,</p>' +
        '<p>Recebemos uma solicitação para redefinir a senha da sua conta na Tasty Aromas e Sabores.</p>' +
        '<p>Clique no link abaixo para criar uma nova senha:</p>' +
        '<p><a href="{APP_URL}/reset-password?token={TOKEN}">Redefinir Senha</a></p>' +
        '<p><strong>Importante:</strong> Este link é válido por no máximo 10 minutos. Após esse período, o link expira automaticamente e será necessário solicitar um novo link de redefinição.</p>' +
        '<p>Se você não solicitou a redefinição de senha, desconsidere esta mensagem. Sua conta permanece em segurança.</p>' +
        '<p>Atenciosamente,<br />Equipe Tasty Aromas e Sabores</p>',
    }

    // 3. Ensure emailVisibility = true for existing users so emails are visible to authorized callers
    app.db().newQuery('UPDATE users SET emailVisibility = 1').execute()

    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    if (users.passwordResetToken) {
      users.passwordResetToken.duration = 1800
    }
    app.save(users)
  },
)
