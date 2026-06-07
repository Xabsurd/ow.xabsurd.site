import { readBody } from 'h3'
import { hashValue, createNumericCode } from '../../utils/security'
import { sendVerificationEmail } from '../../utils/email'
import { prisma } from '../../utils/db'
import { assertRateLimit } from '../../utils/rate-limit'
import { apiError, zodDetails } from '../../utils/errors'
import { sendRegisterCodeSchema } from '../../validation/auth'
import { verifyCaptcha } from '../../utils/captcha'

export default defineEventHandler(async (event) => {
  assertRateLimit(event, 'send-register-code', 5, 60 * 60 * 1000)

  const parsed = sendRegisterCodeSchema.safeParse(await readBody(event))
  if (!parsed.success) throw apiError(400, 'VALIDATION_ERROR', 'Invalid email or captcha', zodDetails(parsed.error))

  verifyCaptcha(event, parsed.data.captchaAnswer)

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (existing) throw apiError(409, 'EMAIL_EXISTS', 'Email already registered')

  const cooldownStartedAt = new Date(Date.now() - 60 * 1000)
  const recent = await prisma.emailVerificationCode.findFirst({
    where: {
      email: parsed.data.email,
      purpose: 'REGISTER',
      createdAt: { gt: cooldownStartedAt }
    },
    orderBy: { createdAt: 'desc' }
  })
  if (recent) throw apiError(429, 'EMAIL_COOLDOWN', '邮箱验证码 1 分钟内只能发送一次，请稍后再试。')

  const code = createNumericCode()
  try {
    await sendVerificationEmail(parsed.data.email, code)
  } catch (error) {
    console.error(error)
    throw apiError(502, 'EMAIL_SEND_FAILED', '邮箱验证码发送失败，请检查 SMTP 发件配置后重试。')
  }

  await prisma.emailVerificationCode.create({
    data: {
      email: parsed.data.email,
      codeHash: hashValue(code),
      purpose: 'REGISTER',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    }
  })

  return { ok: true }
})
