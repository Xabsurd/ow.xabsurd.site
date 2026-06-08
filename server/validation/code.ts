import { z } from 'zod'
import { difficultySchema, markdownSchema, tagsSchema, workshopCodeSchema } from './common'

const queryBooleanSchema = z.preprocess((value) => {
  if (value === 'true' || value === '1' || value === true) return true
  if (value === 'false' || value === '0' || value === false) return false
  return undefined
}, z.boolean().optional())
const queryLevelSchema = z.preprocess(
  (value) => (value === '' || value === null ? undefined : value),
  z.coerce.number().int().min(1).max(9999).optional()
)

const optionalDifficultySchema = z.preprocess((value) => (value === '' ? undefined : value), difficultySchema.optional().nullable())

export const createCodeSchema = z.object({
  workshopCode: workshopCodeSchema,
  title: z.string().trim().min(2).max(80),
  description: markdownSchema,
  type: z.string().trim().min(1).max(32),
  difficulty: difficultySchema,
  mapName: z.string().trim().min(1).max(80),
  tags: tagsSchema,
  authorName: z.string().trim().max(80).optional().nullable(),
  version: z.string().trim().max(32).optional().nullable(),
  region: z.string().trim().max(32).optional().nullable(),
  playerCount: z.string().trim().max(32).optional().nullable(),
  language: z.string().trim().max(32).optional().nullable(),
  parkour: z
    .object({
      hero: z.string().trim().min(1).max(32).default('genji'),
      levelCount: z.coerce.number().int().positive().max(999).optional(),
      difficultyStart: optionalDifficultySchema,
      timerSupported: z.boolean().default(false),
      beginnerFriendly: z.boolean().default(false),
      averageClearTime: z.string().trim().max(40).optional().nullable(),
      notes: z.string().trim().max(1000).optional().nullable()
    })
    .optional()
})

export const updateCodeSchema = createCodeSchema.partial().extend({
  tags: tagsSchema.optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'HIDDEN', 'DELETED']).optional(),
  reviewNote: z.string().trim().max(500).optional().nullable()
})

export const codeQuerySchema = z.object({
  keyword: z.string().trim().max(80).optional(),
  type: z.string().trim().max(32).optional(),
  difficulty: z.string().trim().max(32).optional(),
  mapName: z.string().trim().max(80).optional(),
  hero: z.string().trim().max(32).optional(),
  difficultyStart: z.string().trim().max(32).optional(),
  levelMin: queryLevelSchema,
  levelMax: queryLevelSchema,
  timerSupported: queryBooleanSchema,
  beginnerFriendly: queryBooleanSchema,
  tags: z.string().trim().max(200).optional(),
  sort: z.enum(['latest', 'hot', 'favorites', 'views']).default('latest'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(12)
})

export const reportSchema = z.object({
  reason: z.string().trim().min(2).max(80),
  detail: z.string().trim().max(1000).optional()
})
