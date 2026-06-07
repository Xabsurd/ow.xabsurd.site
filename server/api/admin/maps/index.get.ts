import { requireAdmin } from '../../../utils/auth'
import { getMergedMaps } from '../../../utils/maps'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return { maps: await getMergedMaps(true) }
})
