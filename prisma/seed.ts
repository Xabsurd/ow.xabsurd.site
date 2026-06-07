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
  const password = process.env.INITIAL_ADMIN_PASSWORD || 'ChangeMe12345'

  if (!email) {
    console.log('INITIAL_ADMIN_EMAIL is not set; skipping admin seed.')
    return
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
  .finally(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
