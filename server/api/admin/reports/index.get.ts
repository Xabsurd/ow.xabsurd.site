import { prisma } from '../../../utils/db'
import { requireModerator } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireModerator(event)
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      reporter: { select: { id: true, gameId: true, email: true } },
      workshopCode: { select: { id: true, title: true, workshopCode: true, status: true } },
      handledBy: { select: { id: true, gameId: true } }
    }
  })
  return { reports }
})
