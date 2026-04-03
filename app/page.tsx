export const dynamic = 'force-dynamic'

import { ChatApp } from '@/components/chat/ChatApp'
import { createSession, getSessions } from '@/lib/db/sessions'
import { getMessages } from '@/lib/db/messages'
import { UIMessage } from 'ai'
import type { Message } from '@prisma/client'

export default async function Page() {
  let sessions = await getSessions()

  // 세션이 없으면 첫 세션 자동 생성
  if (sessions.length === 0) {
    await createSession()
    sessions = await getSessions()
  }

  const firstSession = sessions[0]
  const dbMessages = await getMessages(firstSession.id)

  const initialMessages: UIMessage[] = dbMessages.map((m: Message) => ({
    id: m.id,
    role: m.role as 'user' | 'assistant',
    parts: [{ type: 'text' as const, text: m.content }],
  }))

  return (
    <ChatApp
      initialSessions={sessions}
      initialSessionId={firstSession.id}
      initialMessages={initialMessages}
    />
  )
}
