# ACCSystem - Replit Environment

## Project Overview
ACCSystem is an enterprise accounting and management system with:
- **Frontend**: Next.js 16 app (`/frontend`) on port 5000
- **Backend**: Laravel 12 (PHP 8.2) API (`/backend`) on port 8000

## Architecture
- The frontend is a Next.js 16 app with React 19, Tailwind CSS 4, Zustand for state, and Arabic (RTL) UI.
- The backend is a Laravel 12 REST API with domain-driven design under `/api/v2/`.
- Frontend communicates with backend via `NEXT_PUBLIC_API_BASE` env var (defaults to `http://127.0.0.1:8000/api/v2`).

## Running the Project
Two workflows run in parallel:
- **"Backend API"**: `cd /home/runner/workspace/backend && php artisan serve --host=0.0.0.0 --port=8000`
- **"Start application"**: `cd /home/runner/workspace/frontend && npm run dev`

The run button launches the "Project" workflow which starts both.

## Key Configuration Files
- `frontend/.env.local` - Frontend env vars (`NEXT_PUBLIC_API_BASE`)
- `backend/.env` - Laravel env vars (app key, DB, session, cache, queue settings)
- `backend/config/cors.php` - CORS allows all `*.replit.dev` origins

## Database
The backend is configured with MySQL (`DB_CONNECTION=mysql`) but defaults to file-based session/cache/queue drivers so it can run without a live database. The user needs to provide `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` for full functionality.

## Security Notes
- Session driver set to `file` (no DB required for sessions)
- Cache store set to `file`
- Queue set to `sync`
- CORS restricts to `*.replit.dev` and localhost origins only
- Frontend uses `X-Session-Token` header for auth

## Dependencies
- Frontend: npm (package-lock.json present)
- Backend: Composer (vendor/ installed)
