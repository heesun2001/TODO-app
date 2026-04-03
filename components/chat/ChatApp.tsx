'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useChat, UIMessage } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { ChatSidebar } from './ChatSidebar'
import { ChatWindow } from './ChatWindow'
import { ChatInput } from './ChatInput'
import { createSession, getSessions } from '@/lib/db/sessions'
import { getMessages } from '@/lib/db/messages'

interface Session {
  id: string
  title: string
  updatedAt: Date
}

interface Props {
  initialSessions: Session[]
  initialSessionId: string
  initialMessages: UIMessage[]
}

export function ChatApp({ initialSessions, initialSessionId, initialMessages }: Props) {
  const [sessions, setSessions] = useState<Session[]>(initialSessions)
  const [activeId, setActiveId] = useState<string>(initialSessionId)
  const [input, setInput] = useState('')
  const [isSwitching, setIsSwitching] = useState(false)

  const { messages, sendMessage, setMessages, status } = useChat({
    id: activeId,
    messages: initialMessages,
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  // 스트리밍 완료 후 세션 제목 갱신
  const prevStatusRef = useRef(status)
  useEffect(() => {
    if (prevStatusRef.current !== 'ready' && status === 'ready' && messages.length > 0) {
      getSessions().then(setSessions)
    }
    prevStatusRef.current = status
  }, [status, messages.length])

  // 세션 전환
  const handleSelectSession = useCallback(async (id: string) => {
    setActiveId(id)
    setIsSwitching(true)
    const dbMessages = await getMessages(id)
    const uiMessages: UIMessage[] = dbMessages.map((m) => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      parts: [{ type: 'text' as const, text: m.content }],
    }))
    setMessages(uiMessages)
    setIsSwitching(false)
  }, [setMessages])

  // 새 세션 생성 후 진입
  const handleNewSession = useCallback(async (id: string) => {
    const updated = await getSessions()
    setSessions(updated)
    setActiveId(id)
    setMessages([])
  }, [setMessages])

  // 세션 삭제 후 목록 갱신
  const handleDeleteSession = useCallback(async (id: string) => {
    const updated = await getSessions()
    setSessions(updated)
    if (activeId === id) {
      if (updated.length > 0) {
        await handleSelectSession(updated[0].id)
      } else {
        const session = await createSession()
        const fresh = await getSessions()
        setSessions(fresh)
        setActiveId(session.id)
        setMessages([])
      }
    }
  }, [activeId, handleSelectSession, setMessages])

  // 메시지 전송 — sessionId를 body에 포함
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || status === 'streaming' || status === 'submitted') return
    sendMessage({ text: input }, { body: { sessionId: activeId } })
    setInput('')
  }, [input, status, sendMessage, activeId])

  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar
        sessions={sessions}
        activeId={activeId}
        onSelect={handleSelectSession}
        onNewSession={handleNewSession}
        onDelete={handleDeleteSession}
      />
      <main className="flex flex-1 flex-col overflow-hidden">
        <ChatWindow messages={messages} status={status} isSwitching={isSwitching} />
        <ChatInput
          input={input}
          onInputChange={setInput}
          onSubmit={handleSubmit}
          status={status}
        />
      </main>
    </div>
  )
}
