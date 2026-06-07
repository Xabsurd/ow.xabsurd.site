import { readBody } from 'h3'
import { z } from 'zod'
import { prisma } from '../../../../utils/db'
import { requireModerator } from '../../../../utils/auth'
import { apiError } from '../../../../utils/errors'
import { writeAuditLog } from '../../../../utils/audit-log'

const schema = z.object({ note: z.string().trim().min(1).max(500) })

export default defineEventHandler(async (event) => {
  const actor = await requireModerator(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw apiError(400, 'BAD_REQUEST', 'Missing id')
  const data = schema.parse(await readBody(event))

  const code = await prisma.workshopCode.update({
    where: { id },
    data: { status: 'REJECTED', reviewedById: actor.id, reviewedAt: new Date(), reviewNote: data.note },
    select: { id: true, status: true, reviewNote: true }
  })
  await writeAuditLog(actor.id, 'CODE_REJECT', 'WorkshopCode', id, data)
  return { code }
})
