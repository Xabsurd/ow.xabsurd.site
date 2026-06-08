import { prisma } from '../../../utils/db'
import { requireModerator } from '../../../utils/auth'
import { apiError } from '../../../utils/errors'

export default defineEventHandler(async (event) => {
  const user = await requireModerator(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw apiError(400, 'MISSING_ID', 'Code id is required')

  await prisma.workshopCode.update({
    where: { id },
    data: {
      status: 'DELETED',
      reviewedById: user.id,
      reviewedAt: new Date(),
      reviewNote: 'Deleted by moderator'
    }
  })
  await prisma.auditLog.create({
    data: { actorId: user.id, action: 'CODE_DELETE', targetType: 'WorkshopCode', targetId: id }
  })
  return { ok: true }
})
