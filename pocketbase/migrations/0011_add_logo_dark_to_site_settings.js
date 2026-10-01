migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('site_settings')
    if (!col.fields.getByName('logoDark')) {
      col.fields.add(
        new FileField({
          name: 'logoDark',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif', 'image/webp'],
        }),
      )
      app.save(col)
    }
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('site_settings')
      col.fields.removeByName('logoDark')
      app.save(col)
    } catch (_) {}
  },
)
