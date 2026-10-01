migrate(
  (app) => {
    // 1. Seed Representatives
    // São Paulo — Alexandre (24 9 9998-4300) and Waldirene (11 9 7664-7208) as Representante
    // Espírito Santo — Guaraxope Rafael (27 9 9980-6506) as Representante Distribuidor
    const repCol = app.findCollectionByNameOrId('representatives')

    const repsToSeed = [
      {
        name: 'Alexandre',
        region: 'São Paulo',
        role: 'Representante',
        phone: '(24) 99998-4300',
        whatsapp: '(24) 99998-4300',
        order: 10,
      },
      {
        name: 'Waldirene',
        region: 'São Paulo',
        role: 'Representante',
        phone: '(11) 97664-7208',
        whatsapp: '(11) 97664-7208',
        order: 20,
      },
      {
        name: 'Guaraxope Rafael',
        region: 'Espírito Santo',
        role: 'Representante Distribuidor',
        phone: '(27) 99980-6506',
        whatsapp: '(27) 99980-6506',
        order: 30,
      },
    ]

    for (let i = 0; i < repsToSeed.length; i++) {
      const item = repsToSeed[i]
      try {
        app.findFirstRecordByData('representatives', 'name', item.name)
      } catch (_) {
        const record = new Record(repCol)
        record.set('name', item.name)
        record.set('region', item.region)
        record.set('role', item.role)
        record.set('phone', item.phone)
        record.set('whatsapp', item.whatsapp)
        record.set('order', item.order)
        app.save(record)
      }
    }

    // 2. Seed 34 aromas and 9 extratos
    const prodCol = app.findCollectionByNameOrId('products')

    const aromas = [
      'Abacaxi',
      'Açaí',
      'Acerola',
      'Amora',
      'Banana',
      'Baunilha',
      'Bonificador para Vodka',
      'Caju',
      'Catuaba',
      'Cereja',
      'Cola',
      'Corantes',
      'Framboesa',
      'Frutas Cítricas',
      'Frutas Vermelhas',
      'Gengibre',
      'Goiaba',
      'Groselha',
      'Guaraná',
      'Hibisco',
      'Hortelã',
      'Laranja',
      'Laranja com acerola',
      'Limão',
      'Maçã',
      'Manga',
      'Maracujá',
      'Mate Couro',
      'Mel',
      'Menta',
      'Morango',
      'Óleos cítricos',
      'Tangerina',
      'Tônica',
      'Turvador',
      'Uva',
    ]

    for (let i = 0; i < aromas.length; i++) {
      const name = aromas[i]
      const fullName =
        name.startsWith('Aroma') ||
        name.startsWith('Bonificador') ||
        name.startsWith('Óleos') ||
        name.startsWith('Turvador')
          ? name
          : `Aroma de ${name}`

      try {
        app.findFirstRecordByData('products', 'name', fullName)
      } catch (_) {
        const p = new Record(prodCol)
        p.set('name', fullName)
        p.set('category', 'Aroma')
        p.set(
          'description',
          `<p>Aroma de alta qualidade e rendimento industrial: <strong>${name}</strong>.</p>`,
        )
        p.set('order', i + 10)
        p.set('published', true)
        app.save(p)
      }
    }

    const extratos = [
      'Açaí',
      'Alcaçuz',
      'Baunilha',
      'Catuaba',
      'Ginseng',
      'Hibisco',
      'Groselha',
      'Guaraná',
      'Noz de cola',
    ]

    for (let j = 0; j < extratos.length; j++) {
      const name = extratos[j]
      const fullName = `Extrato de ${name}`
      try {
        app.findFirstRecordByData('products', 'name', fullName)
      } catch (_) {
        const p = new Record(prodCol)
        p.set('name', fullName)
        p.set('category', 'Extrato')
        p.set(
          'description',
          `<p>Extrato vegetal concentrado e padronizado: <strong>${name}</strong>.</p>`,
        )
        p.set('order', j + 100)
        p.set('published', true)
        app.save(p)
      }
    }
  },
  (app) => {},
)
