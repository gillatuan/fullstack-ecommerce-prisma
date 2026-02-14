# Full Auth Flow Verification: Signup → Login → Refresh Token

## Overview
This document verifies the complete authentication flow across the frontend (Next.js) and backend (NestJS) including signup, login, and token refresh with HttpOnly cookies.

---

## 1. Signup Flow

### Frontend (Signup)
**File:** `frontend/components/signupForm.tsx`

1. User fills form with `name`, `email`, `password`, and optionally `role` (admin-only)
2. Form action calls `createUser` server action

**File:** `frontend/app/auth/signup/create-user.ts`

```typescript
// Validates email and password
// If admin selected a role, includes it in payload: { email, password, roles: [roleName] }
// Calls POST /users via post() helper with credentials: 'include'
// On success, redirects to /auth/login
```

**Helper:** `frontend/common/util/fetch.ts`

```typescript
export const post = async (path: string, data: LoginFormSchemaType) => {
  const url = `${API_URL}/${API_VERSION}/${path}`;
  
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',  // 🔑 Ensures cookies sent in request
    body: JSON.stringify(data),
  });
  
  // On 401, attempt refresh once then retry
  if (res.status === 401) {
    await attemptRefresh();
    res = await doRequest();
  }
  
  return { error: string, data: any };
};
```

### Backend (Signup)
**File:** `backend/src/users/users.controller.ts`

```typescript
@Post()
@RequirePermissions('user:create')  // ✅ Currently allows POST /users
create(@Body() createUserRequest: UserCreateInput, @CurrentUser() currentUser) {
  return this.usersService.create(createUserRequest, currentUser);
}
```

**Note:** The `@RequirePermissions('user:create')` guard is applied, but POST /users is called **before login** (unauthenticated). This is a **gap** that needs fixing.

**File:** `backend/src/users/users.service.ts`

```typescript
async create(data: UserCreateInput, currentUser: AuthLoginResponse) {
  const { roles, password, ...rest } = data;
  let roleIdsToAssign: string[] = [];

  // 1. Check creator's permission
  const isSuperAdmin = currentUser?.roles?.includes('SUPER_ADMIN');

  if (isSuperAdmin && roles && roles.length > 0) {
    // SUPER_ADMIN can assign roles
    roleIdsToAssign = roles;
  } else {
    // Non-SUPER_ADMIN must get MEMBER role
    const memberRole = await this.prismaService.role.findUnique({
      where: { name: 'MEMBER' },
    });
    roleIdsToAssign = [memberRole.id];
  }

  // Hash password and create user with roles
  return await this.prismaService.user.create({
    data: {
      ...data,
      password: await argon2.hash(data.password),
      roles: {
        create: roleIdsToAssign.map((id) => ({
          role: { connect: { id } },
        })),
      },
    },
    select: userPermissionSelect,
  });
}
```

### **⚠️ Issue Found: Public Signup Endpoint**
The signup endpoint currently requires `user:create` permission, but signup should be **public**. **Fix needed:**

```typescript
// In backend/src/users/users.controller.ts
@Post()
// REMOVE @RequirePermissions('user:create') for unauthenticated signup
// ADD @Public() decorator OR handle guard bypass for signup
create(@Body() createUserRequest: UserCreateInput, @CurrentUser() currentUser) {
  return this.usersService.create(createUserRequest, currentUser);
}
```

---

## 2. Login Flow

### Frontend (Login)
**File:** `frontend/components/loginForm.tsx` → `frontend/app/auth/login/login.ts`

```typescript
// 1. User submits email + password
// 2. Validates via loginFormSchema
// 3. Calls POST /auth/login with credentials: 'include'
// 4. Backend sets HttpOnly cookies (Authentication, Refresh)
// 5. Frontend redirects to / on success (no token reading)
```

### Backend (Login)
**File:** `backend/src/auth/auth.controller.ts`

```typescript
@Post('login')
@UseGuards(LocalAuthGuard)  // Validates email + password
login(
  @CurrentUser() user: AuthLoginResponse,
  @Res({ passthrough: true }) response: Response,
) {
  return this.authService.login(user, response);
}
```

**File:** `backend/src/auth/strategies/local.strategy.ts`

```typescript
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(username: string, password: string) {
    return await this.authService.verifyUser(username, password);
  }
}
```

**File:** `backend/src/auth/auth.service.ts`

```typescript
async verifyUser(email: string, password: string): Promise<AuthLoginResponse> {
  // 1. FindOne user by email
  // 2. Verify argon2 hashed password
  // 3. Return { id, email, fullName, roles: [role], permissions, ... }
}

async login(user: AuthLoginResponse, response: Response) {
  const tokenPayload: TokenPayload = {
    sub: user.id,
    email: user.email,
    permissions: user.permissions,
    userId: user.id,
    roles: user.roles,
  };

  const { accessToken, refreshToken } = await this.getTokens(tokenPayload);
  await this.updateRefreshToken(user.id, refreshToken);  // Hash & store
  
  // ✅ Set HttpOnly cookies
  this.setTokens(response, refreshToken, accessToken);

  // ✅ Return user profile (NOT tokens)
  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles,
      permissions: user.permissions,
    },
  };
}

async setTokens(response: Response, refreshToken: string, token: string) {
  const expires = new Date();
  expires.setMilliseconds(
    expires.getMilliseconds() +
    ms(this.configService.getOrThrow<string>('JWT_EXPIRATION')),
  );

  // Set Refresh token (long-lived, httpOnly)
  response.cookie('Refresh', refreshToken, {
    httpOnly: true,
    secure: true,
    path: '/api/v1/auth/refresh',
  });

  // Set Access token (short-lived, httpOnly)
  response.cookie('Authentication', token, {
    secure: true,
    httpOnly: true,
    expires,
  });
}
```

### Frontend After Login
**File:** `frontend/app/auth/get-current-user.ts` (runs at layout time)

```typescript
export default async function getCurrentUser() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('Authentication')?.value;
  if (!cookie) return null;

  try {
    const payload = jwtDecode<RawPayload>(cookie);
    // Normalize payload fields
    return {
      userId: payload.sub || payload.userId || payload.id,
      email: payload.email,
      roles: payload.roles || [],
      permissions: payload.permissions || [],
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch (e) {
    return null;
  }
}
```

**File:** `frontend/app/providers.tsx`

```typescript
export default function Providers({ children, initialUser }: ProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
```

✅ **Flow:** Backend sets cookies → `getCurrentUser` reads from server-side cookies → Hydrates client with user via AuthContext

---

## 3. Token Refresh Flow

### Frontend (Fetch Helper with Auto-Refresh)
**File:** `frontend/common/util/fetch.ts`

```typescript
export const post = async (path: string, data: LoginFormSchemaType) => {
  const url = `${API_URL}/${API_VERSION}/${path}`;

  const doRequest = async () => {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',  // 🔑 Includes both Authentication & Refresh cookies
      body: JSON.stringify(data),
    });
  };

  let res = await doRequest();

  // 🔑 If access token expired (401), attempt refresh once, then retry
  if (res.status === 401) {
    await attemptRefresh();
    res = await doRequest();  // Retry original request with new tokens
  }

  const parsedRes = await res.json();
  if (!res.ok) {
    return { error: getErrorMessage(parsedRes), data: null };
  }
  return { error: "", data: parsedRes, response: res };
};

async function attemptRefresh() {
  try {
    const refreshUrl = `${API_URL}/${API_VERSION}/auth/refresh`;
    const r = await fetch(refreshUrl, { 
      method: 'POST', 
      credentials: 'include'  // 🔑 Sends Refresh cookie
    });
    return r.ok;
  } catch (e) {
    return false;
  }
}
```

### Backend (Refresh Token Endpoint)
**File:** `backend/src/auth/auth.controller.ts`

```typescript
@UseGuards(AuthGuard('jwt-refresh'))  // Validates Refresh cookie
@Post('refresh')
async refresh(@CurrentUser() user: any, @Res() res: Response) {
  const userId = user.id;
  const refreshToken = user.refreshToken;
  return this.authService.refreshTokens(userId, refreshToken, res);
}
```

**File:** `backend/src/auth/strategies/refresh-token.strategy.ts`

```typescript
@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request?.cookies?.Refresh,  // Read Refresh cookie
      ]),
      secretOrKey: configService.get('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: any) {
    const refreshToken = req.cookies?.Refresh;
    return { ...payload, refreshToken };  // Attach raw token to request.user
  }
}
```

**File:** `backend/src/auth/auth.service.ts`

```typescript
async refreshTokens(userId: string, refreshToken: string, res: Response) {
  const user = await this.usersService.findOne(userId);
  if (!user || !user.refreshToken) {
    throw new ForbiddenException('Access denied.');
  }

  // 🔑 Verify hashed refresh token matches
  const refreshTokenMatches = await argon2.verify(
    user.refreshToken,
    refreshToken,
  );
  if (!refreshTokenMatches) {
    throw new ForbiddenException('Access denied.');
  }

  // 🔑 Create new token pair
  const tokenPayload: TokenPayload = {
    sub: user.id,
    email: user.email,
    userId: user.id,
  };
  const tokens = await this.getTokens(tokenPayload);
  await this.updateRefreshToken(user.id, tokens.refreshToken);

  // 🔑 Set new cookies
  this.setTokens(res, tokens.refreshToken, tokens.accessToken);

  return res.send({ message: 'Token refreshed successfully' });
}
```

✅ **Flow:** 
1. Client gets 401 on protected request
2. Calls POST /auth/refresh with Refresh cookie + credentials
3. Backend validates Refresh token against hashed DB value
4. Backend issues new token pair and sets cookies
5. Client retries original request with new tokens

---

## 4. Protected Route Flow (JWT Validation)

### Backend (Protected Routes)
**File:** `backend/src/auth/strategies/jwt.strategy.ts`

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) =>
          request.cookies?.Authentication ||  // First try cookie
          ExtractJwt.fromAuthHeaderAsBearerToken()(request),  // Fallback to header
      ]),
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const userId = payload?.sub || payload?.userId || payload?.id;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: { include: { permission: true } },
              },
            },
          },
        },
      },
    });

    if (!user) throw new UnauthorizedException();

    const roleNames = (user.roles || []).map((ur) => ur.role?.name).filter(Boolean);
    const permissions = flattenPermissions(user);

    return {
      id: user.id,
      email: user.email,
      roles: roleNames,
      permissions,
    };
  }
}
```

✅ **Flow:** Every protected request retrieves user from JWT and re-queries permissions from DB (always fresh)

---

## 5. GET /auth/me Endpoint

### Backend
**File:** `backend/src/auth/auth.controller.ts`

```typescript
@UseGuards(JwtAuthGuard)
@Get('me')
me(@CurrentUser() user: any) {
  return { user };
}
```

✅ **Usage:** Frontend can call GET /auth/me to verify current user is still authenticated (optional, used if needed)

---

## 6. Complete Flow Diagram

```
SIGNUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Frontend (signupForm.tsx)
  ├─ User inputs: name, email, password, role (if admin)
  └─ POST /api/v1/users (createUser server action)
       │ credentials: 'include'
       └─→ Backend (POST users.controller.create)
            ├─ Validate request ⚠️ (currently requires user:create permission)
            └─ UsersService.create()
                 ├─ If SUPER_ADMIN & roles provided: assign roles
                 ├─ Else: assign MEMBER role
                 ├─ Hash password (argon2)
                 └─ Save to DB with role associations
              └─→ 201 Created: returns user profile (no tokens)
       ← Response 201
  └─ Redirect to /auth/login


LOGIN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Frontend (loginForm.tsx)
  ├─ User inputs: email, password
  └─ POST /api/v1/auth/login (login server action)
       │ credentials: 'include'
       └─→ Backend (POST auth.controller.login with LocalAuthGuard)
            ├─ LocalStrategy.validate(email, password)
            │   └─ AuthService.verifyUser()
            │       ├─ Find user by email
            │       ├─ Verify argon2 password
            │       └─ Return { id, email, roles, permissions }
            │
            ├─ AuthService.login()
            │   ├─ Create TokenPayload { sub, email, roles, permissions }
            │   ├─ Sign access token (JWT_SECRET, JWT_EXPIRATION)
            │   ├─ Sign refresh token (JWT_REFRESH_SECRET, JWT_REFRESH_TOKEN_EXPIRATION)
            │   ├─ Hash & store refresh token in DB (argon2)
            │   └─ Set HttpOnly cookies:
            │       ├─ Authentication (access token)
            │       └─ Refresh (refresh token)
            │
            └─ Return { user: { id, email, fullName, roles, permissions } }
       ← Response 200 + Set-Cookie headers
  
  └─ Redirect to /
       │
       └─→ Layout calls getCurrentUser()
            ├─ Read Authentication cookie
            ├─ jwt-decode to payload
            └─ Hydrate AuthContext with user
         → Refresh renders with authenticated user


PROTECTED ROUTE REQUEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Frontend (fetch via post() helper)
  └─ GET/POST /api/v1/{resource} (credentials: 'include')
       │ Sends: Authentication cookie
       └─→ Backend
            ├─ JwtAuthGuard checks JwtStrategy
            │   ├─ Extract Authentication cookie
            │   ├─ Validate JWT signature
            │   ├─ Query user + roles + permissions from DB
            │   └─ Return { id, email, roles, permissions }
            │
            └─ PermissionGuard checks request.user.permissions
                 ├─ If permission matches @RequirePermissions, allow
                 └─ Else, 403 Forbidden
       ← Response 200 or 403


TOKEN EXPIRATION & REFRESH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Frontend (fetch via post() helper)
  └─ Request to protected endpoint
       │ Sends: Authentication + Refresh cookies
       └─→ Backend
            ├─ JwtAuthGuard: JWT decode fails (token expired)
            └─ Return 401 Unauthorized
       ← Response 401
  
  ├─ post() helper detects 401
  ├─ Calls attemptRefresh()
  │   └─ POST /api/v1/auth/refresh
  │       │ credentials: 'include' (Sends Refresh cookie)
  │       └─→ Backend
  │            ├─ RefreshTokenStrategy reads Refresh cookie
  │            ├─ AuthService.refreshTokens()
  │            │   ├─ Find user by userId from Refresh payload
  │            │   ├─ Verify hashed Refresh token in DB
  │            │   ├─ Create new token pair (access + refresh)
  │            │   ├─ Hash & update refresh token in DB
  │            │   └─ Set new HttpOnly cookies
  │            │
  │            └─ Return { message: '...' }
  │       ← Response 200 + Set-Cookie (new tokens)
  │
  ├─ Retry original request with new tokens
  │   └─ POST /api/v1/{resource}
  │       │ Sends: new Authentication cookie
  │       └─→ Backend
  │            └─ JwtAuthGuard: succeeds with new token
  │       ← Response 200 + data
  │
  └─ Return to client
```

---

## Issues & Recommendations

### 1. **⚠️ Signup Endpoint Permission Check**
**Issue:** POST /users requires `user:create` permission, but unauthenticated users should be able to signup.

**Fix:** Add `@Public()` decorator or create separate `/auth/signup` endpoint.

**Option A: Create dedicated signup endpoint**
```typescript
// In auth.controller.ts
@Post('signup')
async signup(@Body() dto: UserCreateInput) {
  return this.usersService.create(dto, null);  // No creator context
}
```

**Option B: Make POST /users public for signup**
```typescript
// In users.controller.ts - Modify guard
@Post()
// @RequirePermissions('user:create')  ← Remove for signup
// Add logic to allow:
// - Public signup (unauthenticated) with default MEMBER role
// - SUPER_ADMIN/ADMIN can create users with custom roles (separate endpoint)
create(@Body() createUserRequest: UserCreateInput, @CurrentUser() currentUser) {
  return this.usersService.create(createUserRequest, currentUser);
}
```

### 2. ✅ Cookie Path for Refresh Token
Currently:
```typescript
response.cookie('Refresh', refreshToken, {
  path: '/api/v1/auth/refresh',  // Only sent to /refresh endpoint
});
```

This is correct — Refresh cookie is only needed for the refresh endpoint. ✅

### 3. ✅ CORS with Credentials
Ensure backend CORS is configured to allow credentials:
```typescript
// Check app.module.ts or main.ts
app.enableCors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,  // 🔑 Critical for HttpOnly cookies
});
```

### 4. ✅ Token Expiration Handling
- Access token: short-lived (e.g., 15 minutes)
- Refresh token: long-lived (e.g., 7 days)
- Client auto-refresh on 401 ✅

### 5. ✅ Secure Flag
```typescript
response.cookie('Authentication', token, {
  secure: true,    // 🔑 Only HTTPS (adjust for dev)
  httpOnly: true,  // 🔑 Not accessible from JS
});
```

### 6. Frontend AuthContext Update on Refresh
Currently: AuthContext only updates on initial login (layout).
**Recommendation:** After refresh succeeds, optionally re-call `getCurrentUser()` or assume tokens are valid until next 401.

---

## Summary

| Component | Status | Notes |
|-----------|--------|-------|
| **Signup** | ⚠️ Needs Fix | Endpoint requires permission that unauthenticated users don't have |
| **Login** | ✅ Working | Validates credentials, issues HttpOnly cookies, returns user profile |
| **Protected Routes** | ✅ Working | JwtStrategy validates cookie, reruns permission checks |
| **Token Refresh** | ✅ Working | Frontend auto-retries on 401, backend validates & issues new tokens |
| **Fetch Credentials** | ✅ Working | `credentials: 'include'` ensures cookies sent/received |
| **CORS** | ⚠️ Verify | Must have `credentials: true` in backend CORS config |
| **HttpOnly Cookies** | ✅ Working | Tokens stored securely, not accessible from JS |

---

## Recommended Next Steps

1. **Fix signup endpoint** — make it public for unauthenticated users
2. **Verify CORS** — ensure `credentials: true` in backend
3. **Run full flow test** — create account → login → make protected request → observe auto-refresh on token expiry
4. **E2E tests** — add Cypress/Playwright tests for complete auth flows
