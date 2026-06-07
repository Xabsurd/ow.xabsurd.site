import { readBody } from 'h3'
import { prisma } from '../../../utils/db'
import { requireActiveUser } from '../../../utils/auth'
import { assertRateLimit } from '../../../utils/rate-limit'
import { apiError, zodDetails } from '../../../utils/errors'
import { reportSchema } from '../../../validation/code'

export default defineEventHandler(async (event) => {
  assertRateLimit(event, 'report-code', 10, 60 * 60 * 1000)
  const user = await requireActiveUser(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw apiError(400, 'BAD_REQUEST', 'Missing id')

  const parsed = reportSchema.safeParse(await readBody(event))
  if (!parsed.success) throw apiError(400, 'VALIDATION_ERROR', 'Invalid report', zodDetails(parsed.error))

  const report = await prisma.report.create({
    data: { reporterId: user.id, workshopCodeId: id, ...parsed.data },
    select: { id: true, status: true }
  })
  return { report }
})
