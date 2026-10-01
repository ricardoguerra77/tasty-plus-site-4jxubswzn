import type { JSX } from 'react'
import { PagePlaceholder } from '@/components/PagePlaceholder'

export default function Login(): JSX.Element {
  return (
    <PagePlaceholder
      title="Login"
      subtitle="Acesso restrito à área interna e administrativa"
      extraContent={<p className="text-muted-foreground">[Formulário de autenticação em breve]</p>}
    />
  )
}
