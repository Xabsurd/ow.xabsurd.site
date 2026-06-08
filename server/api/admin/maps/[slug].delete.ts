import { prisma } from '../../../utils/db'
import { requireAdmin } from '../../../utils/auth'
import { apiError } from '../../../utils/errors'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw apiError(400, 'MISSING_SLUG', 'Map slug is required')

  await prisma.mapOverride.deleteMany({ where: { slug } })
  return { ok: true }
})
