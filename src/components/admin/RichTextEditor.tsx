import { type JSX, type ChangeEvent } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Bold, Italic, List, Heading, Code } from 'lucide-react'

interface RichTextEditorProps {
  id?: string
  label?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  rows?: number
  helperText?: string
}

export function RichTextEditor({
  id,
  label,
  value,
  onChange,
  disabled = false,
  placeholder = 'Escreva o conteúdo formatado em HTML...',
  rows = 5,
  helperText,
}: RichTextEditorProps): JSX.Element {
  const insertTag = (openTag: string, closeTag: string): void => {
    const textarea = document.getElementById(id || 'rich-text-area') as HTMLTextAreaElement | null
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const replacement = `${openTag}${selectedText || 'texto'}${closeTag}`

    const newValue = value.substring(0, start) + replacement + value.substring(end)
    onChange(newValue)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + openTag.length,
        start + openTag.length + (selectedText.length || 5),
      )
    }, 10)
  }

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    onChange(e.target.value)
  }

  return (
    <div className="space-y-1.5">
      {label && (
        <Label htmlFor={id} className="text-sm font-semibold">
          {label}
        </Label>
      )}

      <div className="rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 p-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => insertTag('<strong>', '</strong>')}
            className="h-7 px-2 text-xs"
            title="Negrito"
          >
            <Bold className="h-3.5 w-3.5 mr-1" />
            <span className="sr-only md:not-sr-only">Negrito</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => insertTag('<em>', '</em>')}
            className="h-7 px-2 text-xs"
            title="Itálico"
          >
            <Italic className="h-3.5 w-3.5 mr-1" />
            <span className="sr-only md:not-sr-only">Itálico</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => insertTag('<h3>', '</h3>')}
            className="h-7 px-2 text-xs"
            title="Título"
          >
            <Heading className="h-3.5 w-3.5 mr-1" />
            <span className="sr-only md:not-sr-only">Título</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>')}
            className="h-7 px-2 text-xs"
            title="Lista com marcadores"
          >
            <List className="h-3.5 w-3.5 mr-1" />
            <span className="sr-only md:not-sr-only">Lista</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => insertTag('<p>', '</p>')}
            className="h-7 px-2 text-xs"
            title="Parágrafo"
          >
            <Code className="h-3.5 w-3.5 mr-1" />
            <span className="sr-only md:not-sr-only">Parágrafo</span>
          </Button>
        </div>

        <textarea
          id={id || 'rich-text-area'}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          rows={rows}
          className="w-full resize-y bg-transparent p-3 text-sm font-mono placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
    </div>
  )
}
