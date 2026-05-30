# BabyTracker Web

BabyTracker Web là ứng dụng quản lý hành trình của bé yêu với:
- Nhật ký bú/ăn, giấc ngủ, thay tã, hút sữa
- Tiêm chủng, tăng trưởng, nhắc nhở
- Chia sẻ với gia đình và support PWA install

## Bắt đầu

1. Cài dependencies:

```bash
npm install
```

2. Chạy development:

```bash
npm run dev
```

3. Mở ứng dụng:

```bash
http://localhost:3000
```

## Scripts

- `npm run dev` — chạy dev server
- `npm run build` — build production
- `npm run start` — chạy app sau khi build
- `npm run lint` — kiểm tra lint
- `npm run test:e2e` — chạy Playwright E2E tests
- `npm run test:qa` — chạy chỉ dẫn QA manual

## Tính năng chính

- Multi-page dashboard cho từng bé
- Family invite link + QR
- Realtime activity notification
- PWA manifest + service worker
- Error boundary + custom 404
- Metadata/SEO + Open Graph

## QA và triển khai

- Xem `QA_CHECKLIST.md` để kiểm tra chức năng chính.
- Xem `DEPLOYMENT_CHECKLIST.md` để chuẩn bị release trên Vercel hoặc nền tảng tương tự.

## Ghi chú

- `auth/callback` xử lý OAuth Google
- `src/app/(dashboard)/layout.tsx` chứa layout dashboard chung
- `src/app/(dashboard)/[babyId]/layout.tsx` chứa metadata cho trang bé
