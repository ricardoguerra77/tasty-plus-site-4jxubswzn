import pb from '@/lib/pocketbase/client'

export type ProductCategory = 'Aroma' | 'Extrato' | 'Aditivo' | 'Corante' | 'Outro'

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Aroma',
  'Extrato',
  'Aditivo',
  'Corante',
  'Outro',
]

export interface Product {
  id: string
  name: string
  category: ProductCategory
  description?: string
  image?: string
  order?: number
  published: boolean
  created?: string
  updated?: string
}

export type ProductInput = {
  name: string
  category: ProductCategory
  description?: string
  image?: File | string | null
  order?: number
  published: boolean
}

export async function listProducts(options?: { all?: boolean; sort?: string }): Promise<Product[]> {
  const filter = options?.all ? '' : 'published = true'
  const records = await pb.collection('products').getFullList<Product>({
    filter,
    sort: options?.sort ?? 'order,created',
    requestKey: null,
  })
  return records
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const formData = new FormData()
  formData.append('name', input.name)
  formData.append('category', input.category)
  formData.append('description', input.description || '')
  formData.append('order', String(input.order ?? 0))
  formData.append('published', String(input.published))

  if (input.image instanceof File) {
    formData.append('image', input.image)
  }

  return await pb.collection('products').create<Product>(formData)
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<Product> {
  const formData = new FormData()
  if (input.name !== undefined) formData.append('name', input.name)
  if (input.category !== undefined) formData.append('category', input.category)
  if (input.description !== undefined) formData.append('description', input.description)
  if (input.order !== undefined) formData.append('order', String(input.order))
  if (input.published !== undefined) formData.append('published', String(input.published))

  if (input.image instanceof File) {
    formData.append('image', input.image)
  } else if (input.image === null) {
    formData.append('image', '')
  }

  return await pb.collection('products').update<Product>(id, formData)
}

export async function deleteProduct(id: string): Promise<void> {
  await pb.collection('products').delete(id)
}
