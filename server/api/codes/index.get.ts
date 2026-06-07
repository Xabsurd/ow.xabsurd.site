import { getQuery } from 'h3'
import type { Prisma } from '@prisma/client'
import { prisma } from '../../utils/db'
import { apiError, zodDetails } from '../../utils/errors'
import { slugify } from '../../utils/security'
import { codeQuerySchema } from '../../validation/code'

export default defineEventHandler(async (event) => {
  const parsed = codeQuerySchema.safeParse(getQuery(event))
  if (!parsed.success) throw apiError(400, 'VALIDATION_ERROR', 'Invalid query', zodDetails(parsed.error))

  const { page, pageSize, keyword, sort, tags, ...filters } = parsed.data
  const where: Prisma.WorkshopCodeWhereInput = {
    status: 'APPROVED',
    type: filters.type || undefined,
    difficulty: filters.difficulty || undefined,
    mapName: filters.mapName ? { contains: filters.mapName, mode: 'insensitive' } : undefined,
    OR: keyword
      ? [
          { title: { contains: keyword, mode: 'insensitive' } },
          { workshopCode: { contains: keyword, mode: 'insensitive' } },
          { authorName: { contains: keyword, mode: 'insensitive' } }
        ]
      : undefined,
    tags: tags
      ? {
          some: {
            tag: { slug: { in: tags.split(',').map((tag) => slugify(tag)).filter(Boolean) } }
          }
        }
      : undefined
  }
  const orderBy =
    sort === 'views'
      ? { viewCount: 'desc' as const }
      : sort === 'favorites'
        ? { favoriteCount: 'desc' as const }
        : sort === 'hot'
          ? [{ favoriteCount: 'desc' as const }, { viewCount: 'desc' as const }]
          : { createdAt: 'desc' as const }

  const [items, total] = await Promise.all([
    prisma.workshopCode.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        workshopCode: true,
        title: true,
        type: true,
        difficulty: true,
        mapName: true,
        authorName: true,
        viewCount: true,
        favoriteCount: true,
        createdAt: true,
        tags: { select: { tag: { select: { name: true, slug: true } } } },
        genjiPk: { select: { levelCount: true, timerSupported: true, beginnerFriendly: true } }
      }
    }),
    prisma.workshopCode.count({ where })
  ])

  return { items, total, page, pageSize }
})
