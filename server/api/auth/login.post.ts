import bcrypt from 'bcryptjs'
import { readBody } from 'h3'
import { prisma } from '../../utils/db'
import { assertRateLimit } from '../../utils/rate-limit'
import { createSession, toSafeUser } from '../../utils/auth'
import { apiError, zodDetails } from '../../utils/errors'
import { loginSchema } from '../../validation/auth'

export default defineEventHandler(async (event) => {
  assertRateLimit(event, 'login', 10, 15 * 60 * 1000)

  const parsed = loginSchema.safeParse(await readBody(event))
  if (!parsed.success) throw apiError(400, 'VALIDATION_ERROR', 'Invalid login payload', zodDetails(parsed.error))

  const emailOrGameId = parsed.data.emailOrGameId
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: emailOrGameId.toLowerCase() }, { gameId: emailOrGameId }]
    }
  })
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    throw apiError(401, 'INVALID_CREDENTIALS', 'Invalid credentials')
  }
  if (user.isBanned) throw apiError(403, 'BANNED', 'Account is banned')

  await createSession(event, user.id)
  return { user: toSafeUser(user) }
})
