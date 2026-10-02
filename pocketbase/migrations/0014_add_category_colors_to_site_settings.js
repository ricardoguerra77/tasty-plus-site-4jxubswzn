migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('site_settings')
    if (!col.fields.getByName('categoryColors')) {
      col.fields.add(
        new JSONField({
          name: 'categoryColors',
          required: false,
          maxSize: 2048,
        }),
      )
      app.save(col)
    }

    // Initialize default colors on existing site_settings records if empty
    try {
      const records = app.findRecordsByFilter('site_settings', '', '', 100, 0)
      const defaultColors = {
        Aroma: '#e11d48',
        Extrato: '#16233b',
        Aditivo: '#5b21b6',
        Corante: '#d97706',
        Outro: '#475569',
      }
      for (let i = 0; i < records.length; i++) {
        const r = records[i]
        const val = r.get('categoryColors')
        if (!val || Object.keys(val).length === 0) {
          r.set('categoryColors', defaultColors)
          app.save(r)
        }
      }
    } catch (_) {}
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('site_settings')
      col.fields.removeByName('categoryColors')
      app.save(col)
    } catch (_) {}
  },
)
