import { readBody } from 'h3'
import { prisma } from '../../utils/db'
import { requireActiveUser } from '../../utils/auth'
import { assertRateLimit } from '../../utils/rate-limit'
import { apiError, zodDetails } from '../../utils/errors'
import { connectTags } from '../../utils/tags'
import { createGenjiPkSchema } from '../../validation/genji-pk'

export default defineEventHandler(async (event) => {
  assertRateLimit(event, 'upload-genji-pk', 20, 60 * 60 * 1000)
  const user = await requireActiveUser(event)
  const parsed = createGenjiPkSchema.safeParse(await readBody(event))
  if (!parsed.success) throw apiError(400, 'VALIDATION_ERROR', 'Invalid Genji PK payload', zodDetails(parsed.error))

  const data = parsed.data
  const tagConnections = await connectTags(data.tags)
  const code = await prisma.workshopCode.create({
    data: {
      workshopCode: data.workshopCode,
      title: data.title || `源氏跑酷 - ${data.workshopCode}`,
      description: data.description || '源氏跑酷地图，等待上传者补充说明。',
      type: '跑酷',
      difficulty: data.difficulty,
      mapName: data.mapName || '未填写',
      authorName: data.authorName,
      status: 'PENDING',
      uploaderId: user.id,
      tags: { create: tagConnections },
      parkour: {
        create: {
          hero: 'genji',
          levelCount: data.levelCount,
          timerSupported: data.timerSupported,
          beginnerFriendly: data.beginnerFriendly,
          averageClearTime: data.averageClearTime,
          notes: data.notes
        }
      }
    },
    select: { id: true, status: true }
  })

  return { code }
})
