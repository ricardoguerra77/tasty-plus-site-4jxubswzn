import type { JSX } from 'react'
import { PagePlaceholder } from '@/components/PagePlaceholder'

export default function Produtos(): JSX.Element {
  return (
    <PagePlaceholder
      title="Produtos"
      subtitle="Linhas de concentrados e aromas para bebidas e confeitaria"
      extraContent={<p className="font-medium text-accent">[Catálogo de produtos em breve]</p>}
    />
  )
}
