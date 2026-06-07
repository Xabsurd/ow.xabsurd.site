import { z } from 'zod'

export const workshopCodeSchema = z
  .string()
  .trim()
  .min(1)
  .max(10)
  .regex(/^[A-Za-z0-9]+$/)
  .transform((value) => value.toUpperCase())

export const tagsSchema = z
  .array(z.string().trim().min(1).max(24))
  .max(10)
  .default([])
  .transform((tags) => [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))])

export const markdownSchema = z.string().trim().min(10).max(10000)

export const difficultySchema = z.enum([
  'Easy-',
  'Easy',
  'Easy+',
  'Medium-',
  'Medium',
  'Medium+',
  'Hard-',
  'Hard',
  'Hard+',
  'Very Hard-',
  'Very Hard',
  'Very Hard+',
  'Extreme-',
  'Extreme',
  'Extreme+',
  'Hell',
  '入门',
  '简单',
  '普通',
  '困难',
  '专家',
  '地狱'
])

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(12)
})
