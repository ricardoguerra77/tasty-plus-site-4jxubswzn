import type { JSX } from 'react'
import { PagePlaceholder } from '@/components/PagePlaceholder'

export default function Representantes(): JSX.Element {
  return (
    <PagePlaceholder
      title="Representantes"
      subtitle="Rede de atendimento e distribuição Tasty Plus em todo o Brasil"
      extraContent={
        <p className="text-muted-foreground">
          [Lista e contatos de representantes regionais em breve]
        </p>
      }
    />
  )
}
