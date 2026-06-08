import { prisma } from '../../../utils/db'
import { requireActiveUser } from '../../../utils/auth'
import { apiError } from '../../../utils/errors'

export default defineEventHandler(async (event) => {
  const user = await requireActiveUser(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw apiError(400, 'MISSING_ID', 'Code id is required')

  const result = await prisma.workshopCode.updateMany({
    where: { id, uploaderId: user.id, status: { not: 'DELETED' } },
    data: { status: 'DELETED' }
  })
  if (!result.count) throw apiError(404, 'NOT_FOUND', 'Upload not found or cannot be deleted')

  return { ok: true }
})
