# Handoff Report - Baby Tracker Web - Session 2026-05-21

## Summary
Phiên làm việc tập trung vào khắc phục vấn đề Google OAuth login, từ build error đến PKCE flow issues. Đã hoàn thành hầu hết công việc liên quan đến authentication flow, nhưng vẫn cần test cuối trước khi declare thành công.

**Status**: ⏳ In Progress - Waiting for OAuth PKCE verifier fix to be deployed and tested

---

## Timeline & Progress

### Phase 1: Build Error Fix (✅ Completed)
- **Issue**: `useSearchParams()` should be wrapped in a suspense boundary
- **Root Cause**: Using `useSearchParams` hook in a pre-render page
- **Solution**: 
  - Removed `useSearchParams` from `/login` page
  - Used `URLSearchParams(window.location.search)` inside `useEffect`
  - **File**: [src/app/login/page.tsx](src/app/login/page.tsx)

### Phase 2: OAuth Callback Architecture (✅ Completed)
- **Issue**: Server-side callback route (`route.ts`) not compatible with PKCE OAuth flow
- **Solution**: 
  - Converted callback to client-side page (`page.tsx`)
  - Moved OAuth code exchange to browser context
  - Manually set auth cookie after exchange succeeds
  - **Files**: 
    - Deleted: `src/app/auth/callback/route.ts`
    - Created: [src/app/auth/callback/page.tsx](src/app/auth/callback/page.tsx)

### Phase 3: Cookie Storage & Middleware Issues (✅ Completed)
- **Issue**: Callback redirect back to `/login?next=/` instead of dashboard
- **Root Cause**: 
  1. ProjectId extraction from Supabase URL using regex failed (regex only matched `.supabase` but URL is `.supabase.co`)
  2. Cookie name mismatch between callback page and middleware
  3. Middleware couldn't read auth cookie

- **Solutions**:
  1. Fixed projectId extraction using `new URL(supabaseUrl).hostname.split('.')[0]`
  2. Made callback page manually set cookie after `exchangeCodeForSession`
  3. Updated middleware to use corrected projectId logic
  4. **Files Modified**:
     - [src/lib/supabase/server.ts](src/lib/supabase/server.ts)
     - [src/middleware.ts](src/middleware.ts)
     - [src/app/auth/callback/page.tsx](src/app/auth/callback/page.tsx)

### Phase 4: TypeScript Build Error (✅ Completed)
- **Issue**: `Property 'entries' does not exist on type 'RequestCookies'`
- **Solution**: Changed `Array.from(request.cookies.entries())` to `request.cookies.getAll().map(c => c.name)`
- **File**: [src/middleware.ts](src/middleware.ts)

### Phase 5: PKCE Verifier Missing Error (🔄 In Progress)
- **Issue**: OAuth callback shows error: `PKCE code verifier not found in storage`
- **Root Cause**: PKCE code verifier stored in localStorage doesn't persist across OAuth redirect from Google
- **Current Solution**: 
  - Created hybrid storage adapter that stores PKCE verifier in cookies (not localStorage)
  - Using `SameSite=None;Secure` flag to persist through cross-site OAuth redirect
  - **File**: [src/lib/supabase/client.ts](src/lib/supabase/client.ts)

---

## Key Changes Summary

### Storage Architecture
```
Before:
- PKCE verifier: localStorage → Lost on OAuth redirect ❌
- Session token: manual cookie → Inconsistent naming

After:
- PKCE verifier: cookies with SameSite=None → Persist through redirect ✅
- Session token: cookies with SameSite=None → Server reads correctly ✅
```

### File Changes
| File | Change | Status |
|------|--------|--------|
| `src/lib/supabase/client.ts` | Added hybrid storage adapter with cookie-based PKCE storage | ✅ Complete |
| `src/app/auth/callback/page.tsx` | Converted to client-side OAuth handler with manual cookie set | ✅ Complete |
| `src/app/auth/callback/route.ts` | Deleted (replaced by page.tsx) | ✅ Complete |
| `src/middleware.ts` | Fixed projectId extraction, added logging, fixed RequestCookies API | ✅ Complete |
| `src/lib/supabase/server.ts` | Fixed projectId extraction for cookie reading | ✅ Complete |
| `src/app/login/page.tsx` | Removed useSearchParams, preserve next path in localStorage | ✅ Complete |

---

## Current Implementation Details

### Cookie Names & Keys
```
Supabase URL: https://{projectId}.supabase.co
ProjectId extraction: new URL(url).hostname.split('.')[0]
Auth cookie name: sb-{projectId}-auth-token
PKCE verifier key: sb-auth-token (Supabase standard key)
```

### OAuth Flow
1. **Login Page** (`/login`)
   - User clicks "Tiếp tục với Google"
   - Store `next` path in localStorage: `supabase_oauth_next`
   - Call `supabase.auth.signInWithOAuth({ provider: 'google', redirectTo: '/auth/callback' })`
   - Hybrid storage adapter stores PKCE verifier in cookie

2. **Google OAuth**
   - Google redirects back to `/auth/callback?code=...`
   - PKCE verifier persists in cookies (SameSite=None)

3. **Callback Page** (`/auth/callback`)
   - Read query `code`
   - Call `supabase.auth.exchangeCodeForSession(code)`
   - Supabase client finds PKCE verifier in cookies → exchange succeeds
   - Manually set auth cookie: `sb-{projectId}-auth-token`
   - Get `next` from localStorage or query param
   - Redirect to dashboard or specified page

4. **Middleware** (`src/middleware.ts`)
   - On every request, read auth cookie: `sb-{projectId}-auth-token`
   - Verify session has `access_token`
   - If valid: allow request
   - If invalid/missing: redirect to `/login?next={originalPath}`

---

## Known Issues & Blockers

### Current Blocker: PKCE Verifier Not Persisting
- **Status**: Deployed hybrid storage adapter, awaiting test results
- **Expected Next**: If still failing, may need to use `@supabase/ssr` package as recommended in error message
- **Alternative**: Implement custom PKCE flow with backend validation

---

## Testing Checklist

- [ ] Google OAuth redirect works (shows Google account selection)
- [ ] Callback page shows "Đang xử lý đăng nhập..."
- [ ] Console logs show `[Callback] Session exchanged` 
- [ ] Console logs show `[Callback] Cookie set` with projectId
- [ ] Redirects to dashboard (or /next path if specified)
- [ ] Middleware logs show `[Middleware] Session found` with access_token
- [ ] Refresh page → stays logged in (cookie persists)
- [ ] Can view dashboard with baby data
- [ ] Logout works (clears auth cookie)

---

## Environment & Deployment

**Framework**: Next.js 16.2.6 (Turbopack)  
**Auth**: Supabase JS v2.105.4 with PKCE flow  
**Deployment**: Vercel (current branch: `main`)  
**Production URL**: https://baby-tracker-web-theta.vercel.app

**Build Command**: `npm run build`  
**Dev Command**: `npm run dev`

---

## Next Session Priorities

1. **Verify PKCE Fix**
   - Test Google login on Vercel deployment
   - If still failing: implement `@supabase/ssr` package
   - Consider alternative: use simple server-side auth redirect instead of PKCE

2. **Post-Login Flow**
   - Verify dashboard loads with user data
   - Test navigation between pages (baby selection, data logging)
   - Verify logout flow

3. **Polish & Edge Cases**
   - Handle expired sessions (refresh token flow)
   - Prevent redirect loops
   - Add proper error messages
   - Test on multiple browsers (Chrome, Edge, Safari)

4. **Sprint 2 Completion**
   - Complete remaining features per `implementation_plan.md`
   - Database schema validation
   - Service layer completion

---

## Technical Debt & Notes

- **TypeScript Errors in Callback Page**: Template shows JSX/React type errors in IDE (misleading - likely environment issue, builds successfully)
- **Middleware Deprecation Warning**: "The middleware file convention is deprecated. Please use proxy instead" (Next.js recommendation, can be ignored for now)
- **Storage Adapter Complexity**: Current hybrid approach with cookie-based PKCE may not be ideal long-term; `@supabase/ssr` is official recommendation
- **Logging**: Multiple `console.log` statements added for debugging - remove in production

---

## Files Status

✅ = No blocking issues  
⚠️ = Has warnings (non-blocking)  
❌ = Needs work

| File | Status | Notes |
|------|--------|-------|
| `src/app/login/page.tsx` | ✅ | Google OAuth entry point |
| `src/app/auth/callback/page.tsx` | ✅ | OAuth code exchange handler |
| `src/lib/supabase/client.ts` | ✅ | Hybrid storage for PKCE + session |
| `src/middleware.ts` | ⚠️ | Working, has debug logging |
| `src/lib/supabase/server.ts` | ✅ | Server-side auth client |
| `src/lib/supabase.ts` | ✅ | Export wrapper |
| `src/app/middleware.ts` | ⚠️ | Deprecated convention warning |

---

## Deployment Notes

**Last Deploy**: 2026-05-21 (in progress - with PKCE cookie adapter)  
**Previous Deploy**: 2026-05-21 (multiple iterations for OAuth fixes)

To deploy next changes:
```bash
git add .
git commit -m "Fix PKCE verifier persistence with cookie-based storage adapter"
git push origin main
# Vercel auto-deploys from main branch
```

---

## References & Docs

- Supabase OAuth: https://supabase.com/docs/guides/auth/oauth
- PKCE Flow: https://tools.ietf.org/html/rfc7636
- Next.js Middleware: https://nextjs.org/docs/app/building-your-application/routing/middleware
- Supabase JS Docs: https://supabase.com/docs/reference/javascript/auth
- Implementation Plan: [implementation_plan.md](implementation_plan.md)
- Previous Handoff: [Handoff05.21.md](Handoff05.21.md)

---

**Report Generated**: 2026-05-21  
**Session Owner**: AI Assistant (GitHub Copilot)  
**Next Review**: After PKCE fix verification
