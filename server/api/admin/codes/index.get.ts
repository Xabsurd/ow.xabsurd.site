import { getQuery } from 'h3'
import type { Prisma } from '@prisma/client'
import { prisma } from '../../../utils/db'
import { requireModerator } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireModerator(event)
  const query = getQuery(event)
  const keyword = typeof query.keyword === 'string' ? query.keyword.trim() : ''
  const where: Prisma.WorkshopCodeWhereInput = keyword
    ? {
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { workshopCode: { contains: keyword, mode: 'insensitive' } }
        ]
      }
    : {}

  const items = await prisma.workshopCode.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      uploader: { select: { gameId: true } },
      tags: { select: { tag: { select: { name: true, slug: true } } } }
    }
  })
  return { items }
})
