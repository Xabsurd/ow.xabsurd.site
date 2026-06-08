import { prisma } from '../../../utils/db'
import { requireAdmin } from '../../../utils/auth'
import { apiError } from '../../../utils/errors'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw apiError(400, 'MISSING_ID', 'User id is required')
  if (id === admin.id) throw apiError(409, 'SELF_DELETE', 'You cannot delete yourself')

  await prisma.user.delete({ where: { id } })
  await prisma.auditLog.create({
    data: { actorId: admin.id, action: 'USER_DELETE', targetType: 'User', targetId: id }
  })
  return { ok: true }
})
