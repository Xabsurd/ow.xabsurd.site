import { readBody } from 'h3'
import { z } from 'zod'
import { UserRole } from '@prisma/client'
import { prisma } from '../../../utils/db'
import { requireAdmin } from '../../../utils/auth'
import { apiError, zodDetails } from '../../../utils/errors'

const schema = z.object({
  email: z.string().trim().email().max(160).optional(),
  gameId: z.string().trim().min(2).max(40).optional(),
  role: z.enum([UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN]).optional(),
  isBanned: z.boolean().optional(),
  banReason: z.string().trim().max(300).optional().nullable()
})

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw apiError(400, 'MISSING_ID', 'User id is required')

  const parsed = schema.safeParse(await readBody(event))
  if (!parsed.success) throw apiError(400, 'VALIDATION_ERROR', 'Invalid user payload', zodDetails(parsed.error))

  if (id === admin.id && parsed.data.role && parsed.data.role !== UserRole.ADMIN) {
    throw apiError(409, 'SELF_DEMOTE', 'You cannot remove your own admin role')
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...parsed.data,
      bannedAt: parsed.data.isBanned ? new Date() : parsed.data.isBanned === false ? null : undefined,
      banReason: parsed.data.isBanned === false ? null : parsed.data.banReason
    },
    select: { id: true, email: true, gameId: true, role: true, isBanned: true, banReason: true }
  })
  await prisma.auditLog.create({
    data: { actorId: admin.id, action: 'USER_UPDATE', targetType: 'User', targetId: id, metadata: parsed.data }
  })
  return { user }
})
