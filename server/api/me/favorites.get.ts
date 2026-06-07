import { requireUser } from '../../utils/auth'
import { prisma } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id, workshopCode: { status: 'APPROVED' } },
    orderBy: { createdAt: 'desc' },
    select: {
      workshopCode: {
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
      }
    }
  })

  return { items: favorites.map((favorite) => favorite.workshopCode) }
})
