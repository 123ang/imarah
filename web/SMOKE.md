# IMARAH web smoke checklist

Run `npm run dev` (root: `npm run dev` launches web + backend) unless testing a split deploy with `VITE_API_BASE` set.

Manual pass (logged-out unless noted):

- [ ] `/` landing: navigation, BM/EN toggle, hero CTAs, trust strip
- [ ] `/masjid` directory: filters, list or empty state; error row + **Retry**
- [ ] `/masjid/<id>` detail: prayer table + **date** change; coordinates → map chips + optional embed when lat/lng present
- [ ] `/solat` zone page: zones load, persisted selection, URL query params work (`zoneId`, `zone`, `stateId`, `state`, `date`)
- [ ] `/tentang` about + `#zakat` donation expectation copy
- [ ] `/login` → `/profile` after sign-in (dev seed SUPER / MOSQUE / etc.)

Role checks:

- [ ] SUPER_ADMIN: `/admin/hub` tabs (CSV, JSON, Invite, JAKIM); `/admin/import` redirects to CSV tab
- [ ] MOSQUE_ADMIN: `/pentadbir/masjid` → scoped masjid; **Jamaat** save
- [ ] AUTHORITY_OFFICER (or SUPER): `/pentadbir/majilis` authority shell

Keyboard: tab through header nav and forms; focus rings visible. Toggle OS “reduce motion” and confirm no jarring motion on smooth scroll.
