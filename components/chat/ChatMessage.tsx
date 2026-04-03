'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { UIMessage } from 'ai'
import { cn } from '@/lib/utils'

interface Props {
  message: UIMessage
}

export function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user'

  const text = message.parts
    .filter((p) => p.type === 'text')
    .map((p) => (p as { type: 'text'; text: string }).text)
    .join('')

  return (
    <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3 text-sm',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{text}</p>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const isInline = !className
                return isInline ? (
                  <code
                    className="rounded bg-background/50 px-1 py-0.5 font-mono text-xs"
                    {...props}
                  >
                    {children}
                  </code>
                ) : (
                  <pre className="overflow-x-auto rounded bg-background/50 p-3">
                    <code className={cn('font-mono text-xs', className)} {...props}>
                      {children}
                    </code>
                  </pre>
                )
              },
              p({ children }) {
                return <p className="mb-2 last:mb-0">{children}</p>
              },
              ul({ children }) {
                return <ul className="mb-2 list-disc pl-4">{children}</ul>
              },
              ol({ children }) {
                return <ol className="mb-2 list-decimal pl-4">{children}</ol>
              },
            }}
          >
            {text}
          </ReactMarkdown>
        )}
      </div>
    </div>
  )
}
