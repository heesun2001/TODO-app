.PHONY: init dev build deploy db-push db-generate

# 초기화: 패키지 설치 + env pull + DB 스키마 적용
init:
	npm install
	vercel link --yes
	vercel env pull .env.local --yes
	npx prisma generate
	npx prisma db push

# 개발 서버 실행
dev:
	npm run dev

# 프로덕션 빌드
build:
	npm run build

# Vercel 배포 (preview)
deploy:
	vercel deploy

# Vercel 배포 (production)
deploy-prod:
	vercel deploy --prod

# DB 스키마 동기화
db-push:
	npx prisma db push

# Prisma 클라이언트 재생성
db-generate:
	npx prisma generate
