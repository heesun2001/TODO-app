import { convertToModelMessages, streamText, UIMessage } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { saveMessages } from '@/lib/db/messages'
import { updateSessionTitle } from '@/lib/db/sessions'

export const maxDuration = 60

export async function POST(req: Request) {
  const { messages, sessionId }: { messages: UIMessage[]; sessionId: string } =
    await req.json()

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: '당신은 친절하고 유능한 AI 어시스턴트입니다. 한국어로 질문하면 한국어로 답하세요.',
    messages: await convertToModelMessages(messages),
    onFinish: async ({ text }) => {
      const allMessages = [
        ...messages.map((m) => ({
          role: m.role,
          content: m.parts
            .filter((p) => p.type === 'text')
            .map((p) => (p as { type: 'text'; text: string }).text)
            .join(''),
        })),
        { role: 'assistant', content: text },
      ]
      await saveMessages(sessionId, allMessages)

      // 첫 번째 사용자 메시지로 세션 제목 설정
      if (messages.length === 1) {
        const firstUserMsg = messages[0].parts
          .filter((p) => p.type === 'text')
          .map((p) => (p as { type: 'text'; text: string }).text)
          .join('')
        const title = firstUserMsg.slice(0, 30) + (firstUserMsg.length > 30 ? '...' : '')
        await updateSessionTitle(sessionId, title)
      }
    },
  })

  return result.toUIMessageStreamResponse()
}
