import { prisma } from './db'
import { slugify } from './security'

export async function connectTags(tags: string[]) {
  const clean = [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))].slice(0, 10)

  return Promise.all(
    clean.map(async (name) => {
      const slug = slugify(name)
      const tag = await prisma.tag.upsert({
        where: { slug },
        update: { name },
        create: { name, slug }
      })
      return { tagId: tag.id }
    })
  )
}
