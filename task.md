# Baby Tracker Web Task List

## ⏳ Sprint 1: Refactor Architecture + Auth (100% Completed)
- [x] Create Supabase browser client (`src/lib/supabase/client.ts`)
- [x] Create Supabase server client (`src/lib/supabase/server.ts`)
- [x] Implement SSR compatibility adapter in `src/lib/supabase.ts`
- [x] Implement Auth Middleware (`src/middleware.ts`)
- [x] Create OAuth Callback handler (`src/app/auth/callback/route.ts`)
- [x] Redesign Login Page (`src/app/login/page.tsx`) with Sage Green (#1D9E75) and Google OAuth
- [x] Create multi-page layouts (`src/app/(dashboard)/layout.tsx`)
- [x] Implement Sidebar, Header, BottomNav components
- [x] Organize Page Routes and placeholders for feed, sleep, diaper, pump, etc.

## ⏳ Sprint 2: Database Schema + Service APIs (100% Completed)
- [x] Create initial schema SQL (`supabase/migrations/001_initial_schema.sql`)
- [x] Define TypeScript models in `src/types/database.ts`
- [x] Expand CRUD services in `src/lib/services/babyService.ts`

## ⏳ Sprint 3: Dashboard Redesign (100% Completed)
- [x] Create generic premium UI components:
  - [x] `<ProgressBar>` with animated color transitions based on completion (`src/components/ui/ProgressBar.tsx`)
  - [x] `<SkeletonCard>` for shimmering placeholders (`src/components/ui/SkeletonCard.tsx`)
- [x] Create specialized dashboard components:
  - [x] `<TodaySummaryBar>` displaying Sage Green progress dials/cards (`src/components/dashboard/TodaySummaryBar.tsx`)
  - [x] `<QuickAddButtons>` with elegant ripple effects (`src/components/dashboard/QuickAddButtons.tsx`)
  - [x] `<RecentActivityFeed>` with a vertical timeline (`src/components/dashboard/RecentActivityFeed.tsx`)
  - [x] `<DailyTip>` rendering rotating Vietnamese baby care tips (`src/components/dashboard/DailyTip.tsx`)
- [x] Refactor dashboard home page (`src/app/(dashboard)/[babyId]/page.tsx`):
  - [x] Integrate redesigned components
  - [x] Connect Zustand store data with today filters
  - [x] Add smooth fade-in animations and layout spacing

## ⏳ Sprint 4: Separate Modules UI (100% Completed)
- [x] Implement full Feed Page (`src/app/(dashboard)/[babyId]/feed/page.tsx`)
- [x] Implement full Sleep Page (`src/app/(dashboard)/[babyId]/sleep/page.tsx`)
- [x] Implement full Diaper Page (`src/app/(dashboard)/[babyId]/diaper/page.tsx`)
- [x] Implement full Pump Page (`src/app/(dashboard)/[babyId]/pump/page.tsx`)
- [x] Build shared log page helpers:
  - [x] `<DateFilter>` with custom preset options (`src/components/ui/DateFilter.tsx`)
  - [x] Log List & Card components for unified activity rendering (`src/components/logs/LogList.tsx`, `LogCard.tsx`)
