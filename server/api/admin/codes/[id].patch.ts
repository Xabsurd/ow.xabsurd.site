import { readBody } from 'h3'
import { prisma } from '../../../utils/db'
import { requireModerator } from '../../../utils/auth'
import { apiError, zodDetails } from '../../../utils/errors'
import { updateWorkshopCode } from '../../../utils/workshop-code'
import { updateCodeSchema } from '../../../validation/code'

export default defineEventHandler(async (event) => {
  const user = await requireModerator(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw apiError(400, 'MISSING_ID', 'Code id is required')

  const parsed = updateCodeSchema.safeParse(await readBody(event))
  if (!parsed.success) throw apiError(400, 'VALIDATION_ERROR', 'Invalid code payload', zodDetails(parsed.error))

  const code = await updateWorkshopCode(id, parsed.data)

  if (parsed.data.status && ['APPROVED', 'REJECTED', 'HIDDEN'].includes(parsed.data.status)) {
    await prisma.workshopCode.update({
      where: { id },
      data: { reviewedById: user.id, reviewedAt: new Date() }
    })
  }

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: 'CODE_UPDATE',
      targetType: 'WorkshopCode',
      targetId: id,
      metadata: { status: parsed.data.status || null }
    }
  })

  return { code }
})
