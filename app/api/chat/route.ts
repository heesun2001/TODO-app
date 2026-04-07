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

          const allMessages = [
            ...messages.map((m) => ({
              role: m.role,
              // 이미지 첨부 메시지는 텍스트 앞에 [이미지] 표시
              content: `${hasImage(m) ? '[이미지] ' : ''}${extractText(m)}`,
            })),
            { role: 'assistant', content: text },
          ]
          await saveMessages(sessionId, allMessages)

          if (messages.length === 1) {
            const firstText = extractText(messages[0])
            const base = firstText || (hasImage(messages[0]) ? '이미지 첨부' : '새 채팅')
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
