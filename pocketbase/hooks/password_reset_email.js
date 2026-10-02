// Hook to ensure reset email content states 10 minutes expiry in PT-BR
onMailerRecordPasswordResetSend((e) => {
  e.message.subject = 'Redefinição de senha — Tasty Aromas e Sabores'
  // Ensure the body clearly informs the 10-minute limit in PT-BR
  const appUrl =
    $os.getenv('SITE_URL') ||
    $os.getenv('PB_INSTANCE_URL') ||
    'https://tasty-plus-site-c7844.shrd00.internal.goskip.dev'
  const token = e.meta ? e.meta.token : ''
  const resetLink = appUrl + '/reset-password?token=' + encodeURIComponent(token)

  e.message.html =
    '<div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">' +
    '<h2 style="color: #0f172a;">Redefinição de Senha</h2>' +
    '<p>Olá,</p>' +
    '<p>Recebemos uma solicitação para redefinir a senha da sua conta na <strong>Tasty Aromas e Sabores</strong>.</p>' +
    '<p style="margin: 24px 0;"><a href="' +
    resetLink +
    '" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Redefinir Senha</a></p>' +
    '<p>Se o botão acima não funcionar, copie e cole o link a seguir no seu navegador:</p>' +
    '<p style="word-break: break-all; color: #2563eb;">' +
    resetLink +
    '</p>' +
    '<div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 20px 0; border-radius: 4px;">' +
    '<p style="margin: 0; color: #991b1b; font-weight: bold;">Atenção: Este link é válido por no máximo 10 minutos.</p>' +
    '<p style="margin: 4px 0 0 0; color: #7f1d1d; font-size: 14px;">Após 10 minutos, o link expira automaticamente e será necessário solicitar um novo link de redefinição.</p>' +
    '</div>' +
    '<p style="color: #64748b; font-size: 14px;">Se você não solicitou a redefinição de senha, nenhuma ação é necessária. Sua conta permanece segura.</p>' +
    '<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />' +
    '<p style="color: #94a3b8; font-size: 12px;">Tasty Aromas e Sabores — A fórmula certa para a sua empresa.</p>' +
    '</div>'

  e.next()
}, 'users')
