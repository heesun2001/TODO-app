'use server'

import { prisma } from '@/lib/prisma'

export async function getMessages(sessionId: string) {
  return prisma.message.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
  })
}

export async function saveMessages(
  sessionId: string,
  messages: { role: string; content: string }[]
) {
  await prisma.$transaction([
    prisma.message.deleteMany({ where: { sessionId } }),
    prisma.message.createMany({
      data: messages.map((m) => ({ ...m, sessionId })),
    }),
    prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    }),
  ])
}
