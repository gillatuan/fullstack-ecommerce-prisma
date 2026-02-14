# User Storage & Token Expiration Handling

## 1. How User Info is Stored After Login

### Flow: Login → Cookie → Context

```
LOGIN
  ↓
POST /api/v1/auth/login
  ↓ Backend Response with Set-Cookie headers
Authentication Cookie (HttpOnly, Browser stores automatically)
  ↓
Layout calls getCurrentUser()
  ↓ Reads cookie + jwt-decode
AuthUser object (userId, email, roles, permissions, exp, iat)
  ↓
Providers initializes AuthContext with initialUser
  ↓
Client-side Components access via useAuth() hook
```

### Details:

**1. Backend Sets HttpOnly Cookie on Login:**
```typescript
// backend/src/auth/auth.service.ts
async login(user: AuthLoginResponse, response: Response) {
  const { accessToken, refreshToken } = await this.getTokens(tokenPayload);
  
  // Sets cookies in HTTP response
  response.cookie('Authentication', accessToken, {
    httpOnly: true,    // ✅ Only backend can access
    secure: true,      // ✅ Only over HTTPS
    expires: ...       // ✅ Expiration time
  });
  
  // Returns user profile (not token)
  return { user: { id, email, fullName, roles, permissions } };
}
```

**2. Browser Automatically Stores Cookie:**
- Browser receives `Set-Cookie` header
- Browser stores in secure cookie jar
- Browser never exposes to JavaScript (httpOnly)
- Browser auto-sends with every request (credentials: 'include')

**3. Layout Reads Cookie (Server-Side):**
```typescript
// frontend/app/auth/get-current-user.ts
export default async function getCurrentUser() {
  const cookieStore = await cookies()
  const cookie = cookieStore.get('Authentication')?.value  // ← Read cookie
  
  if (!cookie) return null
  
  try {
    const payload = jwtDecode<RawPayload>(cookie)
    // ✅ Extract user info + expiration from JWT
    return {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles,
      permissions: payload.permissions,
      exp: payload.exp,        // ← Token expiration timestamp
      iat: payload.iat,        // ← Token issued-at timestamp
    }
  } catch (e) {
    return null
  }
}
```

**4. Providers Hydrate AuthContext (Client-Side):**
```typescript
// frontend/app/providers.tsx
export default function Providers({ children, initialUser }: ProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**5. Components Access via Hook:**
```typescript
// Any client component
const { user } = useAuth();
if (user) {
  console.log(user.email, user.roles);
}
```

---

## 2. Token Expiration: JWT `exp` Claim

### What is `exp`?

The `exp` claim in JWT is a **Unix timestamp** (seconds since epoch) indicating when the token expires.

```typescript
// Example JWT payload
{
  sub: "user-123",
  email: "user@example.com",
  roles: ["ADMIN"],
  permissions: ["user:read", "user:create"],
  iat: 1707554000,    // Issued at
  exp: 1707557600,    // Expires at (10 hours later)
}
```

### How Token Expiration is Configured:

**Backend** (sets TTL for tokens):
```typescript
// backend/.env
JWT_EXPIRATION=10h           // Access token lifetime
JWT_REFRESH_TOKEN_EXPIRATION=7d  // Refresh token lifetime
```

**Backend Signs Access Token:**
```typescript
// backend/src/auth/auth.service.ts
async getTokens(tokenPayload: TokenPayload) {
  const accessPromise = this.jwtService.signAsync(tokenPayload, {
    secret: this.configService.getOrThrow('JWT_SECRET'),
    expiresIn: this.configService.getOrThrow('JWT_EXPIRATION'),  // ← 10h
  });
}
```

### Current Expiration Flow:

| Stage | What Happens |
|-------|--------------|
| **Login** | Backend signs token with `exp = now + 10 hours` |
| **Browser** | Stores Authentication cookie (no expiration check done) |
| **User browsing** | Each request auto-sends cookie (browser doesn't validate exp) |
| **After 10 hours** | Token is expired, but browser still sends it |
| **Protected endpoint** | Backend validates JWT sig → **401 Unauthorized** |
| **Fetch helper** | Detects 401 → calls POST /auth/refresh (passive refresh) |
| **Backend refresh** | If Refresh token valid, issues new access token |
| **User continues** | New token in cookie, user stays authenticated |

---

## 3. How to Check if User Token is Expired

### Option A: Passive Check (Recommended - Current Implementation)

**Approach:** Don't proactively check expiration. Wait for backend to return 401, then refresh.

**Pros:**
- ✅ No need to validate JWT on client (server is source of truth)
- ✅ Backend can revoke tokens immediately (no client-side caching)
- ✅ Simpler code

**Cons:**
- User sees brief error before auto-refresh happens

**Implementation:** Already in place!
```typescript
// frontend/common/util/fetch.ts
if (res.status === 401) {
  await attemptRefresh();  // Auto-refresh on 401
  res = await doRequest(); // Retry original request
}
```

---

### Option B: Active Check (Proactive Expiration Detection)

**Approach:** Check `exp` before making protected requests.

**Code Example:**
```typescript
// frontend/app/auth/useAuth.ts - NEW HOOK
import { useContext } from 'react';
import { AuthContext } from './auth-context';

export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  
  const isTokenExpired = () => {
    if (!context.user?.exp) return true;
    
    const now = Math.floor(Date.now() / 1000);  // Current time in seconds
    const expiresIn = context.user.exp - now;   // Seconds remaining
    
    // Consider expired if less than 1 minute remaining
    return expiresIn < 60;
  };
  
  return {
    user: context.user,
    setUser: context.setUser,
    isTokenExpired,
  };
}
```

**Usage Example:**
```typescript
// Component
const { user, isTokenExpired } = useAuth();

if (isTokenExpired()) {
  return <div>Token expired. Please login again.</div>;
}

return <div>Welcome, {user?.email}</div>;
```

**Or refresh before request:**
```typescript
// Fetch helper enhancement
export const post = async (path: string, data: any) => {
  // Check if token expiring soon
  const { user } = useAuth();
  if (user?.exp) {
    const now = Math.floor(Date.now() / 1000);
    if (user.exp - now < 60) {
      // Token expiring in < 1 min, refresh now
      await attemptRefresh();
    }
  }
  
  // Proceed with request
  ...
};
```

---

### Option C: Hybrid (Passive + Proactive Fallback)

**Approach:** Use passive refresh, but also check expiration when component mounts.

```typescript
// frontend/components/ProtectedRoute.tsx
'use client'

import { useEffect } from 'react';
import useAuth from 'app/auth/useAuth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isTokenExpired, setUser } = useAuth();
  
  useEffect(() => {
    if (isTokenExpired()) {
      // Token expired, try to refresh
      attemptRefresh().then(() => {
        // Re-fetch current user from server
        getCurrentUserFromServer().then(setUser);
      }).catch(() => {
        // Refresh failed, redirect to login
        window.location.href = '/auth/login';
      });
    }
  }, []);
  
  if (!user) return <div>Loading...</div>;
  
  return children;
}
```

---

## 4. When to Check/Handle Token Expiration

### Check on:

| Event | Why | How |
|-------|-----|-----|
| **Component Mount** | User might have stale token before refresh | `useEffect(() => { if (isTokenExpired()) refresh() })` |
| **Before Protected Request** | Avoid 401 errors | Check `exp - now < buffer` before API call |
| **Tab Focus** | User might've been idle | Check on `visibilityChange` event |
| **Every Protected Page** | Catch expiration early | Check in layout or page component |
| **Server Action** | Validate token still valid | Check `exp` in `getCurrentUser()` |

### Current Implementation Status:

✅ **Passive refresh already works:**
- Fetch helper catches 401
- Auto-refreshes tokens
- Retries original request
- User doesn't need to re-login

⚠️ **Could improve with:**
- Proactive token expiration check before showing protected pages
- Banner warning "Your session expires in 5 minutes"
- Redirect to login if refresh fails

---

## 5. Implementation Example: Add Token Expiration Check

### Example: Warn User Before Token Expires

```typescript
// frontend/app/auth/useTokenExpiration.ts
'use client'

import { useEffect, useState } from 'react';
import useAuth from './useAuth';

// Returns: 'valid', 'expiring-soon', 'expired'
export function useTokenExpiration() {
  const { user } = useAuth();
  const [status, setStatus] = useState<'valid' | 'expiring-soon' | 'expired'>('valid');
  
  useEffect(() => {
    if (!user?.exp) {
      setStatus('expired');
      return;
    }
    
    const checkExpiration = () => {
      const now = Math.floor(Date.now() / 1000);
      const secondsRemaining = user.exp - now;
      
      if (secondsRemaining < 0) {
        setStatus('expired');
      } else if (secondsRemaining < 300) {  // 5 minutes
        setStatus('expiring-soon');
      } else {
        setStatus('valid');
      }
    };
    
    checkExpiration();
    
    // Check every 30 seconds
    const interval = setInterval(checkExpiration, 30000);
    return () => clearInterval(interval);
  }, [user?.exp]);
  
  return status;
}
```

### Usage in Layout:

```typescript
// frontend/app/layout.tsx
'use client'

import { useTokenExpiration } from './auth/useTokenExpiration';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const tokenStatus = useTokenExpiration();
  
  return (
    <>
      {tokenStatus === 'expiring-soon' && (
        <div className="bg-yellow-100 p-4 text-yellow-800">
          ⏰ Your session expires in 5 minutes. 
          <button onClick={() => window.location.href = '/auth/login'}>
            Re-login
          </button>
        </div>
      )}
      
      {tokenStatus === 'expired' && (
        <div className="bg-red-100 p-4 text-red-800">
          ❌ Your session has expired. Please login again.
        </div>
      )}
      
      {children}
    </>
  );
}
```

---

## 6. Token Refresh Flow (When Expiration Occurs)

### When Token Expires:

```
User makes protected request
  ↓
Backend validates JWT
  ↓ JWT is expired (exp timestamp < now)
401 Unauthorized
  ↓
Fetch helper detects 401
  ↓
POST /api/v1/auth/refresh (with Refresh cookie)
  ↓
Backend validates Refresh token
  ↓ If valid (hashed match + not expired)
Issues new access token
  ↓ Sets new Authentication cookie
200 OK
  ↓
Fetch helper retries original request
  ↓ Now with new Authentication cookie
200 OK (request succeeds)
```

### Important: Refresh Token Validity

- **Refresh token stored:** In DB as **hashed** (with argon2)
- **Refresh token in cookie:** Raw (sent to backend)
- **Backend validates:** Hashes incoming token, compares to DB value
- **If match:** New tokens issued
- **If no match:** 403 Forbidden (potential security breach)

---

## Summary of User Storage

| Component | Storage | Lifetime | Access |
|-----------|---------|----------|--------|
| **Access Token (Authentication cookie)** | HttpOnly browser cookie | 10 hours | Auto-sent by browser |
| **Refresh Token (Refresh cookie)** | HttpOnly browser cookie | 7 days | Only to /auth/refresh |
| **User Profile (in context)** | React state (AuthContext) | Until page reload | Client-side only |
| **Hashed Refresh Token** | PostgreSQL DB (users.refreshToken) | 7 days | Backend validation |

## Next Steps (Optional Improvements)

1. Add `useTokenExpiration()` hook for proactive expiration warnings
2. Add "Session expiring soon" banner 
3. Add automatic silent refresh before expiration (e.g., every 5 minutes)
4. Add logout on tab close with expired token
5. Add backend token revocation (logout endpoint)

---

## References

- JWT Claims: https://tools.ietf.org/html/rfc7519#section-4.1
- Unix Timestamp: https://en.wikipedia.org/wiki/Unix_time
- Next.js Server Actions + Cookies: https://nextjs.org/docs/app/building-your-application/data-fetching/forms-and-mutations
- HttpOnly Cookies: https://owasp.org/www-community/attacks/csrf
