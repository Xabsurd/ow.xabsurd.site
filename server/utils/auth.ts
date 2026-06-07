import type { H3Event } from 'h3'
import { deleteCookie, getCookie, setCookie } from 'h3'
import { UserRole, type User } from '@prisma/client'
import { prisma } from './db'
import { apiError } from './errors'
import { hashValue, randomToken } from './security'

const cookieName = 'ow_session'
const sessionDays = 30

export type SafeUser = Pick<User, 'id' | 'email' | 'gameId' | 'role' | 'isBanned' | 'createdAt'>

export function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    email: user.email,
    gameId: user.gameId,
    role: user.role,
    isBanned: user.isBanned,
    createdAt: user.createdAt
  }
}

export async function createSession(event: H3Event, userId: string) {
  const token = randomToken()
  const expiresAt = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000)

  await prisma.session.create({
    data: {
      tokenHash: hashValue(token),
      userId,
      expiresAt
    }
  })

  setCookie(event, cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt
  })
}

export async function destroySession(event: H3Event) {
  const token = getCookie(event, cookieName)
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashValue(token) } })
  }
  deleteCookie(event, cookieName, { path: '/' })
}

export async function getCurrentUser(event: H3Event) {
  const token = getCookie(event, cookieName)
  if (!token) return null

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashValue(token) },
    include: { user: true }
  })

  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.session.delete({ where: { id: session.id } })
    return null
  }

  return session.user
}

export async function requireUser(event: H3Event) {
  const user = await getCurrentUser(event)
  if (!user) throw apiError(401, 'UNAUTHENTICATED', 'Login required')
  return user
}

export async function requireActiveUser(event: H3Event) {
  const user = await requireUser(event)
  if (user.isBanned) throw apiError(403, 'BANNED', 'Account is banned')
  return user
}

export async function requireModerator(event: H3Event) {
  const user = await requireUser(event)
  if (user.role !== UserRole.ADMIN && user.role !== UserRole.MODERATOR) {
    throw apiError(403, 'FORBIDDEN', 'Moderator permission required')
  }
  return user
}

export async function requireAdmin(event: H3Event) {
  const user = await requireUser(event)
  if (user.role !== UserRole.ADMIN) {
    throw apiError(403, 'FORBIDDEN', 'Admin permission required')
  }
  return user
}
