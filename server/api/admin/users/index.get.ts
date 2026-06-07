import { getQuery } from 'h3'
import type { Prisma } from '@prisma/client'
import { prisma } from '../../../utils/db'
import { requireAdmin } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const query = getQuery(event)
  const keyword = typeof query.keyword === 'string' ? query.keyword.trim() : ''
  const where: Prisma.UserWhereInput = keyword
    ? {
        OR: [
          { email: { contains: keyword, mode: 'insensitive' } },
          { gameId: { contains: keyword, mode: 'insensitive' } }
        ]
      }
    : {}

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      email: true,
      gameId: true,
      role: true,
      isBanned: true,
      banReason: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { uploads: true } }
    }
  })

  return { users }
})
