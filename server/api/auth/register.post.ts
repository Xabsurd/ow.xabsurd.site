import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'
import { readBody } from 'h3'
import { prisma } from '../../utils/db'
import { createSession, toSafeUser } from '../../utils/auth'
import { apiError, zodDetails } from '../../utils/errors'
import { hashValue } from '../../utils/security'
import { registerSchema } from '../../validation/auth'

export default defineEventHandler(async (event) => {
  const parsed = registerSchema.safeParse(await readBody(event))
  if (!parsed.success) throw apiError(400, 'VALIDATION_ERROR', 'Invalid register payload', zodDetails(parsed.error))

  const { email, gameId, password, emailCode } = parsed.data
  const config = useRuntimeConfig()

  const verification = await prisma.emailVerificationCode.findFirst({
    where: {
      email,
      purpose: 'REGISTER',
      codeHash: hashValue(emailCode),
      usedAt: null,
      expiresAt: { gt: new Date() }
    },
    orderBy: { createdAt: 'desc' }
  })
  if (!verification) throw apiError(400, 'INVALID_CODE', 'Verification code is invalid or expired')

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email,
        gameId,
        passwordHash: await bcrypt.hash(password, 12),
        role: email === config.initialAdminEmail ? UserRole.ADMIN : UserRole.USER
      }
    })
    await tx.emailVerificationCode.update({
      where: { id: verification.id },
      data: { usedAt: new Date() }
    })
    return created
  })

  await createSession(event, user.id)
  return { user: toSafeUser(user) }
})
