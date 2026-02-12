# Planzo — Vercel Deployment Guide

## Architecture Overview

Planzo is structured as a monorepo with:

- **Frontend** (`/frontend`): Vite + React SPA — served as static files by Vercel
- **Backend** (`/backend`): Express.js API — deployed as a Vercel Serverless Function via `/api`
- **Database**: PostgreSQL (use Vercel Postgres, Supabase, Neon, or any hosted PostgreSQL)

## Deploying to Vercel

### Option 1: Deploy via Vercel Dashboard (No CLI needed)

1. **Push your code** to GitHub/GitLab/Bitbucket
2. Go to [vercel.com/new](https://vercel.com/new)
3. **Import** your repository
4. Vercel will auto-detect the `vercel.json` configuration
5. **Add Environment Variables** in the Vercel dashboard:

   | Variable | Description | Example |
   |---|---|---|
   | `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/planzo` |
   | `JWT_SECRET` | Secret key for JWT tokens | `a-long-random-secret-string` |
   | `NODE_ENV` | Environment | `production` |
   | `FRONTEND_URL` | Your Vercel deployment URL (for CORS) | `https://planzo.vercel.app` |

6. Click **Deploy**

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (from project root)
vercel

# Deploy to production
vercel --prod
```

### Option 3: GitHub Integration (Recommended)

1. Connect your GitHub repo to Vercel
2. Every push to `main` triggers a production deployment
3. Every PR gets a preview deployment automatically

## Database Setup

### Using Vercel Postgres
1. Go to your Vercel project dashboard
2. Navigate to **Storage** > **Create Database** > **Postgres**
3. Vercel will auto-inject `DATABASE_URL` into your environment
4. Run the schema: connect to your database and execute `backend/db/schema.sql`

### Using Supabase (Recommended Free Tier)
1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings** > **Database** > **Connection string** (URI)
3. Add the connection string as `DATABASE_URL` in Vercel
4. Run `backend/db/schema.sql` in Supabase SQL Editor

### Using Neon
1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string
3. Add as `DATABASE_URL` in Vercel env vars
4. Run the schema via Neon SQL Editor

## How It Works

### Request Flow

```
Browser → Vercel CDN (static frontend files)
         ↓
         /api/* → Vercel Serverless Function (Express app)
                  ↓
                  PostgreSQL Database
```

### vercel.json Configuration

- `/api/*` routes are handled by the serverless function at `api/index.js`
- All other routes are rewritten to `index.html` (SPA routing)
- The frontend is built from `frontend/` using Vite
- Backend dependencies are included in the serverless function bundle

### Environment Variables

Set these in the Vercel Dashboard under **Settings** > **Environment Variables**:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens |
| `NODE_ENV` | No | Defaults to `production` on Vercel |
| `FRONTEND_URL` | No | For CORS — auto-set on Vercel |
| `VITE_API_URL` | No | Only if API is on a different domain |

## Local Development

```bash
# Install all dependencies
npm run install:all

# Start backend (port 4000)
npm run dev:backend

# Start frontend (port 5173, proxies /api to backend)
npm run dev:frontend
```

The Vite dev server proxies `/api` requests to `http://localhost:4000`, so the frontend and backend work together seamlessly in development.

## Troubleshooting

- **CORS errors**: Make sure `FRONTEND_URL` is set to your Vercel deployment URL
- **Database connection fails**: Check `DATABASE_URL` is correct and SSL is enabled
- **404 on page refresh**: The SPA rewrite in `vercel.json` handles this
- **Serverless function timeout**: Default is 10s; upgrade to Pro for 60s if needed
