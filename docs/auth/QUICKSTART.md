# Quick Start - Google OAuth Authentication

## 5-Minute Setup

### 1. Install Dependencies (1 minute)

```bash
cd /home/user/agenticflow/Frontend
npm install next-auth@beta
```

### 2. Set Up Google OAuth (2 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth credentials (Web application)
3. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Client Secret

### 3. Configure Environment Variables (1 minute)

Create `/home/user/agenticflow/Frontend/.env.local`:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 4. Start Development Server (30 seconds)

```bash
npm run dev
```

### 5. Test (30 seconds)

1. Go to `http://localhost:3000`
2. Click "Sign in"
3. Complete Google OAuth
4. See your profile avatar

## That's it!

You now have fully functional Google OAuth authentication.

## Need Help?

- **Full Setup Guide**: [AUTH_SETUP.md](/home/user/agenticflow/docs/auth/AUTH_SETUP.md)
- **Implementation Details**: [IMPLEMENTATION_SUMMARY.md](/home/user/agenticflow/docs/auth/IMPLEMENTATION_SUMMARY.md)
- **Automated Install**: Run `bash /home/user/agenticflow/docs/auth/INSTALL.sh`

## Common Issues

**"Invalid redirect URI"**
- Make sure redirect URI matches exactly: `http://localhost:3000/api/auth/callback/google`

**"NEXTAUTH_SECRET not set"**
- Run: `openssl rand -base64 32` and add to `.env.local`

**Session not working**
- Clear browser cookies and try again
- Verify `.env.local` exists and has correct values

## Production Deployment

1. Set environment variables in your hosting platform (Vercel, Netlify, etc.)
2. Update `NEXTAUTH_URL` to your production domain
3. Add production redirect URI to Google Console
4. Generate new production `NEXTAUTH_SECRET`
