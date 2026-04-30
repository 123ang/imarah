# IMARAH Re-check — 2026-04-30 14:33 MYT

## Verification

- `npm run build` — passed.
- `npm run lint` — passed.
- `npm run test -w backend` — passed, 7 tests.
- `npx prisma validate` — passed.
- `npm audit --omit=dev` — 0 vulnerabilities.

## Finding Fixed During Re-check

### Authenticated web API calls were not actually sending `Authorization`

File: `web/src/lib/api.ts`

The newer API helper used:

```ts
Object.assign(headers, await authHeader());
```

`headers` is a `Headers` object, so this does not reliably set the HTTP Authorization header. Protected frontend calls such as admin import, profile, and mosque jamaat updates could fail with 401 even after login.

Fixed by replacing this with:

```ts
headers.set("Authorization", `Bearer ${token}`);
```

and applying the same fix to the retry-after-refresh path.

## Current Notes

- There are already broader uncommitted changes in the working tree, including new React Query integration, admin/authority/mosque portal pages, and package changes.
- The project is now a Git repo on `main` tracking `origin/main`, but the current working tree is dirty and should be committed after review.
- I did not see the previous CSV/timezone/boolean issues return.
- Remaining non-blocking concern: nearby mosque search still loads all active mosques into memory; acceptable for current MVP scale, should become PostGIS/SQL before real national rollout.
