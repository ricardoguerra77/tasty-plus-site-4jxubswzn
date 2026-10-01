/* 404 Page - Displays when a user attempts to access a non-existent route - translate to the language of the user */
import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-background">
      <div className="text-center max-w-md mx-auto space-y-4">
        <h1 className="font-display text-7xl font-extrabold text-accent tracking-tight">404</h1>
        <h2 className="font-display text-2xl font-bold text-primary">Página não encontrada</h2>
        <p className="text-muted-foreground text-sm">
          A rota solicitada ({location.pathname}) não existe ou foi movida.
        </p>
        <div className="pt-2">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-2.5 text-sm font-display font-bold text-accent-foreground shadow-md hover:bg-accent-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Voltar para o Início
          </a>
        </div>
      </div>
    </div>
  )
}

export default NotFound
