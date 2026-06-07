import { prisma } from '../../../utils/db'
import { requireActiveUser } from '../../../utils/auth'
import { apiError } from '../../../utils/errors'

export default defineEventHandler(async (event) => {
  const user = await requireActiveUser(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw apiError(400, 'BAD_REQUEST', 'Missing id')

  const deleted = await prisma.favorite.deleteMany({ where: { userId: user.id, workshopCodeId: id } })
  if (deleted.count) {
    await prisma.workshopCode.updateMany({
      where: { id, favoriteCount: { gt: 0 } },
      data: { favoriteCount: { decrement: 1 } }
    })
  }
  return { ok: true }
})
