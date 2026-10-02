migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('site_settings')

    if (!col.fields.getByName('orgChartImage')) {
      col.fields.add(
        new FileField({
          name: 'orgChartImage',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif', 'image/webp'],
        }),
      )
    }

    if (!col.fields.getByName('flowChartImage')) {
      col.fields.add(
        new FileField({
          name: 'flowChartImage',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif', 'image/webp'],
        }),
      )
    }

    app.save(col)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('site_settings')
      col.fields.removeByName('orgChartImage')
      col.fields.removeByName('flowChartImage')
      app.save(col)
    } catch (_) {}
  },
)
