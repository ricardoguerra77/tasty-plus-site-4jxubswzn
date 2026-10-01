import type { JSX } from 'react'
import { useParams } from 'react-router-dom'
import { PagePlaceholder } from '@/components/PagePlaceholder'

export default function NoticiaDetalhe(): JSX.Element {
  const { id } = useParams<{ id: string }>()
  const safeId = id ?? ''

  return (
    <PagePlaceholder
      title={safeId ? `Notícia #${safeId}` : 'Notícia'}
      subtitle="Publicação Tasty Aromas e Sabores"
      extraContent={
        <p className="text-muted-foreground">[Conteúdo completo da notícia em breve]</p>
      }
    />
  )
}
