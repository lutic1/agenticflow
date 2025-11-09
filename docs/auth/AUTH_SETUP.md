# Google OAuth Authentication Setup Guide

## Overview

This implementation uses NextAuth.js v5 (Auth.js) for authentication with Google OAuth provider. The system includes session management, protected routes, and a clean UI integration.

## Prerequisites

1. Node.js and npm installed
2. A Google Cloud Platform account
3. Access to Google Cloud Console

## Installation

### 1. Install Required Dependencies

Add these packages to your `package.json`:

```bash
npm install next-auth@beta
```

**Note**: We use the beta version (v5) which is compatible with Next.js App Router.

### 2. Google Cloud Console Setup

#### Step 1: Create a Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name your project (e.g., "AI Slides Generator")
4. Click "Create"

#### Step 2: Configure OAuth Consent Screen
1. Navigate to "APIs & Services" → "OAuth consent screen"
2. Select "External" user type
3. Fill in required information:
   - App name: `AI Slides Generator`
   - User support email: Your email
   - Developer contact: Your email
4. Click "Save and Continue"
5. Skip adding scopes (default is fine)
6. Add test users if needed
7. Click "Save and Continue"

#### Step 3: Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Configure:
   - Name: `AI Slides Web Client`
   - Authorized JavaScript origins:
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)
5. Click "Create"
6. Copy your **Client ID** and **Client Secret**

### 3. Environment Variables

Create a `.env.local` file in the Frontend directory:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Or use Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. Production Deployment

For production (e.g., Vercel):

1. Set environment variables in your hosting platform:
   - `NEXTAUTH_URL=https://yourdomain.com`
   - `NEXTAUTH_SECRET=your-production-secret`
   - `GOOGLE_CLIENT_ID=your-client-id`
   - `GOOGLE_CLIENT_SECRET=your-client-secret`

2. Update Google OAuth redirect URIs to include your production domain

## Architecture

### Files Created

```
Frontend/
├── lib/auth/
│   ├── auth.config.ts          # NextAuth configuration
│   ├── auth.ts                 # Auth instance
│   ├── AuthProvider.tsx        # Client-side provider
│   ├── session.ts              # Server-side session helpers
│   ├── ProtectedRoute.tsx      # Route protection HOC
│   └── hooks/
│       ├── useSession.ts       # Session hook
│       └── useAuth.ts          # Auth actions hook
├── components/auth/
│   └── ProfileDropdown.tsx     # User profile dropdown
├── app/
│   ├── api/auth/[...nextauth]/
│   │   └── route.ts            # Auth API routes
│   ├── login/
│   │   └── page.tsx            # Login page
│   ├── layout.tsx              # Updated with AuthProvider
│   └── page.tsx                # Updated with ProfileDropdown
├── middleware.ts               # Auth middleware
└── types/
    └── next-auth.d.ts          # TypeScript definitions
```

### Key Features

1. **Session Management**
   - JWT-based sessions
   - Automatic token refresh every 5 minutes
   - 30-day session lifetime

2. **Authentication Flow**
   - OAuth 2.0 with Google
   - Secure token handling
   - Return URL support

3. **UI Components**
   - Login page with Google sign-in button
   - Profile dropdown with avatar
   - Loading states
   - Error handling

4. **Protected Routes**
   - Middleware-based protection
   - Client-side route guards
   - Automatic redirects

## Usage

### Client-side Usage

```tsx
import { useAuth } from "@/lib/auth/hooks/useAuth"

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth()

  if (!isAuthenticated) {
    return <button onClick={() => login()}>Sign in</button>
  }

  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <button onClick={() => logout()}>Sign out</button>
    </div>
  )
}
```

### Server-side Usage

```tsx
import { getServerSession, isAuthenticated } from "@/lib/auth/session"

export default async function ServerPage() {
  const session = await getServerSession()

  if (!isAuthenticated(session)) {
    redirect("/login")
  }

  return <div>Welcome, {session.user.name}</div>
}
```

### Protecting Routes

#### Option 1: Middleware (Recommended)
Edit `middleware.ts` to add protected routes:

```ts
export default auth((req) => {
  const isLoggedIn = !!req.auth?.user
  const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard")

  if (isProtectedRoute && !isLoggedIn) {
    return Response.redirect(new URL("/login", req.url))
  }
})
```

#### Option 2: Component-based
```tsx
import { ProtectedRoute } from "@/lib/auth/ProtectedRoute"

export default function ProtectedPage() {
  return (
    <ProtectedRoute>
      <YourProtectedContent />
    </ProtectedRoute>
  )
}
```

## Testing

### Test the Authentication Flow

1. Start the development server:
```bash
cd Frontend
npm run dev
```

2. Navigate to `http://localhost:3000`

3. Click the "Sign in" button in the header

4. You should be redirected to `/login`

5. Click "Continue with Google"

6. Complete the Google OAuth flow

7. You should be redirected back to the home page

8. Your profile avatar should appear in the header

9. Click the avatar to see the dropdown menu

10. Click "Sign out" to test logout

### Troubleshooting

**Issue**: "Invalid redirect URI"
- **Solution**: Ensure the redirect URI in Google Console matches exactly: `http://localhost:3000/api/auth/callback/google`

**Issue**: "NEXTAUTH_SECRET not set"
- **Solution**: Generate and set the `NEXTAUTH_SECRET` environment variable

**Issue**: "Failed to sign in"
- **Solution**: Check browser console for errors, verify environment variables, check Google Console configuration

**Issue**: Session not persisting
- **Solution**: Check if cookies are enabled, verify NEXTAUTH_URL matches your domain

## Security Considerations

1. **Never commit** `.env.local` or environment secrets to version control
2. Use different OAuth credentials for development and production
3. Regularly rotate the `NEXTAUTH_SECRET`
4. Enable HTTPS in production
5. Review Google OAuth consent screen settings before going public
6. Implement rate limiting for authentication endpoints
7. Monitor for suspicious login activity

## Next Steps

### Add More OAuth Providers

To add more providers (GitHub, Microsoft, etc.):

1. Install provider package if needed
2. Add provider to `auth.config.ts`:

```ts
import GitHub from "next-auth/providers/github"

export const authConfig: NextAuthConfig = {
  providers: [
    Google({ /* ... */ }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  // ...
}
```

3. Add environment variables
4. Update login page UI

### Add Profile/Settings Pages

Create protected profile and settings pages:

```tsx
// app/profile/page.tsx
import { ProtectedRoute } from "@/lib/auth/ProtectedRoute"

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <YourProfileContent />
    </ProtectedRoute>
  )
}
```

### Add User Database Integration

To store additional user data:

1. Set up a database (PostgreSQL, MongoDB, etc.)
2. Update callbacks in `auth.config.ts`:

```ts
callbacks: {
  async signIn({ user, account }) {
    // Save user to database
    await createOrUpdateUser(user, account)
    return true
  },
}
```

## Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth Setup](https://next-auth.js.org/providers/google)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Google Cloud Console](https://console.cloud.google.com/)

## Support

For issues or questions:
1. Check the [NextAuth.js GitHub Discussions](https://github.com/nextauthjs/next-auth/discussions)
2. Review the [Next.js Documentation](https://nextjs.org/docs)
3. Check browser console for error messages
4. Verify all environment variables are set correctly
