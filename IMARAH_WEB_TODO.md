# IMARAH — Web-Only Development To-Do

**Scope:** `imarah/web` (Vite · React · TypeScript · Tailwind). Out of scope for this list: native iOS/Android apps, SMS/push infra, backend-only work unless it **unblocks a web screen**—track that in `IMARAH_MVP_TODO.md`.

**Goal:** Ship a polished **public site** plus **authenticated web portals** (mosque admin, super/system admin where needed) against the existing API (`/api` proxy in dev).

---

## Legend

- **[x]** Done in the web app today  
- **[ ]** Remaining web work  
- **(API)** Item needs a backend endpoint or contract change—note or link PR before ticking

---

## 0. Foundations

- [x] App shell with layout, header, footer, Malay/Islamic-Malaysia theme.
- [x] Client-side routing (`/`, `/masjid`, `/masjid/:id`, `/solat`, `/tentang`, auth, `/admin/*`, `/pentadbir/*`).
- [x] Typed API helper + shared response types (`src/lib/api.ts`, `src/types/api.ts`).
- [x] Centralised **environment config** (`src/env.ts`, `VITE_API_BASE`; see `web/.env.example`).
- [x] Global **toast** UI + inline errors with **retry** where it matters (`ToastContext`; directory/solat).
- [x] Shared **React Query** provider added (`QueryClientProvider` in `main.tsx`) and used on prayer-zone page for cached zones/timetable queries.
- [x] Favicon + **document title** per route (`PageMeta`); basic **Open Graph** `og:title` / `og:description` where description is supplied.
- [x] **Lint + CI** for `web`: `.github/workflows/web-ci.yml` runs `npm run lint -w web` and `npm run build -w web`.

---

## 1. Public — Home & static

- [x] Landing page (`/`).
- [x] About page (`/tentang`) with project framing & **#zakat** expectation copy.
- [x] Homepage: clearer CTAs (“**Cari masjid**”, “**Waktu solat**”) and **trust strip** (no fake payments, Malaysian data stance, BM/EN).
- [x] Language toggle (**BM / EN**) with persisted preference (`localStorage` key `imarah-lang`); single-language UI strings (mosque/state names use API `nameEn` when EN chosen).

---

## 2. Public — Mosque directory & detail

- [x] List + search + filters + bilingual hints.
- [x] Detail page + prayer table + official vs jamaat + next-prayer line (when API returns data).
- [x] Distance when using geolocation (`/nearby`).
- [x] **Date picker** for prayer section (`/masjid/:id`).
- [x] Detail: **facility tags** (chip style); **embedded map** (OpenStreetMap iframe) when lat/lng present.
- [x] Future content blocks for events / announcements / ceramah / floor plan: **omitted until API fields exist** (no blank clutter), per MVP note.
- [x] Empty / error states — directory retry + messaging; masjid detail **404** vs generic errors.

---

## 3. Public — Prayer & zones (browser)

- [x] Dedicated **“Waktu solat”** page (`/solat`): state → zone → date via `GET /api/prayer-times` + zones endpoint.
- [x] **localStorage** for last zone/state selections.
- [x] Bookmarkable URL (`zoneId`, `stateId`, `date`; aliases `zone`, `state` accepted on first load).

---

## 4. Authentication — Registered user flows

_Backend endpoints exist (`/api/auth/*`); web wired with JWT in `localStorage` and refresh via `configureApiAuth`._

- [x] **Login** / **Register** / **Forgot** / **Reset** / **Verify** / **Profile** stub; SPA threat model surfaced in-copy (`authSpaNote`). HttpOnly cookie / BFF deferred.
- [x] **Logout** clears client session and calls **`/api/auth/logout`** when possible.
- [x] Silent **refresh** before expiry: `AuthProvider` exchanges **`/api/auth/refresh`** when the access JWT is close to expiring; `api.ts` retries **401** once after refresh for `auth: true` calls.
- [x] **Email verification** CTA + confirm page (`/verify-email?token=`).

---

## 5. Mosque admin portal (authenticated)

_Routes `/pentadbir/masjid`._

- [x] **Layout**: nav rail, breadcrumb, **logout**.
- [x] **Role guard**: `RequireMosquePortal` + **`canEditMosque`** for scoped masjid IDs.
- [x] **Dashboard** stubs: shortcuts (public listing, jamaat, settings “akan datang”).
- [x] **Jamaat editor**: **`PATCH /api/mosques/:id/jamaat-times`** (`HH:mm`).
- [x] Web scaffold routes for **mosque profile**, **events**, **announcements**, **facilities** are in place under mosque admin (placeholder cards waiting API payloads).

---

## 6. Super / system admin (web only)

- [x] **CSV + JSON import** hub at **`/admin/hub`** (SUPER_ADMIN) — redirects from `/admin/import`.
- [x] **Invite mosque admin** → **`POST /api/admin/invite-mosque-admin`** (password hint matches server `min(12)`).
- [x] **JAKIM stub** → **`POST /api/admin/jakim/sync`** with status toast/message.
- [x] **SUPER_ADMIN** guard (`RequireSuperAdmin`) with **403** UX via `Forbidden`.

---

## 7. Authority portal (later web slice)

- [x] Dedicated shell for **AUTHORITY_OFFICER** (and SUPER_ADMIN): `/pentadbir/majilis` with **authority layout/nav** stub; KPI/circular dashboards remain **`(API)`**.
- [x] Read-only authority dashboard placeholders for **KPI counts** and **circulars inbox** are present (rendering placeholders until API is exposed).

---

## 8. Donations, Khairat, finance UI

_All three remain **heavy product + API**. Web sets expectations only._

- [x] No fake “pay now” buttons.
- [x] Static **zakat/infaq expectation** copy on **home strip**, **footer** link, **`/tentang#zakat`**.

---

## 9. Quality bar (web)

- [x] Keyboard nav + **`focus-visible`** rings (global base styles).
- [x] **`prefers-reduced-motion`** (smooth scroll + transition dampening).
- [x] Directory + prayer tables wrapped for **horizontal scroll** on small screens (`overflow-x-auto`).
- [x] Smoke checklist: **`web/SMOKE.md`** (covers `/`, directory, detail, `/solat`, `/tentang`, auth, admin/mosque/authority stubs).

---

## 10. Hand-off

Mirror major completions into **`IMARAH_MVP_TODO.md`** (Phase 9 public UI, Phase 5–6 admin UX) when you cut a release milestone.
