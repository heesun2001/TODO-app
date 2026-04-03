# AI Chatbot — 구현 TODO

## 완료된 작업

- [x] Next.js 15 App Router 프로젝트 생성
- [x] 패키지 설치 (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/react`, `prisma`, `@prisma/client`, `react-markdown`, `remark-gfm`, `lucide-react`)
- [x] shadcn/ui 초기화 + 컴포넌트 설치 (button, input, textarea, scroll-area, separator)
- [x] Prisma 초기화 (`prisma/schema.prisma` — ChatSession, Message 모델 작성)
- [x] `lib/prisma.ts` — Prisma 클라이언트 싱글턴
- [x] `lib/db/sessions.ts` — 세션 CRUD (createSession, getSessions, deleteSession, updateSessionTitle)
- [x] `lib/db/messages.ts` — 메시지 저장/조회 (saveMessages, getMessages)
- [x] `app/api/chat/route.ts` — AI 스트리밍 API (AI Gateway, `anthropic/claude-sonnet-4.6`)
- [x] `components/chat/ChatMessage.tsx` — 메시지 렌더링 (Markdown 지원)
- [x] `components/chat/ChatInput.tsx` — 입력창 (Enter 전송, Shift+Enter 줄바꿈)
- [x] `components/chat/ChatWindow.tsx` — 메시지 목록 + 자동 스크롤

---

## 남은 작업

### 1단계 — 컴포넌트 완성

- [x] `components/chat/ChatSidebar.tsx` — 세션 목록 + 새 채팅 버튼 + 삭제 기능

### 2단계 — 메인 페이지

- [x] `app/page.tsx` — 전체 레이아웃 구성 (ChatSidebar + ChatWindow + ChatInput)
  - `useChat` hook 연동 (`@ai-sdk/react`)
  - 세션 상태 관리 (`activeSessionId`)
  - 페이지 진입 시 세션 목록 로드 (`getSessions`)
  - 세션 전환 시 이전 메시지 로드 (`getMessages`)
  - `DefaultChatTransport` 설정 (`/api/chat` + `sessionId` body 전달)

### 3단계 — 환경 설정

- [x] `.env.local` 파일 생성 (`.env.example` 템플릿 포함)
- [x] Neon Postgres DB 생성 → `DATABASE_URL` 입력 (Vercel Marketplace 연동)
- [x] `npx prisma db push` — DB에 스키마 반영 완료
- [x] `npx prisma generate` — Prisma 클라이언트 생성 완료
- [x] `vercel link` — Vercel 프로젝트 연결 완료
- [ ] `AI_GATEWAY_API_KEY` 입력 (Vercel 대시보드 → AI Gateway)

### 4단계 — 버그 수정 (코드 리뷰에서 발견)

- [x] **[치명]** `app/api/chat/route.ts` — `anthropic('claude-sonnet-4.6')` provider로 수정
- [x] **[버그]** 첫 메시지 전송 후 사이드바 세션 제목 갱신 — status `ready` 전환 시 `getSessions()` 재호출
- [x] **[버그]** API 에러 시 `ChatWindow`에 에러 메시지 표시 추가
- [x] **[미구현]** `ChatInput` textarea auto-resize 구현
- [x] **[기타]** `app/layout.tsx` `lang="ko"` 변경
- [x] **[UX]** 세션 전환 중 "불러오는 중..." 로딩 표시 추가

### 5단계 — 로컬 테스트

- [ ] `npm run dev` — 개발 서버 실행
- [ ] 채팅 전송 → 스트리밍 응답 확인
- [ ] 첫 메시지 전송 후 사이드바 제목 자동 업데이트 확인
- [ ] 세션 전환 → 이전 대화 내역 로드 확인
- [ ] 세션 삭제 동작 확인
- [ ] 에러 상태 UI 확인 (네트워크 차단 후 테스트)

### 6단계 — Vercel 배포

- [ ] GitHub 저장소 생성 후 push
- [ ] Vercel 환경변수 `ANTHROPIC_API_KEY` production/preview 환경에 추가
- [ ] `make deploy-prod` 또는 GitHub push로 자동 배포
- [ ] 배포 후 프로덕션 동작 확인

---

## 파일 구조 현황

```
ai-chat/
├── app/
│   ├── api/chat/route.ts   ✅
│   ├── layout.tsx          ✅ (Next.js 기본)
│   └── page.tsx            ✅
├── components/
│   ├── chat/
│   │   ├── ChatMessage.tsx  ✅
│   │   ├── ChatInput.tsx    ✅
│   │   ├── ChatWindow.tsx   ✅
│   │   └── ChatSidebar.tsx  ✅
│   └── ui/                  ✅ (shadcn)
├── lib/
│   ├── prisma.ts            ✅
│   ├── utils.ts             ✅
│   └── db/
│       ├── sessions.ts      ✅
│       └── messages.ts      ✅
├── prisma/
│   └── schema.prisma        ✅
├── .env.local               ❌ (생성 필요)
├── CLAUDE.md                ✅
└── TODO.md                  ✅
```
