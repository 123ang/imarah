# IMARAH Code Review — 2026-04-30

## Latest Fix Status

Fixed after review:

- CSV prayer import now accepts the documented 8-column format.
- CSV prayer import also supports safer 9-column format with `stateCode` to avoid ambiguous zone codes.
- CSV import now validates date and `HH:mm` prayer time values.
- Malaysia date helper added for frontend display/date lookup.
- Backend next-prayer countdown now treats prayer times as Malaysia local time (`Asia/Kuala_Lumpur` / UTC+8), not UTC prayer hours.
- Local `backend/.env` created from `.env.example` so Prisma CLI can validate without manually passing `DATABASE_URL`.
- Prisma client bootstrap now imports config so development fallback can populate `process.env.DATABASE_URL` before Prisma is constructed.
- Admin prayer import page no longer exposes seed password in production builds; the hint appears only in Vite dev mode.
- Boolean query parsing now explicitly accepts only `true` / `false` instead of `z.coerce.boolean()`.
- Backend tests added for CSV parsing, Malaysia time conversion/countdown, and query boolean parsing.

## Verification Run

- `npm run build` — passed.
- `npm run lint` — passed.
- `npm run test -w backend` — passed, 7 tests.
- `npx prisma validate` from `backend/` — passed.
- `npm audit --omit=dev` — 0 production vulnerabilities.

## Remaining Notes

- No `.git` repository was detected in `/Users/123ang/Desktop/Websites/imarah`; initialize Git when ready to preserve this baseline.
- Nearby mosque search still loads active mosques into memory; acceptable for MVP/demo, but use PostGIS or SQL distance query before national-scale rollout.
- CSV parser is intentionally simple and does not handle quoted commas. For real Excel/CSV admin uploads, add a robust parser or XLSX import later.
- Automated tests now exist, but coverage is still early. Next tests should cover auth/RBAC, public directory hiding pending/suspended mosques, and SUPER_ADMIN-only import authorization.
