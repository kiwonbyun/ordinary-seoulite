# OAuth State Validation Design

**Date:** 2026-02-14
**Status:** Approved

## Goal
Google 로그인 흐름을 Authorization Code + PKCE 기반으로 단일화하고, `state` 검증을 추가해 로그인 CSRF/요청 위변조 위험을 줄인다.

## Current Issues
- 로그인 클라이언트(`LoginClient`)에 URL hash 토큰(`access_token`, `refresh_token`) 처리 `useEffect`가 남아 있다.
- 서버 콜백 code 교환(`\/auth\/callback`)과 hash 토큰 처리(`\/auth\/session`)가 동시에 존재해 인증 경로가 중복된다.
- OAuth `state` 검증이 없어 콜백 요청의 정당성 검증이 부족하다.

## Proposed Architecture
1. `\/auth\/start`
- 암호학적으로 안전한 랜덤 `state` 생성
- `httpOnly`, `sameSite=lax`, `secure` 속성의 단기 쿠키(`os-oauth-state`)에 저장
- Google authorize URL에 `response_type=code`, `state`, `redirect_to` 포함 후 리다이렉트

2. `\/auth\/callback`
- `code`, `state`, 쿠키 `os-oauth-state` 읽기
- query `state`와 쿠키 값 일치 검증(타이밍 안전 비교)
- 실패 시 로그인 페이지(`\/login?redirectTo=...`)로 리다이렉트
- 성공 시 `exchangeCodeForSession(code)` 실행 후 세션 쿠키(`os-access-token`, `os-refresh-token`) 설정
- 검증 이후 `os-oauth-state` 쿠키는 즉시 제거(1회성)

3. `LoginClient`
- hash 토큰 파싱/`\/auth\/session` 호출 `useEffect` 제거
- 로그인 버튼은 `\/auth\/start` 링크 역할만 유지

4. 정리
- 더 이상 사용되지 않는 `\/auth\/session` 라우트 삭제

## Data Flow
1. 사용자: `\/login?redirectTo=\/board\/new`
2. 클라이언트: `\/auth\/start?redirectTo=...` 이동
3. 서버(`start`): `state` 생성 + 쿠키 저장 + Google authorize redirect
4. Google: `\/auth\/callback?code=...&state=...&redirectTo=...`
5. 서버(`callback`): `state` 검증
6. 성공 시 code 교환 후 auth 쿠키 설정, `redirectTo`로 이동
7. 실패 시 로그인 페이지로 복귀

## Security Decisions
- OAuth state 값은 클라이언트 JS에서 접근 불가(`httpOnly`)로 저장
- state 쿠키 TTL은 짧게 유지(예: 10분)
- state 검증은 strict equality + timing-safe compare 사용
- `redirectTo`는 기존 `resolveRedirectTarget`으로 open redirect 방어 유지

## Error Handling
- `code` 누락: 로그인 페이지로 리다이렉트
- `state` 누락/불일치: 로그인 페이지로 리다이렉트(옵션: `error=oauth_state_mismatch`)
- code 교환 실패: 로그인 페이지로 리다이렉트
- 모든 실패 케이스에서 state 쿠키 제거

## Testing Strategy
- `src/app/auth/start/route.test.ts`
  - state 쿠키 설정 여부
  - authorize URL에 `response_type=code`, `state`, `redirect_to` 포함 여부
- `src/app/auth/callback/route.test.ts`
  - 정상 state + code -> 세션 쿠키 설정 + target redirect
  - state mismatch -> 세션 쿠키 미설정 + 로그인 redirect
  - missing state/code -> 로그인 redirect
- `src/app/(auth)/login/LoginClient.test.tsx`
  - 로그인 링크 렌더링과 href 검증 유지
  - hash 토큰 처리 관련 로직 제거 후 불필요 시나리오 제거

## Scope
### In Scope
- OAuth state 쿠키 생성/검증
- LoginClient hash flow 제거
- `\/auth\/session` 라우트 제거
- 관련 단위 테스트 보강

### Out of Scope
- OAuth provider 확장(Google 외)
- refresh token rotation 정책 변경
- UI 에러 메시지 대폭 개편
