import { readBody } from 'h3'
import { z } from 'zod'
import { requireAdmin } from '../../../utils/auth'
import { writeAuditLog } from '../../../utils/audit-log'
import { prisma } from '../../../utils/db'
import { apiError, zodDetails } from '../../../utils/errors'

const schema = z.object({
  name: z.string().trim().min(1).max(80),
  zhName: z.string().trim().max(80).optional().nullable(),
  mode: z.string().trim().min(1).max(40),
  image: z.string().trim().url().max(500).optional().nullable(),
  isEnabled: z.boolean()
})

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw apiError(400, 'BAD_REQUEST', 'Missing slug')
  const parsed = schema.safeParse(await readBody(event))
  if (!parsed.success) throw apiError(400, 'VALIDATION_ERROR', 'Invalid map payload', zodDetails(parsed.error))

  const map = await prisma.mapOverride.upsert({
    where: { slug },
    update: parsed.data,
    create: { slug, ...parsed.data }
  })
  await writeAuditLog(user.id, 'MAP_UPDATE', 'MapOverride', slug, parsed.data)
  return { map }
})
