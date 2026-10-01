migrate(
  (app) => {
    // 1. site_settings
    // logo (File), tagline (Text), heroSlide1Title (Text), heroSlide1Subtitle (Text), heroImage1 (File),
    // heroSlide2Title (Text), heroSlide2Subtitle (Text), heroImage2 (File), heroSlide3Title (Text),
    // heroSlide3Subtitle (Text), heroImage3 (File), companyIntro (Editor), mission (Editor), vision (Editor),
    // values (Editor), history (Editor), isoBadge (Bool), address (Text), phoneFixed (Text), phoneSales (Text),
    // phoneFinance (Text), email (Text), hoursWeek (Text), hoursFriday (Text), mapEmbed (URL), facebook (URL),
    // instagram (URL), whatsapp (URL).
    // Rules: public read, mutations restricted to admin role.
    const siteSettings = new Collection({
      name: 'site_settings',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      updateRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        { name: 'logo', type: 'file', maxSelect: 1, maxSize: 5242880 },
        { name: 'tagline', type: 'text' },
        { name: 'heroSlide1Title', type: 'text' },
        { name: 'heroSlide1Subtitle', type: 'text' },
        { name: 'heroImage1', type: 'file', maxSelect: 1, maxSize: 5242880 },
        { name: 'heroSlide2Title', type: 'text' },
        { name: 'heroSlide2Subtitle', type: 'text' },
        { name: 'heroImage2', type: 'file', maxSelect: 1, maxSize: 5242880 },
        { name: 'heroSlide3Title', type: 'text' },
        { name: 'heroSlide3Subtitle', type: 'text' },
        { name: 'heroImage3', type: 'file', maxSelect: 1, maxSize: 5242880 },
        { name: 'companyIntro', type: 'editor' },
        { name: 'mission', type: 'editor' },
        { name: 'vision', type: 'editor' },
        { name: 'values', type: 'editor' },
        { name: 'history', type: 'editor' },
        { name: 'isoBadge', type: 'bool' },
        { name: 'address', type: 'text' },
        { name: 'phoneFixed', type: 'text' },
        { name: 'phoneSales', type: 'text' },
        { name: 'phoneFinance', type: 'text' },
        { name: 'email', type: 'text' },
        { name: 'hoursWeek', type: 'text' },
        { name: 'hoursFriday', type: 'text' },
        { name: 'mapEmbed', type: 'url' },
        { name: 'facebook', type: 'url' },
        { name: 'instagram', type: 'url' },
        { name: 'whatsapp', type: 'url' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(siteSettings)

    // 2. products
    // name (Text, required), category (Select: Aroma, Extrato, Aditivo, Corante, Outro, required),
    // description (Editor), image (File), order (Number, default 0), published (Bool, default true).
    // Rules: public read filtered by published=true, mutations restricted to admin.
    // Note: for admin mutations: createRule/updateRule/deleteRule @request.auth.id != '' && @request.auth.role = 'admin'
    // For view/list rules: published = true || (@request.auth.id != '' && @request.auth.role = 'admin')
    // Prompt states: "Rules: public read filtered by published=true, mutations restricted to admin."
    // So: listRule: "published = true || (@request.auth.id != '' && @request.auth.role = 'admin')"
    // viewRule: "published = true || (@request.auth.id != '' && @request.auth.role = 'admin')"
    const products = new Collection({
      name: 'products',
      type: 'base',
      listRule: "published = true || (@request.auth.id != '' && @request.auth.role = 'admin')",
      viewRule: "published = true || (@request.auth.id != '' && @request.auth.role = 'admin')",
      createRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      updateRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'category',
          type: 'select',
          required: true,
          values: ['Aroma', 'Extrato', 'Aditivo', 'Corante', 'Outro'],
          maxSelect: 1,
        },
        { name: 'description', type: 'editor' },
        { name: 'image', type: 'file', maxSelect: 1, maxSize: 5242880 },
        { name: 'order', type: 'number' },
        { name: 'published', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_products_order ON products (order)',
        'CREATE INDEX idx_products_published ON products (published)',
      ],
    })
    app.save(products)

    // 3. news
    // title (Text, required), slug (Text, required, unique), excerpt (Text), body (Editor, required),
    // image (File), author (Text), publishedAt (Date), published (Bool, default false), createdBy (Relation to users).
    // Rules: public read filtered by published=true, create/update/delete allowed for editor and admin roles.
    const news = new Collection({
      name: 'news',
      type: 'base',
      listRule:
        "published = true || (@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'editor'))",
      viewRule:
        "published = true || (@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'editor'))",
      createRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'editor')",
      updateRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'editor')",
      deleteRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'editor')",
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true },
        { name: 'excerpt', type: 'text' },
        { name: 'body', type: 'editor', required: true },
        { name: 'image', type: 'file', maxSelect: 1, maxSize: 5242880 },
        { name: 'author', type: 'text' },
        { name: 'publishedAt', type: 'date' },
        { name: 'published', type: 'bool' },
        {
          name: 'createdBy',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_news_slug ON news (slug)',
        'CREATE INDEX idx_news_published ON news (published)',
      ],
    })
    app.save(news)

    // 4. representatives
    // name (Text, required), region (Text, required), role (Select: Representante, Representante Distribuidor, required),
    // phone (Text), whatsapp (Text), order (Number, default 0).
    // Rules: public read, mutations restricted to admin.
    const representatives = new Collection({
      name: 'representatives',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      updateRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'region', type: 'text', required: true },
        {
          name: 'role',
          type: 'select',
          required: true,
          values: ['Representante', 'Representante Distribuidor'],
          maxSelect: 1,
        },
        { name: 'phone', type: 'text' },
        { name: 'whatsapp', type: 'text' },
        { name: 'order', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_representatives_order ON representatives (order)'],
    })
    app.save(representatives)
  },
  (app) => {
    try {
      const col4 = app.findCollectionByNameOrId('representatives')
      app.delete(col4)
    } catch (_) {}
    try {
      const col3 = app.findCollectionByNameOrId('news')
      app.delete(col3)
    } catch (_) {}
    try {
      const col2 = app.findCollectionByNameOrId('products')
      app.delete(col2)
    } catch (_) {}
    try {
      const col1 = app.findCollectionByNameOrId('site_settings')
      app.delete(col1)
    } catch (_) {}
  },
)
