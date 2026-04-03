'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { createSession, deleteSession } from '@/lib/db/sessions'
import { PlusCircle, Trash2, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Session {
  id: string
  title: string
  updatedAt: Date
}

interface Props {
  sessions: Session[]
  activeId: string | null
  onSelect: (id: string) => void
  onNewSession: (id: string) => void
  onDelete: (id: string) => void
}

export function ChatSidebar({ sessions, activeId, onSelect, onNewSession, onDelete }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleNew = () => {
    startTransition(async () => {
      const session = await createSession()
      onNewSession(session.id)
    })
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    startTransition(async () => {
      await deleteSession(id)
      onDelete(id)
    })
  }

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r bg-muted/30">
      <div className="p-3">
        <Button
          onClick={handleNew}
          disabled={isPending}
          className="w-full justify-start gap-2"
          variant="outline"
        >
          <PlusCircle className="h-4 w-4" />
          새 채팅
        </Button>
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1 p-2">
          {sessions.length === 0 && (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">
              채팅 내역이 없습니다
            </p>
          )}
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelect(session.id)}
              className={cn(
                'group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent',
                activeId === session.id && 'bg-accent font-medium'
              )}
            >
              <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate">{session.title}</span>
              <Trash2
                className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                onClick={(e) => handleDelete(e, session.id)}
              />
            </button>
          ))}
        </div>
      </ScrollArea>
    </aside>
  )
}
