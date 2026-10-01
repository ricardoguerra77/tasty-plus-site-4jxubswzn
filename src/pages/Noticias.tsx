import type { JSX } from 'react'
import { PagePlaceholder } from '@/components/PagePlaceholder'

export default function Noticias(): JSX.Element {
  return (
    <PagePlaceholder
      title="Notícias"
      subtitle="Lançamentos, feiras do setor e novidades da Tasty Aromas e Sabores"
      extraContent={<p className="text-muted-foreground">[Publicações e comunicados em breve]</p>}
    />
  )
}
