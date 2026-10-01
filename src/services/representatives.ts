import pb from '@/lib/pocketbase/client'

export type RepresentativeRole = 'Representante' | 'Representante Distribuidor'

export const REPRESENTATIVE_ROLES: RepresentativeRole[] = [
  'Representante',
  'Representante Distribuidor',
]

export interface Representative {
  id: string
  name: string
  region: string
  role: RepresentativeRole
  phone?: string
  whatsapp?: string
  order?: number
  created?: string
  updated?: string
}

export type RepresentativeInput = {
  name: string
  region: string
  role: RepresentativeRole
  phone?: string
  whatsapp?: string
  order?: number
}

export async function listRepresentatives(options?: { sort?: string }): Promise<Representative[]> {
  const records = await pb.collection('representatives').getFullList<Representative>({
    sort: options?.sort ?? 'order,created',
    requestKey: null,
  })
  return records
}

export async function createRepresentative(input: RepresentativeInput): Promise<Representative> {
  return await pb.collection('representatives').create<Representative>(input)
}

export async function updateRepresentative(
  id: string,
  input: Partial<RepresentativeInput>,
): Promise<Representative> {
  return await pb.collection('representatives').update<Representative>(id, input)
}

export async function deleteRepresentative(id: string): Promise<void> {
  await pb.collection('representatives').delete(id)
}
