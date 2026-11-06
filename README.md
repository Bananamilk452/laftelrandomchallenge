# 랜덤 라프텔 챌린지

라프텔에서 최근 본 / 정주행 / 보고싶다 목록 중 하나를 골라 애니를 랜덤으로 뽑고,
별점과 한줄평을 남겨 세로형 이미지로 저장하거나 SNS에 공유하는 팬메이드 프로젝트입니다.

- 배포 주소: [https://laftelrandomchallenge.seoa.dev](https://laftelrandomchallenge.seoa.dev)

## 기능

- 라프텔 이메일 로그인 (로그인 토큰은 httpOnly 쿠키로 보관)
- 프로필 선택 (선택한 프로필은 저장하지 않아 새로고침하면 다시 선택)
- 최근 본 / 정주행 / 보고싶다 목록에서 랜덤 뽑기
- 0.5점 단위 별점과 한줄평 작성
- 결과 카드를 세로형 PNG 이미지로 저장
- X(트위터) / 인스타그램 공유 및 캡션 복사
- 모바일/데스크톱 반응형 UI

## 실행

```bash
pnpm install
pnpm dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

```bash
pnpm lint
pnpm build
```

## 구조

- Next.js App Router
- TanStack Query v5 (서버 상태 관리)
- shadcn/ui + Tailwind CSS v4
- 라프텔 API 프록시: `app/api/*`
- 프로필 선택 시 `profiles/v1/{profile.id}/token/`로 프로필 토큰을 교환해 프로필별 목록 조회
- 썸네일 CORS 우회 프록시: `app/api/image`
- 이미지 캡처: `html-to-image`

## 참고

- 라프텔 공식 서비스가 아닌 팬메이드 프로젝트입니다.
- 라프텔 비공식 API를 사용하므로 API 스펙이 변경되면 동작하지 않을 수 있습니다.
- 폰트: [온글잎 박다현체](https://noonnu.cc/font_page/1541)
