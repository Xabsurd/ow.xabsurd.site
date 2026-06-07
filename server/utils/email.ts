import nodemailer from 'nodemailer'

function parseAddress(value: string) {
  const match = value.match(/<([^<>@\s]+@[^<>@\s]+)>|([^<>\s]+@[^<>\s]+)/)
  return match?.[1] || match?.[2] || ''
}

function parseDisplayName(value: string) {
  const withoutAddress = value.replace(/<[^<>]+>|[^<>\s]+@[^<>\s]+/g, '').trim()
  return withoutAddress.replace(/^["']|["']$/g, '').trim()
}

function formatMailbox(name: string, address: string) {
  return name ? `"${name.replace(/"/g, '\\"')}" <${address}>` : address
}

function resolveSender(smtpUser: string, smtpFrom: string) {
  if (!smtpUser) return smtpFrom || 'Overwatch Workshop <no-reply@example.com>'

  const configuredAddress = parseAddress(smtpFrom)
  const displayName = parseDisplayName(smtpFrom) || '守望工坊库'

  if (!configuredAddress || configuredAddress.toLowerCase() !== smtpUser.toLowerCase()) {
    return formatMailbox(displayName, smtpUser)
  }

  return smtpFrom
}

export async function sendVerificationEmail(email: string, code: string) {
  const config = useRuntimeConfig()

  if (!config.smtpHost) {
    console.info(`[email:dev] verification code for ${email}: ${code}`)
    return
  }

  const port = Number(config.smtpPort || 587)
  const smtpUser = typeof config.smtpUser === 'string' ? config.smtpUser : ''
  const smtpFrom = typeof config.smtpFrom === 'string' ? config.smtpFrom : ''
  const from = resolveSender(smtpUser, smtpFrom)
  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port,
    secure: port === 465,
    auth:
      config.smtpUser && config.smtpPass
        ? {
            user: config.smtpUser,
            pass: config.smtpPass
          }
        : undefined
  })

  await transporter.sendMail({
    from,
    envelope: smtpUser ? { from: smtpUser, to: email } : undefined,
    to: email,
    subject: '守望工坊库验证码 / Overwatch Workshop verification code',
    text: `你的验证码是 ${code}，10 分钟内有效。\n\nYour verification code is ${code}. It expires in 10 minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h2 style="margin:0 0 12px">守望工坊库验证码</h2>
        <p>你的验证码是：</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:4px;margin:12px 0">${code}</p>
        <p>验证码 10 分钟内有效。如果不是你本人操作，可以忽略这封邮件。</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0" />
        <p>Your verification code is <strong>${code}</strong>. It expires in 10 minutes.</p>
      </div>
    `
  })
}
