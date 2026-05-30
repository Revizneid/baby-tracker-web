# Deployment Checklist

## Trước khi deploy
- [ ] Xác nhận `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY` đã cấu hình.
- [ ] Xác nhận `SUPABASE_SERVICE_ROLE_KEY` nếu cần chạy các script server-side.
- [ ] Kiểm tra các biến env cần thiết cho production.

## Supabase
- [ ] RLS policies đã bật và kiểm tra đúng cho `profiles`, `babies`, `family_members`, `family_invites`, `feeds`, `sleep_logs`, `diaper_logs`, `growth_logs`, `pumping_logs`, `milk_storage`, `vaccine_records`, `reminders`, `water_logs`.
- [ ] Kiểm tra `family_invites` hoạt động đúng với token và `used_at`.

## Build & Run
- [ ] Chạy `npm run build` thành công.
- [ ] Kiểm tra `npm run lint` không có lỗi nghiêm trọng.
- [ ] Chạy `npm run start` và xác nhận app khởi động.

## PWA
- [ ] `manifest.json` xuất hiện trong HEAD.
- [ ] `sw.js` được đăng ký thành công.
- [ ] Ứng dụng có thể cài đặt khi truy cập trên Chrome/Edge.

## Logging & Monitoring
- [ ] Xem console và server log để đảm bảo không lỗi request API.
- [ ] Kiểm tra kết nối Supabase auth và realtime.

## Sau deploy
- [ ] Mở thử các page chính: dashboard, invite, settings, charts.
- [ ] Kiểm tra 404 page với route giả.
- [ ] Kiểm tra login/logout flow.
- [ ] Kiểm tra build meta tags với Lighthouse simple audit.
