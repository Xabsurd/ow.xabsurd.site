import { readBody } from 'h3'
import { z } from 'zod'
import { UserRole } from '@prisma/client'
import { prisma } from '../../../../utils/db'
import { requireAdmin } from '../../../../utils/auth'
import { apiError } from '../../../../utils/errors'
import { writeAuditLog } from '../../../../utils/audit-log'

const schema = z.object({ role: z.nativeEnum(UserRole) })

export default defineEventHandler(async (event) => {
  const actor = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw apiError(400, 'BAD_REQUEST', 'Missing id')
  const data = schema.parse(await readBody(event))

  const user = await prisma.user.update({
    where: { id },
    data: { role: data.role },
    select: { id: true, role: true }
  })
  await writeAuditLog(actor.id, 'USER_ROLE_UPDATE', 'User', id, data)
  return { user }
})
