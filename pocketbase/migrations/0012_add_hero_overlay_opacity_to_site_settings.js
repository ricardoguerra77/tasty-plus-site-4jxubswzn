migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('site_settings')
    if (!col.fields.getByName('heroOverlayOpacity')) {
      col.fields.add(
        new NumberField({
          name: 'heroOverlayOpacity',
          min: 0,
          max: 100,
          onlyInt: true,
          required: false,
        }),
      )
      app.save(col)
    }

    // Set default value 45 on existing records if not set
    try {
      const records = app.findRecordsByFilter('site_settings', '', '', 100, 0)
      for (let i = 0; i < records.length; i++) {
        const r = records[i]
        const val = r.get('heroOverlayOpacity')
        if (val === null || val === undefined || val === '') {
          r.set('heroOverlayOpacity', 45)
          app.save(r)
        }
      }
    } catch (_) {}
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('site_settings')
      col.fields.removeByName('heroOverlayOpacity')
      app.save(col)
    } catch (_) {}
  },
)
