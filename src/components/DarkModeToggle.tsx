import { useEffect, useState, type JSX } from 'react'
import { Sun, Moon } from 'lucide-react'
import { getTheme, toggleTheme, type Theme } from '@/lib/theme'

export function DarkModeToggle({ className }: { className?: string }): JSX.Element {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState<boolean>(false)

  useEffect(() => {
    setTheme(getTheme())
    setMounted(true)
  }, [])

  const handleToggle = (): void => {
    const next = toggleTheme()
    setTheme(next)
  }

  const isDark = mounted && theme === 'dark'

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      title={isDark ? 'Modo claro' : 'Modo escuro'}
      className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-card/80 text-foreground hover:bg-secondary/80 hover:text-primary transition-colors cursor-pointer ${className ?? ''}`}
    >
      {isDark ? (
        <Sun className="w-5 h-5 transition-transform" />
      ) : (
        <Moon className="w-5 h-5 transition-transform" />
      )}
    </button>
  )
}

export default DarkModeToggle
