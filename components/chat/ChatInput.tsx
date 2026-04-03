'use client'

import { useRef } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { SendHorizonal } from 'lucide-react'

interface Props {
  input: string
  onInputChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  status: 'submitted' | 'streaming' | 'ready' | 'error'
}

export function ChatInput({ input, onInputChange, onSubmit, status }: Props) {
  const isLoading = status === 'streaming' || status === 'submitted'
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (input.trim() && !isLoading) {
        onSubmit(e as unknown as React.FormEvent)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }

  return (
    <form onSubmit={onSubmit} className="flex items-end gap-2 p-4 border-t">
      <Textarea
        ref={textareaRef}
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="메시지를 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
        rows={1}
        className="resize-none min-h-[44px] max-h-[200px]"
        disabled={isLoading}
      />
      <Button
        type="submit"
        size="icon"
        disabled={!input.trim() || isLoading}
        className="shrink-0"
      >
        <SendHorizonal className="h-4 w-4" />
      </Button>
    </form>
  )
}
