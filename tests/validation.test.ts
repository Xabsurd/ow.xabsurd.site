import { describe, expect, it } from 'vitest'
import { workshopCodeSchema } from '../server/validation/common'
import { sendRegisterCodeSchema } from '../server/validation/auth'

describe('workshopCodeSchema', () => {
  it('uppercases valid codes', () => {
    expect(workshopCodeSchema.parse('abc123')).toBe('ABC123')
  })

  it('rejects unsafe characters', () => {
    expect(() => workshopCodeSchema.parse('ABC-123')).toThrow()
  })
})

describe('sendRegisterCodeSchema', () => {
  it('requires a human verification answer before email code is sent', () => {
    expect(sendRegisterCodeSchema.safeParse({ email: 'player@example.com' }).success).toBe(false)
    expect(sendRegisterCodeSchema.safeParse({ email: 'player@example.com', captchaAnswer: '12' }).success).toBe(true)
  })
})
