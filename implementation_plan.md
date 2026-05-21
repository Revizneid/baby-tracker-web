# 📋 Kế hoạch triển khai Baby Tracker Web — So sánh PRD vs Hiện trạng

## Tổng quan

Phân tích chi tiết khoảng cách giữa PRD v1.2 (Web App) và trạng thái hiện tại của dự án, kèm kế hoạch triển khai từng bước với prompt cụ thể.

---

## 1. Phân tích hiện trạng vs PRD

### 1.1 Kiến trúc & Cấu trúc

| Hạng mục | PRD yêu cầu | Hiện trạng | Gap |
|----------|-------------|------------|-----|
| **Route structure** | App Router với `(auth)`, `(dashboard)/[babyId]/*` — 10+ trang riêng biệt | Flat: chỉ 2 route (`/` và `/login`), tất cả nhồi vào `page.tsx` (263 dòng) | 🔴 Critical |
| **Middleware** | `middleware.ts` bảo vệ route, redirect unauthenticated | Không có middleware — auth check bằng client-side `useEffect` | 🔴 Critical |
| **Supabase client** | 2 client: `client.ts` (browser) + `server.ts` (cookies, SSR) dùng `@supabase/ssr` | 1 client duy nhất dùng `createClient` trực tiếp, không SSR-safe | 🟡 Major |
| **Server Components** | SSR initial data, Server Actions cho mutations | 100% Client Components (`'use client'` everywhere) | 🟡 Major |
| **State management** | Zustand (UI) + TanStack Query (server state) | Chỉ Zustand — không có TanStack Query, polling 30s thay Realtime | 🟡 Major |
| **Layout** | Sidebar + header + bottom-nav responsive | Header đơn giản, không sidebar, không bottom-nav | 🟡 Major |
| **Forms** | React Hook Form + Zod validation | Controlled inputs thủ công, không validation | 🟢 Minor |

### 1.2 Modules — Tính năng

| Module | PRD | Hiện trạng | Gap |
|--------|-----|------------|-----|
| **M1 — Dashboard** | Summary cards + progress bars + calendar strip + timeline 6 events + daily tip | Flat list logs + basic quick-action buttons | 🔴 Major redesign |
| **M2 — Feed/Sleep/Diaper** | Trang riêng, list + edit + delete, TimePicker/DatePicker scroll | Modal chung `LogModal.tsx`, basic form, delete qua long-press | 🟡 Partial |
| **M3 — Hút sữa & Kho sữa** | Timer real-time 2 bên, kho sữa expiry color | `PumpingModal` + `MilkInventory` — có basic UI | 🟢 Tương đối OK |
| **M4 — Sức khỏe & Tăng trưởng** | Form đo, bảng lịch sử, so chuẩn WHO | Type `GrowthLog` có, service `getGrowthLogs` có — **nhưng không có UI** | 🔴 Thiếu hoàn toàn |
| **M5 — Tiêm chủng (27 mũi)** | 27 mũi TCMR, status 4 màu, DatePicker, brand tracking | **Thiếu hoàn toàn** — không có type, không có service, không có UI | 🔴 Thiếu hoàn toàn |
| **M6 — Nhắc nhở Vitamin** | CRUD reminders, preset D3+K2, push notification | **Thiếu hoàn toàn** | 🔴 Thiếu hoàn toàn |
| **M7 — Biểu đồ (5 loại)** | 5 tab chart (Hút sữa/Bú/Ngủ/Tã/Tăng trưởng), click bar → detail card | `AnalyticsDashboard` chỉ có 2 chart (milk + diaper), không interactive | 🔴 Major gap |
| **M8 — Gia đình (Family)** | Invite link, role management, realtime toast | **Thiếu hoàn toàn** — không có family_members, family_invites | 🔴 Thiếu hoàn toàn |
| **M9 — Uống nước cho Mẹ** | Progress circle, 6 quick-add buttons, reminder | **Thiếu hoàn toàn** | 🔴 Thiếu hoàn toàn |

### 1.3 Database & Types

| Bảng | PRD | Hiện trạng |
|------|-----|------------|
| `profiles` | ✅ Required | ❌ Thiếu |
| `babies` | ✅ | ✅ Có (type + service) |
| `family_members` | ✅ | ❌ Thiếu |
| `family_invites` | ✅ | ❌ Thiếu |
| `feed_logs` | ✅ | ✅ `feeds` (tên bảng khác PRD) |
| `sleep_logs` | ✅ | ✅ Có |
| `diaper_logs` | ✅ | ✅ Có |
| `growth_logs` | ✅ | ✅ Type + service có, UI thiếu |
| `pump_logs` | ✅ | ✅ `pumping_logs` (tên khác) |
| `milk_storage` | ✅ | ✅ Có |
| `vaccine_records` | ✅ | ❌ Thiếu |
| `reminders` | ✅ | ❌ Thiếu |
| `water_logs` | ✅ | ❌ Thiếu |
| **RLS Policies** | ✅ Required | ❌ Không có |
| **Triggers** | ✅ Auto-insert profile, auto-update updated_at | ❌ Không có |
| **Indexes** | ✅ Composite indexes | ❌ Không có |

### 1.4 UI/UX & Design

| Hạng mục | PRD | Hiện trạng | Gap |
|----------|-----|------------|-----|
| **Font** | Inter | Geist Sans / Geist Mono | 🟢 Minor |
| **Primary color** | `#1D9E75` (sage green) | `pink-500` (#ec4899) | 🟡 Cần đổi |
| **Shadcn/ui** | Required — accessible, themeable | Không có — tất cả custom components | 🟡 Major |
| **Loading skeletons** | Required cho mỗi card | Chỉ có 1 loading spinner đơn giản | 🟡 |
| **Empty states** | CTA rõ ràng, illustration | Basic text "Chưa có..." | 🟡 |
| **Toast notifications** | Required sau mỗi action | Dùng `alert()` | 🟡 |
| **Responsive** | 320px–1440px, 1/2/3 col | Basic responsive, có breakpoints nhưng chưa đầy đủ | 🟢 |

---

## 2. Kế hoạch triển khai — 8 Sprint

> [!IMPORTANT]
> Mỗi Sprint đi kèm **prompt cụ thể** để sử dụng. Các Sprint nên được thực hiện **tuần tự** vì có dependency.

---

### Sprint 1: Refactor kiến trúc + Supabase SSR + Middleware + Auth

**Mục tiêu:** Chuyển đổi cấu trúc từ flat sang multi-page App Router chuẩn PRD. Setup Supabase SSR, middleware bảo vệ routes, Google OAuth.

**Files cần tạo/sửa:**
- `[NEW]` `src/middleware.ts`
- `[NEW]` `src/lib/supabase/client.ts`
- `[NEW]` `src/lib/supabase/server.ts`
- `[NEW]` `src/app/auth/callback/route.ts`
- `[MODIFY]` `src/app/(auth)/login/page.tsx` — thêm Google OAuth button
- `[NEW]` `src/app/(dashboard)/layout.tsx` — sidebar + header + bottom-nav
- `[NEW]` `src/app/(dashboard)/page.tsx` — baby selector / onboarding
- `[NEW]` `src/app/(dashboard)/[babyId]/page.tsx` — dashboard
- `[NEW]` `src/components/layout/Sidebar.tsx`
- `[NEW]` `src/components/layout/Header.tsx`
- `[NEW]` `src/components/layout/BottomNav.tsx`
- `[DELETE]` `src/lib/supabase.ts` (thay bằng 2 file mới)
- `[MODIFY]` `src/components/providers/AuthProvider.tsx` — dùng SSR client
- `[MODIFY]` `package.json` — thêm `@supabase/ssr`

**Prompt:**

```
Bạn là senior Next.js developer. Refactor "Nhật ký bé yêu" (Baby Tracker Web) từ flat structure sang multi-page App Router.

HIỆN TRẠNG:
- Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- Supabase client tại /lib/supabase.ts — dùng createClient trực tiếp (không SSR-safe)
- Auth client-side qua AuthProvider (useEffect check session)
- Tất cả UI nằm trong /app/page.tsx (263 dòng monolith)
- Login tại /login/page.tsx (email+password only)
- Không có middleware
- Màu hiện tại: pink-500

YÊU CẦU REFACTOR:
1. Cài @supabase/ssr, tạo 2 Supabase clients:
   - /lib/supabase/client.ts — createBrowserClient (cho Client Components)
   - /lib/supabase/server.ts — createServerClient (cho Server Components, cookies)

2. Tạo middleware.ts:
   - Protect tất cả routes /dashboard/* 
   - Redirect unauthenticated → /login
   - Refresh session token tự động
   - Public routes: /login, /auth/callback, /invite/*

3. Tạo /app/auth/callback/route.ts:
   - Handle OAuth callback từ Supabase
   - Exchange code → session
   - Redirect to /dashboard

4. Sửa /app/(auth)/login/page.tsx:
   - Thêm nút "Đăng nhập với Google" (dùng supabase.auth.signInWithOAuth)
   - Giữ email/password form hiện tại
   - Giao diện vi-VN, gradient background

5. Tạo cấu trúc route mới:
   /app/(auth)/login/page.tsx
   /app/auth/callback/route.ts
   /app/(dashboard)/layout.tsx → Sidebar + Header + BottomNav
   /app/(dashboard)/page.tsx → Baby selector / redirect to [babyId]
   /app/(dashboard)/[babyId]/page.tsx → Dashboard chính
   /app/(dashboard)/[babyId]/feed/page.tsx → placeholder
   /app/(dashboard)/[babyId]/sleep/page.tsx → placeholder
   /app/(dashboard)/[babyId]/diaper/page.tsx → placeholder
   /app/(dashboard)/[babyId]/pump/page.tsx → placeholder
   /app/(dashboard)/[babyId]/growth/page.tsx → placeholder
   /app/(dashboard)/[babyId]/vaccine/page.tsx → placeholder
   /app/(dashboard)/[babyId]/reminders/page.tsx → placeholder
   /app/(dashboard)/[babyId]/charts/page.tsx → placeholder
   /app/(dashboard)/[babyId]/settings/page.tsx → placeholder

6. Dashboard Layout (/app/(dashboard)/layout.tsx):
   - Sidebar trái (desktop) với 9 menu items + icon:
     📊 Tổng quan, 🍼 Bú/Ăn, 😴 Giấc ngủ, 🧷 Thay tã,
     🤱 Hút sữa, 📏 Tăng trưởng, 💉 Tiêm chủng,
     🔔 Nhắc nhở, 📈 Biểu đồ
   - Header trên: avatar user + baby selector dropdown + nút settings
   - Bottom nav (mobile): 5 items chính
   - Active state highlight

7. Cập nhật AuthProvider:
   - Sử dụng Supabase SSR client
   - Không dùng localStorage cho session

MÀU CHỦ ĐẠO: #1D9E75 (sage green), background: #F5F7F5, font: Inter
KHÔNG dùng shadcn/ui — giữ custom components với Tailwind
TypeScript strict — không dùng `any`
Responsive: mobile-first, 320px → 1440px
```

---

### Sprint 2: Database Schema, RLS & Types hoàn chỉnh

**Mục tiêu:** Tạo SQL migration đầy đủ 13 bảng + RLS + triggers + indexes. Cập nhật TypeScript types.

**Files cần tạo/sửa:**
- `[NEW]` `supabase/migrations/001_initial_schema.sql`
- `[MODIFY]` `src/types/database.ts` — thêm VaccineRecord, Reminder, WaterLog, FamilyMember, etc.
- `[MODIFY]` `src/lib/services/babyService.ts` — thêm services cho vaccine, reminder, water

**Prompt:**

```
CONTEXT: Baby tracker webapp "Nhật ký bé yêu" — Supabase PostgreSQL.

HIỆN TRẠNG DATABASE:
- Các bảng đã có: babies, feeds, sleep_logs, diaper_logs, growth_logs, pumping_logs, milk_storage
- CHƯA có: profiles, family_members, family_invites, vaccine_records, reminders, water_logs
- CHƯA có: RLS policies, triggers, indexes
- CHƯA có: ENUM types

TASK: Tạo complete SQL migration file + TypeScript types cho toàn bộ schema.

TABLES (13 bảng):
1. profiles (id uuid PK → auth.users, full_name TEXT, avatar_url TEXT, created_at TIMESTAMPTZ)
2. babies (id uuid PK, user_id FK→profiles, name TEXT NOT NULL, birth_date DATE NOT NULL, gender TEXT CHECK(gender IN ('male','female','')), avatar_url TEXT, created_at, updated_at)
3. family_members (id uuid PK, baby_id FK→babies, user_id FK→profiles, role TEXT CHECK(role IN ('owner','member')), created_at)
4. family_invites (id uuid PK, baby_id FK→babies, token UUID UNIQUE NOT NULL, expires_at TIMESTAMPTZ, used_at TIMESTAMPTZ, created_at)

5. feed_logs (id uuid PK, baby_id FK, user_id FK, type feed_type_enum, amount_ml INT, time TIMESTAMPTZ NOT NULL, note TEXT, created_at, updated_at)
   - feed_type_enum: 'breast-left','breast-right','breast-both','formula','pumped'

6. sleep_logs (id uuid PK, baby_id FK, user_id FK, start_time TIMESTAMPTZ, end_time TIMESTAMPTZ, type sleep_type_enum, duration_minutes INT, created_at, updated_at)
   - sleep_type_enum: 'night','nap'

7. diaper_logs (id uuid PK, baby_id FK, user_id FK, type diaper_type_enum, color TEXT, note TEXT, time TIMESTAMPTZ NOT NULL, created_at, updated_at)
   - diaper_type_enum: 'wet','dirty','both','clean'

8. growth_logs (id uuid PK, baby_id FK, user_id FK, date DATE NOT NULL, weight_kg DECIMAL(5,2), height_cm DECIMAL(5,1), head_cm DECIMAL(5,1), age_weeks INT, note TEXT, created_at, updated_at)

9. pump_logs (id uuid PK, baby_id FK, user_id FK, left_ml INT DEFAULT 0, right_ml INT DEFAULT 0, total_ml INT DEFAULT 0, duration_min INT, start_time TIMESTAMPTZ, note TEXT, created_at, updated_at)

10. milk_storage (id uuid PK, baby_id FK, user_id FK, amount_ml INT NOT NULL, stored_at storage_type_enum, expires_at DATE, used BOOLEAN DEFAULT FALSE, note TEXT, created_at, updated_at)
    - storage_type_enum: 'fridge','freezer'

11. vaccine_records (id uuid PK, baby_id FK, user_id FK, vaccine_id VARCHAR(50) NOT NULL, vacc_date DATE, brand VARCHAR(100), note TEXT, created_at, updated_at)

12. reminders (id uuid PK, user_id FK, baby_id FK, title TEXT NOT NULL, type TEXT, doses_per_day INT DEFAULT 1, time_schedule TIME[], enabled BOOLEAN DEFAULT TRUE, created_at, updated_at)

13. water_logs (id uuid PK, user_id FK, amount_ml INT NOT NULL, logged_at TIMESTAMPTZ DEFAULT NOW(), created_at)

RLS POLICIES:
- SELECT: user chỉ xem record của baby mình own HOẶC là family_member
- INSERT/UPDATE/DELETE: owner và member đều được
- family_invites: owner tạo, ai cũng có thể đọc bằng token (public select by token)
- water_logs: user chỉ xem/sửa của mình (không liên quan baby)
- profiles: user chỉ xem/sửa của mình

TRIGGERS:
1. auto-insert profiles khi user signup (AFTER INSERT ON auth.users)
2. auto-update updated_at cho tất cả bảng có trường updated_at (sử dụng moddatetime hoặc custom trigger)

INDEXES:
- (baby_id, time DESC) cho feed_logs, diaper_logs
- (baby_id, start_time DESC) cho sleep_logs, pump_logs
- (baby_id, date DESC) cho growth_logs, vaccine_records
- (user_id, logged_at DESC) cho water_logs
- (baby_id, user_id) cho family_members
- (token) UNIQUE cho family_invites

REALTIME:
- Enable Supabase Realtime cho: feed_logs, sleep_logs, diaper_logs, pump_logs, milk_storage

OUTPUT:
1. File SQL: supabase/migrations/001_initial_schema.sql (chạy được, idempotent)
2. File TypeScript: src/types/database.ts — cập nhật đầy đủ types cho 13 bảng
3. File Service: src/lib/services/babyService.ts — thêm CRUD cho vaccine_records, reminders, water_logs

LƯU Ý: 
- Giữ nguyên data cũ đã có, chỉ ALTER nếu cần
- Tên bảng hiện tại (feeds, sleep_logs, diaper_logs, pumping_logs) giữ nguyên HOẶC rename — chọn 1 hướng nhất quán
- Sử dụng uuid_generate_v4() hoặc gen_random_uuid() cho PK
```

---

### Sprint 3: Dashboard Page — Redesign hoàn chỉnh

**Mục tiêu:** Xây dựng Dashboard page theo PRD: summary cards, progress bars, quick-add, recent activity, daily tip.

**Files cần tạo/sửa:**
- `[MODIFY]` `src/app/(dashboard)/[babyId]/page.tsx`
- `[NEW]` `src/components/dashboard/TodaySummaryBar.tsx`
- `[NEW]` `src/components/dashboard/QuickAddButtons.tsx`
- `[NEW]` `src/components/dashboard/RecentActivityFeed.tsx`
- `[NEW]` `src/components/dashboard/DailyTip.tsx`
- `[NEW]` `src/components/ui/ProgressBar.tsx`
- `[NEW]` `src/components/ui/SkeletonCard.tsx`

**Prompt:**

```
CONTEXT: Baby tracker webapp "Nhật ký bé yêu". User đã login + đã chọn baby.
Kiến trúc: Next.js 16 App Router, TypeScript, Tailwind CSS v4, Zustand, Supabase.
Màu chủ đạo: #1D9E75 (sage green), background: #F5F7F5, font: Inter.

TASK: Build Dashboard page tại /app/(dashboard)/[babyId]/page.tsx

COMPONENTS CẦN XÂY:

1. <TodaySummaryBar>
   - 3 metric cards nằm ngang, thiết kế gradient đẹp:
     • Cữ bú: icon 🍼, số lần hôm nay / target 8 lần, progress bar
     • Giờ ngủ: icon 😴, tổng giờ ngủ hôm nay / target 14h, progress bar
     • Thay tã: icon 🧷, số lần hôm nay / target 6 lần, progress bar
   - Dưới mỗi card: text nhỏ "Lần gần nhất: 02:30 — Bú mẹ 150ml"
   - Progress bar đổi màu theo %: đỏ (<30%) → cam (30-70%) → xanh (>70%)

2. <QuickAddButtons>
   - 4 nút tròn nằm ngang, hiệu ứng hover scale + shadow:
     🍼 Bú/Ăn | 😴 Ngủ | 🧷 Tã | 🤱 Hút sữa
   - Click → mở modal form (sử dụng lại LogModal/PumpingModal có sẵn)
   - Thêm hiệu ứng ripple khi nhấn

3. <RecentActivityFeed>
   - Hiển thị 6 sự kiện gần nhất (mix feed + sleep + diaper)
   - Timeline style: vertical line bên trái, dot màu phân loại
   - Mỗi item: icon + label + relative time ("2 phút trước", "1 giờ trước")
   - Format vi-VN locale
   - Hover → highlight + hiện nút xóa
   - Empty state: illustration + CTA "Thêm lần bú đầu tiên"

4. <DailyTip>
   - Card tip chăm sóc bé, gradient background nhẹ
   - Rotate theo ngày trong tuần (7 tips cố định)
   - Tips ví dụ:
     "💡 Bé 0-3 tháng cần bú 8-12 lần/ngày. Đừng lo nếu bé bú ít mỗi cữ!"
     "🌙 Giấc ngủ đêm 6-8 tiếng là bình thường với bé trên 3 tháng"
   - Icon emoji + title + body text

5. <ProgressBar value max color>
   - Thanh tròn bo góc, có animation fill
   - Hiển thị text % bên trong
   - Đổi màu smooth theo giá trị

6. <SkeletonCard>
   - Skeleton loading animation cho mỗi loại card
   - Shimmer effect

LAYOUT:
- Desktop (≥1024px): 2 cột — Summary bar full-width, Quick-add + Activity bên trái, Tip bên phải
- Tablet (768–1023px): 2 cột
- Mobile (<768px): 1 cột xếp dọc

DATA:
- Lấy data từ Zustand store (feeds, sleeps, diapers)
- Filter theo ngày hôm nay cho summary
- Sort theo timestamp DESC cho activity feed
- Relative time: dùng date-fns formatDistanceToNow với locale vi

REQUIREMENTS:
- Skeleton loading khi đang fetch data
- Tất cả timestamp hiển thị dạng relative ("2 phút trước")
- Empty state đẹp với CTA
- Animation fade-in khi component mount
- Responsive từ 320px
- TypeScript strict — không dùng any
```

---

### Sprint 4: Feed/Sleep/Diaper — Trang riêng + Cải thiện form

**Mục tiêu:** Tách mỗi loại log ra trang riêng với list view, edit, filter theo ngày.

**Files cần tạo:**
- `[MODIFY]` `src/app/(dashboard)/[babyId]/feed/page.tsx`
- `[MODIFY]` `src/app/(dashboard)/[babyId]/sleep/page.tsx`
- `[MODIFY]` `src/app/(dashboard)/[babyId]/diaper/page.tsx`
- `[MODIFY]` `src/app/(dashboard)/[babyId]/pump/page.tsx`
- `[NEW]` `src/components/logs/LogList.tsx`
- `[NEW]` `src/components/logs/LogCard.tsx`
- `[NEW]` `src/components/ui/DateFilter.tsx`

**Prompt:**

```
CONTEXT: Baby tracker webapp, Next.js 16 App Router, Tailwind CSS v4, Supabase.
Màu: #1D9E75, font: Inter. Đã có Zustand store với feeds, sleeps, diapers, pumpingLogs.

TASK: Build 4 trang tracking riêng biệt:

1. /app/(dashboard)/[babyId]/feed/page.tsx — Bú / Ăn
   - Header: "🍼 Nhật ký bú/ăn" + nút "Thêm mới"
   - DateFilter: pill selector "Hôm nay | Hôm qua | 7 ngày | Tất cả"
   - Today summary mini: tổng ml + số cữ + cữ gần nhất
   - Log list: card-based, mỗi card hiển thị:
     • Icon loại bú (trái/phải/CT/vắt)
     • Lượng ml (to, bold)
     • Thời gian (relative + absolute)
     • Ghi chú (nếu có)
     • Swipe/hover → nút sửa + xóa
   - Form thêm mới: slide-up sheet
     • Loại bú: pill selector (Mẹ trái | Mẹ phải | Hai bên | CT | Sữa vắt)
     • Lượng ml: number input với quick buttons (+50, +100, +150)
     • Thời gian: time picker
     • Ngày: date picker (default hôm nay)
     • Ghi chú: textarea
   - Empty state: "Bé chưa bú lần nào hôm nay 🍼"

2. /app/(dashboard)/[babyId]/sleep/page.tsx — Giấc ngủ
   - Header: "😴 Nhật ký giấc ngủ" + nút "Thêm giấc"
   - Today summary: tổng giờ ngủ + số giấc + giấc gần nhất
   - Log list:
     • Badge "Ngủ ngày" / "Ngủ đêm" với màu khác nhau
     • Thời lượng (1h30m format)
     • Thời gian bắt đầu → kết thúc
   - Form: start time + end time → tự tính duration
   - Tính duration_minutes = (end - start) / 60000

3. /app/(dashboard)/[babyId]/diaper/page.tsx — Vệ sinh
   - Header: "🧷 Nhật ký thay tã"
   - Today summary: số lần thay + phân loại (ướt/bẩn/cả hai)
   - Log list:
     • Icon/color theo loại (ướt=💧blue, bẩn=💩brown, cả hai=🔴, sạch=✅green)
     • Cảnh báo: nếu color = "đen" hoặc "đỏ" → badge "⚠️ Cần theo dõi"
   - Form: loại + color picker (vàng/xanh/đen/đỏ/bình thường) + note

4. /app/(dashboard)/[babyId]/pump/page.tsx — Hút sữa
   - Tương tự feed page, tách riêng cho pumping logs
   - Summary: tổng ml hôm nay + số lần hút
   - List card: trái/phải ml + tổng + lưu kho status

SHARED COMPONENTS:
- <LogList logs columns onDelete onEdit>
- <LogCard data type>
- <DateFilter value onChange> — "Hôm nay | Hôm qua | 7 ngày | Tháng này | Tất cả"
- <EmptyState icon title description ctaText onCta>
- <SlideSheet isOpen onClose title> — bottom sheet animation

REQUIREMENTS:
- Mỗi trang là Server Component wrapper + Client Component nội dung
- Confirm dialog trước khi xóa: "Bạn có chắc muốn xóa bản ghi này?"
- Loading skeletons
- Optimistic delete (xóa UI trước, rollback nếu lỗi)
- Toast thay alert(): "✅ Đã lưu thành công" / "❌ Có lỗi xảy ra"
- Responsive: card grid trên desktop, list trên mobile
- Animation: slide-in khi thêm, fade-out khi xóa
```

---

### Sprint 5: Vaccine Tracker — 27 mũi TCMR

**Mục tiêu:** Module tiêm chủng hoàn chỉnh theo PRD.

**Files cần tạo:**
- `[MODIFY]` `src/app/(dashboard)/[babyId]/vaccine/page.tsx`
- `[NEW]` `src/components/vaccine/VaccineProgress.tsx`
- `[NEW]` `src/components/vaccine/VaccineFilterTabs.tsx`
- `[NEW]` `src/components/vaccine/VaccineGroupSection.tsx`
- `[NEW]` `src/components/vaccine/VaccineCard.tsx`
- `[NEW]` `src/components/vaccine/VaccineSheet.tsx`
- `[NEW]` `src/lib/data/vaccines.ts`

**Prompt:**

```
CONTEXT: Baby tracker webapp "Nhật ký bé yêu". Cần màn hình Tiêm chủng đầy đủ.
Next.js 16 App Router, Tailwind CSS v4, Supabase. Màu: #1D9E75.

TASK: Build /app/(dashboard)/[babyId]/vaccine/page.tsx

VACCINE DATA — 27 mũi (file cứng src/lib/data/vaccines.ts):

export const VACCINES = [
  // Sơ sinh (tuần 0)
  { id: 'bcg', name: 'BCG', disease: 'Lao', ageWeeks: 0, type: 'tcmr', brands: ['BCG SSI'] },
  { id: 'hepb-1', name: 'Viêm gan B mũi 1', disease: 'Viêm gan B', ageWeeks: 0, type: 'tcmr', brands: ['Euvax B', 'Engerix B'] },
  
  // 2 tháng (tuần 8)
  { id: '6in1-1', name: '6-trong-1 mũi 1', disease: 'Bạch hầu, Ho gà, Uốn ván, Bại liệt, Hib, VGB', ageWeeks: 8, type: 'dv', brands: ['Infanrix Hexa', 'Hexaxim'] },
  { id: '5in1-1', name: '5-trong-1 mũi 1', disease: 'Bạch hầu, Ho gà, Uốn ván, Bại liệt, Hib', ageWeeks: 8, type: 'tcmr', brands: ['Pentaxim', 'ComBE Five'] },
  { id: 'pcv-1', name: 'Phế cầu PCV mũi 1', disease: 'Viêm phổi, Viêm màng não do phế cầu', ageWeeks: 8, type: 'dv', brands: ['Synflorix', 'Prevenar 13'] },
  { id: 'rota-1', name: 'Rotavirus mũi 1', disease: 'Tiêu chảy do Rotavirus', ageWeeks: 8, type: 'dv', brands: ['Rotarix', 'Rotateq'] },
  { id: 'vmnbc-1', name: 'VMN BC mũi 1', disease: 'Viêm màng não mô cầu BC', ageWeeks: 8, type: 'dv', brands: ['VA-MENGOC-BC'] },
  
  // 3 tháng (tuần 12)
  { id: '6in1-2', name: '6-trong-1 mũi 2', disease: 'Bạch hầu, Ho gà, Uốn ván, Bại liệt, Hib, VGB', ageWeeks: 12, type: 'dv', brands: ['Infanrix Hexa', 'Hexaxim'] },
  { id: '5in1-2', name: '5-trong-1 mũi 2', disease: 'Bạch hầu, Ho gà, Uốn ván, Bại liệt, Hib', ageWeeks: 12, type: 'tcmr', brands: ['Pentaxim', 'ComBE Five'] },
  { id: 'rota-2', name: 'Rotavirus mũi 2', disease: 'Tiêu chảy do Rotavirus', ageWeeks: 12, type: 'dv', brands: ['Rotarix', 'Rotateq'] },
  { id: 'vmnbc-2', name: 'VMN BC mũi 2', disease: 'Viêm màng não mô cầu BC', ageWeeks: 12, type: 'dv', brands: ['VA-MENGOC-BC'] },
  
  // 4 tháng (tuần 16)
  { id: '6in1-3', name: '6-trong-1 mũi 3', disease: 'Bạch hầu, Ho gà, Uốn ván, Bại liệt, Hib, VGB', ageWeeks: 16, type: 'dv', brands: ['Infanrix Hexa', 'Hexaxim'] },
  { id: '5in1-3', name: '5-trong-1 mũi 3', disease: 'Bạch hầu, Ho gà, Uốn ván, Bại liệt, Hib', ageWeeks: 16, type: 'tcmr', brands: ['Pentaxim', 'ComBE Five'] },
  { id: 'pcv-2', name: 'Phế cầu PCV mũi 2', disease: 'Viêm phổi, Viêm màng não do phế cầu', ageWeeks: 16, type: 'dv', brands: ['Synflorix', 'Prevenar 13'] },
  { id: 'rota-3', name: 'Rotavirus mũi 3', disease: 'Tiêu chảy do Rotavirus', ageWeeks: 16, type: 'dv', brands: ['Rotateq'] },
  
  // 6 tháng (tuần 24)
  { id: 'hepb-3', name: 'Viêm gan B mũi 3', disease: 'Viêm gan B', ageWeeks: 24, type: 'tcmr', brands: ['Euvax B', 'Engerix B'] },
  { id: 'flu-1', name: 'Cúm mùa mũi 1', disease: 'Cúm', ageWeeks: 24, type: 'dv', brands: ['Vaxigrip Tetra', 'Influvac Tetra'] },
  { id: 'vmn-ac', name: 'VMN A+C', disease: 'Viêm màng não mô cầu A+C', ageWeeks: 24, type: 'dv', brands: ['Polysaccharide A+C'] },
  
  // 9 tháng (tuần 36)
  { id: 'mmr-1', name: 'MMR mũi 1', disease: 'Sởi, Quai bị, Rubella', ageWeeks: 36, type: 'dv', brands: ['MMR II', 'Priorix'] },
  { id: 'measles', name: 'Sởi đơn', disease: 'Sởi', ageWeeks: 36, type: 'tcmr', brands: ['MVVAC'] },
  { id: 'je-1', name: 'Viêm não NB mũi 1', disease: 'Viêm não Nhật Bản', ageWeeks: 36, type: 'tcmr', brands: ['Jevax', 'Imojev'] },
  
  // 12 tháng (tuần 48)
  { id: 'pcv-3', name: 'Phế cầu PCV nhắc', disease: 'Viêm phổi, Viêm màng não do phế cầu', ageWeeks: 48, type: 'dv', brands: ['Synflorix', 'Prevenar 13'] },
  { id: 'je-2', name: 'Viêm não NB mũi 2', disease: 'Viêm não Nhật Bản', ageWeeks: 48, type: 'tcmr', brands: ['Jevax', 'Imojev'] },
  { id: 'varicella', name: 'Thủy đậu', disease: 'Thủy đậu', ageWeeks: 48, type: 'dv', brands: ['Varivax', 'Varilrix'] },
  { id: 'hepb-4', name: 'Viêm gan B nhắc', disease: 'Viêm gan B', ageWeeks: 48, type: 'dv', brands: ['Euvax B'] },
  
  // 18 tháng (tuần 72)
  { id: 'mmr-2', name: 'MMR mũi 2', disease: 'Sởi, Quai bị, Rubella', ageWeeks: 72, type: 'dv', brands: ['MMR II', 'Priorix'] },
  { id: 'dpt-booster', name: 'DPT nhắc lại', disease: 'Bạch hầu, Ho gà, Uốn ván', ageWeeks: 72, type: 'tcmr', brands: ['Adacel', 'Boostrix'] },
];

STATUS LOGIC (tính từ baby.birth_date + vaccine.ageWeeks):
- plannedDate = addWeeks(baby.birth_date, vaccine.ageWeeks)
- done → có record trong vaccine_records (match vaccine_id)
- overdue → plannedDate < today && !done → đỏ #EF4444
- soon → 0 < daysUntil ≤ 7 && !done → vàng #F59E0B
- upcoming → daysUntil > 7 → xám #9CA3AF
- done → xanh #10B981

COMPONENTS:

<VaccineProgress> 
- "Đã tiêm 5/27 mũi" 
- Progress bar xanh lá, animated fill
- Mini badges: "X TCMR" + "Y Dịch vụ" đã tiêm

<VaccineFilterTabs>
- Pill tabs: "Tất cả (27)" | "Chưa tiêm (22)" | "Đã tiêm (5)"
- Active tab có background color

<VaccineGroupSection ageLabel plannedDate vaccines>
- Group theo độ tuổi: "Sơ sinh", "2 tháng", "3 tháng", ...
- Header: ageLabel + "Dự kiến: DD/MM/YYYY"
- Badge count: "2/4 đã tiêm"

<VaccineCard vaccine record>
- Status badge 4 màu (dot + text)
- Tên vaccine (bold) + tên bệnh (nhỏ, gray)
- Badge "TCMR" (xanh dương) hoặc "Dịch vụ" (tím)
- Ngày dự kiến DD/MM/YYYY
- Nếu đã tiêm: hiện ngày tiêm + tên thương mại
- Click → mở <VaccineSheet>

<VaccineSheet vaccine record onSave>
- Slide-up sheet
- Thông tin vaccine: tên, phòng bệnh, TCMR/DV
- Danh sách tên thương mại gợi ý (chips clickable)
- Date picker cho ngày tiêm thực tế
- Input text cho tên thương mại (autocomplete từ brands)
- Nút "Đánh dấu đã tiêm" (xanh lá, to)
- Nếu đã tiêm: nút "Bỏ đánh dấu" (đỏ, outlined)
- Save → upsert vaccine_records trong Supabase

REQUIREMENTS:
- Data vaccine hardcoded (không fetch từ DB)
- Records vaccine lấy từ Supabase vaccine_records table
- Optimistic update: tick ngay, rollback nếu lỗi server
- Loading skeleton khi fetch records
- Scroll smooth to overdue section on mount
- Responsive: cards grid 1-2-3 col
- Không crash khi brand rỗng
```

---

### Sprint 6: Charts & Analytics — 5 loại biểu đồ

**Mục tiêu:** Nâng cấp AnalyticsDashboard lên 5 tab chart với interactive tooltips và detail cards.

**Prompt:**

```
CONTEXT: Baby tracker webapp. Cần 5 loại biểu đồ với Recharts.
Next.js 16, Tailwind CSS v4, Recharts đã cài. Màu: #1D9E75.

HIỆN TRẠNG: AnalyticsDashboard.tsx chỉ có 2 chart basic (milk bar + diaper line).
CẦN: Redesign hoàn toàn thành 5 tab interactive.

TASK: Build /app/(dashboard)/[babyId]/charts/page.tsx

CHART TABS (5 tabs, pill selector horizontal scroll trên mobile):
1. 🤱 Hút sữa — Bar chart, Y: tổng ml/ngày, 6 ngày gần nhất, màu #EC4899
2. 🍼 Bú/Ăn — Bar chart, Y: tổng ml bú/ngày, 6 ngày, màu #F97316
3. 😴 Ngủ — Bar chart, Y: tổng giờ ngủ/ngày, 6 ngày, màu #8B5CF6
4. 🧷 Tã — Bar chart, Y: số lần/ngày, 6 ngày, màu #3B82F6
5. 📏 Tăng trưởng — Line chart, X: tuần tuổi, Y: cân nặng (kg) + chiều cao (cm), dual axis

COMPONENT: <BabyBarChart data color unit label onBarClick>
- Recharts ResponsiveContainer + BarChart
- Rounded bars (radius [8,8,0,0])
- Label value on top mỗi cột
- Custom Tooltip: ngày DD/MM + giá trị + unit
- Cột selected: opacity 1 + border, cột khác: opacity 0.6
- Animation slide-up khi tab switch

COMPONENT: <DayDetailCard date data type onClose>
- Slide-in card khi click cột bar
- 3 stats cards ngang: Số lần | Tổng (ml/giờ) | Trung bình
- Timeline list từng event trong ngày đó:
  - Feed: "08:30 — Bú mẹ trái 120ml"
  - Sleep: "13:00-14:30 — Ngủ ngày (1h30m)"
  - Diaper: "09:15 — Tã ướt"
  - Pump: "07:00 — Hút 200ml (T:100 P:100)"
- Nút đóng (X) hoặc click outside

COMPONENT: <GrowthChart data>
- Recharts LineChart dual Y-axis
- Line 1: Cân nặng (kg) — màu #10B981, dot circle
- Line 2: Chiều cao (cm) — màu #F59E0B, dot square
- X: tuần tuổi
- 12 data points gần nhất
- Custom tooltip: "Tuần X: Y kg, Z cm"
- Reference lines cho chuẩn WHO (optional, nếu có data)

DATA PROCESSING (client-side, useMemo):
- Group logs by date (YYYY-MM-DD)
- Feed: sum(amount_ml) — parse string nếu cần
- Sleep: sum(duration_minutes) / 60, round 1 decimal
- Pump: sum(total_ml)
- Diaper: count(*)
- Growth: sort by age_weeks, lấy 12 gần nhất
- 6 ngày = subDays(today, 5) → today

REQUIREMENTS:
- Fetch tất cả data 1 lần từ store, client-side aggregate
- Recharts mobile-friendly (containerWidth="100%", height tự adapt)
- Empty state cho tab không có data: illustration + "Chưa có dữ liệu"
- Loading skeleton có shimmer animation
- Tab selector sticky ở trên khi scroll
- Smooth transition giữa các tab (fade + slide)
- TypeScript strict
```

---

### Sprint 7: Growth + Reminders + Water Tracker

**Mục tiêu:** Build 3 module còn thiếu: Tăng trưởng (M4), Nhắc nhở (M6), Uống nước (M9).

**Prompt:**

```
CONTEXT: Baby tracker webapp, Next.js 16, Tailwind CSS v4, Supabase.
Màu: #1D9E75. Đã có types và services cho growth_logs, reminders, water_logs.

TASK: Build 3 trang mới:

=== TRANG 1: /app/(dashboard)/[babyId]/growth/page.tsx ===

UI:
- Header: "📏 Theo dõi tăng trưởng"
- Latest stats card (gradient): Cân nặng | Chiều cao | Chu vi đầu | Tuổi tuần
- Form thêm đo lường (slide-up sheet):
  • Ngày đo: date picker
  • Cân nặng (kg): number input step 0.1, quick buttons (+0.5, +1.0)
  • Chiều cao (cm): number input step 0.5
  • Chu vi đầu (cm): number input step 0.5
  • Auto-calculate tuổi tuần từ baby.birth_date
  • Ghi chú
- Bảng lịch sử: table sortable, mỗi hàng = 1 lần đo
  • Ngày | Tuần tuổi | CN (kg) | CC (cm) | CVĐ (cm) | Ghi chú
  • Hàng mới nhất highlight
  • Swipe để xóa (mobile), hover hiện nút xóa (desktop)
- Mini chart: line chart 12 lần đo gần nhất (recharts)
- So sánh chuẩn WHO (stretch goal):
  • Reference data cho bé trai/gái
  • Hiển thị "Bé nằm trong khoảng bình thường ✅" hoặc cảnh báo

=== TRANG 2: /app/(dashboard)/[babyId]/reminders/page.tsx ===

UI:
- Header: "🔔 Nhắc nhở Vitamin & Thuốc"
- Preset nhanh card: "Thêm nhanh Vitamin D3+K2" (1 click)
- Active reminders list:
  • Card cho mỗi reminder: title + frequency + time
  • Toggle enabled/disabled
  • Đếm ngày dùng liên tục: "Đã dùng 15 ngày liên tục 🔥"
- Hôm nay section:
  • Danh sách doses hôm nay
  • 3 nút cho mỗi dose: "✅ Đã cho uống" | "⏭️ Bỏ qua" | "➕ Liều thêm"
  • Visual: check animation khi nhấn
- Form thêm nhắc nhở:
  • Tên: text input
  • Loại: "vitamin" | "thuốc" | "khác"
  • Số liều/ngày: number (default 1)
  • Giờ nhắc: time picker (multi-time nếu >1 liều)
  • Toggle on/off

LƯU Ý: Web Push notifications — chỉ cần UI và data model.
Notification scheduling sẽ implement sau (cần service worker).

=== TRANG 3: Uống nước cho Mẹ — Thêm vào Settings hoặc trang riêng ===

Đặt tại: /app/(dashboard)/water/page.tsx (KHÔNG cần babyId)

UI:
- Header: "💧 Uống nước cho Mẹ"  
- Vòng tròn tiến độ SVG lớn ở giữa:
  • Animated circular progress
  • Đổi màu: đỏ (<30%) → cam (30-60%) → xanh lá (>60%) → xanh dương (100%)
  • Text ở giữa: "1,200 / 2,000 ml"
  • "Còn thiếu 800ml"
- 6 nút thêm nhanh (grid 3x2):
  💧 150ml | 💧 200ml | 💧 250ml | 💧 300ml | 💧 350ml | 💧 500ml
  • Click → add to water_logs + animate ring fill
  • Ripple effect khi nhấn
- Lịch sử hôm nay: timeline nhỏ bên dưới
  • "08:30 — 200ml ☕" 
  • "10:15 — 300ml 💧"
  • Swipe delete
- Cài đặt (collapsible):
  • Mục tiêu ngày: slider 1500-3000ml (default 2000ml)
  • Giờ bắt đầu nhắc: time picker
  • Giờ kết thúc: time picker
  • Khoảng cách nhắc: 30p | 1h | 1.5h | 2h

REQUIREMENTS:
- Water tracker KHÔNG liên quan baby — chỉ user_id
- SVG circle progress tự code, không dùng thư viện
- Smooth animation khi thêm nước (số đếm lên + ring fill)
- Lưu target trong localStorage (không cần DB)
- Responsive: vòng tròn to trên mobile, nhỏ hơn trên desktop
- TypeScript strict
```

---

### Sprint 8: Family Sharing + PWA + Polish

**Mục tiêu:** Module chia sẻ gia đình, PWA support, SEO, performance.

**Prompt:**

```
CONTEXT: Baby tracker webapp, sprint cuối. Build family sharing + PWA.
Next.js 16, Supabase (family_members, family_invites tables đã có).

=== PART 1: FAMILY SHARING ===

FLOW:
Owner → tạo invite link → gửi qua Zalo/Messenger
→ Member click link → /invite/[token] → login Google
→ acceptInvite(token) → add to family_members → redirect dashboard

PAGES:
1. /app/(dashboard)/[babyId]/settings/page.tsx
   - Section "Thành viên gia đình":
     <FamilyMembersList>
     • Avatar + tên + role badge (Owner/Thành viên) + nút xóa (owner only)
     • "Bạn" label cho current user
     
   - Section "Mời thành viên":
     <InviteSection>
     • Nút "Tạo link mời" → generate invite token (expires 7 days)
     • Copy link button (với copy animation ✅)
     • QR code từ link (dùng canvas hoặc lib nhẹ)
     • Hiển thị invites đang active: token + expires_at + status

2. /app/invite/[token]/page.tsx (PUBLIC, no auth required)
   - Màn hình đẹp: illustration + info
   - Hiển thị: tên baby, tên owner
   - "Bạn được mời tham gia gia đình bé [name]"
   - Nút "Tham gia" → redirect /login?redirect=/invite/[token]
   - Sau login → auto acceptInvite → redirect dashboard
   - Handle expired: "Link đã hết hạn, vui lòng yêu cầu link mới"
   - Handle used: redirect dashboard nếu đã là member

SERVER ACTIONS (src/lib/actions/family.ts):
- createInviteLink(babyId) → INSERT family_invites + return URL
- acceptInvite(token) → validate + INSERT family_members + UPDATE used_at
- removeMember(memberId, babyId) → verify owner + DELETE
- getMembers(babyId) → SELECT family_members JOIN profiles

REALTIME (stretch):
- Khi member add log → owner nhận toast: "Bố vừa ghi: Bú mẹ 150ml lúc 02:30"
- Dùng Supabase Realtime broadcast channel

=== PART 2: PWA ===

FILES:
- /public/manifest.json
  • name: "Nhật ký bé yêu"
  • short_name: "BabyTracker"
  • theme_color: "#1D9E75"
  • background_color: "#F5F7F5"
  • icons: 192x192 + 512x512
  • display: "standalone"
  • start_url: "/dashboard"

- /public/sw.js — Service worker
  • Cache static assets
  • Offline fallback page
  • Cache-first strategy cho images/fonts
  • Network-first cho API calls

- Cập nhật layout.tsx: thêm <link rel="manifest">

=== PART 3: SEO & POLISH ===

- Cập nhật metadata cho mỗi page:
  • Title: "Bú/Ăn — Nhật ký bé yêu"
  • Description dynamic theo baby name
- OG tags cho invite page
- Lighthouse audit target: Performance ≥ 90, Accessibility ≥ 95
- Error boundary cho mỗi page
- 404 page đẹp
- Loading.tsx cho mỗi route segment

REQUIREMENTS:
- Invite flow hoạt động end-to-end
- QR code render client-side
- PWA installable trên Chrome/Edge
- Offline fallback hiện message thân thiện
- TypeScript strict
```

---

## 3. Tóm tắt thứ tự ưu tiên

| Sprint | Tên | Ưu tiên | Dependencies |
|--------|-----|---------|--------------|
| **1** | Refactor kiến trúc + Auth | 🔴 P0 | — |
| **2** | Database Schema + RLS | 🔴 P0 | Sprint 1 |
| **3** | Dashboard redesign | 🔴 P0 | Sprint 1, 2 |
| **4** | Feed/Sleep/Diaper pages | 🟡 P1 | Sprint 1, 2 |
| **5** | Vaccine Tracker | 🟡 P1 | Sprint 2 |
| **6** | Charts & Analytics | 🟡 P1 | Sprint 4 (data) |
| **7** | Growth + Reminders + Water | 🟢 P2 | Sprint 2 |
| **8** | Family + PWA + Polish | 🟢 P2 | Sprint 1, 2 |

---

## Các Quyết định thiết kế (Đã thống nhất)

> [!IMPORTANT]
> **Q1: Giữ tên bảng hiện tại hay rename theo PRD?**
> - **Quyết định**: **Giữ tên cũ**. Các bảng `feeds`, `pumping_logs`, `diaper_logs`, `sleep_logs`, `growth_logs` và `milk_storage` được giữ nguyên tên cũ để tránh gây lỗi/mất mát dữ liệu hiện có.
> - **Ảnh hưởng**: Các service và query trong code sẽ tiếp tục truy vấn đến các bảng này thay vì đổi sang `feed_logs`/`pump_logs`.

> [!IMPORTANT]
> **Q2: Có muốn cài shadcn/ui không?**
> - **Quyết định**: **Giữ custom Tailwind**, không cài shadcn/ui để giữ tốc độ phát triển và tránh refactor quá lớn các component hiện tại.

> [!IMPORTANT]
> **Q3: Google OAuth - đã setup trong Supabase Dashboard chưa?**
> - **Quyết định**: **Chưa setup**. Chúng tôi vẫn sẽ tích hợp nút đăng nhập Google và handle OAuth callback theo đúng luồng, đồng thời hiển thị hướng dẫn cấu hình chi tiết cho bạn.

> [!WARNING]
> **Q4: Supabase Realtime đã enable chưa?**
> - **Quyết định**: **Đã Enable**. Sẽ chuyển đổi từ cơ chế polling 30s sang cơ chế Realtime subscription để cập nhật dữ liệu tức thì.

> [!NOTE]
> **Q5: Có cần import data từ app mobile (FamilyGreen FG2)?**
> - **Quyết định**: **Không cần**.
