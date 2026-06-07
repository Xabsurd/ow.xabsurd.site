import crypto from 'node:crypto'

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url')
}

export function hashValue(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

export function createNumericCode() {
  return crypto.randomInt(100000, 1000000).toString()
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
}
