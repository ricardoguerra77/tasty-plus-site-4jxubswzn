import type { JSX } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export function Layout(): JSX.Element {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors">
      <Header />
      {/* Page content padding-top to clear the fixed header (pt-20 on mobile, pt-24 on desktop) */}
      <main className="flex-1 pt-20 lg:pt-24 pb-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Layout
