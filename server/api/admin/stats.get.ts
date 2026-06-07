import { prisma } from '../../utils/db'
import { requireModerator } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireModerator(event)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [users, pending, todayUploads, reports, logs] = await Promise.all([
    prisma.user.count(),
    prisma.workshopCode.count({ where: { status: 'PENDING' } }),
    prisma.workshopCode.count({ where: { createdAt: { gte: today } } }),
    prisma.report.count({ where: { status: 'OPEN' } }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { actor: { select: { gameId: true } } }
    })
  ])

  return { users, pending, todayUploads, reports, logs }
})
