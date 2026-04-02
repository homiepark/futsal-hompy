# 우리의풋살 프로젝트 계획서

## Context

풋살 모임 관리 + 싸이월드 감성의 소셜 플랫폼.
팀 관리, 매칭, 커뮤니티 기능을 하나의 앱에서 제공.
현재 104+ 커밋, 18 페이지, 145 컴포넌트, 14 DB 테이블. MVP 80% 완성.

### 핵심 원칙
- **팀 관리 기능 우선** (가입팀이 늘어나기 전까지 매치보다 팀 관리에 집중)
- **모바일 가시성** 최우선 (픽셀 폰트 특성상 작은 글자 주의)
- **기존 기능과의 충돌 없는 구현** (수정 시 연관 기능 반드시 검증)
- **수익화는 팀이 충분히 늘어난 후** (현재 단계 X)
- **향후 앱스토어/플레이스토어 출시 계획** (PWA → 네이티브 래퍼 고려)

---

## 현재 상태 요약

### ✅ 완성된 기능
| 기능 | 상태 | 핵심 파일 |
|------|------|----------|
| 인증 (이메일/OAuth) | 100% | Auth.tsx, AuthCallback.tsx |
| 프로필 설정/수정 | 95% | MyProfile.tsx, ProfileSetup.tsx |
| 팀 생성/관리 | 100% | CreateTeam.tsx, TeamHome.tsx |
| 멤버 역할 (owner/admin/manager/coach/member) | 100% | AdminManageModal.tsx |
| 매칭 게시판 (생성/챌린지/필터) | 95% | Matchmaking.tsx |
| 메시지 (DM/초대/입단신청/방송) | 100% | Messages.tsx |
| 팀 일정 (캘린더/CRUD/시간범위) | 100% | Schedule.tsx |
| 팀 아카이브 (게시글/사진/댓글/좋아요) | 90% | TeamArchive.tsx |
| 선수 방명록 | 100% | Guestbook.tsx |
| 홈피 스킨 13종 + 애니메이션 7종 | 100% | HompySkinSelector.tsx, SkinAnimation.tsx |
| 미니룸 (싸이월드풍) | 100% | TeamMiniRoom.tsx |
| 팀 업적 뱃지 8종 | 100% | TeamAchievements.tsx |
| 레벨 시스템 (LV.1-4) | 100% | TeamLevelBadge.tsx |
| 동네소식 피드 | 100% | NeighborhoodNews.tsx |
| 하단 네비 실시간 뱃지 | 100% | BottomNav.tsx |
| 새 일정 팝업 알림 | 100% | TeamHome.tsx |

### ⚠️ 미완성
| 기능 | 상태 | 문제 |
|------|------|------|
| 코트 예약 | 10% | UI만 있고 DB 없음. 목데이터 |
| 선수 등록 페이지 | 0% | 플레이스홀더 |
| 매치 결과/점수 입력 | 0% | 매치 수락 후 워크플로우 없음 |
| 매너 점수 시스템 | 0% | UI에 "-"로 표시만 |
| 푸시 알림 | 0% | 없음 |

### 기술 스택
- React 18 + TypeScript + Vite
- Supabase (인증, PostgreSQL, 실시간, 스토리지)
- Tailwind CSS + shadcn/ui + 커스텀 픽셀아트 테마
- 폰트: DNFBitBitv2, NeoDunggeunmo, Galmuri11
- 배포: Vercel

### DB 테이블 (14개)
profiles, teams, team_members, team_join_requests, team_invitations,
team_notices, team_schedules, match_posts, match_applications,
messages, archive_posts, archive_post_comments, archive_post_likes,
player_guestbook_entries

### DB 함수
- is_team_admin() — 권한 체크 (admin/owner/manager/coach + teams.admin_user_id)
- generate_nickname_tag() — 유니크 닉네임 태그 생성

---

## 로드맵

### Phase 1: 정리 & 안정화 (즉시)

기존 기능 마무리 + 모바일 UX 점검. 새 기능 추가 전 기반 다지기.

| # | 작업 | 규모 | 영향 범위 |
|---|------|------|----------|
| 1.1 | 전체 화면 모바일 글자 크기/가시성 일괄 점검 | M | 전체 컴포넌트 |
| 1.2 | 선수카드에 감독/코치 역할 + 지도경력 표시 | S | PlayerStatsModal.tsx |
| 1.3 | 코트 예약 → "준비 중" 안내 or 제거 | S | CourtBooking.tsx, App.tsx |
| 1.4 | PlayerRegistration 페이지 정리 | S | App.tsx |
| 1.5 | 번들 사이즈 최적화 (lazy import) | M | App.tsx, vite.config.ts |
| 1.6 | 기존 기능 전체 동작 검증 (회귀 테스트) | M | 전체 |

**검증:** 모든 페이지를 모바일에서 열어서 글자 읽히는지, 버튼 누르기 편한지, CRUD 동작하는지 확인

---

### Phase 2: 팀 관리 강화 (핵심 — 최우선)

팀장/감독이 팀을 효과적으로 운영할 수 있는 도구.

| # | 작업 | 규모 | 설명 | 새 테이블 |
|---|------|------|------|----------|
| 2.1 | **일정 출석 관리** | M | 일정별 참석/불참/미정 투표. 팀원이 직접 응답 | schedule_attendances |
| | - 일정 상세에 출석 버튼 (✅❌❓) | | | (schedule_id, user_id, status) |
| | - 참석 현황 요약 (5명 참석 / 2명 불참) | | | |
| | - 미응답 팀원에게 알림 | | | |
| 2.2 | **팀 회비 관리** | M | 월별 회비 납부 체크리스트 (결제 X, 기록만) | team_dues |
| | - 관리자가 금액 설정 + 납부 체크 | | | (team_id, user_id, month, amount, paid) |
| | - 팀원은 본인 납부 현황 조회 | | | |
| | - 미납 알림 | | | |
| 2.3 | **팀 공지 개선** | S | 공지 히스토리 + 중요 공지 고정 | team_notices 확장 |
| | - 과거 공지 목록 보기 | | | (is_pinned 컬럼 추가) |
| | - 중요 공지 별도 표시 | | | |
| 2.4 | **팀원 현황 개선** | S | 가입일, 마지막 활동일, 출석률 표시 | team_members 확장 |
| | - 장기 미활동 팀원 표시 | | | (last_active_at 컬럼) |

**검증:** 팀장 계정으로 출석 관리 CRUD, 회비 체크, 공지 관리 전체 테스트. 일반 멤버 계정으로 뷰 확인.

---

### Phase 3: 싸이월드 감성 + 소셜 (확장)

앱의 차별점인 싸이월드 감성을 더 살리면서 팀 간 교류 확대.

| # | 작업 | 규모 | 설명 |
|---|------|------|------|
| 3.1 | **오늘의 기분 (Today's Mood)** | S | 팀원 현재 상태 이모지 (😊😤😴🔥) |
| | - profiles에 mood/mood_updated_at 컬럼 | | MemberRoster.tsx에 말풍선 표시 |
| 3.2 | **BGM 플레이어** | S | 팀 홈 배경음악 (YouTube URL) |
| | - BgmPlayer.tsx 이미 존재, 연동만 | | teams에 bgm_url 컬럼 |
| 3.3 | **팀 일촌 (파트너 팀)** | M | 팀 간 우호 관계 (싸이월드 일촌) |
| | - team_partnerships 테이블 | | 신청→수락 흐름 |
| 3.4 | **선수 개인 통계** | M | 출전, 골, 어시스트 기록 |
| | - player_match_stats 테이블 | | PlayerStatsModal.tsx 연동 |
| 3.5 | **미니홈 확장** | M | 방문자 수 실제 연동, 꾸미기 아이템 |

---

### Phase 4: 매칭 완성 (팀 수 증가 후)

팀이 충분히 모인 후 매칭 기능 완성.

| # | 작업 | 규모 | 설명 | 새 테이블 |
|---|------|------|------|----------|
| 4.1 | **매치 결과 입력** | L | 양팀 점수, MVP 선정, 사진 | match_results |
| 4.2 | **매너 점수 시스템** | M | 매치 후 상대팀 평가 (별 1-5) | manner_ratings |
| 4.3 | **매치 전적 페이지** | M | 팀/개인 전적 기록 | match_results 활용 |
| 4.4 | **지역 리그/랭킹** | L | 시즌 리그, 지역 랭킹 보드 | leagues, league_standings |

---

### Phase 5: 수익화 + 앱 출시 (장기)

가입팀이 충분히 늘어난 후.

| # | 작업 | 규모 | 설명 |
|---|------|------|------|
| 5.1 | **도토리 (포인트 시스템)** | L | 활동 포인트 → 스킨/아이템 구매 |
| 5.2 | **프리미엄 스킨** | M | 유료 or 포인트 스킨 |
| 5.3 | **코트 예약 실제 구현** | L | 카카오맵 + 풋살장 DB + 예약 시스템 |
| 5.4 | **앱스토어 출시** | L | PWA → Capacitor/React Native 래퍼 |
| 5.5 | **푸시 알림** | M | FCM + Service Worker |
| 5.6 | **풋살장 제휴/광고** | M | 코트 예약 수수료 모델 |

---

## 다음 세션 작업 순서 (권장)

1. **Phase 1 전체** — 기존 기능 안정화, 모바일 점검
2. **2.1 출석 관리** — 팀 운영 핵심 기능
3. **2.2 회비 관리** — 팀 운영 실용 기능
4. **3.1 오늘의 기분** — 싸이월드 감성 (간단)
5. **3.2 BGM** — 이미 컴포넌트 존재
6. **2.3 공지 개선** + **2.4 팀원 현황 개선**
7. **3.3 팀 일촌** + **3.4 선수 통계**

---

## 작업 시 체크리스트 (매 작업마다)

- [ ] 기존 기능과 충돌 없는지 확인
- [ ] 모바일에서 글자 크기/가시성 확인
- [ ] CRUD 전체 동작 확인 (생성/조회/수정/삭제)
- [ ] RLS 정책 정상 작동 확인
- [ ] `npm run build` 성공 확인
- [ ] 연관 컴포넌트에 사이드 이펙트 없는지 확인

---

## 핵심 파일 참조

### 페이지 (src/pages/)
- TeamHome.tsx — 팀 홈 (가장 큰 파일, ~1000줄)
- Schedule.tsx — 일정 관리
- Matchmaking.tsx — 매칭 게시판
- Messages.tsx — 메시지/초대/입단신청
- Index.tsx — 홈 화면
- MyProfile.tsx — 프로필 수정

### 핵심 컴포넌트 (src/components/)
- team/MemberRoster.tsx — 팀원 현황
- team/AdminManageModal.tsx — 역할 관리
- team/HompySkinSelector.tsx — 스킨 선택 (13종)
- team/SkinAnimation.tsx — 애니메이션 (쌈바 픽셀아트 포함)
- team/TeamAchievements.tsx — 업적 뱃지
- team/PlayerStatsModal.tsx — 선수 카드
- team/Guestbook.tsx — 방명록
- home/TeamMiniRoom.tsx — 미니룸
- home/NeighborhoodNews.tsx — 동네소식
- layout/BottomNav.tsx — 하단 네비 (실시간 뱃지)

### DB
- supabase-migration.sql — 전체 스키마
- is_team_admin() — 권한 함수
- RLS 정책 — 모든 테이블

### 스타일
- src/index.css — 픽셀아트 CSS (14+ 애니메이션)
- tailwind.config.ts — 커스텀 테마
