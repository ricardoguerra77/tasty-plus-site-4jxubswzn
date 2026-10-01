import type { JSX } from 'react'
import { PagePlaceholder } from '@/components/PagePlaceholder'

export default function AdminNoticias(): JSX.Element {
  return (
    <PagePlaceholder
      title="Admin — Notícias"
      subtitle="Gerenciamento e publicação de notícias e comunicados"
      extraContent={
        <p className="text-muted-foreground">[Painel de cadastro de notícias em breve]</p>
      }
    />
  )
}
