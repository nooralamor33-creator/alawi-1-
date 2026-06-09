# Varecvsce Game Auth

نظام تسجيل الدخول وإنشاء الحسابات للعبة Varecvsce الإلكترونية العالمية.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/game-auth run dev` — run the frontend (dynamic port)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required env: `SESSION_SECRET` — secret key for session management

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui
- API: Express 5 + express-session
- Auth storage: JSON file (no SQL database required)
- Password hashing: bcryptjs
- Validation: Zod
- API codegen: Orval (from OpenAPI spec)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `artifacts/api-server/src/routes/auth.ts` — auth endpoints (register, login, logout, me)
- `artifacts/api-server/src/lib/userStore.ts` — file-based user storage
- `artifacts/api-server/data/users.json` — user accounts stored here (auto-created)
- `artifacts/game-auth/src/` — React frontend (login, register, dashboard pages)

## Architecture decisions

- **File-based user storage**: Users stored in `artifacts/api-server/data/users.json` — no SQL database needed. Simple and portable.
- **Session management**: express-session with server-side session store. Cookie-based, httpOnly, 7-day expiry.
- **Password security**: bcryptjs with salt rounds = 10. Passwords never stored in plain text.
- **Case-insensitive usernames**: Username lookup is case-insensitive to prevent duplicate accounts like "Admin" and "admin".

## Product

- `/` — Login page with cinematic game-themed UI
- `/register` — Registration page
- `/dashboard` — Welcome screen for logged-in players

## User preferences

- No SQL database — user data stored in JSON file
- Cinematic, dark game-themed UI for the Varecvsce brand

## Gotchas

- `SESSION_SECRET` env var must be set before starting the API server
- The `data/` directory is auto-created on first user registration
- Run codegen after any changes to `lib/api-spec/openapi.yaml`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
