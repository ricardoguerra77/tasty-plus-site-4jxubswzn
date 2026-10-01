routerAdd('POST', '/backend/v1/contact', (e) => {
  let body = {}
  try {
    body = e.requestInfo().body || {}
  } catch (err) {
    return e.json(400, { error: 'Corpo da requisição inválido' })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''

  if (!name) {
    return e.json(400, { error: 'Nome completo é obrigatório' })
  }
  if (!phone) {
    return e.json(400, { error: 'Telefone/WhatsApp é obrigatório' })
  }
  if (!email || !email.includes('@')) {
    return e.json(400, { error: 'E-mail válido é obrigatório' })
  }
  if (!message) {
    return e.json(400, { error: 'Mensagem é obrigatória' })
  }

  try {
    const col = $app.findCollectionByNameOrId('contacts')
    const record = new Record(col)
    record.set('name', name)
    record.set('phone', phone)
    record.set('email', email)
    record.set('message', message)
    $app.save(record)

    return e.json(200, {
      success: true,
      message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
    })
  } catch (err) {
    return e.json(500, { error: 'Falha interna ao registrar a mensagem. Tente novamente.' })
  }
})
