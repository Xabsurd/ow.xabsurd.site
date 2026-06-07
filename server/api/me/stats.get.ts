import { requireUser } from '../../utils/auth'
import { prisma } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const [uploads, favorites, pending, approved] = await Promise.all([
    prisma.workshopCode.count({ where: { uploaderId: user.id, status: { not: 'DELETED' } } }),
    prisma.favorite.count({ where: { userId: user.id } }),
    prisma.workshopCode.count({ where: { uploaderId: user.id, status: 'PENDING' } }),
    prisma.workshopCode.count({ where: { uploaderId: user.id, status: 'APPROVED' } })
  ])

  return { uploads, favorites, pending, approved }
})
