# IMARAH

**Spesifikasi:** `IMARAH_DEVELOPER_MVP.md` · **Senarai kerja penuh:** `IMARAH_MVP_TODO.md` · **Fokus web sahaja:** `IMARAH_WEB_TODO.md`

**Deploy VPS (domain + port 3017/4017):** `DEPLOY_VPS.md`

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
| MOSQUE_ADMIN (contoh MN) | `masjid-admin@imarah.local` | `Imarah2026!` |
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
- Import CSV & JSON waktu solat (`POST /api/admin/prayer/import-csv`, `POST /api/admin/prayer/import-json`) — SUPER_ADMIN.
- Stub job JAKIM (`POST /api/admin/jakim/sync`) — rekod status sahaja; gantikan dengan import sebenar kemudian.
- Tetapan jemaah masjid oleh pentadbir (`PATCH /api/mosques/:id/jamaat-times`) — SUPER_ADMIN atau MOSQUE_ADMIN ber-skop.
- Pentadbiran: jemputan pentadbir masjid (`POST /api/admin/invite-mosque-admin`) — SUPER_ADMIN.
- Auth: `/api/auth/forgot-password`, `/api/auth/reset-password`, `/api/auth/send-verification`, `/api/auth/verify-email`; token berpaut hantar melalui e-mel perlu penyedia SMTP berasingan — dalam pembangunan token dipaparkan di konsol API.
- Pendaftaran & log masuk asas (`/api/auth/*`) dengan refresh token JWT (TTL capaian ~15 min).

## Storan fail

Direktori `backend/uploads/` (dicipta automatik). Sandaran: sandarkan DB + folder ini bersama.

## Tanpa Docker

Sediakan PostgreSQL sendiri pada mesin anda (default Homebrew/Mac sering **`127.0.0.1:5432`**, pengguna sama dengan akaun login macOS):

```bash
# Satu kali: cipta pangkalan
psql "postgresql://$(whoami)@127.0.0.1:5432/postgres" -c "CREATE DATABASE imarah;"

cd imarah/backend
# Edit .env — contoh:
# DATABASE_URL="postgresql://$(whoami)@127.0.0.1:5432/imarah"
npx prisma migrate deploy
npx prisma db seed
```

Redis dalam `.env` tidak digunakan oleh API semasa; boleh abaikan jika tiada pelayan Redis.
