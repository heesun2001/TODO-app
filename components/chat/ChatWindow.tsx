'use client'

import { useEffect, useRef } from 'react'
import { UIMessage } from 'ai'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessage } from './ChatMessage'

interface Props {
  messages: UIMessage[]
  status: 'submitted' | 'streaming' | 'ready' | 'error'
  isSwitching?: boolean
}

export function ChatWindow({ messages, status, isSwitching }: Props) {
  const isLoading = status === 'streaming' || status === 'submitted'
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (isSwitching) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
        불러오는 중...
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
        무엇이든 물어보세요!
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <div className="flex flex-col gap-4 p-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground animate-pulse">
              생각하는 중...
            </div>
          </div>
        )}
        {status === 'error' && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              응답을 가져오지 못했습니다. 다시 시도해주세요.
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}
