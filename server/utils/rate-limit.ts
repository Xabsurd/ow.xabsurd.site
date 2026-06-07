import { getRequestIP, type H3Event } from 'h3'
import { apiError } from './errors'

const buckets = new Map<string, number[]>()

export function assertRateLimit(event: H3Event, bucket: string, limit: number, windowMs: number) {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const key = `${bucket}:${ip}`
  const now = Date.now()
  const hits = (buckets.get(key) || []).filter((time) => now - time < windowMs)

  if (hits.length >= limit) {
    throw apiError(429, 'RATE_LIMITED', 'Too many requests')
  }

  hits.push(now)
  buckets.set(key, hits)
}
