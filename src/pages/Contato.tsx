import type { JSX } from 'react'
import { PagePlaceholder } from '@/components/PagePlaceholder'

export default function Contato(): JSX.Element {
  return (
    <PagePlaceholder
      title="Contato"
      subtitle="Fale conosco para pedidos, orçamentos e amostras grátis"
      extraContent={
        <div className="space-y-1 text-xs md:text-sm">
          <p>Fixo: 21 2658-3517 | Vendas: 21 98883-1253</p>
          <p>E-mail: tasty@tastyplus.com.br</p>
        </div>
      }
    />
  )
}
