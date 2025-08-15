# IntrinArc Basic Authentication Setup

This guide explains how to set up password protection for your IntrinArc dashboard using Vercel Basic Auth Middleware.

## 🚀 Quick Setup

### 1. Environment Variables

Create a `.env.local` file in your project root with:

```bash
# Basic Authentication Credentials
BASIC_AUTH_USER=your_username_here
BASIC_AUTH_PASSWORD=your_secure_password_here

# Polygon API Key (if you have one)
NEXT_PUBLIC_POLYGON_API_KEY=your_polygon_api_key_here
```

### 2. Vercel Deployment

When deploying to Vercel, add these environment variables in your Vercel project settings:

- `BASIC_AUTH_USER` = your chosen username
- `BASIC_AUTH_PASSWORD` = your chosen password

## 🔐 How It Works

### Middleware Protection
- **`src/middleware.ts`** - Protects all routes with basic authentication
- **Browser popup** - Users see a standard browser login prompt
- **No custom UI needed** - Works immediately after deployment

### Optional Enhanced UI
- **`src/components/ui/auth-guard.tsx`** - Custom login form (optional)
- **`src/app/api/auth/check/route.ts`** - Authentication status check
- **`src/app/api/auth/login/route.ts`** - Login endpoint

## 🎯 Implementation Options

### Option 1: Basic Middleware Only (Recommended)
Just deploy with the middleware - users get browser login popup automatically.

### Option 2: Custom Login UI
Wrap your dashboard with the AuthGuard component for a branded login experience.

## 📁 Files Created

- `src/middleware.ts` - Main authentication middleware
- `src/components/ui/auth-guard.tsx` - Optional custom login UI
- `src/app/api/auth/check/route.ts` - Auth status API
- `src/app/api/auth/login/route.ts` - Login API
- `env-template.txt` - Environment variables template

## 🔒 Security Features

- **Route Protection** - All dashboard routes require authentication
- **Asset Exclusion** - Static files, images, and API routes remain accessible
- **Environment Variables** - Credentials stored securely in Vercel
- **Standard HTTP Auth** - Uses industry-standard Basic Authentication

## 🚨 Important Notes

1. **Change Default Credentials** - Don't use the example username/password
2. **Strong Passwords** - Use complex, unique passwords
3. **Environment Variables** - Never commit credentials to Git
4. **Vercel Settings** - Add environment variables in Vercel dashboard

## 🧪 Testing Locally

1. Create `.env.local` with your credentials
2. Run `npm run dev`
3. Visit any protected route
4. Enter your username/password when prompted

## 🚀 Deployment

1. Commit your changes: `git add . && git commit -m "Add basic auth middleware"`
2. Push to GitHub: `git push`
3. Vercel will automatically redeploy with authentication enabled
4. Add environment variables in Vercel dashboard
5. Your dashboard is now password-protected!

## 🆘 Troubleshooting

- **Middleware not working?** Check environment variables are set correctly
- **Can't access dashboard?** Verify credentials in `.env.local`
- **Vercel deployment fails?** Ensure all environment variables are set in Vercel
- **Browser not showing login?** Clear browser cache and try again

Your IntrinArc dashboard is now secure! 🔐✨ 