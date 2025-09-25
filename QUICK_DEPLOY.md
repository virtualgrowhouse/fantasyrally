# 🚀 Fantasy Rally - Quick Deployment Guide

## Step 1: Database Setup (5 minutes)

### Create Neon Account
1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Create project: "fantasy-rally"
4. Copy connection string (starts with `postgresql://`)

### Setup Database
```bash
# Use your connection string from Neon
psql "your_connection_string_here" -f "D:\GAME_PROJECT_ORGANIZED\ACTIVE_PROJECTS\Fantasy_Rally_Backend\database\optimized_schema.sql"
```

## Step 2: Backend Deployment (10 minutes)

### Push to GitHub
```bash
cd "D:\GAME_PROJECT_ORGANIZED\ACTIVE_PROJECTS\Fantasy_Rally_Backend"
git init
git add .
git commit -m "Fantasy Rally Backend v1.0"
# Create repository on GitHub: fantasy-rally-backend
# Follow GitHub's push instructions
```

### Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Select `fantasy-rally-backend`
5. Add environment variables:
   - `DATABASE_URL`: (your Neon connection string)
   - `JWT_SECRET`: `fantasy_rally_super_secure_jwt_key_2024_production`
   - `SESSION_SECRET`: `fantasy_rally_session_secret_production_2024`
   - `NODE_ENV`: `production`

## Step 3: Frontend Deployment (5 minutes)

### Push to GitHub
```bash
cd "D:\GAME_PROJECT_ORGANIZED\ACTIVE_PROJECTS\Wavetype_Website"
git init
git add .
git commit -m "Fantasy Rally Website v1.0"
# Create repository on GitHub: wavetype-xyz-frontend
# Follow GitHub's push instructions
```

### Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. "New Project" → Import `wavetype-xyz-frontend`
4. Framework: Vite
5. Deploy!

## Step 4: Domain Configuration (5 minutes)

### Update DNS (at your domain registrar)
```
Type: A     Name: @      Value: 76.76.19.61
Type: CNAME Name: www    Value: cname.vercel-dns.com
```

### Add Domain in Vercel
1. Project Settings → Domains
2. Add `wavetype.xyz`
3. Add `www.wavetype.xyz`

## 🎯 Test Your Deployment

1. Visit https://wavetype.xyz
2. Check 3D car viewer loads
3. Test both inspect and human modes
4. Verify no console errors

## 📋 Environment Variables Checklist

### Railway (Backend)
- ✅ `DATABASE_URL`
- ✅ `JWT_SECRET`
- ✅ `SESSION_SECRET`
- ✅ `NODE_ENV=production`

### Vercel (Frontend)
- ✅ `VITE_API_URL` (your Railway URL)

---

**Total time: ~25 minutes**
**Result: Live website at wavetype.xyz** 🎉