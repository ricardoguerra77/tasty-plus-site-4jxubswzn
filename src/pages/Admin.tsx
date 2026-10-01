import type { JSX } from 'react'
import { PagePlaceholder } from '@/components/PagePlaceholder'

export default function Admin(): JSX.Element {
  return (
    <PagePlaceholder
      title="Admin"
      subtitle="Painel de controle institucional Tasty Plus"
      extraContent={<p className="text-muted-foreground">[Módulos administrativos em breve]</p>}
    />
  )
}
