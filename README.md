# IMARAH

**Spesifikasi:** `IMARAH_DEVELOPER_MVP.md` · **Senarai kerja:** `IMARAH_MVP_TODO.md`

Monorepo: `web` (React + Vite + Tailwind), `backend` (Express + TypeScript + Prisma), `mobile` (README untuk native Swift/Java).

## Prasyarat

- Node.js 20+
- Docker Desktop (untuk PostgreSQL + Redis tempatan), **atau** PostgreSQL 16 sendiri pada `DATABASE_URL`

## Mula pantas

```bash
cd imarah
npm install
# Jalankan pangkalan (PostgreSQL 55433, Redis 6379)
docker compose up -d

cd backend
cp .env.example .env   # laras jika perlu
npx prisma migrate deploy
npx prisma db seed

cd ..
npm run dev
```

- **Web:** http://localhost:5173 (proxy `/api` → http://127.0.0.1:4000)
- **API:** http://127.0.0.1:4000/api/health

### Akaun seed

| Peranan        | E-mel               | Kata laluan   |
|----------------|---------------------|---------------|
| SUPER_ADMIN    | `admin@imarah.local` | `Imarah2026!` |
| Pengguna demo  | `demo@imarah.local`  | `Imarah2026!` |

## Skrip berguna

| Skrip | Keterangan |
|--------|------------|
| `npm run dev` | Web + API serentak |
| `npm run build` | Bina backend + web |
| `npm run db:up` / `db:down` | Docker Compose |
| `npm run db:migrate` | `prisma migrate deploy` |
| `npm run db:seed` | Seed data |

## MVP yang telah disokong (ringkas)

- Direktori masjid awam (`GET /api/mosques`, tapisan, `nearby`, butiran + pautan Google/Apple Maps).
- Waktu solat daripada storan IMARAH (`GET /api/prayer-times`, `GET /api/mosques/:id/prayer-times`).
- Import CSV waktu solat (`POST /api/admin/prayer/import-csv`) — SUPER_ADMIN.
- Pendaftaran & log masuk asas (`/api/auth/*`) dengan refresh token.

## Storan fail

Direktori `backend/uploads/` (dicipta automatik). Sandaran: sandarkan DB + folder ini bersama.

## Tanpa Docker

Jika `docker` tidak dipasang, sediakan PostgreSQL sendiri dan set `DATABASE_URL` dalam `backend/.env`, kemudian `npx prisma migrate deploy` dan `npx prisma db seed`.
