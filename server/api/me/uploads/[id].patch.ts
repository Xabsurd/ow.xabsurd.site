import { readBody } from 'h3'
import { prisma } from '../../../utils/db'
import { requireActiveUser } from '../../../utils/auth'
import { apiError, zodDetails } from '../../../utils/errors'
import { updateWorkshopCode } from '../../../utils/workshop-code'
import { updateCodeSchema } from '../../../validation/code'

export default defineEventHandler(async (event) => {
  const user = await requireActiveUser(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw apiError(400, 'MISSING_ID', 'Code id is required')

  const existing = await prisma.workshopCode.findFirst({ where: { id, uploaderId: user.id, status: { not: 'DELETED' } } })
  if (!existing) throw apiError(404, 'NOT_FOUND', 'Upload not found')

  const parsed = updateCodeSchema.omit({ status: true, reviewNote: true }).safeParse(await readBody(event))
  if (!parsed.success) throw apiError(400, 'VALIDATION_ERROR', 'Invalid code payload', zodDetails(parsed.error))

  const code = await updateWorkshopCode(id, parsed.data, { resetReview: true })
  return { code }
})
