import type { JSX } from 'react'
import { PagePlaceholder } from '@/components/PagePlaceholder'

export default function Home(): JSX.Element {
  return (
    <PagePlaceholder
      title="Início"
      subtitle="A fórmula certa para a sua empresa — Tasty Aromas e Sabores"
      extraContent={
        <p className="italic text-primary">[Sobre a Tasty Plus — texto institucional em breve]</p>
      }
    />
  )
}
