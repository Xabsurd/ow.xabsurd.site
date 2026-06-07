import { prisma } from '../../../../utils/db'
import { requireAdmin } from '../../../../utils/auth'
import { apiError } from '../../../../utils/errors'
import { writeAuditLog } from '../../../../utils/audit-log'

export default defineEventHandler(async (event) => {
  const actor = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw apiError(400, 'BAD_REQUEST', 'Missing id')

  const user = await prisma.user.update({
    where: { id },
    data: { isBanned: false, banReason: null, bannedAt: null },
    select: { id: true, isBanned: true }
  })
  await writeAuditLog(actor.id, 'USER_UNBAN', 'User', id)
  return { user }
})
