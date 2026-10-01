import type { JSX } from 'react'

export function LoadingSpinner(): JSX.Element {
  return (
    <div className="flex-1 min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-4 animate-fade-in">
      <div
        className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"
        role="status"
        aria-label="Carregando..."
      />
      <p className="text-sm font-medium text-muted-foreground">Carregando...</p>
    </div>
  )
}

export default LoadingSpinner
