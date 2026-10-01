import { type JSX } from 'react'
import { TabNews } from '@/components/admin/TabNews'

export default function AdminNoticias(): JSX.Element {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Gerenciador de Notícias
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Área de edição e publicação de comunicados e artigos para editores e administradores.
        </p>
      </div>

      <TabNews />
    </div>
  )
}
