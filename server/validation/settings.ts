import { z } from 'zod'

export const updateSettingsSchema = z
  .object({
    gameId: z.string().trim().min(2).max(40).optional(),
    currentPassword: z.string().min(1).optional(),
    newPassword: z.string().min(8).regex(/[A-Za-z]/).regex(/[0-9]/).optional()
  })
  .refine((data) => data.gameId || data.newPassword, {
    message: 'No changes submitted'
  })
  .refine((data) => !data.newPassword || data.currentPassword, {
    message: 'Current password is required'
  })
