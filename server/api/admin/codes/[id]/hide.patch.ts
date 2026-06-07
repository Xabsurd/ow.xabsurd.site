import { prisma } from '../../../../utils/db'
import { requireModerator } from '../../../../utils/auth'
import { apiError } from '../../../../utils/errors'
import { writeAuditLog } from '../../../../utils/audit-log'

export default defineEventHandler(async (event) => {
  const actor = await requireModerator(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw apiError(400, 'BAD_REQUEST', 'Missing id')

  const code = await prisma.workshopCode.update({
    where: { id },
    data: { status: 'HIDDEN' },
    select: { id: true, status: true }
  })
  await writeAuditLog(actor.id, 'CODE_HIDE', 'WorkshopCode', id)
  return { code }
})
