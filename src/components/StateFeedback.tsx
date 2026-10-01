import type { JSX, ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface StateFeedbackProps {
  icon?: ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function StateFeedback({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: StateFeedbackProps): JSX.Element {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 border border-dashed border-border rounded-xl bg-card/40 my-6 ${className}`}
    >
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-md mb-6">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="default" className="font-semibold">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
