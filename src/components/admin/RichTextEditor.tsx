import { type JSX, useRef, useEffect, useCallback, useState, type MouseEvent } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Unlink,
  RemoveFormatting,
  Undo2,
  Redo2,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface RichTextEditorProps {
  id?: string
  label?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  rows?: number
  helperText?: string
  className?: string
}

/**
 * Normalizes empty content or default paragraph tags so the placeholder works reliably.
 */
function isContentEmpty(html: string): boolean {
  if (!html) return true
  const stripped = html.replace(/<[^>]*>/g, '').trim()
  return stripped.length === 0
}

export function RichTextEditor({
  id,
  label,
  value,
  onChange,
  disabled = false,
  placeholder = 'Digite ou cole o conteúdo formatado...',
  rows = 5,
  helperText,
  className,
}: RichTextEditorProps): JSX.Element {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const isComposingRef = useRef<boolean>(false)
  const lastEmittedValueRef = useRef<string>(value || '')
  const savedSelectionRef = useRef<Range | null>(null)

  // Active toolbar states
  const [activeMarks, setActiveMarks] = useState<{
    bold: boolean
    italic: boolean
    underline: boolean
    h2: boolean
    h3: boolean
    bulletList: boolean
    orderedList: boolean
  }>({
    bold: false,
    italic: false,
    underline: false,
    h2: false,
    h3: false,
    bulletList: false,
    orderedList: false,
  })

  // Link dialog state
  const [linkDialogOpen, setLinkDialogOpen] = useState<boolean>(false)
  const [linkUrl, setLinkUrl] = useState<string>('')
  const [linkText, setLinkText] = useState<string>('')

  // Sync incoming value prop with contentEditable DOM if it changes externally
  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    const normalizedIncoming = value ?? ''
    // Only update the innerHTML if it diverged from what was last emitted
    // to avoid resetting cursor position during active typing
    if (normalizedIncoming !== lastEmittedValueRef.current) {
      if (editor.innerHTML !== normalizedIncoming) {
        editor.innerHTML = normalizedIncoming
        lastEmittedValueRef.current = normalizedIncoming
      }
    }
  }, [value])

  // Initial populate
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && value) {
      editorRef.current.innerHTML = value
      lastEmittedValueRef.current = value
    }
  }, [value])

  const updateActiveMarks = useCallback(() => {
    if (typeof document === 'undefined') return
    try {
      const isBold = document.queryCommandState('bold')
      const isItalic = document.queryCommandState('italic')
      const isUnderline = document.queryCommandState('underline')
      const isBullet = document.queryCommandState('insertUnorderedList')
      const isOrdered = document.queryCommandState('insertOrderedList')

      // Check current block format for H2 / H3
      const block = (document.queryCommandValue('formatBlock') || '').toLowerCase()
      const isH2 = block === 'h2' || block.includes('h2')
      const isH3 = block === 'h3' || block.includes('h3')

      setActiveMarks({
        bold: isBold,
        italic: isItalic,
        underline: isUnderline,
        h2: isH2,
        h3: isH3,
        bulletList: isBullet,
        orderedList: isOrdered,
      })
    } catch {
      // Ignore queryCommand errors if unsupported
    }
  }, [])

  const saveSelection = useCallback(() => {
    if (typeof window === 'undefined') return
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0)
    }
  }, [])

  const restoreSelection = useCallback(() => {
    if (typeof window === 'undefined') return
    const sel = window.getSelection()
    if (sel && savedSelectionRef.current) {
      sel.removeAllRanges()
      sel.addRange(savedSelectionRef.current)
    }
  }, [])

  const emitChange = useCallback(() => {
    if (!editorRef.current) return
    let html = editorRef.current.innerHTML

    // Normalize empty placeholder markup like <p><br></p> or <div><br></div> to empty string
    if (isContentEmpty(html)) {
      html = ''
    }

    lastEmittedValueRef.current = html
    onChange(html)
    updateActiveMarks()
  }, [onChange, updateActiveMarks])

  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    if (disabled || !editorRef.current) return
    editorRef.current.focus()
    try {
      document.execCommand(command, false, arg)
    } catch {
      // ignore
    }
    emitChange()
  }

  const handleHeading = (tag: 'h2' | 'h3') => {
    if (disabled || !editorRef.current) return
    editorRef.current.focus()

    try {
      const currentBlock = (document.queryCommandValue('formatBlock') || '').toLowerCase()
      if (currentBlock.includes(tag)) {
        // Toggle off back to regular paragraph
        document.execCommand('formatBlock', false, '<p>')
      } else {
        document.execCommand('formatBlock', false, `<${tag}>`)
      }
    } catch {
      // Fallback
      document.execCommand('formatBlock', false, tag)
    }
    emitChange()
  }

  const handleOpenLinkDialog = (e: MouseEvent) => {
    e.preventDefault()
    if (disabled || !editorRef.current) return
    saveSelection()

    const sel = window.getSelection()
    const selectedText = sel ? sel.toString() : ''
    setLinkText(selectedText)
    setLinkUrl('')
    setLinkDialogOpen(true)
  }

  const handleApplyLink = () => {
    setLinkDialogOpen(false)
    if (!linkUrl.trim()) return

    editorRef.current?.focus()
    restoreSelection()

    let formattedUrl = linkUrl.trim()
    if (
      !/^https?:\/\//i.test(formattedUrl) &&
      !formattedUrl.startsWith('/') &&
      !formattedUrl.startsWith('#') &&
      !formattedUrl.startsWith('mailto:') &&
      !formattedUrl.startsWith('tel:')
    ) {
      formattedUrl = `https://${formattedUrl}`
    }

    if (linkText && savedSelectionRef.current && savedSelectionRef.current.collapsed) {
      // Insert new linked text if cursor had no selection
      const a = document.createElement('a')
      a.href = formattedUrl
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      a.textContent = linkText
      savedSelectionRef.current.insertNode(a)
    } else {
      document.execCommand('createLink', false, formattedUrl)
    }

    emitChange()
  }

  const handleRemoveFormatting = () => {
    if (disabled || !editorRef.current) return
    editorRef.current.focus()
    document.execCommand('removeFormat', false, undefined)
    document.execCommand('formatBlock', false, '<p>')
    emitChange()
  }

  // Calculate approximate minimum height based on rows prop (e.g. 3 rows ~ 90px, 4 rows ~ 120px, 6 rows ~ 180px)
  const minHeightStyle = {
    minHeight: `${Math.max(90, rows * 28)}px`,
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label htmlFor={id} className="text-sm font-semibold font-display text-foreground">
          {label}
        </Label>
      )}

      <div
        className={cn(
          'rounded-xl border border-input bg-card shadow-sm transition-all duration-200',
          'focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20',
          disabled && 'opacity-60 cursor-not-allowed bg-muted/30',
        )}
      >
        {/* Toolbar */}
        <TooltipProvider delayDuration={200}>
          <div
            role="toolbar"
            aria-label="Barra de ferramentas de formatação"
            className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 p-1.5 rounded-t-xl"
          >
            {/* Negrito */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  aria-label="Negrito"
                  aria-pressed={activeMarks.bold}
                  onClick={() => executeCommand('bold')}
                  className={cn(
                    'h-8 w-8 p-0 text-foreground/80 hover:text-foreground hover:bg-muted font-display',
                    activeMarks.bold && 'bg-primary/10 text-primary dark:text-accent font-bold',
                  )}
                >
                  <Bold className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Negrito (Ctrl+B)</TooltipContent>
            </Tooltip>

            {/* Itálico */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  aria-label="Itálico"
                  aria-pressed={activeMarks.italic}
                  onClick={() => executeCommand('italic')}
                  className={cn(
                    'h-8 w-8 p-0 text-foreground/80 hover:text-foreground hover:bg-muted font-display',
                    activeMarks.italic && 'bg-primary/10 text-primary dark:text-accent font-bold',
                  )}
                >
                  <Italic className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Itálico (Ctrl+I)</TooltipContent>
            </Tooltip>

            {/* Sublinhado */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  aria-label="Sublinhado"
                  aria-pressed={activeMarks.underline}
                  onClick={() => executeCommand('underline')}
                  className={cn(
                    'h-8 w-8 p-0 text-foreground/80 hover:text-foreground hover:bg-muted font-display',
                    activeMarks.underline &&
                      'bg-primary/10 text-primary dark:text-accent font-bold',
                  )}
                >
                  <UnderlineIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Sublinhado (Ctrl+U)</TooltipContent>
            </Tooltip>

            <div className="h-4 w-px bg-border mx-1" aria-hidden="true" />

            {/* Título H2 */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  aria-label="Título 2 (H2)"
                  aria-pressed={activeMarks.h2}
                  onClick={() => handleHeading('h2')}
                  className={cn(
                    'h-8 px-2 text-xs font-display font-semibold text-foreground/80 hover:text-foreground hover:bg-muted',
                    activeMarks.h2 && 'bg-primary/10 text-primary dark:text-accent font-bold',
                  )}
                >
                  <Heading2 className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">H2</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Título Secundário (H2)</TooltipContent>
            </Tooltip>

            {/* Título H3 */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  aria-label="Título 3 (H3)"
                  aria-pressed={activeMarks.h3}
                  onClick={() => handleHeading('h3')}
                  className={cn(
                    'h-8 px-2 text-xs font-display font-semibold text-foreground/80 hover:text-foreground hover:bg-muted',
                    activeMarks.h3 && 'bg-primary/10 text-primary dark:text-accent font-bold',
                  )}
                >
                  <Heading3 className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">H3</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Subtítulo (H3)</TooltipContent>
            </Tooltip>

            <div className="h-4 w-px bg-border mx-1" aria-hidden="true" />

            {/* Lista com Marcadores */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  aria-label="Lista com marcadores"
                  aria-pressed={activeMarks.bulletList}
                  onClick={() => executeCommand('insertUnorderedList')}
                  className={cn(
                    'h-8 w-8 p-0 text-foreground/80 hover:text-foreground hover:bg-muted',
                    activeMarks.bulletList &&
                      'bg-primary/10 text-primary dark:text-accent font-bold',
                  )}
                >
                  <List className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Lista com Marcadores</TooltipContent>
            </Tooltip>

            {/* Lista Numerada */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  aria-label="Lista numerada"
                  aria-pressed={activeMarks.orderedList}
                  onClick={() => executeCommand('insertOrderedList')}
                  className={cn(
                    'h-8 w-8 p-0 text-foreground/80 hover:text-foreground hover:bg-muted',
                    activeMarks.orderedList &&
                      'bg-primary/10 text-primary dark:text-accent font-bold',
                  )}
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Lista Numerada</TooltipContent>
            </Tooltip>

            <div className="h-4 w-px bg-border mx-1" aria-hidden="true" />

            {/* Inserir Link */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  aria-label="Inserir link"
                  onClick={handleOpenLinkDialog}
                  className="h-8 w-8 p-0 text-foreground/80 hover:text-foreground hover:bg-muted"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Inserir Link</TooltipContent>
            </Tooltip>

            {/* Remover Link */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  aria-label="Remover link"
                  onClick={() => executeCommand('unlink')}
                  className="h-8 w-8 p-0 text-foreground/80 hover:text-foreground hover:bg-muted"
                >
                  <Unlink className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Remover Link</TooltipContent>
            </Tooltip>

            {/* Limpar formatação */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  aria-label="Limpar formatação"
                  onClick={handleRemoveFormatting}
                  className="h-8 w-8 p-0 text-foreground/80 hover:text-foreground hover:bg-muted"
                >
                  <RemoveFormatting className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Remover Formatação</TooltipContent>
            </Tooltip>

            <div className="flex-1" />

            {/* Desfazer */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  aria-label="Desfazer"
                  onClick={() => executeCommand('undo')}
                  className="h-8 w-8 p-0 text-foreground/80 hover:text-foreground hover:bg-muted"
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Desfazer (Ctrl+Z)</TooltipContent>
            </Tooltip>

            {/* Refazer */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  aria-label="Refazer"
                  onClick={() => executeCommand('redo')}
                  className="h-8 w-8 p-0 text-foreground/80 hover:text-foreground hover:bg-muted"
                >
                  <Redo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Refazer (Ctrl+Y)</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        {/* Visual Editing Surface (WYSIWYG contentEditable) - Strictly NO raw HTML textarea */}
        <div className="relative">
          <div
            id={id || 'rich-text-editor'}
            ref={editorRef}
            role="textbox"
            aria-multiline="true"
            aria-label={label || 'Editor de texto formatado'}
            contentEditable={!disabled}
            suppressContentEditableWarning
            onInput={emitChange}
            onKeyUp={updateActiveMarks}
            onMouseUp={updateActiveMarks}
            onCompositionStart={() => {
              isComposingRef.current = true
            }}
            onCompositionEnd={() => {
              isComposingRef.current = false
              emitChange()
            }}
            onPaste={(e) => {
              // Standard paste works natively, then we emit change
              setTimeout(emitChange, 0)
            }}
            style={minHeightStyle}
            className={cn(
              'w-full p-3.5 text-sm sm:text-base text-foreground font-sans leading-relaxed focus:outline-none',
              'prose prose-sm dark:prose-invert max-w-none',
              '[&_p]:mb-2 [&_p:last-child]:mb-0',
              '[&_h2]:text-xl [&_h2]:font-display [&_h2]:font-bold [&_h2]:text-primary dark:[&_h2]:text-foreground [&_h2]:mb-2',
              '[&_h3]:text-lg [&_h3]:font-display [&_h3]:font-semibold [&_h3]:text-primary dark:[&_h3]:text-foreground [&_h3]:mb-1.5',
              '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2',
              '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2',
              '[&_li]:mb-0.5',
              '[&_a]:text-accent [&_a]:underline [&_a]:hover:text-accent-dark',
              '[&_strong]:font-bold [&_em]:italic [&_u]:underline',
            )}
          />

          {/* Clean placeholder overlay when empty */}
          {(!value || isContentEmpty(value)) && (
            <div
              onClick={() => editorRef.current?.focus()}
              className="absolute left-3.5 top-3.5 text-sm text-muted-foreground/70 pointer-events-none select-none"
            >
              {placeholder}
            </div>
          )}
        </div>
      </div>

      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}

      {/* Inserir/Editar Link Modal */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display font-bold">Inserir Link</DialogTitle>
            <DialogDescription>
              Informe o endereço web (URL) para redirecionar o leitor ao clicar no texto.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="link-text" className="text-xs font-semibold">
                Texto de Exibição
              </Label>
              <Input
                id="link-text"
                placeholder="Ex: Saiba mais aqui"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="link-url" className="text-xs font-semibold">
                URL de Destino *
              </Label>
              <Input
                id="link-url"
                placeholder="https://exemplo.com.br"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleApplyLink()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleApplyLink}
              disabled={!linkUrl.trim()}
              className="bg-accent text-accent-foreground hover:bg-accent-dark"
            >
              Inserir Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
