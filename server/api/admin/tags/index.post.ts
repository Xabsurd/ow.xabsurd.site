import { readBody } from 'h3'
import { z } from 'zod'
import { requireAdmin } from '../../../utils/auth'
import { writeAuditLog } from '../../../utils/audit-log'
import { prisma } from '../../../utils/db'
import { apiError, zodDetails } from '../../../utils/errors'
import { slugify } from '../../../utils/security'

const schema = z.object({
  name: z.string().trim().min(1).max(24),
  isHot: z.boolean().default(false)
})

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const parsed = schema.safeParse(await readBody(event))
  if (!parsed.success) throw apiError(400, 'VALIDATION_ERROR', 'Invalid tag payload', zodDetails(parsed.error))
  const slug = slugify(parsed.data.name)
  const tag = await prisma.tag.upsert({
    where: { slug },
    update: { name: parsed.data.name, isHot: parsed.data.isHot },
    create: { name: parsed.data.name, slug, isHot: parsed.data.isHot }
  })
  await writeAuditLog(user.id, 'TAG_UPSERT', 'Tag', tag.id, parsed.data)
  return { tag }
})
