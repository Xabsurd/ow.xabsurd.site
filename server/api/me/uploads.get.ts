import { requireUser } from '../../utils/auth'
import { prisma } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const items = await prisma.workshopCode.findMany({
    where: { uploaderId: user.id, status: { not: 'DELETED' } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      workshopCode: true,
      title: true,
      description: true,
      type: true,
      difficulty: true,
      mapName: true,
      authorName: true,
      version: true,
      region: true,
      playerCount: true,
      language: true,
      status: true,
      reviewNote: true,
      createdAt: true,
      parkour: true,
      tags: { select: { tag: { select: { name: true, slug: true } } } }
    }
  })
  return { items }
})
