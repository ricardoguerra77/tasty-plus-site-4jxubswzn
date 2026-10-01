/* Main App Component - Handles routing (using react-router-dom) with lazy loading and ErrorBoundary */
import { Suspense, type JSX } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from '@/components/Layout'
import ErrorBoundary from '@/components/ErrorBoundary'
import LoadingSpinner from '@/components/LoadingSpinner'
import ProtectedRoute from '@/components/ProtectedRoute'
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
                const content = (
                  <Suspense fallback={<LoadingSpinner />}>
                    <LazyComponent />
                  </Suspense>
                )

                const isRoot = route.path === '/'
                const relativePath = isRoot ? undefined : route.path.replace(/^\//, '')

                if (route.requiredRole || route.allowedRoles) {
                  return isRoot ? (
                    <Route
                      key={route.path}
                      index
                      element={
                        <ProtectedRoute
                          requiredRole={route.requiredRole}
                          allowedRoles={route.allowedRoles}
                        >
                          {content}
                        </ProtectedRoute>
                      }
                    />
                  ) : (
                    <Route
                      key={route.path}
                      path={relativePath}
                      element={
                        <ProtectedRoute
                          requiredRole={route.requiredRole}
                          allowedRoles={route.allowedRoles}
                        >
                          {content}
                        </ProtectedRoute>
                      }
                    />
                  )
                }

                return isRoot ? (
                  <Route key={route.path} index element={content} />
                ) : (
                  <Route key={route.path} path={relativePath} element={content} />
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
