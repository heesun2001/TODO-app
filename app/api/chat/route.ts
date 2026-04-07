import { convertToModelMessages, streamText, UIMessage } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { saveMessages } from '@/lib/db/messages'
import { updateSessionTitle } from '@/lib/db/sessions'

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const { messages, sessionId }: { messages: UIMessage[]; sessionId: string } =
      await req.json()

    const result = streamText({
      model: anthropic('claude-sonnet-4-6'),
      system: '당신은 친절하고 유능한 AI 어시스턴트입니다. 한국어로 질문하면 한국어로 답하세요.',
      messages: await convertToModelMessages(messages),
      onFinish: async ({ text }) => {
        try {
          const extractText = (m: UIMessage) =>
            m.parts
              .filter((p) => p.type === 'text')
              .map((p) => (p as { type: 'text'; text: string }).text)
              .join('')

          const hasImage = (m: UIMessage) => m.parts.some((p) => p.type === 'file')

          // 신규 메시지 2개(user + assistant)만 append — 전체 재삽입 방지
          const lastUserMsg = messages[messages.length - 1]
          await saveMessages(sessionId, [
            {
              role: lastUserMsg.role,
              content: `${hasImage(lastUserMsg) ? '[이미지] ' : ''}${extractText(lastUserMsg)}`,
            },
            { role: 'assistant', content: text },
          ])

          if (messages.length === 1) {
            const firstText = extractText(lastUserMsg)
            const base = firstText || (hasImage(lastUserMsg) ? '이미지 첨부' : '새 채팅')
            const title = base.slice(0, 30) + (base.length > 30 ? '...' : '')
            await updateSessionTitle(sessionId, title)
          }
        } catch (dbError) {
          console.error('[onFinish] DB 저장 실패:', dbError)
        }
      },
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('[POST /api/chat] 오류:', error)
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
