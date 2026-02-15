# DM Server-First Auth Design

**Date:** 2026-02-15
**Status:** Approved

## Goal
DM 기능을 서버 중심으로 완성한다. 모든 Supabase 접근은 서버에서만 수행하고, 로그인한 사용자만 DM 조회/생성/전송할 수 있도록 강제한다.

## Scope
### In Scope
- DM 페이지 SSR 초기 렌더 (내 스레드 목록 + 선택 스레드 메시지)
- 스레드 목록 조회/생성 API
- 메시지 목록 조회/전송 API
- API 권한 검사(본인 스레드만 접근 가능)
- 클라이언트 DM UI(스레드 선택/생성, 메시지 전송)
- 로그인 리다이렉트 가드

### Out of Scope
- 운영자 전용 응답 콘솔
- 실시간 구독(WebSocket)
- 읽음 상태/알림

## Architecture
- `src/app/(main)/dm/page.tsx`는 서버 컴포넌트로 동작한다.
- 페이지 진입 시 `getSessionUserFromCookies()`로 세션 확인 후 미로그인 사용자를 `/login?redirectTo=/dm`으로 리다이렉트한다.
- 서버 전용 라이브러리 `src/lib/dm.ts`에서 스레드/메시지 조회 및 생성 로직을 관리한다.
- 클라이언트 상호작용(스레드 생성, 메시지 전송, 목록 갱신)은 Next Route Handler API를 통해 수행한다.
- Route Handler 내부에서만 Supabase(`createServerSupabase`)를 호출한다.

## Data Model Usage
- `dm_threads`:
  - `id`, `user_id`, `assigned_responder_id`, `status`, `created_at`
- `dm_messages`:
  - `id`, `thread_id`, `sender_id`, `body`, `created_at`

## Endpoints
- `GET /api/dm/threads`
  - 로그인 사용자 본인 스레드 목록 반환(최신순)
- `POST /api/dm/threads`
  - 본인 스레드 생성 + 첫 메시지 생성(원자적으로 처리)
- `GET /api/dm/messages?threadId=...`
  - 본인 소유 스레드 메시지 목록 반환
- `POST /api/dm/messages`
  - 본인 소유 스레드에 메시지 전송

## Authorization Rules
- 세션 없음: `401`
- 스레드 소유자 불일치: `403`
- 권한 검사는 모든 DM API에서 중복으로 강제한다(클라이언트 신뢰 금지).

## Validation
- 기존 `src/lib/validation/dm.ts` 스키마를 재사용한다.
- 스레드 생성 시 최초 메시지 body 유효성 검증
- 메시지 전송 시 body 유효성 검증

## UX Requirements
- `/dm` 진입 시 좌측: 내 스레드 목록, 우측: 선택 스레드 메시지
- 스레드가 없으면 empty state + 첫 메시지 입력 UI 노출
- 메시지 전송 성공 시 목록 갱신 및 입력 초기화
- 실패 시 인라인 에러 노출

## Error Handling
- `400`: 잘못된 입력(유효성 실패)
- `401`: 로그인 필요
- `403`: 접근 불가 스레드
- `500`: 서버/DB 오류
- 클라이언트는 에러를 문구로 표시하고 사용자 입력을 유지한다.

## Testing Strategy
- `src/lib/dm.test.ts`: 서버 유틸 매핑/권한 보조 로직
- `src/app/api/dm/threads/route.test.ts`: 목록/생성/인증
- `src/app/api/dm/messages/route.test.ts`: 목록/전송/권한
- `src/app/(main)/dm/page.test.tsx`: 로그인 가드 + SSR 렌더
- `src/app/(main)/dm/DMClient.test.tsx`: 상호작용(생성/전송/오류)
