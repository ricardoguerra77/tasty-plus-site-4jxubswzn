/* Placeholder page component for Tasty Plus routes */
import type { JSX, ReactNode } from 'react'

interface PagePlaceholderProps {
  title: string
  subtitle?: string
  extraContent?: ReactNode
}

export function PagePlaceholder({
  title,
  subtitle,
  extraContent,
}: PagePlaceholderProps): JSX.Element {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 md:py-12 animate-fade-in">
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="text-base md:text-lg text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="rounded-xl border-2 border-dashed border-border bg-card/60 p-8 md:p-14 text-center transition-all">
        <div className="max-w-md mx-auto space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary text-primary font-semibold text-lg">
            TP
          </div>
          <p className="text-base text-muted-foreground font-medium">(Conteúdo em breve)</p>
          {extraContent && <div className="pt-2 text-sm text-muted-foreground">{extraContent}</div>}
        </div>
      </div>
    </div>
  )
}
export default PagePlaceholder
