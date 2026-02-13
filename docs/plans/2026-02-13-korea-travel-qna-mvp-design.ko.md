# 한국 여행 Q&A MVP 디자인

날짜: 2026-02-13

## 목표
- 한국 문화에 관심이 있는 첫 한국 방문 단기 여행자가 영어로 질문하고 24시간 내 답을 받을 수 있게 한다.
- Substack에서 사이트로의 초기 유입을 만들고 질문/DM 시작을 극대화한다.
- 수요와 신뢰를 증명하면서 비용을 최소화한다.

## 대상 및 포지셔닝
- 대상: 한국 문화에 관심이 있는 첫 한국 방문 단기 여행자.
- 포지셔닝: "서울에 사는 보통 사람"; 과도한 상업성 지양.
- 운영자 정체성: 실명은 공개하지 않되 사진은 공개.

## MVP 기능
- 공개 게시판: 비로그인 열람, 로그인 후 질문 작성, 운영자/검증 답변자 답변.
- 스레드형 DM: 로그인 필수, 유저 ↔ 운영자/검증 답변자, 24시간 내 응답 목표.
- 팁: 선택 사항, 답변 후 Stripe Checkout으로 감사 팁, 그 외는 무료.
- 갤러리: 운영자만 업로드, 공개 열람, 캡션과 지역 태그.
- 운영: 기본 금칙어 필터 + 신고 버튼.

## 정보 구조
- 랜딩: 짧은 가치 제안 + CTA "DM으로 질문하기" + 미리보기(최근 Q&A, 갤러리).
- 게시판: 목록, 필터(서울/부산/제주 등), 상세 + 답변.
- DM 인박스: 스레드 목록과 메시지 뷰.
- 갤러리: 태그가 있는 사진.
- 프로필: 운영자 소개 + 사진.
- 인증: Google/Apple.

## 데이터 모델(핵심 테이블)
- User(id, provider, email, displayName, photoUrl, role, createdAt)
- BoardPost(id, authorId, title, body, locationTag, status, createdAt)
- BoardReply(id, postId, authorId, body, createdAt)
- DmThread(id, userId, assignedResponderId, status, createdAt)
- DmMessage(id, threadId, senderId, body, createdAt)
- GalleryPhoto(id, uploaderId, imageUrl, caption, locationTag, createdAt)
- Tip(id, userId, contextType, contextId, amount, currency, status, createdAt)
- Report(id, reporterId, contextType, contextId, reason, createdAt)
- ModerationBlock(id, userId, reason, createdAt)
- NotificationPref(userId, emailOptIn)

## 핵심 플로우
- 질문하기(게시판): 로그인 -> 질문 작성 -> 공개 노출 -> 운영자/검증 답변자 답변.
- DM 시작: 로그인 -> 스레드 생성 -> 24시간 내 답변 목표 -> 선택 팁.
- 팁: Stripe Checkout -> 감사 상태.
- 신고: 신고 생성 -> 운영자 검토.

## 기술 스택
- Next.js App Router
- Supabase Auth (Google/Apple)
- Supabase Postgres + Storage
- Stripe Checkout
- Vercel 배포

## 배포 및 리전
- Vercel Functions 리전: iad1.
- Supabase 리전: iad1에 가장 가까운 리전 선택.

## 지표(MVP)
- DM 시작 수, 게시판 질문 시작 수, 답변 완료율, 24시간 내 응답률, 팁 전환율.

## 리스크 및 대응
- 초기 신뢰 부족: Q&A와 갤러리 시드 콘텐츠 확보, 운영자 프로필 명확화.
- 지연: DB 리전을 Functions 리전에 맞춤.
- 악용: 금칙어 + 신고 + 수동 검토.

## 오픈 질문
- MVP 기준으로 없음.
