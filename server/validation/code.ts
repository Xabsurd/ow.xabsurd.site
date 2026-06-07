import { z } from 'zod'
import { difficultySchema, markdownSchema, tagsSchema, workshopCodeSchema } from './common'

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
  language: z.string().trim().max(32).optional().nullable()
})

export const codeQuerySchema = z.object({
  keyword: z.string().trim().max(80).optional(),
  type: z.string().trim().max(32).optional(),
  difficulty: z.string().trim().max(32).optional(),
  mapName: z.string().trim().max(80).optional(),
  tags: z.string().trim().max(200).optional(),
  sort: z.enum(['latest', 'hot', 'favorites', 'views']).default('latest'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(12)
})

export const reportSchema = z.object({
  reason: z.string().trim().min(2).max(80),
  detail: z.string().trim().max(1000).optional()
})
