import { requireAdmin } from '../../../utils/auth'
import { writeAuditLog } from '../../../utils/audit-log'
import { prisma } from '../../../utils/db'
import { apiError } from '../../../utils/errors'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw apiError(400, 'BAD_REQUEST', 'Missing id')
  const count = await prisma.workshopCodeTag.count({ where: { tagId: id } })
  if (count > 0) throw apiError(409, 'TAG_IN_USE', 'Tag is still used by codes')
  await prisma.tag.delete({ where: { id } })
  await writeAuditLog(user.id, 'TAG_DELETE', 'Tag', id)
  return { ok: true }
})
