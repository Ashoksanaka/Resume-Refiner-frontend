# Resume Refiner Frontend

Next.js frontend for the Resume Refiner platform. Uses Clerk for authentication and proxies API requests to the Django backend.

## Prerequisites

- Node.js 20.9+
- Clerk application ([dashboard.clerk.com](https://dashboard.clerk.com))

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env.local
```

Required variables:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard`
- `BACKEND_URL=http://localhost:8000` (local dev)

3. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Authentication

- Sign in: `/sign-in`
- Sign up: `/sign-up`
- Protected routes (`/dashboard`, `/profile`, `/generate`) are guarded by Clerk middleware
- After sign-in/sign-up, users are redirected to `/dashboard`
- API calls send `Authorization: Bearer <clerk_session_jwt>` to the backend

## Testing

```bash
npm test
npm run lint
```

## Deploying to Vercel

The frontend repo is designed for direct Vercel deployment. API requests use a same-origin proxy: the browser calls `/api/v1/*` on the Vercel domain, and Next.js rewrites those requests to your Django backend via `BACKEND_URL`.

### 1. Connect the repository

1. Import [Ashoksanaka/Resume-Refiner-frontend](https://github.com/Ashoksanaka/Resume-Refiner-frontend) in the [Vercel dashboard](https://vercel.com/new).
2. Framework preset: **Next.js** (auto-detected).
3. Root directory: repository root.
4. Set Node.js version to **20.x** in project settings (matches `engines` in `package.json`).

### 2. Environment variables

Set these in Vercel for **Production** and **Preview** environments:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Production Clerk publishable key |
| `CLERK_SECRET_KEY` | Production Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL` | `/dashboard` |
| `NEXT_PUBLIC_API_URL` | `/api/v1` |
| `BACKEND_URL` | `https://<your-backend-host>` (no trailing slash) |

`BACKEND_URL` is server-only and required on Vercel. The build fails if it is missing or still points to `localhost`.

**Deployment order:** deploy the Django backend first, then set `BACKEND_URL` in Vercel and redeploy the frontend.

### 3. Clerk production configuration

After Vercel assigns a domain (e.g. `your-app.vercel.app` or a custom domain):

1. Switch from test keys (`pk_test_` / `sk_test_`) to production keys in Vercel env vars.
2. In Clerk Dashboard → **Domains**, add your Vercel production and preview domains.
3. Ensure redirect URLs allow `/sign-in`, `/sign-up`, and post-auth `/dashboard`.
4. Point the Clerk webhook to your **backend** (not the frontend):
   `https://<your-backend-host>/api/v1/auth/clerk/webhook`
   Subscribe to `user.created`, `user.updated`, and `user.deleted`.

### 4. Backend coordination

On your deployed Django backend, set:

```bash
FRONTEND_URL=https://your-vercel-domain.com
CORS_ALLOWED_ORIGINS=https://your-vercel-domain.com
```

CORS is secondary while using the proxy pattern, but set both for tooling and any future direct API access.

### 5. Post-deploy smoke test

- [ ] Landing page loads
- [ ] Sign-in / sign-up → lands on `/dashboard`
- [ ] Profile save succeeds through the proxy
- [ ] Resume generation triggers (`POST /resumes` → 202) and polling completes
- [ ] PDF download works through the proxy

## Backend coordination (local dev)

Configure a Clerk webhook pointing to `http://localhost:8000/api/v1/auth/clerk/webhook` for `user.created`, `user.updated`, and `user.deleted` events so the Django backend stays in sync with Clerk users.

## Docker

For self-hosted deployment, use the included `Dockerfile` and `docker-compose.yml`. Docker builds use `output: "standalone"`; Vercel ignores this setting safely.
