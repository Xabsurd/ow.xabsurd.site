import type { Prisma } from '@prisma/client'
import { prisma } from './db'
import { connectTags } from './tags'

type CodePayload = {
  workshopCode?: string
  title?: string
  description?: string
  type?: string
  difficulty?: string
  mapName?: string
  tags?: string[]
  authorName?: string | null
  version?: string | null
  region?: string | null
  playerCount?: string | null
  language?: string | null
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN' | 'DELETED'
  reviewNote?: string | null
  parkour?: {
    hero?: string
    levelCount?: number
    difficultyStart?: string | null
    timerSupported?: boolean
    beginnerFriendly?: boolean
    averageClearTime?: string | null
    notes?: string | null
  }
}

export async function createWorkshopCode(payload: Required<Pick<CodePayload, 'workshopCode' | 'title' | 'description' | 'type' | 'difficulty' | 'mapName' | 'tags'>> & CodePayload, uploaderId: string, fallbackAuthorName: string) {
  const { parkour, tags, ...codeData } = payload
  const tagConnections = await connectTags(tags)

  return prisma.workshopCode.create({
    data: {
      ...codeData,
      authorName: codeData.authorName || fallbackAuthorName,
      status: 'PENDING',
      uploaderId,
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
}

export async function updateWorkshopCode(id: string, payload: CodePayload, options: { resetReview?: boolean } = {}) {
  const { parkour, tags, ...rawCodeData } = payload
  const tagConnections = tags ? await connectTags(tags) : undefined
  const codeData: Prisma.WorkshopCodeUpdateInput = Object.fromEntries(
    Object.entries(rawCodeData).filter(([, value]) => value !== undefined)
  )

  if (options.resetReview) {
    codeData.status = 'PENDING'
    codeData.reviewedAt = null
    codeData.reviewedBy = { disconnect: true }
    codeData.reviewNote = null
  }

  return prisma.$transaction(async (tx) => {
    const code = await tx.workshopCode.update({
      where: { id },
      data: codeData,
      select: { id: true, type: true, status: true }
    })

    if (tags) {
      await tx.workshopCodeTag.deleteMany({ where: { workshopCodeId: id } })
      if (tagConnections?.length) {
        await tx.workshopCodeTag.createMany({
          data: tagConnections.map((tag) => ({ workshopCodeId: id, tagId: tag.tagId })),
          skipDuplicates: true
        })
      }
    }

    const nextType = payload.type ?? code.type
    if (nextType === '跑酷') {
      await tx.parkourCode.upsert({
        where: { workshopCodeId: id },
        update: {
          hero: parkour?.hero || 'genji',
          levelCount: parkour?.levelCount || 1,
          difficultyStart: parkour?.difficultyStart || null,
          timerSupported: parkour?.timerSupported || false,
          beginnerFriendly: parkour?.beginnerFriendly || false,
          averageClearTime: parkour?.averageClearTime || null,
          notes: parkour?.notes || null
        },
        create: {
          workshopCodeId: id,
          hero: parkour?.hero || 'genji',
          levelCount: parkour?.levelCount || 1,
          difficultyStart: parkour?.difficultyStart || null,
          timerSupported: parkour?.timerSupported || false,
          beginnerFriendly: parkour?.beginnerFriendly || false,
          averageClearTime: parkour?.averageClearTime || null,
          notes: parkour?.notes || null
        }
      })
    } else if (payload.type) {
      await tx.parkourCode.deleteMany({ where: { workshopCodeId: id } })
    }

    return code
  })
}
