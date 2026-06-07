import { prisma } from './db'

const baseMaps = [
  ['aatlis', 'Aatlis', '阿特利斯', 'flashpoint', '/maps/aatlis.webp'],
  ['antarctic-peninsula', 'Antarctic Peninsula', '南极半岛', 'control', '/maps/antarctic-peninsula.webp'],
  ['anubis', 'Temple of Anubis', '阿努比斯神殿', 'assault', '/maps/anubis.webp'],
  ['arena-victoriae', 'Arena Victoriae', '维多利亚竞技场', 'control', '/maps/arena-victoriae.webp'],
  ['ayutthaya', 'Ayutthaya', '阿育陀耶', 'capture the flag', '/maps/ayutthaya.webp'],
  ['black-forest', 'Black Forest', '黑森林', 'arena', '/maps/black-forest.webp'],
  ['blizzard-world', 'Blizzard World', '暴雪世界', 'hybrid', '/maps/blizzard-world.webp'],
  ['busan', 'Busan', '釜山', 'control', '/maps/busan.webp'],
  ['castillo', 'Castillo', '城堡', 'arena', '/maps/castillo.webp'],
  ['chateau-guillard', 'Chateau Guillard', '吉拉德堡', 'deathmatch', '/maps/chateau-guillard.webp'],
  ['circuit-royal', 'Circuit Royal', '皇家赛道', 'escort', '/maps/circuit-royal.webp'],
  ['colosseo', 'Colosseo', '斗兽场', 'push', '/maps/colosseo.webp'],
  ['dorado', 'Dorado', '多拉多', 'escort', '/maps/dorado.webp'],
  ['ecopoint-antarctica', 'Ecopoint: Antarctica', '生态监测站：南极洲', 'arena', '/maps/ecopoint-antarctica.webp'],
  ['eichenwalde', 'Eichenwalde', '艾兴瓦尔德', 'hybrid', '/maps/eichenwalde.webp'],
  ['esperanca', 'Esperanca', '埃斯佩兰萨', 'push', '/maps/esperanca.webp'],
  ['gogadoro', 'Gogadoro', '戈加多罗', 'clash', '/maps/gogadoro.webp'],
  ['hanamura', 'Hanamura', '花村', 'assault', '/maps/hanamura.webp'],
  ['hanaoka', 'Hanaoka', '花冈', 'clash', '/maps/hanaoka.webp'],
  ['havana', 'Havana', '哈瓦那', 'escort', '/maps/havana.webp'],
  ['hollywood', 'Hollywood', '好莱坞', 'hybrid', '/maps/hollywood.webp'],
  ['horizon-lunar-colony', 'Horizon Lunar Colony', '“地平线”月球基地', 'assault', '/maps/horizon-lunar-colony.webp'],
  ['ilios', 'Ilios', '伊利奥斯', 'control', '/maps/ilios.webp'],
  ['junkertown', 'Junkertown', '渣客镇', 'escort', '/maps/junkertown.webp'],
  ['lijiang-tower', 'Lijiang Tower', '漓江塔', 'control', '/maps/lijiang-tower.webp'],
  ['kanezaka', 'Kanezaka', '金坂', 'deathmatch', '/maps/kanezaka.webp'],
  ['kings-row', 'Kings Row', '国王大道', 'hybrid', '/maps/kings-row.webp'],
  ['malevento', 'Malevento', '马莱温多', 'deathmatch', '/maps/malevento.webp'],
  ['midtown', 'Midtown', '中城', 'hybrid', '/maps/midtown.webp'],
  ['necropolis', 'Necropolis', '墓园', 'arena', '/maps/necropolis.webp'],
  ['nepal', 'Nepal', '尼泊尔', 'control', '/maps/nepal.webp'],
  ['new-junk-city', 'New Junk City', '新渣客城', 'flashpoint', '/maps/new-junk-city.webp'],
  ['new-queen-street', 'New Queen Street', '新皇后街', 'push', '/maps/new-queen-street.webp'],
  ['numbani', 'Numbani', '努巴尼', 'hybrid', '/maps/numbani.webp'],
  ['oasis', 'Oasis', '绿洲城', 'control', '/maps/oasis.webp'],
  ['paraiso', 'Paraiso', '帕莱索', 'hybrid', '/maps/paraiso.webp'],
  ['paris', 'Paris', '巴黎', 'assault', '/maps/paris.webp'],
  ['petra', 'Petra', '佩特拉', 'deathmatch', '/maps/petra.webp'],
  ['place-lacroix', 'Place Lacroix', '拉克鲁瓦城', 'deathmatch', '/maps/place-lacroix.webp'],
  ['powder-keg-mine', 'Powder Keg Mine', '火药桶矿井', 'arena', '/maps/powder-keg-mine.webp'],
  ['practice-range', 'Practice Range', '训练靶场', 'training', '/maps/practice-range.webp'],
  ['redwood-dam', 'Redwood Dam', '红杉水坝', 'arena', '/maps/redwood-dam.webp'],
  ['rialto', 'Rialto', '里阿尔托', 'escort', '/maps/rialto.webp'],
  ['route-66', 'Route 66', '66 号公路', 'escort', '/maps/route-66.webp'],
  ['runasapi', 'Runasapi', '鲁纳萨皮', 'push', '/maps/runasapi.webp'],
  ['samoa', 'Samoa', '萨摩亚', 'control', '/maps/samoa.webp'],
  ['shambali-monastery', 'Shambali Monastery', '香巴里寺院', 'escort', '/maps/shambali-monastery.webp'],
  ['suravasa', 'Suravasa', '苏拉瓦萨', 'flashpoint', '/maps/suravasa.webp'],
  ['thames-district', 'Thames District', '泰晤士区', 'clash', '/maps/thames-district.webp'],
  ['throne-of-anubis', 'Throne of Anubis', '阿努比斯王座', 'clash', '/maps/throne-of-anubis.webp'],
  ['volskaya-industries', 'Volskaya Industries', '沃斯卡娅工业区', 'assault', '/maps/volskaya-industries.webp'],
  ['watchpoint-gibraltar', 'Watchpoint: Gibraltar', '监测站：直布罗陀', 'escort', '/maps/watchpoint-gibraltar.webp'],
  ['workshop-chamber', 'Workshop Chamber', '工坊室内', 'workshop', '/maps/workshop-chamber.webp'],
  ['workshop-expanse', 'Workshop Expanse', '工坊开阔地', 'workshop', '/maps/workshop-expanse.webp'],
  ['workshop-green-screen', 'Workshop Green Screen', '工坊绿幕', 'workshop', '/maps/workshop-green-screen.webp'],
  ['workshop-island', 'Workshop Island', '工坊岛屿', 'workshop', '/maps/workshop-island.webp'],
  ['wuxing-university', 'Wuxing University', '五行大学', 'capture the flag', '/maps/wuxing-university.webp']
] as const

export async function getMergedMaps(includeDisabled = false) {
  const overrides = await prisma.mapOverride.findMany()
  const overrideMap = new Map(overrides.map((item) => [item.slug, item]))
  const merged = baseMaps.map(([slug, name, zhName, mode, image]) => {
    const override = overrideMap.get(slug)
    return {
      slug,
      name: override?.name || name,
      zhName: override?.zhName ?? zhName,
      mode: override?.mode || mode,
      image: override?.image ?? image,
      isEnabled: override?.isEnabled ?? true,
      overridden: Boolean(override)
    }
  })
  const custom = overrides
    .filter((item) => !baseMaps.some(([slug]) => slug === item.slug))
    .map((item) => ({ ...item, overridden: true }))

  return [...merged, ...custom]
    .filter((item) => includeDisabled || item.isEnabled)
    .sort((a, b) => a.name.localeCompare(b.name))
}
