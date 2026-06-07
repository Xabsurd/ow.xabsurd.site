import { prisma } from '../../../utils/db'
import { requireModerator } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireModerator(event)
  const items = await prisma.workshopCode.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
    take: 50,
    include: {
      uploader: { select: { id: true, gameId: true, email: true } },
      tags: { select: { tag: { select: { name: true, slug: true } } } },
      genjiPk: true
    }
  })
  return { items }
})
