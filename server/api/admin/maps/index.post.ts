import { readBody } from 'h3'
import { z } from 'zod'
import { prisma } from '../../../utils/db'
import { requireAdmin } from '../../../utils/auth'
import { apiError, zodDetails } from '../../../utils/errors'

const schema = z.object({
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9-]+$/),
  name: z.string().trim().min(1).max(80),
  zhName: z.string().trim().max(80).optional().nullable(),
  mode: z.string().trim().min(1).max(40),
  image: z.string().trim().url().optional().nullable(),
  isEnabled: z.boolean().default(true)
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const parsed = schema.safeParse(await readBody(event))
  if (!parsed.success) throw apiError(400, 'VALIDATION_ERROR', 'Invalid map payload', zodDetails(parsed.error))

  const map = await prisma.mapOverride.create({ data: parsed.data })
  return { map }
})
