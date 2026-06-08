import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { PrismaClient, UserRole } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

type RawMap = {
  code?: string
  map_code?: string
  map_name?: string
  map_type?: string[]
  reprint?: string
  mechanics?: string[]
  checkpoints?: number
  creators?: string
  difficulty?: string
  desc?: string
  quality?: number
  date?: string
}

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required.')
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(databaseUrl)
})

const mapNameAliases: Record<string, string> = {
  '墓园': 'Necropolis',
  '巴黎': 'Paris',
  '“地平线”月球基地': 'Horizon Lunar Colony',
  '地平线月球基地': 'Horizon Lunar Colony',
  '好莱坞': 'Hollywood',
  '艾兴瓦尔德': 'Eichenwalde',
  '马来温多': 'Malevento',
  '监测站-直布罗陀': 'Watchpoint: Gibraltar',
  '漓江塔': 'Lijiang Tower',
  '阿努比斯神殿': 'Temple of Anubis',
  '努纳塞比': 'Numbani'
}

const difficultyAliases: Record<string, string> = {
  'medium': 'Medium',
  'medium+': 'Medium+',
  'hard-': 'Hard-',
  'hard': 'Hard',
  'hard+': 'Hard+',
  'vh': 'Very Hard',
  'very hard': 'Very Hard',
  'very hard+': 'Very Hard+',
  'xx': 'Extreme',
  '编辑器': 'Medium'
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeDifficulty(value: unknown, group: string) {
  const raw = String(value || group).trim()
  return difficultyAliases[raw.toLowerCase()] || raw
}

function normalizeMapName(name: string) {
  return mapNameAliases[name.trim()] || name.trim()
}

function descriptionFor(row: RawMap, sourceMapName: string) {
  const lines = [
    row.desc && row.desc !== 'No description available' ? row.desc : '',
    `源氏跑酷地图：${sourceMapName}`,
    row.reprint ? `转载/备用代码：${row.reprint}` : '',
    row.quality ? `数据评分：${row.quality}` : '',
    row.date ? `数据日期：${row.date}` : ''
  ].filter(Boolean)

  return lines.join('\n\n') || '源氏跑酷地图，来自导入数据。'
}

async function getImporterUser() {
  const configuredEmail = process.env.INITIAL_ADMIN_EMAIL
  const existing =
    configuredEmail
      ? await prisma.user.findUnique({ where: { email: configuredEmail } })
      : await prisma.user.findFirst({ where: { role: UserRole.ADMIN }, orderBy: { createdAt: 'asc' } })

  if (existing) return existing

  return prisma.user.create({
    data: {
      email: 'importer@ow.local',
      gameId: 'Importer#0001',
      passwordHash: await bcrypt.hash(`import-${Date.now()}-${Math.random()}`, 12),
      role: UserRole.ADMIN
    }
  })
}

async function connectTags(tags: string[]) {
  const clean = [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))].slice(0, 10)

  return Promise.all(
    clean.map(async (name) => {
      const slug = slugify(name)
      const tag = await prisma.tag.upsert({
        where: { slug },
        update: { name },
        create: { name, slug, isHot: true }
      })
      return { tagId: tag.id }
    })
  )
}

async function main() {
  const file = path.resolve('public/maps-data.json')
  const raw = JSON.parse(await readFile(file, 'utf8')) as Record<string, RawMap[]>
  const importer = await getImporterUser()
  const rows = Object.entries(raw).flatMap(([group, items]) =>
    Array.isArray(items) ? items.map((item) => ({ group, item })) : []
  )

  let imported = 0
  let updated = 0
  let skipped = 0

  for (const { group, item } of rows) {
    const workshopCode = String(item.map_code || item.code || '').trim().toUpperCase()
    const sourceMapName = String(item.map_name || '').trim()

    if (!workshopCode || !sourceMapName) {
      skipped += 1
      continue
    }

    const difficulty = normalizeDifficulty(item.difficulty, group)
    const mapName = normalizeMapName(sourceMapName)
    const tags = ['源氏跑酷', ...(item.map_type || []), ...(item.mechanics || [])]
    const tagConnections = await connectTags(tags)
    const existing = await prisma.workshopCode.findFirst({
      where: { workshopCode },
      select: { id: true }
    })

    const data = {
      workshopCode,
      title: `${sourceMapName} · ${workshopCode}`,
      description: descriptionFor(item, sourceMapName),
      type: '跑酷',
      difficulty,
      mapName,
      authorName: item.creators || '未知作者',
      version: item.reprint || null,
      region: 'Global',
      playerCount: item.checkpoints ? `${item.checkpoints} 关` : null,
      language: 'zh-CN',
      status: 'APPROVED' as const,
      reviewedAt: new Date(),
      uploaderId: importer.id
    }

    if (existing) {
      await prisma.workshopCodeTag.deleteMany({ where: { workshopCodeId: existing.id } })
      await prisma.workshopCode.update({
        where: { id: existing.id },
        data: {
          ...data,
          tags: { create: tagConnections },
          parkour: {
            upsert: {
              create: {
                hero: 'genji',
                levelCount: Math.max(1, Number(item.checkpoints || 1)),
                timerSupported: true,
                beginnerFriendly: ['Easy-', 'Easy', 'Easy+', 'Medium-', 'Medium'].includes(difficulty),
                notes: item.quality ? `quality: ${item.quality}` : null
              },
              update: {
                hero: 'genji',
                levelCount: Math.max(1, Number(item.checkpoints || 1)),
                timerSupported: true,
                beginnerFriendly: ['Easy-', 'Easy', 'Easy+', 'Medium-', 'Medium'].includes(difficulty),
                notes: item.quality ? `quality: ${item.quality}` : null
              }
            }
          }
        }
      })
      updated += 1
    } else {
      await prisma.workshopCode.create({
        data: {
          ...data,
          tags: { create: tagConnections },
          parkour: {
            create: {
              hero: 'genji',
              levelCount: Math.max(1, Number(item.checkpoints || 1)),
              timerSupported: true,
              beginnerFriendly: ['Easy-', 'Easy', 'Easy+', 'Medium-', 'Medium'].includes(difficulty),
              notes: item.quality ? `quality: ${item.quality}` : null
            }
          }
        }
      })
      imported += 1
    }
  }

  console.log(`Genji map import complete. imported=${imported}, updated=${updated}, skipped=${skipped}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
