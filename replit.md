# AccSystem - Accounting ERP

A full-stack accounting/ERP application with a Next.js frontend and Laravel PHP backend.

## Architecture

- **Frontend**: Next.js 16 (React 19, Tailwind CSS v4) — runs on port 5000
- **Backend**: Laravel 12 (PHP 8.2) REST API — runs on port 8000

## Project Structure

```
/
├── frontend/         # Next.js app
│   ├── app/          # Next.js App Router pages
│   ├── components/   # Shared React components
│   ├── lib/          # API client, utilities, endpoints
│   ├── stores/       # Zustand state stores
│   └── types/        # TypeScript types
├── backend/          # Laravel API
│   ├── app/          # Application code (Domains, Controllers, etc.)
│   ├── config/       # Laravel config (cors, database, etc.)
│   ├── database/     # Migrations and seeders
│   └── routes/       # API route definitions
```

## Workflows

- **Start application** — `cd frontend && npm run dev` (port 5000, webview)
- **Backend API** — `cd backend && php artisan serve --host=0.0.0.0 --port=8000` (port 8000, console)

## Environment Variables

### Frontend (`frontend/.env.local`)
- `NEXT_PUBLIC_API_BASE` — URL to the Laravel backend API

### Backend (`backend/.env`)
- `APP_KEY` — Laravel app encryption key (generated)
- `APP_URL` — Public URL of the app
- `DB_*` — Database connection settings (MySQL by default)

## Database

The backend uses MySQL. Configure `DB_*` variables in `backend/.env`. Run migrations with:
```bash
cd backend && php artisan migrate
```

## Authentication

Custom session-token based auth (not Laravel Sanctum). The `ApiAuth` middleware validates `X-Session-Token` headers on protected routes.
