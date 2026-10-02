migrate(
  (app) => {
    // 1. Atualizar regras da coleção 'news' para incluir 'super_admin'
    const newsCol = app.findCollectionByNameOrId('news')
    newsCol.listRule =
      "published = true || (@request.auth.id != '' && (@request.auth.role = 'super_admin' || @request.auth.role = 'admin' || @request.auth.role = 'editor'))"
    newsCol.viewRule =
      "published = true || (@request.auth.id != '' && (@request.auth.role = 'super_admin' || @request.auth.role = 'admin' || @request.auth.role = 'editor'))"
    newsCol.createRule =
      "@request.auth.id != '' && (@request.auth.role = 'super_admin' || @request.auth.role = 'admin' || @request.auth.role = 'editor')"
    newsCol.updateRule =
      "@request.auth.id != '' && (@request.auth.role = 'super_admin' || @request.auth.role = 'admin' || @request.auth.role = 'editor')"
    newsCol.deleteRule =
      "@request.auth.id != '' && (@request.auth.role = 'super_admin' || @request.auth.role = 'admin' || @request.auth.role = 'editor')"
    app.save(newsCol)

    // 2. Atualizar regras da coleção 'products', 'site_settings' e 'representatives' para permitir 'super_admin' também
    const prodCol = app.findCollectionByNameOrId('products')
    prodCol.listRule =
      "published = true || (@request.auth.id != '' && (@request.auth.role = 'super_admin' || @request.auth.role = 'admin'))"
    prodCol.viewRule =
      "published = true || (@request.auth.id != '' && (@request.auth.role = 'super_admin' || @request.auth.role = 'admin'))"
    prodCol.createRule =
      "@request.auth.id != '' && (@request.auth.role = 'super_admin' || @request.auth.role = 'admin')"
    prodCol.updateRule =
      "@request.auth.id != '' && (@request.auth.role = 'super_admin' || @request.auth.role = 'admin')"
    prodCol.deleteRule =
      "@request.auth.id != '' && (@request.auth.role = 'super_admin' || @request.auth.role = 'admin')"
    app.save(prodCol)

    const repCol = app.findCollectionByNameOrId('representatives')
    repCol.createRule =
      "@request.auth.id != '' && (@request.auth.role = 'super_admin' || @request.auth.role = 'admin')"
    repCol.updateRule =
      "@request.auth.id != '' && (@request.auth.role = 'super_admin' || @request.auth.role = 'admin')"
    repCol.deleteRule =
      "@request.auth.id != '' && (@request.auth.role = 'super_admin' || @request.auth.role = 'admin')"
    app.save(repCol)

    // 3. Adicionar os 3 campos de destaques em 'site_settings'
    const settingsCol = app.findCollectionByNameOrId('site_settings')
    settingsCol.createRule =
      "@request.auth.id != '' && (@request.auth.role = 'super_admin' || @request.auth.role = 'admin')"
    settingsCol.updateRule =
      "@request.auth.id != '' && (@request.auth.role = 'super_admin' || @request.auth.role = 'admin')"
    settingsCol.deleteRule =
      "@request.auth.id != '' && (@request.auth.role = 'super_admin' || @request.auth.role = 'admin')"

    if (!settingsCol.fields.getByName('highlight1')) {
      settingsCol.fields.add(
        new EditorField({
          name: 'highlight1',
        }),
      )
    }
    if (!settingsCol.fields.getByName('highlight2')) {
      settingsCol.fields.add(
        new EditorField({
          name: 'highlight2',
        }),
      )
    }
    if (!settingsCol.fields.getByName('highlight3')) {
      settingsCol.fields.add(
        new EditorField({
          name: 'highlight3',
        }),
      )
    }
    app.save(settingsCol)

    // 4. Pré-popular os campos de destaques e atualizar 'Tasty Plus' para 'Tasty Aromas e Sabores' nos registros existentes
    const highlight1Content = `<h3>Adoçante Dietético</h3>
<p><strong>DESPACHO PARA TODO O BRASIL</strong></p>
<p><strong>Caixa com 24 unidades</strong> por apenas<br />
<strong>R$ 600,00</strong> (Preço de lançamento)</p>
<ul>
  <li><strong>Poder edulcorante:</strong> 1kg adoça de 2.000 a 3.000 litros</li>
  <li><strong>Sem residual metálico:</strong> sabor limpo e arredondado</li>
  <li><strong>50% de economia</strong> em relação ao açúcar</li>
  <li><strong>25% de desconto</strong> para clientes de aroma Tasty</li>
</ul>`

    const highlight2Content = `<h3>Café-Cola Gelado Tasty</h3>
<p>Inovação refrescante unindo o melhor do café premium com a vibração da cola, disponível para licenciamento exclusivo de marcas.</p>
<ul>
  <li><strong>Industrial:</strong> 632x</li>
  <li><strong>Comercial:</strong> 100x</li>
  <li><strong>Para o lar:</strong> 10x</li>
</ul>
<p><strong>Licenciamento exclusivo:</strong> oportunidade única para engarrafadores e marcas próprias.</p>`

    const highlight3Content = `<h3>NATU-COLA</h3>
<p><strong>100% Natural</strong></p>
<p>Sabor cola 100% autêntico e natural extraído diretamente da noz de cola. A resposta perfeita para o mercado de refrigerantes artesanais, clean label e bebidas premium.</p>
<ul>
  <li><strong>Extrato de Noz de Cola</strong> certificado</li>
  <li>Estabilidade térmica e sensorial comprovada</li>
  <li>Ideal para bebidas gaseificadas e xaropes artesanais</li>
</ul>`

    try {
      const records = app.findRecordsByFilter('site_settings', '', '', 100, 0)
      for (const rec of records) {
        if (!rec.get('highlight1')) {
          rec.set('highlight1', highlight1Content)
        }
        if (!rec.get('highlight2')) {
          rec.set('highlight2', highlight2Content)
        }
        if (!rec.get('highlight3')) {
          rec.set('highlight3', highlight3Content)
        }

        // Atualizar textos que contenham "Tasty Plus" em site_settings
        let intro = rec.getString('companyIntro') || ''
        if (intro.includes('Tasty Plus')) {
          intro = intro.replace(/Tasty Plus/g, 'Tasty Aromas e Sabores')
          rec.set('companyIntro', intro)
        }

        let hist = rec.getString('history') || ''
        if (hist.includes('Tasty Plus')) {
          hist = hist.replace(/Tasty Plus/g, 'Tasty Aromas e Sabores')
          rec.set('history', hist)
        }

        app.save(rec)
      }
    } catch (_) {}

    // 5. Atualizar notícia existente que tenha "Tasty Plus" no título
    try {
      const newsRecords = app.findRecordsByFilter('news', '', '', 100, 0)
      for (const n of newsRecords) {
        let nTitle = n.getString('title') || ''
        if (nTitle.includes('Tasty Plus')) {
          n.set('title', nTitle.replace(/Tasty Plus/g, 'Tasty Aromas e Sabores'))
          app.save(n)
        }
      }
    } catch (_) {}
  },
  (app) => {
    try {
      const settingsCol = app.findCollectionByNameOrId('site_settings')
      const h1 = settingsCol.fields.getByName('highlight1')
      if (h1) settingsCol.fields.remove(h1)
      const h2 = settingsCol.fields.getByName('highlight2')
      if (h2) settingsCol.fields.remove(h2)
      const h3 = settingsCol.fields.getByName('highlight3')
      if (h3) settingsCol.fields.remove(h3)
      app.save(settingsCol)
    } catch (_) {}
  },
)
