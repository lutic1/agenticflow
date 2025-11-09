# Authentication Flow Diagrams

This document contains sequence diagrams for all authentication flows in the system.

## 1. Sign Up Flow (New User)

```mermaid
sequenceDiagram
    participant User
    participant Frontend as Frontend (Next.js)
    participant Google as Google OAuth
    participant Backend as Backend (FastAPI)
    participant DB as Database

    User->>Frontend: Click "Sign in with Google"
    Frontend->>Frontend: Generate PKCE code_verifier & code_challenge
    Frontend->>Google: Redirect to OAuth consent screen<br/>(client_id, redirect_uri, scope, code_challenge)

    Note over Google: User grants permission

    Google->>Frontend: Redirect to /auth/callback?code=ABC123
    Frontend->>Backend: POST /api/auth/google<br/>{code: "ABC123", redirect_uri}

    Backend->>Google: Exchange code for tokens<br/>(code, client_secret, redirect_uri)
    Google-->>Backend: {access_token, id_token, refresh_token}

    Backend->>Google: GET /oauth2/v2/userinfo<br/>(access_token)
    Google-->>Backend: {email, name, picture, sub}

    Backend->>DB: Check if user exists (by email or Google sub)
    DB-->>Backend: User not found

    Backend->>DB: INSERT INTO users<br/>(id, email, name, avatar_url, provider)
    DB-->>Backend: New user created

    Backend->>Backend: Generate JWT access_token (15 min)
    Backend->>Backend: Generate JWT refresh_token (7 days)

    Backend-->>Frontend: 200 OK<br/>{user, accessToken, expiresAt}<br/>Set-Cookie: refresh_token (httpOnly)

    Frontend->>Frontend: Store accessToken in memory
    Frontend->>Frontend: Update AuthContext state
    Frontend->>Frontend: Redirect to /dashboard (or redirectTo)

    Frontend->>User: Show dashboard with profile avatar
```

---

## 2. Sign In Flow (Existing User)

```mermaid
sequenceDiagram
    participant User
    participant Frontend as Frontend (Next.js)
    participant Google as Google OAuth
    participant Backend as Backend (FastAPI)
    participant DB as Database

    User->>Frontend: Click "Sign in with Google"
    Frontend->>Frontend: Generate PKCE code_verifier & code_challenge
    Frontend->>Google: Redirect to OAuth consent screen<br/>(client_id, redirect_uri, scope, code_challenge)

    Note over Google: User already authorized,<br/>may skip consent

    Google->>Frontend: Redirect to /auth/callback?code=DEF456
    Frontend->>Backend: POST /api/auth/google<br/>{code: "DEF456", redirect_uri}

    Backend->>Google: Exchange code for tokens
    Google-->>Backend: {access_token, id_token, refresh_token}

    Backend->>Google: GET /oauth2/v2/userinfo
    Google-->>Backend: {email, name, picture, sub}

    Backend->>DB: SELECT * FROM users<br/>WHERE email = ? OR google_sub = ?
    DB-->>Backend: User found (id: usr_123)

    Backend->>DB: UPDATE users<br/>SET name=?, avatar_url=?, last_login=NOW()
    DB-->>Backend: User updated

    Backend->>Backend: Generate JWT access_token (15 min)
    Backend->>Backend: Generate JWT refresh_token (7 days)
    Backend->>DB: INSERT INTO refresh_tokens<br/>(user_id, token_family, expires_at)

    Backend-->>Frontend: 200 OK<br/>{user, accessToken, expiresAt}<br/>Set-Cookie: refresh_token

    Frontend->>Frontend: Store accessToken in memory
    Frontend->>Frontend: Update AuthContext state (authenticated)
    Frontend->>Frontend: Redirect to /dashboard

    Frontend->>User: Show dashboard with profile avatar
```

---

## 3. Token Refresh Flow

```mermaid
sequenceDiagram
    participant Frontend as Frontend (Next.js)
    participant Backend as Backend (FastAPI)
    participant DB as Database

    Note over Frontend: Access token expires (15 min)<br/>or API returns 401

    Frontend->>Frontend: Detect token expiry<br/>(check expiresAt timestamp)

    Frontend->>Backend: POST /api/auth/refresh<br/>Cookie: refresh_token

    Backend->>Backend: Extract refresh_token from httpOnly cookie
    Backend->>Backend: Verify JWT signature & expiry

    alt Invalid or Expired Refresh Token
        Backend-->>Frontend: 401 Unauthorized<br/>{error: "INVALID_REFRESH_TOKEN"}
        Frontend->>Frontend: Clear auth state
        Frontend->>Frontend: Redirect to /login
    else Valid Refresh Token
        Backend->>DB: SELECT * FROM refresh_tokens<br/>WHERE token_family = ?

        alt Token Family Reused (Security Breach)
            DB-->>Backend: Token already used (rotation breach)
            Backend->>DB: DELETE FROM refresh_tokens<br/>WHERE user_id = ?
            Backend-->>Frontend: 401 Unauthorized<br/>{error: "TOKEN_ROTATION_BREACH"}
            Frontend->>Frontend: Force sign out
            Frontend->>Frontend: Show security alert
        else Token Valid (First Use)
            DB-->>Backend: Token found and valid

            Backend->>Backend: Generate new access_token (15 min)
            Backend->>Backend: Generate new refresh_token (rotate)

            Backend->>DB: UPDATE refresh_tokens<br/>SET used_at = NOW()
            Backend->>DB: INSERT INTO refresh_tokens<br/>(new token_family entry)

            Backend-->>Frontend: 200 OK<br/>{accessToken, expiresAt}<br/>Set-Cookie: new refresh_token

            Frontend->>Frontend: Update accessToken in memory
            Frontend->>Frontend: Schedule next refresh before expiry
        end
    end
```

---

## 4. Sign Out Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend as Frontend (Next.js)
    participant Backend as Backend (FastAPI)
    participant DB as Database

    User->>Frontend: Click "Sign Out" in profile dropdown

    Frontend->>Backend: POST /api/auth/signout<br/>Authorization: Bearer {accessToken}<br/>Cookie: refresh_token

    Backend->>Backend: Verify access_token
    Backend->>Backend: Extract user_id from token

    Backend->>DB: DELETE FROM refresh_tokens<br/>WHERE user_id = ? AND token_family = ?
    DB-->>Backend: Token family invalidated

    Backend->>DB: UPDATE users<br/>SET last_logout = NOW()
    DB-->>Backend: User updated

    Backend-->>Frontend: 200 OK<br/>{success: true}<br/>Set-Cookie: refresh_token (Max-Age=0)

    Frontend->>Frontend: Clear accessToken from memory
    Frontend->>Frontend: Clear AuthContext state
    Frontend->>Frontend: Redirect to /login

    Frontend->>User: Show login page
```

---

## 5. Protected Route Access (Authorized)

```mermaid
sequenceDiagram
    participant User
    participant Frontend as Frontend (Next.js)
    participant Middleware as Auth Middleware
    participant Backend as Backend (FastAPI)
    participant Page as Protected Page

    User->>Frontend: Navigate to /dashboard
    Frontend->>Middleware: middleware.ts check

    Middleware->>Middleware: Check AuthContext state

    alt Session in Memory
        Middleware->>Middleware: Check if accessToken is expired

        alt Token Valid
            Middleware->>Page: Render protected page
            Page->>Backend: GET /api/slides<br/>Authorization: Bearer {accessToken}
            Backend->>Backend: Validate access_token
            Backend-->>Page: 200 OK {slides: [...]}
            Page->>User: Show dashboard content
        else Token Expired
            Middleware->>Backend: POST /api/auth/refresh
            Backend-->>Middleware: New accessToken
            Middleware->>Page: Render with new token
            Page->>User: Show dashboard content
        end
    else No Session
        Note over Middleware: Should not happen if user was logged in,<br/>but handles edge cases
        Middleware->>Frontend: Redirect to /login?redirectTo=/dashboard
        Frontend->>User: Show login page
    end
```

---

## 6. Protected Route Redirect (Unauthorized)

```mermaid
sequenceDiagram
    participant User
    participant Frontend as Frontend (Next.js)
    participant Middleware as Auth Middleware
    participant Login as Login Page

    User->>Frontend: Navigate to /dashboard (while signed out)
    Frontend->>Middleware: middleware.ts check

    Middleware->>Middleware: Check AuthContext state
    Middleware->>Middleware: status = 'unauthenticated'

    Middleware->>Middleware: Check if route is protected<br/>(matcher config: /dashboard/*)

    Middleware->>Middleware: Capture current path<br/>(/dashboard)

    Middleware->>Frontend: NextResponse.redirect<br/>(/login?redirectTo=/dashboard)

    Frontend->>Login: Render login page
    Login->>Login: Parse redirectTo from query
    Login->>Login: Store redirectTo in component state

    Login->>User: Show "Sign in with Google" button

    Note over User: User signs in with Google

    Login->>Login: After successful auth,<br/>check if redirectTo exists
    Login->>Frontend: Navigate to /dashboard
    Frontend->>User: Show protected dashboard content
```

---

## 7. Session Initialization on App Load

```mermaid
sequenceDiagram
    participant Browser
    participant Frontend as Frontend (Next.js)
    participant Backend as Backend (FastAPI)

    Browser->>Frontend: Load app (page refresh)
    Frontend->>Frontend: AuthProvider mounts
    Frontend->>Frontend: Set status = 'loading'

    Frontend->>Frontend: Check memory for accessToken

    alt AccessToken in Memory (Session Storage)
        Frontend->>Frontend: Decode JWT to check expiry

        alt Token Valid
            Frontend->>Frontend: Set session state
            Frontend->>Frontend: Set status = 'authenticated'
        else Token Expired
            Frontend->>Backend: POST /api/auth/refresh<br/>(httpOnly cookie automatically sent)

            alt Refresh Successful
                Backend-->>Frontend: New accessToken
                Frontend->>Frontend: Update session state
                Frontend->>Frontend: Set status = 'authenticated'
            else Refresh Failed
                Backend-->>Frontend: 401 Unauthorized
                Frontend->>Frontend: Clear session state
                Frontend->>Frontend: Set status = 'unauthenticated'
            end
        end
    else No AccessToken
        Frontend->>Backend: POST /api/auth/refresh<br/>(attempt with httpOnly cookie)

        alt Refresh Cookie Exists
            Backend-->>Frontend: New accessToken
            Frontend->>Frontend: Set session state
            Frontend->>Frontend: Set status = 'authenticated'
        else No Refresh Cookie
            Backend-->>Frontend: 401 Unauthorized
            Frontend->>Frontend: Set status = 'unauthenticated'
        end
    end

    Frontend->>Browser: Render app based on status
```

---

## 8. Automatic Token Refresh (Background)

```mermaid
sequenceDiagram
    participant Frontend as Frontend (Next.js)
    participant Timer as Refresh Timer
    participant Backend as Backend (FastAPI)

    Note over Frontend: User is signed in<br/>accessToken expires in 15 min

    Frontend->>Frontend: Session established<br/>expiresAt = now + 15 min

    Frontend->>Timer: Schedule refresh at<br/>(expiresAt - 60 seconds)

    Note over Timer: Wait 14 minutes

    Timer->>Frontend: Trigger refresh (1 min before expiry)

    Frontend->>Backend: POST /api/auth/refresh<br/>Cookie: refresh_token

    alt Refresh Successful
        Backend-->>Frontend: 200 OK<br/>{accessToken, expiresAt}
        Frontend->>Frontend: Update session in AuthContext
        Frontend->>Frontend: Clear old timer
        Frontend->>Timer: Schedule next refresh<br/>(new expiresAt - 60 seconds)

        Note over Frontend: User continues working seamlessly<br/>No interruption to UI
    else Refresh Failed
        Backend-->>Frontend: 401 Unauthorized
        Frontend->>Frontend: Clear session state
        Frontend->>Frontend: Show toast: "Session expired. Please sign in."
        Frontend->>Frontend: Redirect to /login
    end
```

---

## 9. API Request with Auto-Refresh on 401

```mermaid
sequenceDiagram
    participant Component as React Component
    participant APIClient as API Client
    participant Backend as Backend (FastAPI)
    participant AuthContext as Auth Context

    Component->>APIClient: fetch('/api/slides')
    APIClient->>APIClient: Add Authorization header<br/>Bearer {accessToken}

    APIClient->>Backend: GET /api/slides

    alt Access Token Valid
        Backend->>Backend: Validate token
        Backend-->>APIClient: 200 OK {slides: [...]}
        APIClient-->>Component: Return slides data
    else Access Token Expired/Invalid
        Backend->>Backend: Token validation fails
        Backend-->>APIClient: 401 Unauthorized<br/>{error: "EXPIRED_ACCESS_TOKEN"}

        APIClient->>APIClient: Detect 401 error
        APIClient->>AuthContext: Call refreshSession()

        AuthContext->>Backend: POST /api/auth/refresh

        alt Refresh Successful
            Backend-->>AuthContext: New accessToken
            AuthContext->>AuthContext: Update session state
            AuthContext-->>APIClient: Return new token

            APIClient->>APIClient: Retry original request<br/>with new token
            APIClient->>Backend: GET /api/slides<br/>Authorization: Bearer {newAccessToken}
            Backend-->>APIClient: 200 OK {slides: [...]}
            APIClient-->>Component: Return slides data
        else Refresh Failed
            Backend-->>AuthContext: 401 Unauthorized
            AuthContext->>AuthContext: Clear session
            AuthContext->>Frontend: Redirect to /login
            APIClient-->>Component: Throw error
            Component->>Component: Show error message
        end
    end
```

---

## 10. Error Recovery - Network Failure

```mermaid
sequenceDiagram
    participant User
    participant Frontend as Frontend (Next.js)
    participant APIClient as API Client
    participant Backend as Backend (FastAPI)

    User->>Frontend: Click "Sign in with Google"
    Frontend->>Backend: POST /api/auth/google

    Note over Backend: Network interruption

    Backend-->>Frontend: Network Error (timeout/connection refused)

    Frontend->>APIClient: Handle network error
    APIClient->>APIClient: Retry logic with exponential backoff

    APIClient->>APIClient: Attempt 1: Wait 1 second
    APIClient->>Backend: POST /api/auth/google (retry)

    alt Network Still Down
        Backend-->>Frontend: Network Error
        APIClient->>APIClient: Attempt 2: Wait 2 seconds
        APIClient->>Backend: POST /api/auth/google (retry)

        alt Network Still Down
            Backend-->>Frontend: Network Error
            APIClient->>APIClient: Attempt 3: Wait 4 seconds
            APIClient->>Backend: POST /api/auth/google (retry)

            alt Network Still Down
                Backend-->>Frontend: Network Error
                APIClient->>Frontend: Max retries reached
                Frontend->>User: Show error toast<br/>"Connection failed. Check your internet."
                Frontend->>User: Enable "Retry" button
            else Network Restored
                Backend-->>Frontend: 200 OK
                Frontend->>User: Sign in successful
            end
        else Network Restored
            Backend-->>Frontend: 200 OK
            Frontend->>User: Sign in successful
        end
    else Network Restored
        Backend-->>Frontend: 200 OK
        Frontend->>User: Sign in successful
    end
```

---

## 11. Multi-Tab Synchronization

```mermaid
sequenceDiagram
    participant Tab1 as Browser Tab 1
    participant Tab2 as Browser Tab 2
    participant BroadcastChannel as Broadcast Channel
    participant Backend as Backend (FastAPI)

    Note over Tab1: User signs in on Tab 1

    Tab1->>Backend: POST /api/auth/google
    Backend-->>Tab1: {user, accessToken}<br/>Set-Cookie: refresh_token

    Tab1->>Tab1: Update AuthContext state
    Tab1->>BroadcastChannel: postMessage({<br/>  type: 'AUTH_STATE_CHANGED',<br/>  status: 'authenticated',<br/>  user: {...}<br/>})

    BroadcastChannel->>Tab2: Broadcast message

    Tab2->>Tab2: Receive AUTH_STATE_CHANGED
    Tab2->>Backend: POST /api/auth/refresh<br/>(refresh_token cookie shared across tabs)
    Backend-->>Tab2: New accessToken

    Tab2->>Tab2: Update AuthContext state
    Tab2->>Tab2: Redirect from /login to /dashboard

    Note over Tab1,Tab2: Both tabs now authenticated

    Note over Tab1: User signs out on Tab 1

    Tab1->>Backend: POST /api/auth/signout
    Backend-->>Tab1: Clear refresh_token cookie

    Tab1->>Tab1: Clear AuthContext state
    Tab1->>BroadcastChannel: postMessage({<br/>  type: 'AUTH_STATE_CHANGED',<br/>  status: 'unauthenticated'<br/>})

    BroadcastChannel->>Tab2: Broadcast message

    Tab2->>Tab2: Receive AUTH_STATE_CHANGED
    Tab2->>Tab2: Clear AuthContext state
    Tab2->>Tab2: Redirect to /login

    Note over Tab1,Tab2: Both tabs now signed out
```

---

## Flow Summary

| Flow | Actors | Key Steps | Duration |
|------|--------|-----------|----------|
| **Sign Up** | User, Frontend, Google, Backend, DB | OAuth consent → Token exchange → Create user → Generate JWT | ~3-5 seconds |
| **Sign In** | User, Frontend, Google, Backend, DB | OAuth consent → Token exchange → Update user → Generate JWT | ~2-4 seconds |
| **Token Refresh** | Frontend, Backend, DB | Validate refresh token → Rotate tokens → Return new access token | ~100-200ms |
| **Sign Out** | User, Frontend, Backend, DB | Invalidate tokens → Clear cookies → Clear state | ~50-100ms |
| **Protected Route (Auth)** | User, Frontend, Middleware, Page | Check session → Render page → Fetch data | ~10-50ms (client-side) |
| **Protected Route (Unauth)** | User, Frontend, Middleware | Check session → Redirect to login → Capture redirect path | ~10-20ms (client-side) |
| **Session Init** | Browser, Frontend, Backend | Check memory → Attempt refresh → Set status | ~200-500ms |
| **Auto-Refresh** | Frontend, Timer, Backend | Schedule timer → Refresh before expiry → Update session | ~100-200ms (background) |
| **API with Retry** | Component, APIClient, Backend | Request → 401 error → Auto-refresh → Retry | ~300-400ms |
| **Error Recovery** | User, Frontend, Backend | Network error → Exponential backoff → Retry → Show error | ~7-15 seconds (max) |
| **Multi-Tab Sync** | Tab1, Tab2, BroadcastChannel | Auth change → Broadcast → Sync state | ~10-50ms |

---

**Document Version**: 1.0.0
**Last Updated**: 2025-11-09
**Authors**: Auth Architect Agent
**Status**: Draft for Review
