export const difficultyOptions = [
  { value: 'Easy-', label: 'Easy-', subtitle: '简单-', color: '#16a34a' },
  { value: 'Easy', label: 'Easy', subtitle: '简单', color: '#16a34a' },
  { value: 'Easy+', label: 'Easy+', subtitle: '简单+', color: '#16a34a' },
  { value: 'Medium-', label: 'Medium-', subtitle: '中等-', color: '#d99a00' },
  { value: 'Medium', label: 'Medium', subtitle: '中等', color: '#d99a00' },
  { value: 'Medium+', label: 'Medium+', subtitle: '中等+', color: '#d99a00' },
  { value: 'Hard-', label: 'Hard-', subtitle: '困难-', color: '#f97316' },
  { value: 'Hard', label: 'Hard', subtitle: '困难', color: '#f97316' },
  { value: 'Hard+', label: 'Hard+', subtitle: '困难+', color: '#f97316' },
  { value: 'Very Hard-', label: 'Very Hard-', subtitle: '非常困难-', color: '#ef4444' },
  { value: 'Very Hard', label: 'Very Hard', subtitle: '非常困难', color: '#dc2626' },
  { value: 'Very Hard+', label: 'Very Hard+', subtitle: '非常困难+', color: '#dc2626' },
  { value: 'Extreme-', label: 'Extreme-', subtitle: '极限-', color: '#9333ea' },
  { value: 'Extreme', label: 'Extreme', subtitle: '极限', color: '#7e22ce' },
  { value: 'Extreme+', label: 'Extreme+', subtitle: '极限+', color: '#7e22ce' },
  { value: 'Hell', label: 'Hell', subtitle: '地狱', color: '#020617' }
] as const

export const legacyDifficultyOptions = ['入门', '简单', '普通', '困难', '专家', '地狱'] as const

export const codeTypes = ['娱乐', '竞技', '训练', '跑酷', 'PVE', 'PVP', '小游戏', '工具', '其他'] as const

export const parkourHeroes = [
  { value: 'genji', label: '源氏跑酷', shortLabel: '源氏' },
  { value: 'kiriko', label: '雾子跑酷', shortLabel: '雾子' },
  { value: 'doomfist', label: '铁拳跑酷', shortLabel: '铁拳' },
  { value: 'lucio', label: '卢西奥跑酷', shortLabel: '卢西奥' },
  { value: 'other', label: '其他英雄跑酷', shortLabel: '其他' }
] as const

export function parkourHeroLabel(value?: string | null) {
  return parkourHeroes.find((hero) => hero.value === value)?.shortLabel || value || ''
}

export const codeTypeLabels: Record<string, { zh: string; en: string }> = {
  娱乐: { zh: '娱乐', en: 'Fun' },
  竞技: { zh: '竞技', en: 'Competitive' },
  训练: { zh: '训练', en: 'Training' },
  跑酷: { zh: '跑酷', en: 'Parkour' },
  PVE: { zh: 'PVE', en: 'PVE' },
  PVP: { zh: 'PVP', en: 'PVP' },
  小游戏: { zh: '小游戏', en: 'Minigame' },
  工具: { zh: '工具', en: 'Tool' },
  其他: { zh: '其他', en: 'Other' }
}

export const workshopTags = [
  { name: '卡小', color: '#8b5cf6' },
  { name: '原地滑步', color: '#3b82f6' },
  { name: '图外点位', color: '#6b3000' },
  { name: '大份', color: '#f59e0b' },
  { name: '宝宝佳已通过', color: '#ec4899' },
  { name: '平地卡小', color: '#6366f1' },
  { name: '延二段', color: '#6366f1' },
  { name: '弹射', color: '#ef4444' },
  { name: '扫码惹', color: '#8b5cf6' },
  { name: '找路', color: '#14b8a6' },
  { name: '技巧', color: '#f59e0b' },
  { name: '抽奖点位', color: '#403c3a' },
  { name: '极限点位', color: '#ef4444' },
  { name: '死小', color: '#14b8a6' },
  { name: '滑滑乐', color: '#3b82f6' },
  { name: '狗洞', color: '#eeff00' },
  { name: '猎奇点位', color: '#ef4444' },
  { name: '留爬', color: '#84cc16' },
  { name: '竞速', color: '#eeff00' },
  { name: '简单图', color: '#84cc16' },
  { name: '系统跳', color: '#f97316' },
  { name: '经典', color: '#f1f50f' },
  { name: '老图', color: '#06b6d4' },
  { name: '自动卡小', color: '#8b5cf6' },
  { name: '萌新小进阶', color: '#14b8a6' },
  { name: '萌新进阶', color: '#84cc16' },
  { name: '表情小', color: '#14b8a6' },
  { name: '走路', color: '#3b82f6' },
  { name: '超级大份', color: '#6b3000' },
  { name: '超级跳', color: '#ff6b35' },
  { name: '超级长', color: '#84cc16' },
  { name: '蹭留', color: '#ef4444' },
  { name: '身位', color: '#f97316' },
  { name: '闸图', color: '#ef4444' },
  { name: '难图', color: '#ec4899' },
  { name: '难度虚标', color: '#ef4444' },
  { name: '马拉松', color: '#3b82f6' }
] as const

export const overwatchMaps = [
  { name: 'Aatlis', slug: 'aatlis', mode: 'flashpoint', image: '/maps/aatlis.webp' },
  { name: 'Antarctic Peninsula', slug: 'antarctic-peninsula', mode: 'control', image: '/maps/antarctic-peninsula.webp' },
  { name: 'Temple of Anubis', slug: 'anubis', mode: 'assault', image: '/maps/anubis.webp' },
  { name: 'Arena Victoriae', slug: 'arena-victoriae', mode: 'control', image: '/maps/arena-victoriae.webp' },
  { name: 'Ayutthaya', slug: 'ayutthaya', mode: 'capture the flag', image: '/maps/ayutthaya.webp' },
  { name: 'Black Forest', slug: 'black-forest', mode: 'arena', image: '/maps/black-forest.webp' },
  { name: 'Blizzard World', slug: 'blizzard-world', mode: 'hybrid', image: '/maps/blizzard-world.webp' },
  { name: 'Busan', slug: 'busan', mode: 'control', image: '/maps/busan.webp' },
  { name: 'Castillo', slug: 'castillo', mode: 'arena', image: '/maps/castillo.webp' },
  { name: 'Chateau Guillard', slug: 'chateau-guillard', mode: 'deathmatch', image: '/maps/chateau-guillard.webp' },
  { name: 'Circuit Royal', slug: 'circuit-royal', mode: 'escort', image: '/maps/circuit-royal.webp' },
  { name: 'Colosseo', slug: 'colosseo', mode: 'push', image: '/maps/colosseo.webp' },
  { name: 'Dorado', slug: 'dorado', mode: 'escort', image: '/maps/dorado.webp' },
  { name: 'Ecopoint: Antarctica', slug: 'ecopoint-antarctica', mode: 'arena', image: '/maps/ecopoint-antarctica.webp' },
  { name: 'Eichenwalde', slug: 'eichenwalde', mode: 'hybrid', image: '/maps/eichenwalde.webp' },
  { name: 'Esperanca', slug: 'esperanca', mode: 'push', image: '/maps/esperanca.webp' },
  { name: 'Gogadoro', slug: 'gogadoro', mode: 'clash', image: '/maps/gogadoro.webp' },
  { name: 'Hanamura', slug: 'hanamura', mode: 'assault', image: '/maps/hanamura.webp' },
  { name: 'Hanaoka', slug: 'hanaoka', mode: 'clash', image: '/maps/hanaoka.webp' },
  { name: 'Havana', slug: 'havana', mode: 'escort', image: '/maps/havana.webp' },
  { name: 'Hollywood', slug: 'hollywood', mode: 'hybrid', image: '/maps/hollywood.webp' },
  { name: 'Horizon Lunar Colony', slug: 'horizon-lunar-colony', mode: 'assault', image: '/maps/horizon-lunar-colony.webp' },
  { name: 'Ilios', slug: 'ilios', mode: 'control', image: '/maps/ilios.webp' },
  { name: 'Junkertown', slug: 'junkertown', mode: 'escort', image: '/maps/junkertown.webp' },
  { name: 'Lijiang Tower', slug: 'lijiang-tower', mode: 'control', image: '/maps/lijiang-tower.webp' },
  { name: 'Kanezaka', slug: 'kanezaka', mode: 'deathmatch', image: '/maps/kanezaka.webp' },
  { name: 'Kings Row', slug: 'kings-row', mode: 'hybrid', image: '/maps/kings-row.webp' },
  { name: 'Malevento', slug: 'malevento', mode: 'deathmatch', image: '/maps/malevento.webp' },
  { name: 'Midtown', slug: 'midtown', mode: 'hybrid', image: '/maps/midtown.webp' },
  { name: 'Necropolis', slug: 'necropolis', mode: 'arena', image: '/maps/necropolis.webp' },
  { name: 'Nepal', slug: 'nepal', mode: 'control', image: '/maps/nepal.webp' },
  { name: 'New Junk City', slug: 'new-junk-city', mode: 'flashpoint', image: '/maps/new-junk-city.webp' },
  { name: 'New Queen Street', slug: 'new-queen-street', mode: 'push', image: '/maps/new-queen-street.webp' },
  { name: 'Numbani', slug: 'numbani', mode: 'hybrid', image: '/maps/numbani.webp' },
  { name: 'Oasis', slug: 'oasis', mode: 'control', image: '/maps/oasis.webp' },
  { name: 'Paraiso', slug: 'paraiso', mode: 'hybrid', image: '/maps/paraiso.webp' },
  { name: 'Paris', slug: 'paris', mode: 'assault', image: '/maps/paris.webp' },
  { name: 'Petra', slug: 'petra', mode: 'deathmatch', image: '/maps/petra.webp' },
  { name: 'Place Lacroix', slug: 'place-lacroix', mode: 'deathmatch', image: '/maps/place-lacroix.webp' },
  { name: 'Powder Keg Mine', slug: 'powder-keg-mine', mode: 'arena', image: '/maps/powder-keg-mine.webp' },
  { name: 'Practice Range', slug: 'practice-range', mode: 'training', image: '/maps/practice-range.webp' },
  { name: 'Redwood Dam', slug: 'redwood-dam', mode: 'arena', image: '/maps/redwood-dam.webp' },
  { name: 'Rialto', slug: 'rialto', mode: 'escort', image: '/maps/rialto.webp' },
  { name: 'Route 66', slug: 'route-66', mode: 'escort', image: '/maps/route-66.webp' },
  { name: 'Runasapi', slug: 'runasapi', mode: 'push', image: '/maps/runasapi.webp' },
  { name: 'Samoa', slug: 'samoa', mode: 'control', image: '/maps/samoa.webp' },
  { name: 'Shambali Monastery', slug: 'shambali-monastery', mode: 'escort', image: '/maps/shambali-monastery.webp' },
  { name: 'Suravasa', slug: 'suravasa', mode: 'flashpoint', image: '/maps/suravasa.webp' },
  { name: 'Thames District', slug: 'thames-district', mode: 'clash', image: '/maps/thames-district.webp' },
  { name: 'Throne of Anubis', slug: 'throne-of-anubis', mode: 'clash', image: '/maps/throne-of-anubis.webp' },
  { name: 'Volskaya Industries', slug: 'volskaya-industries', mode: 'assault', image: '/maps/volskaya-industries.webp' },
  { name: 'Watchpoint: Gibraltar', slug: 'watchpoint-gibraltar', mode: 'escort', image: '/maps/watchpoint-gibraltar.webp' },
  { name: 'Workshop Chamber', slug: 'workshop-chamber', mode: 'workshop', image: '/maps/workshop-chamber.webp' },
  { name: 'Workshop Expanse', slug: 'workshop-expanse', mode: 'workshop', image: '/maps/workshop-expanse.webp' },
  { name: 'Workshop Green Screen', slug: 'workshop-green-screen', mode: 'workshop', image: '/maps/workshop-green-screen.webp' },
  { name: 'Workshop Island', slug: 'workshop-island', mode: 'workshop', image: '/maps/workshop-island.webp' },
  { name: 'Wuxing University', slug: 'wuxing-university', mode: 'capture the flag', image: '/maps/wuxing-university.webp' }
] as const

export const mapZhNames: Record<string, string> = {
  aatlis: '阿特利斯',
  'antarctic-peninsula': '南极半岛',
  anubis: '阿努比斯神殿',
  'arena-victoriae': '维多利亚竞技场',
  ayutthaya: '阿育陀耶',
  'black-forest': '黑森林',
  'blizzard-world': '暴雪世界',
  busan: '釜山',
  castillo: '城堡',
  'chateau-guillard': '吉拉德堡',
  'circuit-royal': '皇家赛道',
  colosseo: '斗兽场',
  dorado: '多拉多',
  'ecopoint-antarctica': '生态监测站：南极洲',
  eichenwalde: '艾兴瓦尔德',
  esperanca: '埃斯佩兰萨',
  gogadoro: '戈加多罗',
  hanamura: '花村',
  hanaoka: '花冈',
  havana: '哈瓦那',
  hollywood: '好莱坞',
  'horizon-lunar-colony': '“地平线”月球基地',
  ilios: '伊利奥斯',
  junkertown: '渣客镇',
  'lijiang-tower': '漓江塔',
  kanezaka: '金坂',
  'kings-row': '国王大道',
  malevento: '马莱温多',
  midtown: '中城',
  necropolis: '墓园',
  nepal: '尼泊尔',
  'new-junk-city': '新渣客城',
  'new-queen-street': '新皇后街',
  numbani: '努巴尼',
  oasis: '绿洲城',
  paraiso: '帕莱索',
  paris: '巴黎',
  petra: '佩特拉',
  'place-lacroix': '拉克鲁瓦城',
  'powder-keg-mine': '火药桶矿井',
  'practice-range': '训练靶场',
  'redwood-dam': '红杉水坝',
  rialto: '里阿尔托',
  'route-66': '66 号公路',
  runasapi: '鲁纳萨皮',
  samoa: '萨摩亚',
  'shambali-monastery': '香巴里寺院',
  suravasa: '苏拉瓦萨',
  'thames-district': '泰晤士区',
  'throne-of-anubis': '阿努比斯王座',
  'volskaya-industries': '沃斯卡娅工业区',
  'watchpoint-gibraltar': '监测站：直布罗陀',
  'workshop-chamber': '工坊室内',
  'workshop-expanse': '工坊开阔地',
  'workshop-green-screen': '工坊绿幕',
  'workshop-island': '工坊岛屿',
  'wuxing-university': '五行大学'
}

export const mapModeZhNames: Record<string, string> = {
  arena: '竞技场',
  assault: '攻防作战',
  'capture the flag': '勇夺锦旗',
  clash: '争锋',
  control: '占领要点',
  deathmatch: '死斗',
  escort: '运载目标',
  flashpoint: '闪点作战',
  hybrid: '攻击/护送',
  push: '机动推进',
  training: '训练',
  workshop: '工坊'
}

export type OverwatchMap = (typeof overwatchMaps)[number] & { zhName?: string | null; isEnabled?: boolean; overridden?: boolean }

export function localizedMapName(map: OverwatchMap, locale?: string) {
  return locale?.startsWith('zh') ? map.zhName || mapZhNames[map.slug] || map.name : map.name
}

export function localizedMapValue(value?: string | null, locale?: string) {
  if (!value) return ''
  const map = findOverwatchMap(value)
  if (map) return localizedMapName(map, locale)
  if (!locale?.startsWith('zh')) return value
  const matched = overwatchMaps.find((item) => item.name === value || item.slug === value)
  return matched ? mapZhNames[matched.slug] || matched.name : value
}

export function localizedMapMode(map: OverwatchMap, locale?: string) {
  return locale?.startsWith('zh') ? mapModeZhNames[map.mode] || map.mode : map.mode
}

export function localizedCodeType(type?: string | null, locale?: string) {
  if (!type) return locale?.startsWith('zh') ? '其他' : 'Other'
  const label = codeTypeLabels[type]
  if (!label) return type
  return locale?.startsWith('zh') ? label.zh : label.en
}

export function mapSearchTerms(map: OverwatchMap) {
  return [map.name, mapZhNames[map.slug], map.mode, mapModeZhNames[map.mode], map.slug].filter(Boolean)
}

export function findOverwatchMap(value?: string | null) {
  if (!value) return undefined
  return overwatchMaps.find((map) => map.name === value || mapZhNames[map.slug] === value || map.slug === value)
}
