**👶 Nhật ký bé yêu**

Baby Tracker — Ứng dụng theo dõi chăm sóc trẻ 0–18 tháng

Mô tả sản phẩm · PRD · Kế hoạch Web App · Prompts phát triển

Phiên bản 1.1 | Tháng 5/2026 | lanadev

# PHẦN 1: MÔ TẢ ỨNG DỤNG

## 1.1 Tổng quan sản phẩm

Nhật ký bé yêu (BabyTrackerExpo) là ứng dụng di động native (React Native / Expo SDK 51) dành cho bố mẹ có con nhỏ từ 0 đến 18 tháng tuổi tại Việt Nam. Ứng dụng giúp ghi chép và phân tích toàn diện hoạt động chăm sóc bé hàng ngày — từ cữ bú, giấc ngủ, thay tã, hút sữa, theo dõi sức khỏe, lịch tiêm chủng (TCMR + dịch vụ), nhắc nhở vitamin, cho đến theo dõi lượng nước uống của mẹ để duy trì sữa cho con.

**Tên sản phẩm**

Nhật ký bé yêu — Baby Tracker

**Package ID**

com.babytracker.vn

**Platform**

Android (EAS Cloud Build, Expo SDK 51)

**Version**

1.1.0 (versionCode: 2)

**Developer**

lanadev — Vo Thanh Nam

**Language**

TypeScript / React Native 0.74.5

**Storage**

AsyncStorage (100% offline-first)

**Target users**

Bố mẹ có con 0–18 tháng tại Việt Nam

**EAS Project ID**

ceeafe52-8a1d-4a94-9022-51fc6435976d

## 1.2 Vấn đề được giải quyết

Những tuần đầu sau khi sinh, bố mẹ phải theo dõi hàng chục sự kiện mỗi ngày trong trạng thái thiếu ngủ trầm trọng. Chưa có ứng dụng baby tracker tốt bằng tiếng Việt, phù hợp với lịch tiêm chủng TCMR Việt Nam, và đảm bảo dữ liệu sức khỏe trẻ em không bị gửi lên server bên thứ ba.

• Không nhớ bé vừa bú bao lâu, bú bên nào, thay tã lần cuối khi nào

• Bố và mẹ dùng 2 điện thoại riêng — không chia sẻ được dữ liệu theo thời gian thực

• Lịch tiêm chủng TCMR Việt Nam (2024) không có trong các app nước ngoài

• Dữ liệu sức khỏe trẻ em quá nhạy cảm để giao cho server bên thứ ba

• Không có tool theo dõi lượng nước uống cho mẹ đang cho con bú

## 1.3 Người dùng mục tiêu

Persona 1 — Mẹ mới sinh (22–35 tuổi, Android tầm trung):

• Nhu cầu: Ghi chép cữ bú, nhắc vitamin D3+K2, theo dõi kho sữa vắt, nhắc uống đủ nước

• Pain point: Quên mất đã bú bao lâu, bú bên nào, không nhớ thay tã lần cuối lúc nào

Persona 2 — Bố hỗ trợ (25–38 tuổi, bất kỳ thiết bị):

• Nhu cầu: Xem lịch sử để tiếp tục chăm bé khi mẹ ngủ, đồng bộ không qua server

• Pain point: Không biết bé vừa bú xong chưa, không biết hôm nay đã tiêm vaccine gì

## 1.4 Tính năng chi tiết

### Module 1 — Tổng quan (Dashboard)

• Thống kê hôm nay: số cữ bú, giờ ngủ, số lần thay tã với progress bars

• Calendar strip 7 ngày — nhấn để xem lịch sử

• Timeline 6 sự kiện gần nhất (feed + sleep + diaper)

• Tip chăm sóc bé thay đổi theo ngày

### Module 2 — Ghi chép (Feed / Sleep / Diaper)

• Bú/Ăn: Loại bú (mẹ trái/phải/hai bên, sữa CT, sữa vắt), ml, giờ

• Giấc ngủ: Bấm giờ real-time hoặc nhập thủ công, ngủ đêm/ngủ ngày

• Thay tã: Loại tã, màu sắc, ghi chú; cảnh báo màu bất thường

• TimePicker scroll (Giờ:Phút) và DatePicker scroll (Ngày/Tháng/Năm)

### Module 3 — Hút sữa & Kho sữa

• Bấm giờ 2 bên độc lập (trái/phải) với chronometer real-time

• Kho sữa: trạng thái hết hạn (tủ lạnh 4 ngày / tủ đông 6 tháng), cảnh báo màu

### Module 4 — Sức khỏe & Tăng trưởng

• Nhập cân nặng, chiều cao, chu vi đầu, tuổi tuần

• Bảng lịch sử đo lường, so sánh với chuẩn WHO

### Module 5 — Tiêm chủng (27 mũi, 0–18 tháng)

• TCMR bắt buộc + dịch vụ: BCG, 6 trong 1, Phế cầu, Rota, VMN, Cúm, MMR, Thủy đậu, VNNB

• Tính ngày dự kiến từ ngày sinh, trạng thái 4 màu (đã tiêm/quá hạn/sắp đến/sắp tới)

• DatePicker chọn ngày thực tế, lưu tên thương mại vắc xin

### Module 6 — Nhắc nhở Vitamin & Thuốc

• Preset nhanh: Vitamin D3+K2; hỗ trợ bất kỳ loại vitamin/thuốc

• Theo dõi liều uống theo ngày: Đã cho uống / Bỏ qua / Liều thêm

• Đếm ngày dùng liên tục, push notification theo giờ cài đặt

### Module 7 — Biểu đồ (5 loại)

• Bar chart 6 ngày: Hút sữa (ml) / Bú-Ăn (tổng ml/ngày) / Ngủ (giờ) / Tã (lần)

• Nhấn cột → Detail card: Số lần + Tổng + Trung bình

• Timeline chi tiết từng lần trong ngày được chọn

• Bảng tăng trưởng 12 lần đo gần nhất

### Module 8 — Gia đình (FamilyGreen Sync)

• Mã FG2:base64 chứa toàn bộ dữ liệu — không cần server, không cần internet

• Merge thông minh: union theo ID, không xóa dữ liệu bên nào

• Đồng bộ 9 loại dữ liệu: bú, ngủ, tã, hút sữa, kho sữa, vaccine, nhắc nhở, tăng trưởng, thông tin bé

### Module 9 — Uống nước cho Mẹ

• Vòng tròn tiến độ đổi màu theo % (đỏ → cam → xanh)

• 6 nút thêm nhanh: 150/200/250/300/350/500 ml

• Nhắc nhở định kỳ 30p–2h với khung giờ tùy chỉnh

## 1.5 Stack công nghệ

**Framework**

React Native (Expo SDK 51, Managed Workflow)

**Language**

TypeScript ~5.3.3

**Navigation**

@react-navigation/native 6 + Drawer + Bottom Tabs

**Storage**

@react-native-async-storage/async-storage 1.23.1

**Notifications**

expo-notifications 0.28.19

**Build**

EAS Cloud Build — profile: preview (APK Android)

**Gesture/Anim**

react-native-gesture-handler + react-native-reanimated

**Icons**

@expo/vector-icons (Ionicons)

**Sharing**

expo-sharing + expo-clipboard

# PHẦN 2: PRODUCT REQUIREMENTS DOCUMENT

## 2.1 Mục tiêu sản phẩm

Mục tiêu cốt lõi: Trở thành người bạn đồng hành đáng tin cậy của bố mẹ Việt

trong 1000 ngày đầu đời của bé — cung cấp dữ liệu chính xác, nhắc nhở kịp thời,

trải nghiệm không ma sát, và tuyệt đối bảo mật thông tin trẻ em.

• OKR 1: Đạt 1,000 lượt cài đặt trong 3 tháng đầu sau ra mắt

• OKR 2: Retention D30 > 40% (benchmark health apps: 20%)

• OKR 3: NPS > 50 — người dùng chủ động giới thiệu cho bạn bè

• OKR 4: Zero data loss — không một bản ghi nào bị mất do lỗi app

## 2.2 Yêu cầu chức năng (FR)

### FR-001: Quản lý hồ sơ bé

• FR-001.1: Setup wizard khi mở lần đầu — nhập tên, ngày sinh, giới tính

• FR-001.2: Tính tuổi tự động (tuần, tháng) từ ngày sinh

• FR-001.3: Multi-baby support (roadmap v2)

### FR-002: Ghi chép real-time

• FR-002.1: Tất cả log phải có timestamp chính xác đến phút

• FR-002.2: TimePicker/DatePicker native thay vì text input thủ công

• FR-002.3: Quick-add trong tối đa 2 chạm (mở form → chọn loại → lưu)

• FR-002.4: Xóa log bằng long-press (với confirm dialog)

### FR-003: Biểu đồ & Thống kê

• FR-003.1: Bar chart 6 ngày gần nhất, hiển thị tổng ml/giờ/lần theo ngày

• FR-003.2: Nhấn cột → detail card với số lần, tổng, trung bình

• FR-003.3: Timeline chi tiết từng sự kiện trong ngày

### FR-004: Tiêm chủng

• FR-004.1: 27 mũi vaccine 0–18 tháng theo TCMR 2024 + dịch vụ

• FR-004.2: Tính ngày dự kiến, hiển thị 4 trạng thái màu

• FR-004.3: Ghi nhận ngày tiêm thực tế với DatePicker + tên thương mại

• FR-004.4: Push notification trước 3 ngày và đúng ngày tiêm

### FR-005: Đồng bộ gia đình

• FR-005.1: Xuất mã FG2:base64 chứa toàn bộ dữ liệu

• FR-005.2: Import merge không phá hủy — union theo ID, không xóa

• FR-005.3: Hoạt động 100% offline, không phụ thuộc server

## 2.3 Yêu cầu phi chức năng (NFR)

**Performance**

Cold start < 2s trên thiết bị tầm trung (RAM 3GB)

**Offline**

100% tính năng hoạt động không cần internet

**Storage**

Dữ liệu 1 năm sử dụng < 5MB AsyncStorage

**Privacy**

Zero telemetry, không tracking, không gửi dữ liệu ra ngoài

**Crash rate**

< 0.1% sessions bị crash

**Accessibility**

Font ≥ 11pt, contrast ratio ≥ 4.5:1 (WCAG AA)

**Compatibility**

Android 8.0+ (API 26+), màn hình 5"–6.7"

## 2.4 Roadmap sản phẩm

### v1.1 — MVP hoàn chỉnh (Hiện tại)

• 9 modules: Dashboard, Ghi chép, Hút sữa, Sức khỏe, Vaccine, Nhắc nhở, Biểu đồ, Gia đình, Uống nước

• 27 mũi vaccine TCMR 2024 + dịch vụ

• FamilyGreen Sync offline, Drawer + Bottom Tab 5 mục

### v1.2 — Web App (Q3 2026)

• Next.js 14 + Supabase + Vercel

• Đăng nhập Google OAuth, sync realtime web ↔ mobile

• Dashboard analytics nâng cao, multi-baby support

### v2.0 — Platform (Q4 2026)

• iOS app (React Native codebase tái sử dụng ~80%)

• AI insights: phát hiện pattern bất thường trong giấc ngủ/bú

• Chia sẻ với bác sĩ/bà nội qua link read-only có passcode

# PHẦN 3: KẾ HOẠCH WEB APP

## 3.1 Kiến trúc tổng thể

Tech Stack: Next.js 14 (App Router) + Supabase (Auth+DB+Realtime) + Vercel (Deploy) + Tailwind CSS + shadcn/ui + Recharts

**Frontend**

Next.js 14 — App Router, Server Components, TypeScript

**UI / Styling**

Tailwind CSS + shadcn/ui (accessible, themeable)

**Auth**

Supabase Auth — Google OAuth 2.0, email magic link

**Database**

Supabase PostgreSQL — Row Level Security

**Realtime**

Supabase Realtime — sync live giữa web và mobile

**File Storage**

Supabase Storage — avatar bé, ảnh tiêm chủng

**Deploy**

Vercel — zero-config Next.js, preview URLs per PR

**State (client)**

Zustand (UI state) + TanStack Query (server state)

**Charts**

Recharts — responsive bar/line chart

**Forms**

React Hook Form + Zod validation

## 3.2 Database Schema (PostgreSQL)

Nguyên tắc: Row Level Security trên mọi bảng. User chỉ đọc/ghi dữ liệu của baby mình sở hữu hoặc được invite làm family\_member.

\-- 1. User profiles

profiles (id uuid PK → auth.users, full\_name, avatar\_url, created\_at)

\-- 2. Baby management

babies (id, user\_id FK, name, birth\_date DATE, gender, avatar\_url)

family\_members (id, baby\_id FK, user\_id FK, role: owner|member)

family\_invites (id, baby\_id FK, token UUID, expires\_at, used\_at)

\-- 3. Daily tracking

feed\_logs (id, baby\_id, user\_id, type ENUM, amount\_ml, time TIMESTAMPTZ, note)

sleep\_logs (id, baby\_id, user\_id, start\_time, end\_time, type, duration\_minutes)

diaper\_logs (id, baby\_id, user\_id, type ENUM, color, note, time TIMESTAMPTZ)

growth\_logs (id, baby\_id, user\_id, date DATE, weight\_kg, height\_cm, head\_cm, age\_weeks)

pump\_logs (id, baby\_id, user\_id, left\_ml, right\_ml, total\_ml, duration\_min, start\_time)

milk\_storage (id, baby\_id, user\_id, amount\_ml, stored\_at ENUM, expires\_at DATE, used BOOL)

\-- 4. Health records

vaccine\_records (id, baby\_id, user\_id, vaccine\_id VARCHAR, vacc\_date DATE, brand)

reminders (id, user\_id, baby\_id, title, type, doses\_per\_day, deadline\_time, enabled)

\-- 5. Mom wellness

water\_logs (id, user\_id, amount\_ml, logged\_at TIMESTAMPTZ)

## 3.3 Cấu trúc thư mục Next.js

baby-tracker-web/

├── app/

│ ├── (auth)/

│ │ └── login/page.tsx # Google OAuth sign-in

│ ├── auth/callback/route.ts # Supabase OAuth callback

│ ├── invite/\[token\]/page.tsx # Family invite handler

│ └── (dashboard)/ # Protected routes

│ ├── layout.tsx # Sidebar + header

│ ├── page.tsx # Baby selector / onboarding

│ └── \[babyId\]/

│ ├── page.tsx # Dashboard

│ ├── feed/page.tsx # Bú / Ăn

│ ├── sleep/page.tsx # Giấc ngủ

│ ├── diaper/page.tsx # Thay tã

│ ├── pump/page.tsx # Hút sữa

│ ├── growth/page.tsx # Tăng trưởng

│ ├── vaccine/page.tsx # Tiêm chủng

│ ├── reminders/page.tsx # Nhắc nhở

│ ├── charts/page.tsx # Biểu đồ

│ └── settings/page.tsx # Cài đặt + chia sẻ

├── components/

│ ├── ui/ # shadcn/ui components

│ ├── charts/ # Recharts wrappers

│ ├── forms/ # Form components

│ └── layout/ # Sidebar, header, bottom-nav

├── lib/

│ ├── supabase/client.ts # Browser client

│ ├── supabase/server.ts # Server client (cookies)

│ └── actions/ # Server actions

├── hooks/ # Custom React hooks

├── types/database.ts # Generated Supabase types

└── middleware.ts # Auth protection

## 3.4 Sprint Plan (8 tuần)

### Sprint 1 — Foundation (Tuần 1–2)

1\. create-next-app + Tailwind + shadcn/ui setup

2\. Supabase project, Google OAuth, middleware bảo vệ routes

3\. SQL migrations: 12 bảng + RLS policies + triggers

4\. Deploy Vercel, configure env variables, test CI/CD

5\. Baby profile: tạo/chỉnh sửa, upload avatar

### Sprint 2 — Core Tracking (Tuần 3–4)

1\. Dashboard: metric cards, activity timeline, today summary

2\. Feed/Sleep/Diaper: form nhập, list log, delete/edit

3\. Quick-add bottom sheet (2-tap UX)

4\. Realtime sync Supabase Realtime subscriptions

5\. Mobile responsive layout (320px–1440px)

### Sprint 3 — Health & Vaccine (Tuần 5–6)

1\. Growth: form đo lường + biểu đồ so chuẩn WHO

2\. Vaccine: 27 mũi, status tracking, DatePicker, upsert records

3\. Pump + milk storage: timer UI, expiry tracking

4\. Reminders: CRUD + Web Push API notifications

5\. Water tracker cho mẹ

### Sprint 4 — Analytics & Launch (Tuần 7–8)

1\. Charts: 5 loại biểu đồ Recharts, 6-day view, interactive tooltips

2\. Family sharing: invite by email, role management

3\. Import từ app mobile (parse FamilyGreen FG2 code)

4\. PWA: manifest.json, service worker, offline fallback

5\. SEO, OG tags, performance audit (Lighthouse ≥ 90)

6\. Security review RLS, pen test cơ bản

7\. Soft launch 🚀

# PHẦN 4: PROMPTS PHÁT TRIỂN CHI TIẾT

Các prompt dưới đây được viết để dùng với Claude AI hoặc Cursor. Copy nguyên văn — đủ context để AI generate code production-ready không cần hỏi thêm.

**PROMPT 1: Project Setup & Google Auth**

Bạn là senior Next.js developer. Build "Nhật ký bé yêu" webapp.

TECH STACK: Next.js 14 App Router + TypeScript + Tailwind + shadcn/ui

Supabase Auth (Google OAuth) + PostgreSQL + Vercel deploy

TASK: Setup hoàn chỉnh:

1\. npx create-next-app với TypeScript, Tailwind, App Router

2\. Cài @supabase/ssr, configure cho Next.js App Router

3\. Hướng dẫn bật Google OAuth trong Supabase Dashboard + Google Cloud Console

4\. /app/auth/callback/route.ts — OAuth callback handler

5\. middleware.ts — protect /dashboard/\* routes, redirect unauthenticated to /login

6\. /app/(auth)/login/page.tsx — "Đăng nhập với Google" button, vi-VN text

7\. /app/(dashboard)/layout.tsx — sidebar navigation với 9 menu items

8\. /lib/supabase/client.ts và /lib/supabase/server.ts

REQUIREMENTS:

\- Server Components + Server Actions theo chuẩn Next.js 14

\- Session lưu trong HTTP-only cookies (không localStorage)

\- Redirect to /dashboard sau login thành công

\- Loading states + error handling đầy đủ

\- TypeScript strict — không dùng any

\- Màu chủ đạo: #1D9E75 (sage green)

OUTPUT: Toàn bộ code files + SQL tạo bảng profiles + .env.local template

**PROMPT 2: Database Schema & RLS**

CONTEXT: Baby tracker webapp "Nhật ký bé yêu" — Supabase PostgreSQL.

TASK: Tạo complete SQL migration file cho toàn bộ schema.

TABLES (12 bảng):

profiles, babies, family\_members, family\_invites,

feed\_logs, sleep\_logs, diaper\_logs, growth\_logs,

pump\_logs, milk\_storage, vaccine\_records,

reminders, water\_logs

CHI TIẾT TỪNG BẢNG:

feed\_logs: type ENUM(breast-left,breast-right,breast-both,formula,pumped),

amount\_ml INT, time TIMESTAMPTZ, note TEXT

sleep\_logs: start\_time, end\_time TIMESTAMPTZ, type ENUM(night,nap),

duration\_minutes INT (computed hoặc stored)

vaccine\_records: vaccine\_id VARCHAR(50), vacc\_date DATE, brand VARCHAR(100)

water\_logs: amount\_ml INT, logged\_at TIMESTAMPTZ, user\_id (không có baby\_id)

RLS REQUIREMENTS:

\- SELECT: user chỉ xem record của baby mình own hoặc là family\_member

\- INSERT/UPDATE/DELETE: chỉ owner và member với role "member"

\- family\_invites: chỉ owner tạo, ai cũng có thể đọc bằng token

THÊM:

\- Trigger: auto-insert vào profiles khi user signup (auth.users)

\- Trigger: auto-update updated\_at cho tất cả bảng

\- Index: (baby\_id, time DESC) cho feed/sleep/diaper/pump

\- Index: (baby\_id, date DESC) cho growth/vaccine

\- ENUMs đặt trong schema public

OUTPUT:

1\. SQL migration file (001\_initial\_schema.sql)

2\. TypeScript types file (/types/database.ts) tương ứng

3\. Supabase realtime enable commands

**PROMPT 3: Dashboard Page**

CONTEXT: Baby tracker webapp. User đã login + đã chọn baby.

Design: primary #1D9E75, background #F5F7F5, font Inter.

TASK: Build /app/(dashboard)/\[babyId\]/page.tsx

COMPONENTS:

1\. <TodaySummaryBar>

\- 3 metric cards: Số cữ bú | Giờ ngủ | Số lần thay tã

\- Progress bar so với target (bú 8x/ngày, ngủ 14h, tã 6x)

\- "Cữ bú gần nhất: 02:30 — Bú mẹ 150ml"

2\. <QuickAddButtons>

\- 4 nút: 🍼 Bú | 😴 Ngủ | 💧 Tã | 🤱 Hút sữa

\- Click mở Sheet (shadcn Sheet) với form rút gọn

\- Submit → Server Action → toast "Đã lưu"

3\. <RecentActivityFeed>

\- 6 sự kiện gần nhất (mix feed + sleep + diaper)

\- Timeline style, icon màu phân loại

\- "2 phút trước", "1 giờ trước" (relative time vi-VN)

4\. <DailyTip>

\- Card tip chăm sóc bé, rotate theo ngày trong tuần

DATA:

\- TanStack Query để fetch + cache

\- Supabase Realtime subscription → invalidate query khi có update

\- Initial data từ Server Component (SSR)

REQUIREMENTS:

\- Loading skeleton cho mỗi card

\- Empty state có CTA "Thêm lần bú đầu tiên"

\- Responsive: 1 col mobile / 2 col tablet / 3 col desktop

\- Date format: DD/MM/YYYY HH:mm (vi-VN locale)

\- Optimistic updates cho quick-add

**PROMPT 4: Vaccine Tracker**

CONTEXT: Baby tracker webapp. Cần màn hình Tiêm chủng đầy đủ.

TASK: Build /app/(dashboard)/\[babyId\]/vaccine/page.tsx

VACCINE DATA — 27 mũi (dùng data array cứng, không fetch từ DB):

Sơ sinh: BCG, Viêm gan B

2 tháng: 6-trong-1 (Infanrix Hexa/Hexaxim), 5-trong-1 (Pentaxim),

VGB-2, Phế cầu PCV-1, Rotavirus-1, VMN BC-1

3 tháng: 6/5-trong-1 mũi 2, Rotavirus-2, VMN BC-2

4 tháng: 6/5-trong-1 mũi 3, PCV-2, Rotavirus-3

6 tháng: VGB-3, Cúm mùa mũi 1, VMN A+C

9 tháng: MMR-1, Sởi đơn, Viêm não NB-1

12 tháng: PCV-3 nhắc, VNNB-2, Thủy đậu, VGB-4 nhắc

18 tháng: MMR-2, DPT nhắc

STATUS LOGIC (tính từ baby.birth\_date + vaccine.ageWeeks):

done → có record trong vaccine\_records

overdue → plannedDate < today && !done

soon → 0 < daysUntil ≤ 7 && !done

upcoming→ daysUntil > 7

COMPONENTS:

<VaccineProgress> — "Đã tiêm 5/27 mũi" với progress bar

<VaccineFilterTabs> — Tất cả / Chưa tiêm / Đã tiêm

<VaccineGroupSection ageLabel plannedDate>

<VaccineCard vaccine record>

\- Status badge 4 màu (green/red/yellow/gray)

\- Ngày dự kiến DD/MM/YYYY

\- Click → <VaccineSheet>

<VaccineSheet>

\- Thông tin vaccine (tên, phòng bệnh, tên thương mại gợi ý)

\- shadcn Calendar picker cho ngày tiêm thực tế

\- Input text cho tên thương mại

\- Server Action: upsert vaccine\_records

\- Nếu đã tiêm: hiện nút "Bỏ đánh dấu"

REQUIREMENTS:

\- Không crash khi vaccine không có brands (optional field)

\- Optimistic update: tick ngay, rollback nếu lỗi

**PROMPT 5: Charts & Analytics**

CONTEXT: Baby tracker webapp. Cần 5 loại biểu đồ với Recharts.

TASK: Build /app/(dashboard)/\[babyId\]/charts/page.tsx

CHART TABS (5 tabs, pill selector):

1\. Hút sữa — Bar chart, Y: ml, 6 ngày gần nhất

2\. Bú/Ăn — Bar chart, Y: tổng ml bú/ngày, 6 ngày

3\. Ngủ — Bar chart, Y: tổng giờ ngủ/ngày, 6 ngày

4\. Tã — Bar chart, Y: số lần/ngày, 6 ngày

5\. Tăng trưởng — Line chart, X: tuần tuổi, Y: cân nặng + chiều cao

COMPONENT: <BabyBarChart data color unit onBarClick>

\- Recharts ResponsiveContainer + BarChart

\- Label on top mỗi cột (giá trị)

\- Custom Tooltip: ngày DD/MM + giá trị + unit

\- Màu cột selected khác màu cột thường

\- Animation khi tab switch

COMPONENT: <DayDetailCard date data color>

\- Hiện khi click cột bar

\- 3 stats: Số lần | Tổng | Trung bình

\- Timeline list từng event trong ngày đó

DATA PROCESSING (client-side):

\- Group logs by date

\- Feed: sum(amount\_ml) — parse "150ml" → 150 nếu string

\- Sleep: sum(duration\_minutes) / 60, round 1 decimal

\- Pump: sum(total\_ml)

\- Diaper: count(\*)

REQUIREMENTS:

\- Fetch tất cả data 1 lần, client-side aggregate

\- Recharts mobile-friendly (containerWidth="100%")

\- Empty state đẹp với illustration

\- Loading skeleton có animation

**PROMPT 6: Family Sharing System**

CONTEXT: Baby tracker webapp. Build tính năng chia sẻ gia đình.

TASK: Family invite + member management.

FLOW:

Owner → tạo invite link (/invite/\[uuid-token\])

Gửi qua Zalo/Messenger → Member click → login Google

→ acceptInvite(token) → add to family\_members → redirect dashboard

SERVER ACTIONS (/lib/actions/family.ts):

createInviteLink(babyId)

\- INSERT family\_invites (token=uuid, expires\_at=+7days)

\- Return https://app.com/invite/\[token\]

acceptInvite(token)

\- Validate: token exists, not expired, not used

\- INSERT family\_members (role="member")

\- UPDATE family\_invites.used\_at = now()

\- Redirect to /\[babyId\]/dashboard

removeMember(memberId, babyId)

\- Verify caller is owner

\- DELETE family\_members

PAGES:

/app/(dashboard)/\[babyId\]/settings/page.tsx

<FamilyMembersList> — avatar + tên + role badge + nút xóa (owner only)

<InviteSection> — nút tạo link + copy + QR code

/app/invite/\[token\]/page.tsx (public, no auth required)

Hiện: tên baby, tên owner, "Bạn được mời tham gia gia đình bé \[name\]"

Nút: "Tham gia" → redirect login → callback → acceptInvite

Handle: expired (hiện thông báo), used (redirect dashboard nếu đã là member)

REALTIME:

\- Khi member add log, owner nhận toast notification

\- "Bố vừa ghi: Bú mẹ 150ml lúc 02:30"

\- Dùng Supabase Realtime broadcast

OUTPUT: Server actions + pages + RLS updates + realtime handler

**Nhật ký bé yêu · Made with ❤️ for Vietnamese parents**

lanadev · v1.1 · Tháng 5/2026 · com.babytracker.vn