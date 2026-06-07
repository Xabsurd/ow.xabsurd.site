import 'dotenv/config'
import { PrismaClient, UserRole } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to seed the database.')
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(databaseUrl)
})

async function main() {
  const email = process.env.INITIAL_ADMIN_EMAIL
  const password = process.env.INITIAL_ADMIN_PASSWORD

  if (!email) {
    console.log('INITIAL_ADMIN_EMAIL is not set; skipping admin seed.')
    return
  }

  if (!password) {
    throw new Error('INITIAL_ADMIN_PASSWORD is required for production seed.')
  }

  await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash: await bcrypt.hash(password, 12),
      role: UserRole.ADMIN,
      isBanned: false
    },
    create: {
      email,
      gameId: 'Admin#0001',
      passwordHash: await bcrypt.hash(password, 12),
      role: UserRole.ADMIN
    }
  })

  console.log(`Admin ready: ${email}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
