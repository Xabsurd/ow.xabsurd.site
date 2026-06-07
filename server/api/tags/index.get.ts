import { prisma } from '../../utils/db'

export default defineEventHandler(async () => {
  const tags = await prisma.tag.findMany({
    where: {
      codes: {
        some: {
          workshopCode: { status: 'APPROVED' }
        }
      }
    },
    orderBy: [{ codes: { _count: 'desc' } }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { codes: true } }
    },
    take: 80
  })

  return { tags }
})
