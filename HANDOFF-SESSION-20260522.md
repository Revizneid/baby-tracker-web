Lỗi khi thực hiện vercel deploy sprint 4
Vercel báo lỗi:
14:38:05.518 Running build in Washington, D.C., USA (East) – iad1
14:38:05.519 Build machine configuration: 2 cores, 8 GB
14:38:05.840 Cloning github.com/Revizneid/baby-tracker-web (Branch: main, Commit: 8a44fcf)
14:38:06.118 Cloning completed: 278.000ms
14:38:07.363 Restored build cache from previous deployment (CAehu52UR47e4PZxFvHjg92z9K4J)
14:38:07.576 Running "vercel build"
14:38:07.598 Vercel CLI 54.3.0
14:38:07.809 Installing dependencies...
14:38:08.941 
14:38:08.942 up to date in 878ms
14:38:08.943 
14:38:08.943 148 packages are looking for funding
14:38:08.943   run `npm fund` for details
14:38:08.970 Detected Next.js version: 16.2.6
14:38:08.975 Running "npm run build"
14:38:09.074 
14:38:09.075 > baby-tracker-web@0.1.0 build
14:38:09.075 > next build
14:38:09.075 
14:38:09.757   Applying modifyConfig from Vercel
14:38:09.772 ▲ Next.js 16.2.6 (Turbopack)
14:38:09.773 
14:38:09.780 ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
14:38:09.805   Creating an optimized production build ...
14:38:19.252 
14:38:19.253 > Build error occurred
14:38:19.257 Error: Turbopack build failed with 1 errors:
14:38:19.257 ./src/app/(dashboard)/[babyId]/page.tsx:216:12
14:38:19.257 Expected ';', '}' or <eof>
14:38:19.257   214 |       </div>
14:38:19.258   215 |
14:38:19.258 > 216 |       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
14:38:19.258       |            ^^^^^^^^^
14:38:19.258   217 |         {/* Left Column: Quick Actions */}
14:38:19.258   218 |         <div className="lg:col-span-1 space-y-6">
14:38:19.259   219 |           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space...
14:38:19.259 
14:38:19.259 Parsing ecmascript source code failed
14:38:19.259 
14:38:19.259 
14:38:19.260     at <unknown> (./src/app/(dashboard)/[babyId]/page.tsx:216:12)
14:38:19.319 Error: Command "npm run build" exited with 1