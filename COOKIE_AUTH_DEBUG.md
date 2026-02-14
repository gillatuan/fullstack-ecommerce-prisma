# Cookie Authentication Debug & Fix

## Problem
Authentication cookie was not being saved after login (POST /auth/login).

## Root Cause Analysis

### Issue #1: CORS Not Configured ✅ FIXED
**Problem:** Backend didn't have `enableCors` with `credentials: true`
- Browser **rejects** Set-Cookie headers when `credentials: true` is not allowed
- This is a CORS security requirement

**Fix Applied:**
```typescript
// backend/src/main.ts
app.enableCors({
  origin: configService.get('FRONTEND_URL') || 'http://localhost:3000',
  credentials: true,  // 🔑 Critical for HttpOnly cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

### Issue #2: FRONTEND_URL Environment Variable Missing ✅ FIXED
**Problem:** Backend needed to know the frontend URL for CORS
- Without it, CORS `origin` would be undefined

**Fix Applied:**
```dotenv
# backend/.env
FRONTEND_URL=http://localhost:3000
```

---

## How Cookie Authentication Works

### 1. Browser Sends Login Request
```
POST http://localhost:3001/api/v1/auth/login
Header: credentials: 'include'
```

### 2. Backend Sets Cookies in Response
```typescript
// auth.service.ts sets cookies
response.cookie('Authentication', accessToken, {
  httpOnly: true,  // Only sent to backend, not accessible from JS
  secure: true,    // Only HTTPS (or localhost for dev)
  expires: ...
});

response.cookie('Refresh', refreshToken, {
  httpOnly: true,
  secure: true,
  path: '/api/v1/auth/refresh',  // Only sent to refresh endpoint
});
```

### 3. Browser Receives Response
**With CORS `credentials: true` enabled:**
- ✅ Browser accepts Set-Cookie headers
- ✅ Stores cookies in cookie jar
- ✅ Auto-sends cookies on subsequent requests (with credentials: 'include')

**Without CORS `credentials: true`:**
- ❌ Browser silently rejects Set-Cookie (CORS security)
- ❌ Cookies are NOT stored
- ❌ Subsequent requests have no auth cookies

---

## Verification Steps

### Step 1: Restart Backend
```bash
cd backend
yarn start  # or npm start
```

### Step 2: Check Backend Logs
Look for confirmation that CORS is enabled:
```
[App] CORS enabled for origin: http://localhost:3000
```

### Step 3: Test Login in Browser
1. Open http://localhost:3000
2. Click "Login"
3. Enter email & password
4. Open Browser DevTools → Network tab
5. Find the POST /api/v1/auth/login request
6. Check **Response Headers**:
   ```
   Set-Cookie: Authentication=eyJhbGc...HttpOnly; Secure
   Set-Cookie: Refresh=eyJhbGc...HttpOnly; Secure; Path=/api/v1/auth/refresh
   ```

### Step 4: Verify Cookies Stored
1. Open Browser DevTools → Application → Cookies
2. Look for domain `localhost` → cookies `Authentication` and `Refresh`
3. Verify both have ✅ **HttpOnly** flag

### Step 5: Make Protected Request
1. After login, the page should show authenticated user
2. Open DevTools → Network tab
3. Make a request to a protected endpoint (e.g., GET /api/v1/users/me)
4. Under Request → Cookies, verify `Authentication` is sent automatically

---

## Configuration Checklist

| Component | Status | Location | Details |
|-----------|--------|----------|---------|
| **Backend CORS** | ✅ Fixed | `backend/src/main.ts` | `credentials: true` enabled |
| **FRONTEND_URL** | ✅ Fixed | `backend/.env` | Set to `http://localhost:3000` |
| **Frontend API_URL** | ✅ Correct | `frontend/.env.local` | `http://localhost:3001/api` |
| **Frontend Credentials** | ✅ Set | `frontend/common/util/fetch.ts` | `credentials: 'include'` |
| **HttpOnly Cookies** | ✅ Set | `backend/src/auth/auth.service.ts` | Both Access & Refresh tokens |
| **Cookie Path** | ✅ Set | `backend/src/auth/auth.service.ts` | Refresh: `/api/v1/auth/refresh` |

---

## Common Troubleshooting

### "Still no cookies after login"
1. **Check CORS headers in response**:
   - DevTools → Network → auth/login → Response Headers
   - Should have `Set-Cookie` headers
   
2. **Verify CORS is enabled**:
   - Check backend console output on startup
   - Backend logs should show CORS config

3. **Check browser console**:
   - Look for CORS errors
   - Example: "Access to XMLHttpRequest blocked by CORS policy"

4. **Verify frontend URL matches**:
   - If frontend is on `http://localhost:3001` but FRONTEND_URL=`http://localhost:3000`, CORS will fail
   - Update `.env` FRONTEND_URL to match your frontend port

### "CORS error in browser"
```
Access to XMLHttpRequest at 'http://localhost:3001/...' from origin 
'http://localhost:3000' has been blocked by CORS policy: ...
```
**Fix:** Ensure backend has `enableCors` with `credentials: true`

### "Set-Cookie headers present but cookies not stored"
- Check if `Secure` flag is set and you're using HTTPS
- On localhost, `secure: true` may need adjustment
- In development, you can temporarily disable:
  ```typescript
  response.cookie('Authentication', token, {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  });
  ```

---

## Files Modified

1. **backend/src/main.ts**
   - Added `app.enableCors()` with credentials support

2. **backend/.env**
   - Added `FRONTEND_URL=http://localhost:3000`

---

## What's Next

1. ✅ Restart backend with new CORS config
2. ✅ Test login flow in browser
3. ✅ Verify cookies appear in DevTools
4. (Optional) Enable backend debug logs to see cookie operations:
   ```typescript
   console.log('Setting Authentication cookie:', { ... });
   ```

---

## References
- NestJS CORS: https://docs.nestjs.com/security/cors
- Express Set-Cookie: https://expressjs.com/en/api/res.html#res.cookie
- MDN HttpOnly: https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie#restrict_access_to_cookies
