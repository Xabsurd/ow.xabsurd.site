import { getCookie, setCookie } from 'h3'
import { prisma } from '../../utils/db'
import { apiError } from '../../utils/errors'
import { renderMarkdown } from '../../utils/markdown'
import { getCurrentUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw apiError(400, 'BAD_REQUEST', 'Missing id')

  const code = await prisma.workshopCode.findFirst({
    where: { id, status: 'APPROVED' },
    include: {
      uploader: { select: { id: true, gameId: true } },
      tags: { select: { tag: { select: { name: true, slug: true } } } },
      parkour: true
    }
  })
  if (!code) throw apiError(404, 'NOT_FOUND', 'Code not found')
  const user = await getCurrentUser(event)

  const viewedKey = `viewed_${id}`
  if (!getCookie(event, viewedKey)) {
    await prisma.workshopCode.update({ where: { id }, data: { viewCount: { increment: 1 } } })
    setCookie(event, viewedKey, '1', {
      path: '/',
      maxAge: 60 * 60 * 12,
      sameSite: 'lax'
    })
    code.viewCount += 1
  }

  const favorited = user
    ? Boolean(
        await prisma.favorite.findUnique({
          where: { userId_workshopCodeId: { userId: user.id, workshopCodeId: id } },
          select: { id: true }
        })
      )
    : false

  return { code: { ...code, htmlDescription: renderMarkdown(code.description), favorited } }
})
