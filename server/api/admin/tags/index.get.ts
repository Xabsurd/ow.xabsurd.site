import { prisma } from '../../../utils/db'
import { requireAdmin } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const tags = await prisma.tag.findMany({
    orderBy: [{ isHot: 'desc' }, { name: 'asc' }],
    include: { _count: { select: { codes: true } } }
  })
  return { tags }
})
