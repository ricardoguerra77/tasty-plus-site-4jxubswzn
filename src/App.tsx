/* Main App Component - Handles routing (using react-router-dom) with lazy loading and ErrorBoundary */
import { Suspense, type JSX } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from '@/components/Layout'
import ErrorBoundary from '@/components/ErrorBoundary'
import LoadingSpinner from '@/components/LoadingSpinner'
import NotFound from '@/pages/NotFound'
import { routesConfig } from '@/config/navigation'

export function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route element={<Layout />}>
              {routesConfig.map((route) => {
                const LazyComponent = route.lazyComponent
                return (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <LazyComponent />
                      </Suspense>
                    }
                  />
                )
              })}
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
