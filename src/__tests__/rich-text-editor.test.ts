import { describe, it, expect, beforeEach, vi } from 'vitest'
import { sanitizeHtml } from '@/lib/sanitize'
import { RichTextEditor } from '@/components/admin/RichTextEditor'

// Import file raw as string using Vite's ?raw feature
import richTextEditorSource from '@/components/admin/RichTextEditor.tsx?raw'

describe('RichTextEditor Architecture & WYSIWYG Integrity', () => {
  it('RichTextEditor is exported and defined as a valid React component function', () => {
    expect(RichTextEditor).toBeDefined()
    expect(typeof RichTextEditor).toBe('function')
  })

  it('guarantees that no raw HTML textarea or code view exists in RichTextEditor', () => {
    // 1. Must NOT contain <textarea in the component
    expect(richTextEditorSource).not.toMatch(/<textarea/i)

    // 2. Must NOT contain a "code view" toggle or HTML markup switch
    expect(richTextEditorSource).not.toMatch(/codeview/i)
    expect(richTextEditorSource).not.toMatch(/toggleCode/i)
    expect(richTextEditorSource).not.toMatch(/isHtmlMode/i)
    expect(richTextEditorSource).not.toMatch(/viewSource/i)

    // 3. Must use visual contentEditable editing surface
    expect(richTextEditorSource).toMatch(/contentEditable/i)
    expect(richTextEditorSource).toMatch(/role="textbox"/i)
  })

  it('has visual toolbar actions with Portuguese labels and accessibility attributes', () => {
    // Toolbar buttons in Portuguese
    expect(richTextEditorSource).toContain('aria-label="Negrito"')
    expect(richTextEditorSource).toContain('aria-label="Itálico"')
    expect(richTextEditorSource).toContain('aria-label="Sublinhado"')
    expect(richTextEditorSource).toContain('aria-label="Título 2 (H2)"')
    expect(richTextEditorSource).toContain('aria-label="Título 3 (H3)"')
    expect(richTextEditorSource).toContain('aria-label="Lista com marcadores"')
    expect(richTextEditorSource).toContain('aria-label="Lista numerada"')
    expect(richTextEditorSource).toContain('aria-label="Inserir link"')
    expect(richTextEditorSource).toContain('aria-label="Remover link"')
    expect(richTextEditorSource).toContain('aria-label="Limpar formatação"')
    expect(richTextEditorSource).toContain('aria-label="Desfazer"')
    expect(richTextEditorSource).toContain('aria-label="Refazer"')
    expect(richTextEditorSource).toContain('role="toolbar"')
  })

  it('provides a prompt-based modal dialog for inserting links instead of code input', () => {
    expect(richTextEditorSource).toContain('Inserir Link')
    expect(richTextEditorSource).toContain('Texto de Exibição')
    expect(richTextEditorSource).toContain('URL de Destino')
    expect(richTextEditorSource).toContain('createLink')
  })
})

describe('HTML Sanitization and Round-Trip Processing', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('preserves valid rich-text formatting tags (p, strong, em, u, h2, h3, ul, ol, li, a)', () => {
    const input =
      '<p>A <strong>Tasty Aromas e Sabores</strong> é referência <em>nacional</em> no fornecimento de aromas.</p>'
    const sanitized = sanitizeHtml(input)
    expect(sanitized).toBe(input)
  })

  it('preserves lists and headings formatting', () => {
    const input =
      '<h2>Nossos Diferenciais</h2><ul><li>Customização total</li><li>Qualidade certificada</li></ul><p>Consulte nossa equipe.</p>'
    const sanitized = sanitizeHtml(input)
    expect(sanitized).toBe(input)
  })

  it('preserves links with target and rel attributes while stripping dangerous javascript: urls', () => {
    const validLink = '<p><a href="https://tastyplus.com.br/produtos">Catálogo</a></p>'
    const sanitizedValid = sanitizeHtml(validLink)
    expect(sanitizedValid).toContain('href="https://tastyplus.com.br/produtos"')
    expect(sanitizedValid).toContain('rel="noopener noreferrer"')

    const dangerousLink = '<p><a href="javascript:alert(1)">Clique aqui</a></p>'
    const sanitizedDangerous = sanitizeHtml(dangerousLink)
    expect(sanitizedDangerous).not.toContain('javascript:')
  })

  it('strips script tags and inline event handlers', () => {
    const malicious =
      '<p>Texto com <script>alert("hack")</script><img src="x" onerror="alert(1)" /> visual.</p>'
    const sanitized = sanitizeHtml(malicious)
    expect(sanitized).not.toContain('<script>')
    expect(sanitized).not.toContain('onerror')
    expect(sanitized).toContain('Texto com')
    expect(sanitized).toContain('visual.')
  })

  it('handles empty, null, or undefined values safely', () => {
    expect(sanitizeHtml('')).toBe('')
    expect(sanitizeHtml(null)).toBe('')
    expect(sanitizeHtml(undefined)).toBe('')
  })
})

describe('Editor HTML Round-Trip Simulation', () => {
  it('loads existing stored HTML, retains formatting, and outputs equivalent HTML', () => {
    const initialStoredHtml =
      '<p>A <strong>Tasty Aromas e Sabores</strong> é líder no segmento.</p>'

    // Simulate what the contentEditable div does:
    const container = document.createElement('div')
    container.contentEditable = 'true'
    container.innerHTML = initialStoredHtml

    // User can read text without raw HTML code tags in textContent
    expect(container.textContent).toBe('A Tasty Aromas e Sabores é líder no segmento.')

    // Formatted tags are retained in DOM
    expect(container.querySelector('strong')?.textContent).toBe('Tasty Aromas e Sabores')

    // Extracted HTML matches initial stored value
    const savedHtml = container.innerHTML
    expect(savedHtml).toBe(initialStoredHtml)
  })

  it('executes formatting commands like bold on text range', () => {
    const container = document.createElement('div')
    container.contentEditable = 'true'
    container.innerHTML = '<p>Aroma Natural de Baunilha</p>'
    document.body.appendChild(container)

    // Select "Baunilha"
    const p = container.querySelector('p')!
    const range = document.createRange()
    range.setStart(p.firstChild!, 17)
    range.setEnd(p.firstChild!, 25)

    const sel = window.getSelection()!
    sel.removeAllRanges()
    sel.addRange(range)

    // Execute bold command
    document.execCommand('bold', false)

    // Confirm <b> or <strong> was created
    expect(container.innerHTML).toMatch(/<(strong|b)>Baunilha<\/(strong|b)>/)

    document.body.removeChild(container)
  })
})
