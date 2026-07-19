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

The frontend repo is designed for direct Vercel deployment. API and media requests use a same-origin proxy: the browser calls `/api/v1/*` and `/media/*` on the Vercel domain (HTTPS), and Next.js rewrites those requests server-side to your Django backend via `BACKEND_URL`.

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
| `BACKEND_URL` | `http://<AWS_ELASTIC_IP>:8080` (no trailing slash) while the VM is HTTP-only |
| `ALLOW_INSECURE_BACKEND` | `true` (required when `BACKEND_URL` is `http://` on Vercel) |

`BACKEND_URL` and `ALLOW_INSECURE_BACKEND` are server-only. The browser always calls same-origin `/api/v1/*` and `/media/*` over HTTPS, so mixed content is avoided. Next.js then proxies server-side to the AWS VM (host port **8080** by default).

`BACKEND_URL` is required on Vercel. The build fails if it is missing, still points to `localhost`, or uses HTTP without `ALLOW_INSECURE_BACKEND=true`.

**Security note:** Until the VM terminates TLS, the Vercel → AWS hop is plaintext (JWTs and resume data). Prefer `https://api.yourdomain.com` and drop `ALLOW_INSECURE_BACKEND` as soon as certificates are available.

**Deployment order:** deploy the Django backend on the AWS VM first, then set Vercel env vars and redeploy the frontend.

### 3. Clerk production configuration

After Vercel assigns a domain (e.g. `your-app.vercel.app` or a custom domain):

1. Switch from test keys (`pk_test_` / `sk_test_`) to production keys in Vercel env vars.
2. In Clerk Dashboard → **Domains**, add your Vercel production and preview domains.
3. Ensure redirect URLs allow `/sign-in`, `/sign-up`, and post-auth `/dashboard`.
4. Point the Clerk webhook at the **Vercel HTTPS proxy** (not the raw HTTP Elastic IP):
   `https://your-vercel-domain.com/api/v1/auth/clerk/webhook`
   Subscribe to `user.created`, `user.updated`, and `user.deleted`.

### 4. Backend coordination

On your deployed Django backend, set:

```bash
FRONTEND_URL=https://your-vercel-domain.com
CORS_ALLOWED_ORIGINS=https://your-vercel-domain.com
CSRF_TRUSTED_ORIGINS=https://your-vercel-domain.com
ALLOWED_HOSTS=backend,localhost,127.0.0.1
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

For self-hosted / local containers, use the included `Dockerfile` and `docker-compose.yml`. Docker builds use `output: "standalone"`; Vercel ignores this setting safely.

Frontend and backend share the Docker network `resume-refiner-net` (external). Create it once before either stack:

```bash
../Resume-Refiner-Backend/scripts/ensure-shared-network.sh
# or: docker network create resume-refiner-net
```

```bash
# Backend (from Resume-Refiner-Backend) — requires valid Supabase DIRECT_URL in .env
docker compose up -d

# Frontend (from Resume-Refiner-frontend)
docker compose up -d --build
```

In Docker, the frontend proxies to `http://backend:8000` on that shared network.
