import pb from '@/lib/pocketbase/client'

export interface NewsArticle {
  id: string
  title: string
  slug: string
  excerpt?: string
  body: string
  image?: string
  author?: string
  publishedAt?: string
  published: boolean
  createdBy?: string
  created?: string
  updated?: string
}

export type NewsArticleInput = {
  title: string
  slug: string
  excerpt?: string
  body: string
  image?: File | string | null
  author?: string
  publishedAt?: string
  published: boolean
}

export async function listNews(options?: { all?: boolean; sort?: string }): Promise<NewsArticle[]> {
  const filter = options?.all ? '' : 'published = true'
  const records = await pb.collection('news').getFullList<NewsArticle>({
    filter,
    sort: options?.sort ?? '-publishedAt,-created',
    requestKey: null,
  })
  return records
}

export async function getNewsBySlug(
  slug: string,
  options?: { publicOnly?: boolean },
): Promise<NewsArticle | null> {
  try {
    // If publicOnly is requested, enforce published = true in the filter
    const baseFilter = `slug = "${slug}"`
    const filter = options?.publicOnly ? `${baseFilter} && published = true` : baseFilter
    const record = await pb.collection('news').getFirstListItem<NewsArticle>(filter, {
      requestKey: null,
    })
    if (options?.publicOnly && !record.published) {
      return null
    }
    return record
  } catch {
    return null
  }
}

export async function getNewsById(
  id: string,
  options?: { publicOnly?: boolean },
): Promise<NewsArticle | null> {
  try {
    const record = await pb.collection('news').getOne<NewsArticle>(id, {
      requestKey: null,
    })
    if (options?.publicOnly && !record.published) {
      return null
    }
    return record
  } catch {
    return null
  }
}

export async function createNews(input: NewsArticleInput): Promise<NewsArticle> {
  const formData = new FormData()
  formData.append('title', input.title)
  formData.append('slug', input.slug)
  formData.append('body', input.body)
  formData.append('published', String(input.published))

  if (input.excerpt) formData.append('excerpt', input.excerpt)
  if (input.author) formData.append('author', input.author)
  if (input.publishedAt) formData.append('publishedAt', input.publishedAt)

  if (pb.authStore.record?.id) {
    formData.append('createdBy', pb.authStore.record.id)
  }

  if (input.image instanceof File) {
    formData.append('image', input.image)
  }

  return await pb.collection('news').create<NewsArticle>(formData)
}

export async function updateNews(
  id: string,
  input: Partial<NewsArticleInput>,
): Promise<NewsArticle> {
  const formData = new FormData()
  if (input.title !== undefined) formData.append('title', input.title)
  if (input.slug !== undefined) formData.append('slug', input.slug)
  if (input.excerpt !== undefined) formData.append('excerpt', input.excerpt)
  if (input.body !== undefined) formData.append('body', input.body)
  if (input.author !== undefined) formData.append('author', input.author)
  if (input.publishedAt !== undefined) formData.append('publishedAt', input.publishedAt)
  if (input.published !== undefined) formData.append('published', String(input.published))

  if (input.image instanceof File) {
    formData.append('image', input.image)
  } else if (input.image === null) {
    formData.append('image', '')
  }

  return await pb.collection('news').update<NewsArticle>(id, formData)
}

export async function deleteNews(id: string): Promise<void> {
  await pb.collection('news').delete(id)
}
