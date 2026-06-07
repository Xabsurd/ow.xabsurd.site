import crypto from 'node:crypto'
import type { H3Event } from 'h3'
import { deleteCookie, getCookie, setCookie } from 'h3'
import { apiError } from './errors'

const cookieName = 'ow_captcha'
const ttlMs = 5 * 60 * 1000

type CaptchaPayload = {
  answer: string
  expiresAt: number
  nonce: string
}

function secret() {
  return useRuntimeConfig().sessionSecret || process.env.SESSION_SECRET || 'change-me-in-production'
}

function sign(value: string) {
  return crypto.createHmac('sha256', secret()).update(value).digest('base64url')
}

function encodePayload(payload: CaptchaPayload) {
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  return `${encoded}.${sign(encoded)}`
}

function decodePayload(value: string): CaptchaPayload | null {
  const [encoded, signature] = value.split('.')
  if (!encoded || !signature) return null

  const expected = sign(encoded)
  const actualBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null
  }

  try {
    return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as CaptchaPayload
  } catch {
    return null
  }
}

export function createCaptcha(event: H3Event) {
  const left = crypto.randomInt(2, 10)
  const right = crypto.randomInt(2, 10)
  const payload: CaptchaPayload = {
    answer: String(left + right),
    expiresAt: Date.now() + ttlMs,
    nonce: crypto.randomBytes(12).toString('base64url')
  }

  setCookie(event, cookieName, encodePayload(payload), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ttlMs / 1000
  })

  return { question: `${left} + ${right} = ?`, expiresIn: ttlMs / 1000 }
}

export function verifyCaptcha(event: H3Event, answer: string) {
  const cookie = getCookie(event, cookieName)
  const payload = cookie ? decodePayload(cookie) : null

  if (!payload || payload.expiresAt < Date.now()) {
    deleteCookie(event, cookieName, { path: '/' })
    throw apiError(400, 'CAPTCHA_EXPIRED', 'Human verification expired, please refresh it')
  }

  if (payload.answer !== answer.trim()) {
    throw apiError(400, 'INVALID_CAPTCHA', 'Human verification answer is incorrect')
  }

  deleteCookie(event, cookieName, { path: '/' })
}
