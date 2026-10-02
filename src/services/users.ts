import pb from '@/lib/pocketbase/client'
import type { UserRole } from '@/hooks/useAuth'

export interface ManagedUser {
  id: string
  name: string
  email: string
  role: UserRole
  created: string
  updated: string
  verified: boolean
}

export interface CreateUserInput {
  name: string
  email: string
  password: string
  passwordConfirm: string
  role: 'admin' | 'editor'
}

export interface UpdateUserInput {
  name?: string
  role?: 'admin' | 'editor'
}

/**
 * List all users. Only super_admin is authorized by PocketBase collection rules and server hook.
 */
export async function listUsers(): Promise<ManagedUser[]> {
  const records = await pb.collection('users').getFullList<ManagedUser>({
    sort: '-created',
    requestKey: null,
  })
  return records
}

/**
 * Create a new user with role 'admin' or 'editor'.
 * PocketBase collection rules + user_management_security hook reject 'super_admin' or non-super_admin callers.
 */
export async function createUser(data: CreateUserInput): Promise<ManagedUser> {
  const record = await pb.collection('users').create<ManagedUser>(
    {
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password,
      passwordConfirm: data.passwordConfirm,
      role: data.role,
      emailVisibility: true,
    },
    { requestKey: null },
  )
  return record
}

/**
 * Update a user's name or role.
 */
export async function updateUser(id: string, data: UpdateUserInput): Promise<ManagedUser> {
  const payload: Record<string, unknown> = {}
  if (data.name !== undefined) payload.name = data.name.trim()
  if (data.role !== undefined) payload.role = data.role

  const record = await pb.collection('users').update<ManagedUser>(id, payload, {
    requestKey: null,
  })
  return record
}

/**
 * Delete a user by ID.
 */
export async function deleteUser(id: string): Promise<boolean> {
  await pb.collection('users').delete(id, { requestKey: null })
  return true
}
