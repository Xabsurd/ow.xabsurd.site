import 'dotenv/config'
import { PrismaClient, UserRole } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

type Ow62Map = {
  id: number
  game_map_name?: string
  title?: string
  code?: string
  author_name?: string | null
  difficulty?: string | null
  difficulty_start?: string | null
  map_type?: string | null
  level_count?: number | null
  tags?: string | string[] | null
  views?: number | null
  status?: string | null
  created_at?: string | null
  description?: string | null
  uploader_username?: string | null
}

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required.')
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(databaseUrl)
})

const mapNameAliases: Record<string, string> = {
  '66号公路': 'Route 66',
  '万圣节吉拉德堡': 'Chateau Guillard',
  '万圣节好莱坞': 'Hollywood',
  '万圣节艾兴瓦尔德': 'Eichenwalde',
  '中城': 'Midtown',
  '伊利奥斯': 'Ilios',
  '伊利奥斯废墟': 'Ilios',
  '佩特拉': 'Petra',
  '努巴尼': 'Numbani',
  '南极半岛': 'Antarctic Peninsula',
  '南极洲': 'Ecopoint: Antarctica',
  '吉拉德堡': 'Chateau Guillard',
  '哈瓦那': 'Havana',
  '国王大道': 'Kings Row',
  '圣诞节南极洲': 'Ecopoint: Antarctica',
  '圣诞节国王大道': 'Kings Row',
  '圣诞节暴雪世界': 'Blizzard World',
  '圣诞节花村': 'Hanamura',
  '地图工坊室内': 'Workshop Chamber',
  '地图工坊岛屿': 'Workshop Expanse',
  '地图工坊空地': 'Workshop Island',
  '地平线月球基地': 'Horizon Lunar Colony',
  '埃斯佩兰萨': 'Esperanca',
  '城堡': 'Castillo',
  '多拉多': 'Dorado',
  '好莱坞': 'Hollywood',
  '尼泊尔': 'Nepal',
  '尼泊尔神殿': 'Nepal',
  '巴黎': 'Paris',
  '帕拉伊苏': 'Paraiso',
  '斗兽场': 'Colosseo',
  '新渣客城': 'New Junk City',
  '新皇后街': 'New Queen Street',
  '暴雪世界': 'Blizzard World',
  '沃斯卡娅工业区': 'Volskaya Industries',
  '渣客镇': 'Junkertown',
  '漓江塔': 'Lijiang Tower',
  '皇家赛道': 'Circuit Royal',
  '直布罗陀': 'Watchpoint: Gibraltar',
  '绿洲城': 'Oasis',
  '艾兴瓦尔德': 'Eichenwalde',
  '花冈': 'Hanaoka',
  '花村': 'Hanamura',
  '苏拉瓦萨': 'Suravasa',
  '萨摩亚': 'Samoa',
  '里阿尔托': 'Rialto',
  '釜山': 'Busan',
  '铁坂': 'Kanezaka',
  '铁板': 'Kanezaka',
  '阿努比斯王座': 'Throne of Anubis',
  '阿努比斯神殿': 'Temple of Anubis',
  '阿特利斯': 'Aatlis',
  '阿育陀耶': 'Ayutthaya',
  '香巴里寺院': 'Shambali Monastery',
  '马莱温多': 'Malevento',
  '鲁纳塞彼': 'Runasapi'
}

const difficultyAliases: Record<string, string> = {
  easy_minus: 'Easy-',
  easy: 'Easy',
  easy_plus: 'Easy+',
  medium_minus: 'Medium-',
  medium: 'Medium',
  medium_plus: 'Medium+',
  hard_minus: 'Hard-',
  hard: 'Hard',
  hard_plus: 'Hard+',
  very_hard_minus: 'Very Hard-',
  very_hard: 'Very Hard',
  very_hard_plus: 'Very Hard+',
  extreme_minus: 'Extreme-',
  extreme: 'Extreme',
  extreme_plus: 'Extreme+',
  hell: 'Hell'
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeDifficulty(value?: string | null) {
  const raw = String(value || 'Medium').trim()
  return difficultyAliases[raw.toLowerCase()] || raw
}

function splitDifficulty(row: Ow62Map) {
  const raw = String(row.difficulty || '').trim()
  if (raw.includes(' - ')) {
    const [start, end] = raw.split(' - ').map((part) => normalizeDifficulty(part))
    return { difficultyStart: start, difficulty: end || start || 'Medium' }
  }
  return {
    difficultyStart: row.difficulty_start ? normalizeDifficulty(row.difficulty_start) : null,
    difficulty: normalizeDifficulty(row.difficulty)
  }
}

function normalizeMapName(value?: string) {
  const names = String(value || '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
  const first = names[0] || '未填写'
  return mapNameAliases[first] || first
}

function parseTags(value: Ow62Map['tags']) {
  const tags = Array.isArray(value) ? value : String(value || '').split(',')
  return ['源氏跑酷', ...tags.map((tag) => tag.trim()).filter(Boolean)]
}

function descriptionFor(row: Ow62Map) {
  const lines = [
    row.description?.trim(),
    `来源：ow62.icu/maps #${row.id}`,
    row.game_map_name ? `原始地图：${row.game_map_name}` : '',
    row.uploader_username ? `上传者：${row.uploader_username}` : '',
    row.created_at ? `收录时间：${row.created_at}` : ''
  ].filter(Boolean)

  return lines.join('\n\n') || '源氏跑酷地图，来自 ow62.icu 数据同步。'
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

async function fetchOw62Maps() {
  const rows: Ow62Map[] = []
  const limit = 100

  for (let page = 1; ; page += 1) {
    const url = `https://ow62.icu/api/maps?limit=${limit}&page=${page}&t=${Date.now()}`
    const response = await fetch(url, { headers: { 'Cache-Control': 'no-cache' } })
    if (!response.ok) throw new Error(`ow62 request failed: ${response.status} ${response.statusText}`)

    const payload = (await response.json()) as { maps?: Ow62Map[]; total?: number }
    rows.push(...(payload.maps || []))

    if (!payload.maps?.length || rows.length >= (payload.total || 0)) break
  }

  return rows
}

async function main() {
  const importer = await getImporterUser()
  const rows = (await fetchOw62Maps()).filter((row) => row.status === 'approved')
  let imported = 0
  let updated = 0
  let skipped = 0

  for (const row of rows) {
    const workshopCode = String(row.code || '').trim().toUpperCase()
    if (!workshopCode || !row.id) {
      skipped += 1
      continue
    }

    const { difficulty, difficultyStart } = splitDifficulty(row)
    const tagConnections = await connectTags(parseTags(row.tags))
    const existing = await prisma.workshopCode.findFirst({
      where: { parkour: { is: { source: 'ow62', sourceId: String(row.id) } } },
      select: { id: true }
    })

    const data = {
      workshopCode,
      title: row.title?.trim() || `${row.game_map_name || '源氏跑酷'} · ${workshopCode}`,
      description: descriptionFor(row),
      type: '跑酷',
      difficulty,
      mapName: normalizeMapName(row.game_map_name),
      authorName: row.author_name?.trim() || '未知作者',
      version: null,
      region: 'Global',
      playerCount: row.level_count ? `${row.level_count} 关` : null,
      language: 'zh-CN',
      status: 'APPROVED' as const,
      reviewedAt: new Date(),
      viewCount: Math.max(0, Number(row.views || 0)),
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
                levelCount: Math.max(1, Number(row.level_count || 1)),
                difficultyStart,
                timerSupported: true,
                beginnerFriendly: difficulty.startsWith('Easy') || difficulty.startsWith('Medium'),
                source: 'ow62',
                sourceId: String(row.id)
              },
              update: {
                hero: 'genji',
                levelCount: Math.max(1, Number(row.level_count || 1)),
                difficultyStart,
                timerSupported: true,
                beginnerFriendly: difficulty.startsWith('Easy') || difficulty.startsWith('Medium'),
                source: 'ow62',
                sourceId: String(row.id)
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
              levelCount: Math.max(1, Number(row.level_count || 1)),
              difficultyStart,
              timerSupported: true,
              beginnerFriendly: difficulty.startsWith('Easy') || difficulty.startsWith('Medium'),
              source: 'ow62',
              sourceId: String(row.id)
            }
          }
        }
      })
      imported += 1
    }
  }

  console.log(`ow62 Genji map import complete. imported=${imported}, updated=${updated}, skipped=${skipped}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
