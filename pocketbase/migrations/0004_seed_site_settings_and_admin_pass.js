migrate(
  (app) => {
    // 1. Reset admin password to known deterministic password if ADMIN_PASSWORD is set or default Skip@PassAdmin2025!
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const adminEmail = 'admin@tastyplus.com.br'
    const envPassword = $secrets.get('ADMIN_PASSWORD') || $secrets.get('ADMIN_INITIAL_PASSWORD')
    const adminPassword = envPassword || 'Skip@PassAdmin2025!'

    try {
      const adminRecord = app.findAuthRecordByEmail('_pb_users_auth_', adminEmail)
      adminRecord.setPassword(adminPassword)
      adminRecord.setVerified(true)
      adminRecord.set('role', 'admin')
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

    // 2. Ensure default site_settings single record exists
    const settingsCol = app.findCollectionByNameOrId('site_settings')
    const count = app.countRecords('site_settings')
    if (count === 0) {
      const record = new Record(settingsCol)
      record.set(
        'tagline',
        'Soluções em Aromas, Extratos e Ingredientes para a Indústria Alimentícia',
      )
      record.set('heroSlide1Title', 'Inovação e Sabor em Cada Detalhe')
      record.set(
        'heroSlide1Subtitle',
        'Desenvolvemos aromas e extratos exclusivos com alta tecnologia e conformidade internacional.',
      )
      record.set('heroSlide2Title', 'Qualidade Certificada e Rastreabilidade')
      record.set(
        'heroSlide2Subtitle',
        'Processos rigorosos que garantem a segurança alimentar e a padronização dos seus produtos.',
      )
      record.set('heroSlide3Title', 'Parceria Técnica Especializada')
      record.set(
        'heroSlide3Subtitle',
        'Nossa equipe de especialistas cria soluções sob medida para as necessidades da sua indústria.',
      )
      record.set(
        'companyIntro',
        '<p>A <strong>Tasty Plus</strong> é referência nacional no desenvolvimento e fornecimento de aromas, extratos, corantes e aditivos para a indústria de alimentos e bebidas.</p>',
      )
      record.set(
        'mission',
        '<p>Criar experiências sensoriais memoráveis fornecendo aromas e ingredientes de altíssima qualidade e segurança alimentar.</p>',
      )
      record.set(
        'vision',
        '<p>Ser a parceira mais confiável e inovadora da indústria alimentícia em soluções de sabor no Brasil e América Latina.</p>',
      )
      record.set(
        'values',
        '<p>Inovação constante, rigor na qualidade, integridade nas relações comerciais e respeito às pessoas e ao meio ambiente.</p>',
      )
      record.set(
        'history',
        '<p>Fundada com o propósito de transformar a percepção de sabor na indústria alimentícia brasileira, a Tasty Plus construiu uma trajetória sólida baseada em pesquisa e excelência técnica.</p>',
      )
      record.set('isoBadge', true)
      record.set(
        'address',
        'Av. das Indústrias, 1500 - Distrito Industrial, São Paulo - SP, 01000-000',
      )
      record.set('phoneFixed', '(11) 3456-7890')
      record.set('phoneSales', '(11) 98765-4321')
      record.set('phoneFinance', '(11) 3456-7899')
      record.set('email', 'contato@tastyplus.com.br')
      record.set('hoursWeek', 'Segunda a Quinta: 08:00 às 18:00')
      record.set('hoursFriday', 'Sexta-feira: 08:00 às 17:00')
      record.set('mapEmbed', 'https://maps.google.com/?q=Tasty+Plus')
      record.set('facebook', 'https://facebook.com/tastyplus')
      record.set('instagram', 'https://instagram.com/tastyplus')
      record.set('whatsapp', 'https://wa.me/5511987654321')
      app.save(record)
    }
  },
  (app) => {
    // down migration
  },
)
