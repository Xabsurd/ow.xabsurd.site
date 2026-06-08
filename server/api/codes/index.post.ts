import { readBody } from 'h3'
import { requireActiveUser } from '../../utils/auth'
import { assertRateLimit } from '../../utils/rate-limit'
import { apiError, zodDetails } from '../../utils/errors'
import { createWorkshopCode } from '../../utils/workshop-code'
import { createCodeSchema } from '../../validation/code'

export default defineEventHandler(async (event) => {
  assertRateLimit(event, 'upload-code', 20, 60 * 60 * 1000)
  const user = await requireActiveUser(event)
  const parsed = createCodeSchema.safeParse(await readBody(event))
  if (!parsed.success) throw apiError(400, 'VALIDATION_ERROR', 'Invalid code payload', zodDetails(parsed.error))

  const code = await createWorkshopCode(parsed.data, user.id, user.gameId)

  return { code }
})
