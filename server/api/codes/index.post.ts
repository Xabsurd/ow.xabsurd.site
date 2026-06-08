import { readBody } from 'h3'
import { prisma } from '../../utils/db'
import { requireActiveUser } from '../../utils/auth'
import { assertRateLimit } from '../../utils/rate-limit'
import { apiError, zodDetails } from '../../utils/errors'
import { connectTags } from '../../utils/tags'
import { createCodeSchema } from '../../validation/code'

export default defineEventHandler(async (event) => {
  assertRateLimit(event, 'upload-code', 20, 60 * 60 * 1000)
  const user = await requireActiveUser(event)
  const parsed = createCodeSchema.safeParse(await readBody(event))
  if (!parsed.success) throw apiError(400, 'VALIDATION_ERROR', 'Invalid code payload', zodDetails(parsed.error))

  const { parkour, ...codeData } = parsed.data
  const tagConnections = await connectTags(codeData.tags)
  const code = await prisma.workshopCode.create({
    data: {
      ...codeData,
      authorName: codeData.authorName || user.gameId,
      status: 'PENDING',
      uploaderId: user.id,
      tags: { create: tagConnections },
      parkour:
        codeData.type === '跑酷'
          ? {
              create: {
                hero: parkour?.hero || 'genji',
                levelCount: parkour?.levelCount || 1,
                difficultyStart: parkour?.difficultyStart || null,
                timerSupported: parkour?.timerSupported || false,
                beginnerFriendly: parkour?.beginnerFriendly || false,
                averageClearTime: parkour?.averageClearTime || null,
                notes: parkour?.notes || null
              }
            }
          : undefined
    },
    select: { id: true, status: true }
  })

  return { code }
})
