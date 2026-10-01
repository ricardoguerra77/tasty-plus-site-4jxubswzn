import { useState, useRef, type ChangeEvent, type JSX } from 'react'
import { validateImageFile, MAX_IMAGE_SIZE_BYTES } from '@/lib/validation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'

interface ImageUploaderProps {
  label: string
  helperText?: string
  currentImageUrl?: string
  onFileSelect: (file: File | null) => void
  disabled?: boolean
  maxSizeBytes?: number
  previewAspect?: 'square' | 'video' | 'banner'
}

export function ImageUploader({
  label,
  helperText,
  currentImageUrl,
  onFileSelect,
  disabled = false,
  maxSizeBytes = MAX_IMAGE_SIZE_BYTES,
  previewAspect = 'square',
}: ImageUploaderProps): JSX.Element {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isMarkedForRemoval, setIsMarkedForRemoval] = useState<boolean>(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    setErrorMessage(null)

    if (!file) {
      return
    }

    const validation = validateImageFile(file, { maxSizeBytes })
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Arquivo inválido.')
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    setIsMarkedForRemoval(false)
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    onFileSelect(file)
  }

  const handleClear = (): void => {
    setPreviewUrl(null)
    setErrorMessage(null)
    setIsMarkedForRemoval(true)
    if (inputRef.current) inputRef.current.value = ''
    onFileSelect(null)
  }

  const activeDisplayUrl = !isMarkedForRemoval ? previewUrl || currentImageUrl : null

  const aspectClass =
    previewAspect === 'video'
      ? 'aspect-video w-full'
      : previewAspect === 'banner'
        ? 'aspect-[21/9] w-full'
        : 'h-28 w-28'

  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold">{label}</Label>
      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}

      <div className="flex flex-wrap items-center gap-4">
        {activeDisplayUrl ? (
          <div
            className={`relative overflow-hidden rounded-md border bg-muted/20 flex items-center justify-center ${aspectClass}`}
          >
            <img
              src={activeDisplayUrl}
              alt={label}
              className="h-full w-full object-cover object-center"
            />
            {!disabled && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Remover imagem"
                className="absolute top-1 right-1 rounded-full bg-destructive p-1 text-white shadow-sm hover:bg-destructive/90 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div
            className={`flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/10 text-muted-foreground ${aspectClass}`}
          >
            <ImageIcon className="h-6 w-6 mb-1 text-muted-foreground/60" />
            <span className="text-xs">Sem imagem</span>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
            id={`file-input-${label.replace(/\s+/g, '-').toLowerCase()}`}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            <span>{activeDisplayUrl ? 'Alterar Imagem' : 'Selecionar Imagem'}</span>
          </Button>
          <span className="text-[11px] text-muted-foreground">
            PNG, JPG, WebP ou SVG (máx. 5MB)
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-1.5 text-xs text-destructive mt-1 font-medium">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  )
}
