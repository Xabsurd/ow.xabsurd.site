import { readBody } from 'h3'
import { z } from 'zod'
import { requireAdmin } from '../../../utils/auth'
import { writeAuditLog } from '../../../utils/audit-log'
import { prisma } from '../../../utils/db'
import { apiError, zodDetails } from '../../../utils/errors'
import { slugify } from '../../../utils/security'

const schema = z.object({
  name: z.string().trim().min(1).max(24).optional(),
  isHot: z.boolean().optional()
})

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw apiError(400, 'BAD_REQUEST', 'Missing id')
  const parsed = schema.safeParse(await readBody(event))
  if (!parsed.success) throw apiError(400, 'VALIDATION_ERROR', 'Invalid tag payload', zodDetails(parsed.error))
  const tag = await prisma.tag.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug: parsed.data.name ? slugify(parsed.data.name) : undefined,
      isHot: parsed.data.isHot
    }
  })
  await writeAuditLog(user.id, 'TAG_UPDATE', 'Tag', tag.id, parsed.data)
  return { tag }
})
