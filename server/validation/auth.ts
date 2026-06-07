import { z } from 'zod'

export const sendRegisterCodeSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  captchaAnswer: z.string().trim().min(1).max(3).regex(/^\d+$/)
})

export const registerSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  gameId: z.string().trim().min(2).max(40),
  password: z.string().min(8).regex(/[A-Za-z]/).regex(/[0-9]/),
  emailCode: z.string().regex(/^\d{6}$/)
})

export const loginSchema = z.object({
  emailOrGameId: z.string().trim().min(2).max(80),
  password: z.string().min(1)
})
