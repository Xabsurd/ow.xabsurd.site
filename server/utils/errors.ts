import { createError } from 'h3'

export function apiError(statusCode: number, code: string, message: string, details?: unknown) {
  return createError({
    statusCode,
    statusMessage: message,
    data: { code, message, details }
  })
}

export function zodDetails(error: unknown) {
  if (typeof error === 'object' && error && 'issues' in error) {
    return (error as { issues: unknown }).issues
  }
  return undefined
}
