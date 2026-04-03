# 우리의풋살 프로젝트 계획서

## Context

풋살 모임 관리 + 싸이월드 감성의 소셜 플랫폼.
팀 관리, 매칭, 커뮤니티 기능을 하나의 앱에서 제공.
현재 140+ 커밋, 18 페이지, 145+ 컴포넌트, 14 DB 테이블. MVP 85% 완성.

### 핵심 원칙
- **팀 관리 기능 우선** (가입팀이 늘어나기 전까지 매치보다 팀 관리에 집중)
- **모바일 가시성** 최우선 (픽셀 폰트 최소 11px, 내용 텍스트는 font-body 사용)
- **기존 기능과의 충돌 없는 구현** (수정 시 연관 기능 반드시 검증)
- **UI 통일성** (라운드 테두리, 글자 크기, 색상 일관성)
- **수익화는 팀이 충분히 늘어난 후** (현재 단계 X)
- **향후 앱스토어/플레이스토어 출시 계획** (PWA → 네이티브 래퍼 고려)

---

## 빌딩 히스토리 (2026.04.03 세션)

이 세션에서 **34개 커밋**, **78개 파일** 수정 (1,212줄 추가 / 1,039줄 삭제)

### Phase 1: 정리 & 안정화 ✅ 완료

| 작업 | 상태 | 상세 |
|------|------|------|
| 1.1 모바일 글자 크기/가시성 점검 | ✅ | font-pixel 5~8px → 11px 일괄 상향 (57개 파일, ~200곳) |
| 1.2 선수카드 감독/코치 표시 | ✅ | PlayerStatsModal에 role, staffCareerYears, staffCareerNote 표시 |
| 1.3 코트 예약 → "준비 중" | ✅ | 목데이터 제거, "준비 중" 안내 + 예정 기능 리스트 |
| 1.4 PlayerRegistration 정리 | ✅ | "준비 중" 안내로 전환, JoinRequestButton → /profile-setup 리다이렉트 |
| 1.5 번들 최적화 | ✅ | lazy import + manualChunks (메인 번들 1,090KB → 125KB, 89% 감소) |

### UI/UX 대폭 개선 ✅ 완료

| 작업 | 상세 |
|------|------|
| 테두리 라운드 통일 | kairo-panel → rounded-xl, 버튼/카드 → rounded-lg |
| 팀 헤더 가시성 강화 | 프로필 80→96px+라운드, 팀명 text-lg+drop-shadow, 라벨 색상 진하게 |
| 팀원 현황 UI 리뉴얼 | flex-wrap → 4열 고정 그리드, 아바타 48px, 세로 카드형, 관리자 뱃지 위치 수정 |
| 감독/코치 카드 개선 | 경력 2줄 분리 (📋/💬), 아바타 48px, 이모지 제거(뱃지로 충분) |
| 팀 소개 | font-pixel 11px → font-body 14px |
| Quick Stats | 라벨 축약 (팀원평균경력→평균경력), 라운드 적용 |
| 팀 스토리 미리보기 | 4칸→8칸 (2줄), DB limit도 4→8 |
| 팀 업적 | TeamHome에서 제거 (목데이터만 있었음, 공간 확보) |
| 홈 화면 | NEW팀 카드, 동네소식, 팀 리스트, 최근 활동 전부 글씨 11px 상향 |
| 게시글 작성 모달 | 라벨 진하게, 내용 font-body 14px, 라운드 통일, 바텀시트 스타일 |

### 새 기능 추가

| 기능 | 상세 |
|------|------|
| **전광판 공지 네온 컬러** | 8색 네온 프리셋 (그린/블루/핑크/옐로우/오렌지/퍼플/라임/화이트) + 실시간 미리보기 |
| **일정 유형 확장** | 매치(⭐) / 자체전(⚔️) / 훈련(🏃) / 이벤트(🎉) 4종 |
| **정기일정 다중 등록** | 달력에서 날짜 복수 선택 → 한번에 일괄 등록 |
| **시간 입력 개선** | 시작/종료 별도 필드, 시작 입력 시 종료 자동 +2시간 |
| **감독/코치 경력 수정** | 본인 + 팀장/관리자가 카드에서 바로 지도경력/경력노트 수정 |
| **선수카드 실명 표시** | 같은 팀원에게만 닉네임 옆 (실명) 표시 |
| **게시글 수정 확장** | 내용/공개범위/이미지관리/동영상URL/활동날짜/폴더 전부 수정 가능 |
| **동영상+사진 통합 갤러리** | 동영상과 사진 함께 올리면 둘 다 표시 + 스와이프로 전환 |
| **라이트박스 슬라이드** | CSS transform 스무스 전환 + 좌우 화살표 + 흔들림 방지 |
| **동영상 썸네일** | #t=0.5로 첫 프레임 강제 표시 (검은화면 방지) |

### 버그 수정

| 수정 | 상세 |
|------|------|
| 관리자 뱃지 짤림 | overflow-hidden 밖으로 absolute 이동 |
| 모달 배경 스크롤 | useBodyScrollLock 적용 (일정 등록/수정) |
| 다중선택 달력 기준달 | new Date() → currentMonth (보고 있는 달 기준) |
| 스와이프 화면 흔들림 | touchmove preventDefault + touch-action: none |
| 실명 안내 문구 | "관리자에게만 공개" → "같은 팀원에게만 선수카드에서 표시" |

---

## 현재 상태 요약 (세션 후)

### ✅ 완성된 기능
| 기능 | 상태 | 핵심 파일 |
|------|------|----------|
| 인증 (이메일/OAuth) | 100% | Auth.tsx, AuthCallback.tsx |
| 프로필 설정/수정 | 95% | MyProfile.tsx, ProfileSetup.tsx |
| 팀 생성/관리 | 100% | CreateTeam.tsx, TeamHome.tsx |
| 멤버 역할 (owner/admin/manager/coach/member) | 100% | AdminManageModal.tsx |
| 감독/코치 경력 관리 | 100% | MemberRoster.tsx (본인+관리자 수정) |
| 매칭 게시판 (생성/챌린지/필터) | 95% | Matchmaking.tsx |
| 메시지 (DM/초대/입단신청/방송) | 100% | Messages.tsx |
| 팀 일정 (CRUD/4유형/다중등록) | 100% | Schedule.tsx |
| 팀 아카이브 (게시글/사진/동영상/댓글/좋아요) | 95% | TeamArchive.tsx |
| 게시글 수정 (전체 항목) | 100% | TimelinePost.tsx |
| 동영상+사진 통합 갤러리 | 100% | TimelinePost.tsx |
| 선수 방명록 | 100% | Guestbook.tsx |
| 선수카드 (실명표시/역할/경력) | 100% | PlayerStatsModal.tsx |
| 홈피 스킨 13종 + 애니메이션 7종 | 100% | HompySkinSelector.tsx, SkinAnimation.tsx |
| 전광판 공지 (네온 8색) | 100% | TeamHome.tsx |
| 미니룸 (싸이월드풍) | 100% | TeamMiniRoom.tsx |
| 레벨 시스템 (LV.1-4) | 100% | TeamLevelBadge.tsx |
| 동네소식 피드 | 100% | NeighborhoodNews.tsx |
| 하단 네비 실시간 뱃지 | 100% | BottomNav.tsx |
| 새 일정 팝업 알림 | 100% | TeamHome.tsx |
| 번들 최적화 (코드 스플리팅) | 100% | App.tsx, vite.config.ts |

### ⚠️ 미완성
| 기능 | 상태 | 문제 |
|------|------|------|
| 코트 예약 | "준비 중" | UI만 → 안내 페이지로 전환 완료 |
| 선수 등록 페이지 | "준비 중" | 안내 페이지로 전환 완료 |
| 매치 결과/점수 입력 | 0% | 매치 수락 후 워크플로우 없음 |
| 매너 점수 시스템 | 0% | UI에 "-"로 표시만 |
| 푸시 알림 | 0% | 없음 |
| 팀 업적 뱃지 | 제거됨 | TeamHome에서 제거 (Phase 4에서 재구현 예정) |

### 기술 스택
- React 18 + TypeScript + Vite (코드 스플리팅 적용)
- Supabase (인증, PostgreSQL, 실시간, 스토리지)
- Tailwind CSS + shadcn/ui + 커스텀 픽셀아트 테마
- 폰트: DNFBitBitv2 (제목/뱃지), NeoDunggeunmo, Galmuri11
- 배포: Vercel
- 번들: vendor(162KB) / supabase(194KB) / ui(80KB) / 페이지별 청크

### DB 테이블 (14개)
profiles, teams, team_members, team_join_requests, team_invitations,
team_notices, team_schedules, match_posts, match_applications,
messages, archive_posts, archive_post_comments, archive_post_likes,
player_guestbook_entries

### DB 함수
- is_team_admin() — 권한 체크 (admin/owner/manager/coach + teams.admin_user_id)
- generate_nickname_tag() — 유니크 닉네임 태그 생성

---

## 알려진 이슈 & 개선 필요사항

### 코드 품질
| 우선순위 | 이슈 | 위치 | 설명 |
|---------|------|------|------|
| 🔴 높음 | 메시지 insert 에러 미처리 | JoinRequestModal.tsx:133, JoinRequestNotification.tsx:99,128 | supabase insert 후 error 체크 없음 |
| 🟡 중간 | text-[8px] 잔여 | ProfileSetup.tsx (5곳), MyProfile.tsx (1곳), TeamArchive.tsx (1곳) | 11px로 통일 필요 |
| 🟡 중간 | console.error 정리 | 30+ 곳 | 프로덕션 로깅 전략 수립 필요 |

### UX 개선 제안
| 우선순위 | 제안 | 설명 |
|---------|------|------|
| 🔴 높음 | 게시글 이미지 수정 시 새로고침 미반영 | 수정 후 allImages가 업데이트되지 않음 (페이지 새로고침 필요) |
| 🟡 중간 | 폰트 전략 재검토 | font-pixel(DNFBitBitv2)이 소형에서 가독성 낮음. Galmuri11을 font-pixel 기본으로 전환 고려 |
| 🟡 중간 | 게시글 작성 시 사진 순서 변경 | 드래그로 대표 이미지 변경 기능 |
| 🟢 낮음 | 라이트박스에서 YouTube 동영상 | 현재 YouTube는 인라인 iframe만 (라이트박스 미지원) |
| 🟢 낮음 | 팀원 현황 컴팩트/카드 뷰 토글 | 한눈에 보기 vs 상세 보기 전환 |

### RLS 주의사항
- `team_members_update_admin`: is_team_admin() 체크 — 감독/코치 본인 경력 수정 시 이 정책에 의존
- 향후 "본인 자신의 row만 수정" 정책 추가 고려: `auth.uid() = user_id OR is_team_admin()`

---

## 로드맵 (업데이트)

### Phase 2: 팀 관리 강화 (핵심 — 다음 세션 최우선)

| # | 작업 | 규모 | 설명 | 새 테이블 |
|---|------|------|------|----------|
| 2.1 | **일정 출석 관리** | M | 일정별 참석/불참/미정 투표 | schedule_attendances |
| 2.2 | **팀 회비 관리** | M | 월별 회비 납부 체크리스트 | team_dues |
| 2.3 | **팀 공지 개선** | S | 공지 히스토리 + 중요 공지 고정 | team_notices 확장 |
| 2.4 | **팀원 현황 개선** | S | 마지막 활동일, 출석률 표시 | team_members 확장 |

### Phase 3: 싸이월드 감성 + 소셜

| # | 작업 | 규모 | 설명 |
|---|------|------|------|
| 3.1 | **오늘의 기분** | S | 팀원 이모지 상태 (😊😤😴🔥) |
| 3.2 | **BGM 플레이어** | S | BgmPlayer.tsx 이미 존재, teams.bgm_url 연동만 |
| 3.3 | **팀 일촌** | M | 팀 간 우호 관계 신청→수락 |
| 3.4 | **선수 개인 통계** | M | 출전, 골, 어시스트 기록 |
| 3.5 | **미니홈 확장** | M | 방문자 수 실제 연동 |

### Phase 4: 매칭 완성 (팀 수 증가 후)

| # | 작업 | 규모 | 설명 |
|---|------|------|------|
| 4.1 | **매치 결과 입력** | L | 양팀 점수, MVP, 사진 |
| 4.2 | **매너 점수** | M | 매치 후 상대팀 평가 |
| 4.3 | **팀 업적 재구현** | M | 실제 매치 데이터 기반 업적 |
| 4.4 | **매치 전적** | M | 팀/개인 전적 기록 |
| 4.5 | **지역 리그/랭킹** | L | 시즌 리그, 랭킹 보드 |

### Phase 5: 수익화 + 앱 출시 (장기)

| # | 작업 | 규모 | 설명 |
|---|------|------|------|
| 5.1 | **도토리 (포인트)** | L | 활동 포인트 → 스킨/아이템 |
| 5.2 | **프리미엄 스킨** | M | 유료 or 포인트 스킨 |
| 5.3 | **코트 예약** | L | 카카오맵 + 풋살장 DB |
| 5.4 | **앱스토어 출시** | L | PWA → Capacitor 래퍼 |
| 5.5 | **푸시 알림** | M | FCM + Service Worker |

---

## 다음 세션 작업 순서 (권장)

1. **알려진 이슈 수정** — 메시지 에러 미처리, 잔여 text-[8px]
2. **2.1 출석 관리** — 팀 운영 핵심 기능
3. **2.2 회비 관리** — 팀 운영 실용 기능
4. **3.1 오늘의 기분** — 싸이월드 감성 (간단)
5. **3.2 BGM** — 이미 컴포넌트 존재
6. **2.3 공지 개선** + **2.4 팀원 현황 개선**

---

## 작업 시 체크리스트 (매 작업마다)

- [ ] 기존 기능과 충돌 없는지 확인
- [ ] 모바일에서 글자 크기/가시성 확인 (font-pixel 최소 11px)
- [ ] 라운드 테두리 통일 (rounded-lg 또는 rounded-xl)
- [ ] CRUD 전체 동작 확인 (생성/조회/수정/삭제)
- [ ] RLS 정책 정상 작동 확인
- [ ] `npm run build` 성공 확인
- [ ] 연관 컴포넌트에 사이드 이펙트 없는지 확인

---

## 핵심 파일 참조

### 페이지 (src/pages/)
- TeamHome.tsx — 팀 홈 (~1000줄, 전광판 네온 컬러 포함)
- Schedule.tsx — 일정 관리 (4유형, 다중등록, 달력 날짜 선택)
- TeamArchive.tsx — 팀 아카이브 (동영상+사진 통합)
- Matchmaking.tsx — 매칭 게시판
- Messages.tsx — 메시지/초대/입단신청
- Index.tsx — 홈 화면
- MyProfile.tsx — 프로필 수정

### 핵심 컴포넌트 (src/components/)
- team/MemberRoster.tsx — 팀원 현황 (4열 그리드, 감독/코치 경력 수정)
- team/PlayerStatsModal.tsx — 선수 카드 (실명 표시, 역할, 경력)
- team/AdminManageModal.tsx — 역할 관리
- team/HompySkinSelector.tsx — 스킨 선택 (13종)
- team/SkinAnimation.tsx — 애니메이션 (쌈바 픽셀아트 포함)
- team/Guestbook.tsx — 방명록
- archive/TimelinePost.tsx — 게시글 (수정/동영상+사진 갤러리/라이트박스)
- archive/ArchiveWriteModal.tsx — 게시글 작성 (전체 항목)
- home/NeighborhoodNews.tsx — 동네소식
- layout/BottomNav.tsx — 하단 네비 (실시간 뱃지)

### DB
- supabase-migration.sql — 전체 스키마
- is_team_admin() — 권한 함수
- RLS 정책 — 모든 테이블

### 스타일
- src/index.css — 픽셀아트 CSS (kairo-panel rounded-xl, 14+ 애니메이션)
- tailwind.config.ts — 커스텀 테마
- vite.config.ts — manualChunks (vendor/supabase/ui 분리)

### 빌드 설정
- App.tsx — 모든 페이지 React.lazy() + Suspense
- vite.config.ts — vendor/supabase/ui 청크 분리
- 메인 번들: 125KB (gzip 40KB)
