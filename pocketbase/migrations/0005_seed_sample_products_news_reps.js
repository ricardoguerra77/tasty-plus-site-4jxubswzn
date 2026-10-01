migrate(
  (app) => {
    // Seed sample products
    const prodCol = app.findCollectionByNameOrId('products')
    if (app.countRecords('products') === 0) {
      const p1 = new Record(prodCol)
      p1.set('name', 'Aroma Natural de Baunilha Bourbon')
      p1.set('category', 'Aroma')
      p1.set(
        'description',
        '<p>Aroma natural de alta concentração para laticínios, panificação e confeitaria.</p>',
      )
      p1.set('order', 1)
      p1.set('published', true)
      app.save(p1)

      const p2 = new Record(prodCol)
      p2.set('name', 'Extrato Concentrado de Guaraná')
      p2.set('category', 'Extrato')
      p2.set(
        'description',
        '<p>Extrato padronizado com teor balanceado de cafeína vegetal para bebidas energéticas.</p>',
      )
      p2.set('order', 2)
      p2.set('published', true)
      app.save(p2)

      const p3 = new Record(prodCol)
      p3.set('name', 'Corante Caramelo IV')
      p3.set('category', 'Corante')
      p3.set(
        'description',
        '<p>Corante alimentício estável para bebidas carbonatadas, molhos e cervejarias.</p>',
      )
      p3.set('order', 3)
      p3.set('published', true)
      app.save(p3)
    }

    // Seed sample representatives
    const repCol = app.findCollectionByNameOrId('representatives')
    if (app.countRecords('representatives') === 0) {
      const r1 = new Record(repCol)
      r1.set('name', 'Carlos Alberto Silveira')
      r1.set('region', 'São Paulo - Capital e Grande ABC')
      r1.set('role', 'Representante')
      r1.set('phone', '(11) 98111-2233')
      r1.set('whatsapp', '(11) 98111-2233')
      r1.set('order', 1)
      app.save(r1)

      const r2 = new Record(repCol)
      r2.set('name', 'Distribuidora Minas Ingredientes')
      r2.set('region', 'Minas Gerais e Espírito Santo')
      r2.set('role', 'Representante Distribuidor')
      r2.set('phone', '(31) 3222-4455')
      r2.set('whatsapp', '(31) 99888-7766')
      r2.set('order', 2)
      app.save(r2)
    }

    // Seed sample news
    const newsCol = app.findCollectionByNameOrId('news')
    if (app.countRecords('news') === 0) {
      let adminId = ''
      try {
        const adminUser = app.findAuthRecordByEmail('_pb_users_auth_', 'admin@tastyplus.com.br')
        adminId = adminUser.id
      } catch (_) {}

      const n1 = new Record(newsCol)
      n1.set('title', 'Tasty Plus Conquista Recertificação ISO 9001:2015')
      n1.set('slug', 'tasty-plus-recertificacao-iso-9001')
      n1.set(
        'excerpt',
        'Auditoria confirma excelência em todos os processos de controle e segurança sensorial.',
      )
      n1.set(
        'body',
        '<p>Com grande satisfação anunciamos a renovação da nossa certificação <strong>ISO 9001:2015</strong>, comprovando nosso compromisso inabalável com a qualidade e a segurança dos ingredientes fornecidos a nossos parceiros industriais.</p>',
      )
      n1.set('author', 'Equipe de Qualidade')
      n1.set('publishedAt', '2026-03-15 10:00:00.000Z')
      n1.set('published', true)
      if (adminId) {
        n1.set('createdBy', adminId)
      }
      app.save(n1)
    }
  },
  (app) => {},
)
