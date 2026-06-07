import { readBody } from 'h3'
import { z } from 'zod'
import { ReportStatus } from '@prisma/client'
import { prisma } from '../../../../utils/db'
import { requireModerator } from '../../../../utils/auth'
import { apiError } from '../../../../utils/errors'
import { writeAuditLog } from '../../../../utils/audit-log'

const schema = z.object({ status: z.enum([ReportStatus.RESOLVED, ReportStatus.REJECTED]) })

export default defineEventHandler(async (event) => {
  const actor = await requireModerator(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw apiError(400, 'BAD_REQUEST', 'Missing id')
  const data = schema.parse(await readBody(event))

  const report = await prisma.report.update({
    where: { id },
    data: { status: data.status, handledById: actor.id, handledAt: new Date() },
    select: { id: true, status: true }
  })
  await writeAuditLog(actor.id, 'REPORT_RESOLVE', 'Report', id, data)
  return { report }
})
