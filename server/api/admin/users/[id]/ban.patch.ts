import { readBody } from 'h3'
import { z } from 'zod'
import { prisma } from '../../../../utils/db'
import { requireAdmin } from '../../../../utils/auth'
import { apiError } from '../../../../utils/errors'
import { writeAuditLog } from '../../../../utils/audit-log'

const schema = z.object({ reason: z.string().trim().min(1).max(200) })

export default defineEventHandler(async (event) => {
  const actor = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw apiError(400, 'BAD_REQUEST', 'Missing id')
  const data = schema.parse(await readBody(event))

  const user = await prisma.user.update({
    where: { id },
    data: { isBanned: true, banReason: data.reason, bannedAt: new Date() },
    select: { id: true, isBanned: true }
  })
  await writeAuditLog(actor.id, 'USER_BAN', 'User', id, data)
  return { user }
})
