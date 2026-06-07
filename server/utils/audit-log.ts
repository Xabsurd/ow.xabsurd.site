import { prisma } from './db'

export async function writeAuditLog(
  actorId: string,
  action: string,
  targetType: string,
  targetId: string,
  metadata?: unknown
) {
  await prisma.auditLog.create({
    data: {
      actorId,
      action,
      targetType,
      targetId,
      metadata: metadata === undefined ? undefined : JSON.parse(JSON.stringify(metadata))
    }
  })
}
