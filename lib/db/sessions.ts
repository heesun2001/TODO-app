'use server'

import { prisma } from '@/lib/prisma'

export async function createSession() {
  return prisma.chatSession.create({ data: {} })
}

export async function getSessions() {
  return prisma.chatSession.findMany({
    orderBy: { updatedAt: 'desc' },
    select: { id: true, title: true, updatedAt: true },
  })
}

export async function deleteSession(id: string) {
  return prisma.chatSession.delete({ where: { id } })
}

export async function updateSessionTitle(id: string, title: string) {
  return prisma.chatSession.update({ where: { id }, data: { title } })
}
