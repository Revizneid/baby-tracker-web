# Walkthrough — Khắc phục lỗi PostgreSQL/Supabase & Tối ưu hóa Build Next.js 16

Tôi đã hoàn tất việc rà soát, sửa lỗi và tối ưu hóa hệ thống để giải quyết triệt để hai lỗi Postgres/Supabase bạn gặp phải, đồng thời sửa lỗi biên dịch (build error) trên Next.js 16.

---

## 🛠️ Các thay đổi đã thực hiện

### 1. Sửa lỗi đệ quy vô hạn trong RLS (PostgreSQL Timeout - Warp Server Error)
- **Vấn đề:** Các chính sách RLS (Row Level Security) cũ trên các bảng (`babies`, `family_members`, `feeds`, v.v.) gọi trực tiếp chéo nhau để xác thực quyền truy cập của người dùng. Điều này tạo ra một vòng lặp đệ quy vô hạn (Circular dependency), khiến Postgres bị treo và Supabase trả về lỗi: `Warp server error: Thread killed by timeout manager`.
- **Giải pháp:** 
  - Tạo tệp di chuyển mới **[003_fix_rls_recursion.sql](file:///c:/Users/namvt.PROPERWELL/Documents/GitHub/baby-tracker-web/supabase/migrations/003_fix_rls_recursion.sql)**.
  - Định nghĩa một hàm helper bảo mật **`public.check_is_baby_member(p_baby_id UUID, p_user_id UUID)`** với tùy chọn `SECURITY DEFINER`. Tùy chọn này cho phép hàm chạy với quyền của chủ sở hữu database (bỏ qua kiểm tra RLS bên trong hàm), giúp phá vỡ vòng lặp đệ quy hoàn toàn.
  - Hủy bỏ các chính sách RLS cũ gây nghẽn và thiết lập lại các chính sách mới tối ưu gọi hàm helper này.

### 2. Sửa lỗi cú pháp SQL Editor (Syntax Error tại 'Manage diaper_logs for shared baby')
- **Vấn đề:** Trong tệp **[002_optimize_rls_performance.sql](file:///c:/Users/namvt.PROPERWELL/Documents/GitHub/baby-tracker-web/supabase/migrations/002_optimize_rls_performance.sql)**, đoạn mã SQL động sử dụng hàm `format()` với cờ `%L` (String Literal) để tạo câu lệnh `DROP POLICY`. Điều này tạo ra câu lệnh lỗi cú pháp có dấu nháy đơn bao quanh tên policy: `DROP POLICY IF EXISTS 'Manage diaper_logs...' ON public.diaper_logs;`. Trong PostgreSQL, tên policy bắt buộc phải là một Identifier (định danh).
- **Giải pháp:** Đã thay đổi `%L` thành `%I` (SQL Identifier) tại dòng 24. Lúc này, PostgreSQL sẽ định dạng chính xác tên chính sách dưới dạng chuỗi có dấu nháy kép `"` (ví dụ: `DROP POLICY IF EXISTS "Manage diaper_logs..."`), giải quyết triệt để lỗi biên dịch trong SQL Editor.

### 3. Tối ưu hóa Next.js 16 và Sửa lỗi Build thành công 100%
- **Cấu hình Proxy cho Next.js 16:** Theo quy chuẩn mới của Next.js 16 (thay thế cho `middleware.ts` cũ), tôi đã chuyển mã nguồn sang **[src/proxy.ts](file:///c:/Users/namvt.PROPERWELL/Documents/GitHub/baby-tracker-web/src/proxy.ts)**.
- **Tránh lỗi thiếu Supabase URL/Key khi Build:** Thêm giá trị placeholder dự phòng (`https://placeholder-project.supabase.co` và `placeholder-anon-key-to-prevent-build-crashes`) trong `src/proxy.ts` để trình biên dịch tĩnh (static compiler) của Next.js không bị crash khi build dự án ở môi trường không có sẵn file `.env.local`.
- **Sửa lỗi kiểu dữ liệu TypeScript:** Sửa lỗi thiếu thuộc tính `time` khi map dữ liệu giấc ngủ tại tệp **[sleep/page.tsx](file:///c:/Users/namvt.PROPERWELL/Documents/GitHub/baby-tracker-web/src/app/(dashboard)/[babyId]/sleep/page.tsx)**.

---

## 🧪 Kết quả xác minh (Verification Results)

1. **Biên dịch & Build Production thành công:**
   Đã chạy lệnh kiểm tra build cục bộ:
   ```bash
   npm run build
   ```
   **Kết quả:** Quá trình biên dịch TypeScript và tối ưu hóa trang tĩnh (static pages generator) đã hoàn thành xuất sắc **100% thành công không có lỗi**:
   - Biên dịch hoàn tất thành công trong 12.9 giây.
   - Kiểm tra kiểu dữ liệu TypeScript thành công trong 6.1 giây.
   - Tạo các trang tĩnh và dynamic hoàn tất (6/6 trang) mượt mà.

2. **Cách áp dụng SQL Fixes vào cơ sở dữ liệu Supabase của bạn:**
   Bạn hãy sao chép toàn bộ mã nguồn của hai file migration để chạy trong **SQL Editor** trên Supabase Dashboard theo thứ tự:
   - Bước 1: Chạy file [002_optimize_rls_performance.sql](file:///c:/Users/namvt.PROPERWELL/Documents/GitHub/baby-tracker-web/supabase/migrations/002_optimize_rls_performance.sql) (đã sửa lỗi cú pháp).
   - Bước 2: Chạy tiếp file [003_fix_rls_recursion.sql](file:///c:/Users/namvt.PROPERWELL/Documents/GitHub/baby-tracker-web/supabase/migrations/003_fix_rls_recursion.sql) (để vá lỗi đệ quy đơ luồng/timeout).
