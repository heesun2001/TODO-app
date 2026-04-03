# AI Chatbot — 프로젝트 명세

## 프로젝트 개요

범용 대화 어시스턴트 챗봇. 누구나 인증 없이 사용 가능하며, 여러 개의 채팅 세션을 DB에 저장하고 전환할 수 있다.

---

## 기술 스택

| 항목 | 선택 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) |
| AI | Claude API (Anthropic) — `claude-sonnet-4-6` |
| AI SDK | Vercel AI SDK (`ai`, `@ai-sdk/anthropic`) |
| DB | Neon Postgres (Vercel Marketplace 연동) |
| ORM | Prisma |
| UI 컴포넌트 | shadcn/ui + Tailwind CSS v4 |
| 마크다운 렌더링 | `react-markdown` + `remark-gfm` |
| 배포 | Vercel |
| 언어 | TypeScript |

---

## 핵심 기능

### 1. 채팅 인터페이스
- 메시지 입력창 (Shift+Enter: 줄바꿈, Enter: 전송)
- AI 응답 스트리밍 (타이핑 효과)
- AI 응답을 Markdown으로 렌더링 (코드 블록, 볼드, 리스트 등)
- 대화 내역 스크롤 (최신 메시지로 자동 스크롤)

### 2. 채팅 세션 관리
- 새 채팅 시작 버튼
- 사이드바에 채팅 세션 목록 표시
- 세션 간 전환
- 세션 삭제

### 3. 데이터 저장
- 모든 메시지를 Neon Postgres에 영구 저장
- 세션별 대화 내역 조회

---

## 디렉토리 구조

```
ai-chat/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  # 메인 페이지 (채팅 UI)
│   └── api/
│       └── chat/
│           └── route.ts          # AI 스트리밍 API 엔드포인트
├── components/
│   ├── chat/
│   │   ├── ChatWindow.tsx        # 메시지 목록
│   │   ├── ChatMessage.tsx       # 개별 메시지 (Markdown 렌더링 포함)
│   │   ├── ChatInput.tsx         # 입력창
│   │   └── ChatSidebar.tsx       # 세션 목록 사이드바
│   └── ui/                       # shadcn/ui 컴포넌트
├── lib/
│   ├── prisma.ts                 # Prisma 클라이언트 싱글턴
│   └── db/
│       ├── sessions.ts           # 세션 CRUD
│       └── messages.ts           # 메시지 CRUD
├── prisma/
│   └── schema.prisma
├── .env.local                    # 로컬 환경변수 (gitignore)
└── CLAUDE.md
```

---

## DB 스키마 (Prisma)

```prisma
model ChatSession {
  id        String    @id @default(cuid())
  title     String    @default("새 채팅")
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  messages  Message[]
}

model Message {
  id        String      @id @default(cuid())
  role      String      // "user" | "assistant"
  content   String      @db.Text
  createdAt DateTime    @default(now())
  sessionId String
  session   ChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
}
```

---

## API 엔드포인트

### `POST /api/chat`

**Request body:**
```json
{
  "messages": [{ "role": "user", "content": "..." }],
  "sessionId": "cuid"
}
```

**동작:**
1. Vercel AI SDK `streamText`로 Claude API 호출
2. 스트리밍 응답 반환
3. 완료 시 `onFinish` 콜백에서 DB에 user/assistant 메시지 저장

---

## 환경변수

```env
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql://...   # Neon에서 발급
```

**Vercel 대시보드에도 동일하게 설정 필요.**

---

## 구현 순서

1. `npx create-next-app@latest ai-chat --typescript --tailwind --app`
2. shadcn/ui 초기화: `npx shadcn@latest init`
3. Prisma 설치 및 스키마 작성, `prisma generate` + `prisma db push`
4. Vercel AI SDK 설치: `npm install ai @ai-sdk/anthropic`
5. `app/api/chat/route.ts` — 스트리밍 API 구현
6. ChatSidebar, ChatWindow, ChatMessage, ChatInput 컴포넌트 구현
7. 메인 페이지에서 세션 상태 관리 연결
8. Vercel 배포 및 환경변수 설정

---

## 코드 컨벤션

- 모든 컴포넌트: `'use client'` / `'use server'` 명시
- Server Actions 또는 Route Handler로 DB 접근 (클라이언트에서 직접 Prisma 사용 금지)
- 에러 처리: API 실패 시 토스트 메시지로 사용자에게 알림
- `react-markdown`에 `remark-gfm` 플러그인 적용 (표, 취소선 등 GFM 지원)
