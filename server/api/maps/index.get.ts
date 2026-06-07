import { getMergedMaps } from '../../utils/maps'

export default defineEventHandler(async () => {
  return { maps: await getMergedMaps(false) }
})
