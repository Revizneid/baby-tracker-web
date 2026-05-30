# QA Checklist

## Môi trường
- [ ] Chạy `npm install` thành công.
- [ ] Chạy `npm run dev` và truy cập http://localhost:3000.
- [ ] Xác nhận `manifest.json` và `sw.js` được tải.

## Auth & Navigation
- [ ] `/login` hiển thị nút Google và form email/password.
- [ ] Khi chưa đăng nhập, truy cập `/` chuyển hướng về `/login`.
- [ ] Google OAuth callback xử lý đúng trên `/auth/callback`.
- [ ] Sau đăng nhập, ứng dụng chuyển về dashboard chính.

## Dashboard & Family
- [ ] Trang dashboard chính tải thông tin bé và hiển thị summary.
- [ ] Thêm/hiển thị hoạt động (feed/sleep/diaper/pump) và dữ liệu cập nhật.
- [ ] Màn hình settings hiển thị danh sách thành viên gia đình.
- [ ] Link mời được tạo và QR code hiển thị.

## Realtime
- [ ] Khi một user khác thêm bản ghi, thông báo realtime hiện trên dashboard.
- [ ] Không hiện thông báo nếu action là của chính user đang đăng nhập.

## SEO, PWA, Error
- [ ] `app/layout.tsx` chứa `manifest.json` và Open Graph metadata.
- [ ] `404` page hiển thị khi truy cập route không tồn tại.
- [ ] `error.tsx` hiển thị khi có lỗi render.
- [ ] PWA install prompt khả dụng trên Chrome/Edge nếu chạy dưới HTTPS / local.

## E2E Smoke Tests
- [ ] Chạy `npm run test:e2e` và xác nhận các test cơ bản pass.
- [ ] Kiểm tra `playwright.config.ts` có cấu hình đúng `baseURL`.

## Tài liệu
- [ ] `README.md` cập nhật mô tả và scripts hiện tại.
- [ ] `DEPLOYMENT_CHECKLIST.md` có thông tin môi trường và bước deploy.
