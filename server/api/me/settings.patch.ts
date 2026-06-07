import bcrypt from 'bcryptjs'
import { readBody } from 'h3'
import { Prisma } from '@prisma/client'
import { requireActiveUser, toSafeUser } from '../../utils/auth'
import { writeAuditLog } from '../../utils/audit-log'
import { prisma } from '../../utils/db'
import { apiError, zodDetails } from '../../utils/errors'
import { updateSettingsSchema } from '../../validation/settings'

export default defineEventHandler(async (event) => {
  const user = await requireActiveUser(event)
  const parsed = updateSettingsSchema.safeParse(await readBody(event))
  if (!parsed.success) throw apiError(400, 'VALIDATION_ERROR', 'Invalid settings payload', zodDetails(parsed.error))

  const data = parsed.data
  if (data.newPassword && !(await bcrypt.compare(data.currentPassword || '', user.passwordHash))) {
    throw apiError(401, 'INVALID_PASSWORD', 'Current password is incorrect')
  }

  try {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        gameId: data.gameId,
        passwordHash: data.newPassword ? await bcrypt.hash(data.newPassword, 12) : undefined
      }
    })

    await writeAuditLog(user.id, 'USER_SETTINGS_UPDATE', 'User', user.id, {
      gameIdChanged: Boolean(data.gameId && data.gameId !== user.gameId),
      passwordChanged: Boolean(data.newPassword)
    })

    return { user: toSafeUser(updated) }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw apiError(409, 'GAME_ID_TAKEN', 'Game ID is already taken')
    }
    throw error
  }
})
