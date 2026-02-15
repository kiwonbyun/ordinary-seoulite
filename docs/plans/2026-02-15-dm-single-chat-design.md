# DM Single Chat (User ↔ Mod) Design

**Date:** 2026-02-15
**Status:** Approved

## Goal
DM을 다중 스레드 모델에서 철회하고, 로그인 사용자와 운영자(mod) 간 단일 1:1 채팅으로 단순화한다.

## Scope
### In Scope
- `/dm`에서 단일 채팅창만 제공
- 운영자 계정 식별 기준: `users.role = 'mod'` 단일 계정
- 사용자-운영자 1:1 스레드 자동 보장(없으면 생성)
- 메시지 송수신은 앱 서버 API를 통해서만 처리
- 클라이언트는 Supabase 직접 연결 금지

### Out of Scope
- 다중 스레드 UI
- 운영자 대시보드
- 클라이언트 Supabase 실시간 구독

## Architecture
- DM 페이지는 서버 컴포넌트로 동작한다.
- 페이지 진입 시 `requireSessionUser('/dm')`로 로그인 강제한다.
- 서버에서 `role='mod'` 사용자를 조회한다.
  - 0명 또는 2명 이상이면 운영 설정 오류로 처리한다.
- 현재 사용자와 mod 쌍의 `dm_threads`를 조회한다.
  - 없으면 생성
  - 있으면 재사용
- 초기 메시지는 서버에서 SSR로 렌더한다.
- 전송/갱신은 `/api/dm/messages`로 처리한다.

## Data Model Decisions
- `dm_threads`는 내부 식별용으로 유지한다.
- 사용자에게 스레드 선택 UI는 노출하지 않는다.
- 단일 thread는 `(user_id, assigned_responder_id)` 쌍으로 결정한다.

## API Design
- `GET /api/dm/messages`
  - 현재 사용자 세션 기준으로 단일 DM thread resolve
  - 해당 thread 메시지 목록 반환
- `POST /api/dm/messages`
  - 현재 사용자 세션 기준으로 단일 DM thread resolve
  - body 검증 후 메시지 insert

## Message Flow / UX
- `/dm` 최초 로드: 서버가 메시지 목록 SSR
- 메시지 전송: API POST
- 전송 성공 시 클라이언트 상태에 즉시 append(낙관적 반영 가능)
- 새 메시지 수신 갱신: 주기적 API polling(2~3초)

## Error Handling
- 미로그인: `/dm` 페이지는 로그인 리다이렉트, API는 `401`
- mod 계정 설정 오류(0명 또는 다수): `500` + 안내 문구
- validation 실패: `400`
- DB 오류: `500`

## Security
- 모든 Supabase 접근은 서버 전용(`createServerSupabase`)에서만 수행
- API는 세션/권한을 서버에서 재검증
- 클라이언트는 앱 API만 호출

## Testing Strategy
- `src/lib/dm-single.test.ts`
  - mod 단일 계정 판별, thread resolve/create 로직
- `src/app/api/dm/messages/route.test.ts`
  - 401/400/500 및 성공 케이스
- `src/app/(main)/dm/page.test.tsx`
  - 로그인 가드, 단일 채팅 렌더, 스레드 목록 제거
- `src/app/(main)/dm/DMClient.test.tsx`
  - 메시지 전송/갱신(polling) 동작
