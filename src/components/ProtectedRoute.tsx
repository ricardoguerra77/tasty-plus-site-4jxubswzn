import { type ReactNode, type JSX } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, type UserRole } from '@/hooks/useAuth'

export interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: UserRole
  allowedRoles?: UserRole[]
}

/**
 * Route guard component that enforces authentication and role-based authorization.
 * Redirects unauthenticated users to /login, preserving target URL in location state.
 * Redirects authenticated users without insufficient role permissions to /login (or /).
 */
export function ProtectedRoute({
  children,
  requiredRole,
  allowedRoles,
}: ProtectedRouteProps): JSX.Element {
  const { user, isValid } = useAuth()
  const location = useLocation()

  if (!isValid || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // Super admin inherits full access to all protected routes
  const isSuperAdmin = user.role === 'super_admin'

  if (requiredRole && user.role !== requiredRole && !isSuperAdmin) {
    // If user lacks required role and is not super_admin, redirect to /login
    return <Navigate to="/login" replace />
  }

  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role) &&
    !isSuperAdmin
  ) {
    // If user's role is not in allowedRoles and is not super_admin, redirect to /login
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
