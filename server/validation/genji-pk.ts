import { z } from 'zod'
import { difficultySchema, tagsSchema, workshopCodeSchema } from './common'

export const createGenjiPkSchema = z.object({
  workshopCode: workshopCodeSchema,
  title: z.string().trim().min(2).max(80).optional(),
  authorName: z.string().trim().min(1).max(80),
  levelCount: z.coerce.number().int().positive().max(999),
  description: z.string().trim().max(10000).optional().default('源氏跑酷地图，等待上传者补充说明。'),
  difficulty: difficultySchema,
  tags: tagsSchema,
  timerSupported: z.boolean().default(false),
  beginnerFriendly: z.boolean().default(false),
  averageClearTime: z.string().trim().max(40).optional().nullable(),
  mapName: z.string().trim().max(80).optional().default(''),
  notes: z.string().trim().max(1000).optional().nullable()
})
