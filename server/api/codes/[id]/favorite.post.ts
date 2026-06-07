import { prisma } from '../../../utils/db'
import { requireActiveUser } from '../../../utils/auth'
import { apiError } from '../../../utils/errors'

export default defineEventHandler(async (event) => {
  const user = await requireActiveUser(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw apiError(400, 'BAD_REQUEST', 'Missing id')

  const created = await prisma.favorite.createMany({
    data: { userId: user.id, workshopCodeId: id },
    skipDuplicates: true
  })
  if (created.count) {
    await prisma.workshopCode.update({ where: { id }, data: { favoriteCount: { increment: 1 } } })
  }
  return { ok: true }
})
