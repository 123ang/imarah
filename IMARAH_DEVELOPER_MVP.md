# Imarah — Developer MVP Specification

**Project:** Imarah — Integrated Ummah Centre of Excellence Management System  
**Product Type:** Integrated Mosque Management System / Mosque Finder / Religious Authority Governance Platform  
**MVP Scope:** Phase 1 — Activation  
**Platforms:** Web Admin Portal + **native** mobile apps (**Swift** on iOS, **Java** on Android)  
**Languages:** Bahasa Malaysia and English  
**Primary Market:** Malaysia, with future international scalability  
**Document Purpose:** Developer-facing MVP build guide  

---

## 1. MVP Goal

The MVP must deliver a usable Phase 1 platform that connects three main user layers:

1. **General Users** — public users who search mosques/suraus, view mosque information, prayer times, make donations, manage Khairat membership, and receive notifications.
2. **Mosque / Surau Admins** — verified mosque administrators who manage mosque profiles, kariah members, finance, events, Khairat, facilities, announcements, and statutory communications.
3. **Religious Authority Users** — state-level Majlis Agama users who manage mosque approvals, officer appointments, governance dashboards, read-only financial oversight, official announcements, and cooperative events.

The MVP must be production-ready enough for pilot rollout with selected mosques, suraus, and religious authority users.

---

## 2. Recommended Tech Stack

### 2.1 Frontend

#### Mobile App (native)

- **iOS:** **Swift** (SwiftUI or UIKit), Xcode, Apple Human Interface Guidelines
- **Android:** **Java** (Android SDK; Kotlin optional later), Android Studio
- Two separate codebases sharing the same backend API contract (OpenAPI or documented REST)
- GPS/location permission where needed for discovery and prayer zone UX
- Offline local cache for prayer times (served from your API, not a third-party feed in MVP — see §2.6)
- Bilingual UI: Bahasa Malaysia and English
- **Post-MVP:** push notifications (APNs + FCM or equivalent) once the integrations phase is enabled

#### Web Admin Portal
- **React + Vite**
- TypeScript
- Tailwind CSS
- React Router
- TanStack Query
- i18next for bilingual support
- Role-based layouts for Mosque Admin, State Authority, and National Super Admin

### 2.2 Backend

- **Node.js + Express** or **NestJS**
- TypeScript
- REST API first; GraphQL optional later
- Zod / Joi validation
- JWT access token + refresh token
- RBAC middleware
- Audit logging middleware
- Background job queue for reminders, reports, and notifications

### 2.3 Database

- **PostgreSQL** recommended
- PostGIS extension recommended for mosque location search and kariah boundary mapping
- Prisma ORM recommended
- Redis for caching (e.g. prayer times served by your API), sessions, queues, and rate limiting

### 2.4 Storage

**Phase 1 (MVP — recommended):** persist uploads on the **VPS local filesystem** (or attached volume), not cloud object storage yet.

- Store files under a dedicated directory on the server (e.g. `/var/lib/imarah/uploads` or a Docker volume mount), with clear subfolders per content type.
- Serve files either via:
  - the API (authenticated download routes for sensitive documents), and/or
  - NGINX **`alias`** / static file serving for **public** assets (e.g. mosque images, event flyers) behind HTTPS.
- Use the same logical content types as the product needs:
  - mosque images
  - event flyers
  - officer photos
  - circular attachments
  - Khairat documents
  - statutory documents
  - mosque floor plan / 3D map files
- **Later (optional):** migrate to S3-compatible object storage (AWS S3, Wasabi, Cloudflare R2, etc.) without changing the domain model if the app uses a storage abstraction (upload interface with pluggable backend).

### 2.5 Infrastructure

- **MVP default:** deploy on a **VPS** (or equivalent VM) with PostgreSQL, Redis, app containers, and **local disk** (or block volume) for uploads; keep backups of both database and upload directory.
- Cloud / managed services (AWS / Azure / GCP / Malaysian providers) remain valid when you outgrow a single VPS or need managed DB/object storage.
- Docker-based deployment
- NGINX reverse proxy
- HTTPS required
- Separate environments:
  - development
  - staging
  - production

### 2.6 MVP scope — integrations deferred first

**MVP ships without relying on external third-party product integrations.** Implement flows using your own backend, database, admin tooling, and native app UX first. That keeps delivery predictable on a VPS and avoids blocking sprints on vendor keys, compliance review, or API churn.

| Area | MVP approach (no integration) | Post-MVP (integrations phase) |
|------|-------------------------------|--------------------------------|
| Prayer times | API returns times from **DB** (authority/admin import, seed, or batch upload by zone/date). Apps cache locally. | JAKIM e-Solat (or other official feed) with sync + fallback |
| Maps / navigation | **Deep link** to Google Maps / Apple Maps / Waze with `lat,lng` or address; list/map UI can be simple or static image | Embedded Maps SDK, advanced routing |
| Payments / donations | **Record-only** or manual confirmation (bank transfer ref, admin marks paid); receipts from your templates | Payment gateway + webhooks (FPX, cards, e-wallets) |
| Ceramah / video | **Metadata + pasted YouTube URL** (or link-out); library listing in app | YouTube OAuth + Data API upload/publish |
| Push / email | In-app notification centre optional; **no FCM/APNs/SMTP requirement** for MVP launch | FCM, APNs, transactional email provider |

Anything previously listed under **§10 Integrations** is **not** part of the MVP acceptance bar; it becomes **Phase 2** once core journeys are stable.

---

## 3. User Roles and Permissions

### 3.1 Role List

| Role | Description |
|---|---|
| Guest User | Can browse public mosque profiles, prayer times, and public events. |
| Registered User | Can set My Mosque, subscribe to mosques, donate, apply for Khairat, receive notifications, and view history. |
| Kariah Member | Verified member of a mosque kariah. Can access private community board and member-specific features. |
| Mosque Admin | Manages one mosque/surau profile, kariah, finances, events, facilities, Khairat, notifications, and reports. |
| Mosque Finance Officer / Treasurer | Can manage finance module, financial reports, donations, reconciliation, and Khairat fund records. |
| Mosque Content Admin | Can manage events, announcements, ceramah library, and community board moderation. |
| State Authority Officer | Can view mosques within assigned state and perform assigned governance tasks. |
| State Authority Admin | Can approve mosques, manage state authority users, officer appointments, announcements, and cooperative events. |
| National Super Admin | Has national read access and can manage authority users. Cannot edit mosque financial records. |
| System Admin | Technical admin for platform configuration, logs, integrations, and support. |

### 3.2 Core Permission Rules

- A mosque admin can only access their own mosque/surau.
- A state authority user can only access mosques/suraus in their state jurisdiction.
- A national super admin can view all states but cannot interfere with state-level operational workflows unless explicitly granted.
- Religious authorities have **read-only financial oversight**.
- Financial records remain owned and controlled by the mosque admin.
- All sensitive create, update, delete, approve, reject, and view-financial actions must be audit logged.

---

## 4. MVP Modules

## Module A — Authentication and Account Management

### Features

- User registration
- Login/logout
- Forgot password
- Email verification
- Phone number verification optional
- Social login optional (**post-MVP**): Google / Apple — MVP uses email/password (and phone where required)
- Role-based login routing
- Admin invitation flow
- MFA for mosque admin and authority users
- Session timeout
- Profile management
- Language preference: BM / English

### MVP Decision

Because identity verification method is still TBD, implement flexible identity structure:

- `email` required for admin accounts
- `phone` required for mobile users where possible
- `ic_number` optional but encrypted
- MyKad verification can be added later

### Acceptance Criteria

- Users can register and login successfully.
- Admin users can only enter dashboards assigned to their role.
- Unauthorized users cannot access admin or authority endpoints.
- MFA can be enabled for admin and authority accounts.

---

## Module B — Mosque and Surau Directory

### Features

- Public mosque/surau listing
- GPS-based nearest mosque search
- Manual search by:
  - mosque name
  - area
  - district
  - state
- Filters:
  - masjid / surau
  - facilities
  - Khairat available
  - OKU access
  - parking availability
  - active jamaat status
- Map view
- List view
- Distance indicator
- Mosque detail page
- Navigation: open device maps app via geo / URL (no embedded Maps SDK in MVP — see §2.6)

### Mosque Profile Fields

- mosque/surau name
- type: masjid, surau
- address
- district
- state
- postcode
- latitude
- longitude
- phone
- email
- website/social links
- kariah boundary description
- male prayer capacity
- female prayer capacity
- parking capacity
- facilities list
- OKU access status
- wudhu area details
- toilets
- imam/bilal/khatib/AJK list
- donation fund balance display setting
- Khairat availability
- public status: active, pending, suspended, under review

### Acceptance Criteria

- User can view nearest mosques based on GPS.
- User can search mosques manually.
- User can filter mosque results.
- User can open mosque profile and open directions in an external maps app (deep link).
- Suspended or unapproved mosques must not appear publicly.

---

## Module C — Prayer Times and Qiblat

### Features

- **MVP:** Prayer times served by **your API** from stored data (per zone/date), populated by admin/authority import or internal tooling — not a live JAKIM dependency.
- **Post-MVP:** Optional sync from JAKIM e-Solat (or equivalent official source) with caching and fallback.
- Display:
  - Subuh
  - Syuruk
  - Zohor
  - Asar
  - Maghrib
  - Isyak
- Location-based prayer zone selection
- Manual state/zone selection
- Mosque-level jamaat time configuration
- Countdown to next prayer / jamaat
- **Post-MVP:** Push notification reminders (APNs / FCM); MVP may use in-app banners or omit pushes
- Offline cached prayer times
- Qiblat compass

### Acceptance Criteria

- User can view prayer times based on current location.
- User can manually choose prayer zone.
- Mosque admin can set jamaat times separately from official azan times.
- Prayer times remain available offline from latest cache.
- **Post-MVP:** User can enable or disable push-based prayer notifications (MVP: optional in-app reminder toggles only, if implemented).

---

## Module D — 3D / Interior Mosque Mapping

### MVP Approach

Because full 3D engine is TBD, MVP should implement a practical **interactive floor plan / indoor map placeholder** first.

### MVP Features

- Mosque admin can upload floor plan image or PDF.
- Admin can define labelled zones:
  - male prayer hall
  - female prayer hall
  - wudhu area
  - toilets
  - admin office
  - library
  - parking
  - OKU route
- User can view interactive floor plan on mosque profile.
- Capacity indicators can be displayed by section.

### Future Upgrade

- 3D model support
- Google Indoor Maps integration (post-MVP; not required for MVP)
- custom 3D mosque walkthrough
- CAD/floor-plan conversion

### Acceptance Criteria

- Mosque profile can display a floor plan.
- Zones can be labelled.
- OKU route can be highlighted.
- The module can later be upgraded to full 3D without changing mosque profile architecture.

---

## Module E — Donations / Tabung Derma

### Features

- Donate to selected mosque (**MVP:** pledge + bank transfer instructions and/or admin-recorded payment; **post-MVP:** live gateway)
- **Post-MVP payment methods** (when gateway integration is enabled):
  - FPX / online banking
  - credit/debit card
  - Touch 'n Go eWallet
  - GrabPay
  - Boost
- Fixed donation amount
- Custom donation amount
- Anonymous donation option
- Recurring monthly donation option (**post-MVP** with gateway; MVP may be manual renewal tracking)
- Receipt generation (MVP: PDF/receipt after admin confirms or after user uploads proof — product choice; post-MVP: auto on webhook)
- User donation history
- Mosque donation transaction list
- Mosque Tabung balance
- **Post-MVP:** Payment webhook handling

### Important Rules

- **Post-MVP:** Never store raw card details; use PCI-DSS compliant payment gateway; webhooks for status.
- **MVP:** If recording bank transfers, store reference numbers and audit who confirmed payment.
- Donation receipt policy: define whether receipt is issued on admin confirmation (MVP) or only after gateway success (post-MVP).
- Anonymous donations should hide donor name from public display but still retain internal transaction record for audit.

### Acceptance Criteria

- **MVP:** User can complete an intended donation flow (e.g. instructions + recorded contribution or admin-confirmed payment) and see history where applicable.
- **Post-MVP:** Payment webhook updates transaction status; receipt after gateway success.
- Mosque admin can view donation list and fund balance.
- User can view personal donation history.

---

## Module F — Khairat Kematian User Module

### Features

- View mosques offering Khairat scheme
- View scheme details and benefits
- Apply for Khairat membership
- Submit personal and family details
- Upload required documents
- Pay annual or periodic subscription (**post-MVP** with payment gateway; MVP: manual fee recording / bank transfer + admin activation)
- View membership status
- View contribution history
- Receive renewal reminder
- Download digital certificate

### Membership Statuses

- pending_review
- approved
- rejected
- active
- expired
- suspended
- cancelled

### Acceptance Criteria

- User can apply for Khairat membership.
- Mosque admin can approve/reject application.
- User can pay subscription after approval or during application depending on mosque setting.
- User can download certificate after membership becomes active.
- Renewal reminders are sent before expiry.

---

## Module G — User Personalisation

### Features

- Set primary “My Mosque”
- Subscribe/unsubscribe to multiple mosques
- Notification preferences per mosque
- Unified event calendar
- Donation history
- Khairat membership dashboard
- Language selection

### Acceptance Criteria

- User can set one primary mosque.
- User can subscribe to multiple mosques.
- User receives only selected notification categories.
- User dashboard shows relevant mosque, event, donation, and Khairat data.

---

## Module H — Asnaf Finder

### MVP Privacy-Safe Approach

The MVP must protect Asnaf privacy. General users should not see personal Asnaf profiles.

### Features

- General users can see public Asnaf service centres or mosque support points.
- Mosque admins can manage Asnaf records within their kariah.
- Authority users can view aggregated Asnaf statistics by mosque/district/state.
- Individual Asnaf data restricted to authorised users only.

### Asnaf Record Fields

- name
- IC number, encrypted
- phone
- address
- category
- household size
- support status
- assigned mosque
- notes
- documents

### Acceptance Criteria

- General user cannot view individual Asnaf records.
- Mosque admin can view/manage Asnaf under their mosque only.
- Authority can view Asnaf data only within jurisdiction.
- All Asnaf record access is audit logged.

---

# 5. Mosque / Surau Admin Portal MVP

## Module I — Mosque Profile Management

### Features

- Edit mosque basic profile
- Upload mosque images
- Manage capacity and facilities
- Manage public contact details
- Manage jamaat times
- Manage floor plan / interior map
- Manage ceramah library entries (**MVP:** paste video URL + metadata; **post-MVP:** YouTube channel OAuth)
- Submit profile updates for authority verification where required

### Acceptance Criteria

- Mosque admin can maintain accurate mosque profile.
- Public profile updates appear after approval if configured.
- Sensitive profile changes are logged.

---

## Module J — Kariah Management

### Features

- Add/edit/deactivate kariah member
- Store personal details
- Store family unit
- Link spouse, children, dependants, next of kin
- Track contribution history
- Track Khairat status
- Search/filter by name, IC, address, Khairat status
- CSV/Excel bulk import
- Basic demographic reports

### Acceptance Criteria

- Mosque admin can create and manage kariah records.
- Family members can be linked.
- Deactivated members remain in system history.
- Search and filters work accurately.
- Bulk import validates duplicate IC numbers and invalid formats.

---

## Module K — Financial Management

### Features

- Income recording
- Expense recording
- Categories:
  - Tabung Masjid donations
  - Khairat subscriptions
  - rental income
  - zakat fitrah collection
  - Friday collection / kutipan Jumaat
  - government grants
  - utilities
  - maintenance
  - staff salaries
  - event costs
  - statutory contributions
- Budget planning
- Actual vs budget tracking
- Bank reconciliation
- Simple cashflow dashboard
- Detailed ledger
- Monthly/quarterly/annual reports
- Export PDF/Excel
- Full audit trail

### Acceptance Criteria

- Treasurer can record income and expenses.
- Mosque admin can view dashboard balance.
- Reports can be generated within expected performance target.
- Authority can only view read-only summary.
- All edits and deletions are audit logged.

---

## Module L — Events and Content Management

### Features

- Create/edit/delete/publish event
- Event categories:
  - ceramah
  - kuliah
  - community programme
  - Ramadan activities
  - Hari Raya
  - gotong-royong
  - other
- Add date/time/location/capacity
- Upload flyer/image
- Schedule announcement
- Display event on public mosque profile
- **Post-MVP:** Push event notification to subscribed users (MVP: in-app feed / optional email when SMTP integrated)
- Mark event as registration-required placeholder for Phase 2

### Acceptance Criteria

- Admin can publish event.
- User can view event on mosque profile.
- **MVP:** Subscribed users see updates in-app; **post-MVP:** push notifications.
- Event can be scheduled and unpublished.

---

## Module M — Ceramah Library (MVP) / YouTube Integration (post-MVP)

### MVP features (no YouTube API)

- Mosque admin creates ceramah entries with **metadata** and a **pasted YouTube URL** (or other video link); no OAuth, no upload-to-YouTube from the app.
- Display ceramah library on mosque profile (list + play in external YouTube app or embedded WebView **using the URL only** — no Data API dependency).
- Save video metadata:
  - speaker / ustaz name
  - topic
  - date
  - duration
  - category
  - video URL

### Post-MVP features (YouTube Data API v3)

- Link mosque YouTube channel via OAuth
- Upload video and auto-publish via API
- Pull basic analytics (views, watch time) if available

### Acceptance Criteria

- **MVP:** Admin can add/edit ceramah entries with URL + metadata; public users can browse the library.
- **Post-MVP:** OAuth connection, upload/publish, and failed-upload retry flows.

---

## Module N — Khairat Kematian Admin

### Features

- Manage Khairat scheme settings
- Register members
- Review applications
- Track subscriptions
- Generate certificates
- Manage claims
- Upload claim documents
- Approve/reject claims
- Record payouts
- Monitor Khairat fund balance
- Generate reports:
  - membership list
  - contribution summary
  - claims history
- Auto-send renewal reminders

### Acceptance Criteria

- Admin can approve user application.
- System tracks member subscription expiry.
- Certificate can be generated.
- Claim workflow supports submission, review, approval, payout, and closure.
- Khairat fund balance reflects contributions and payouts.

---

## Module O — Facility Management

### Features

- Area zoning setup
- Cleaning schedule
- Staff/volunteer assignment
- Task completion tracking
- Maintenance request logging
- Maintenance status:
  - reported
  - in_progress
  - resolved
  - cancelled
- Internal room booking calendar
- Approve/reject booking requests
- Duty roster

### Acceptance Criteria

- Admin can create facility areas.
- Admin can assign cleaning/maintenance tasks.
- Task assignee can update completion status.
- Room booking calendar prevents double booking.
- Facility history is searchable.

---

## Module P — Statutory Obligations

### Features

- Receive official circulars/memos/directives from authority
- Submit statutory reports to authority
- Submission statuses:
  - draft
  - submitted
  - pending_review
  - approved
  - returned_for_amendment
  - rejected
- Document archive
- Deadline reminders
- Auto-generate basic financial/operational report from system data

### Acceptance Criteria

- Authority can send circular to mosque admins.
- Mosque admin receives notification.
- Mosque admin can submit required report.
- Authority can approve or return report for amendment.
- All documents remain searchable in archive.

---

## Module Q — Notifications and Communications

### Features

- Mosque admin broadcast to subscribers
- Target groups:
  - all subscribers
  - kariah members
  - Khairat members
  - event attendees
- In-app notification
- Push notification
- Email for admin/authority messages
- Scheduled notifications
- Notification history
- Delivery/read status where possible

### Acceptance Criteria

- Admin can send notification to selected audience.
- User receives notification according to preference.
- Notification history is visible to sender.
- Scheduled notifications are sent at correct time.

---

## Module R — Private Kariah Community Board

### Features

- Verified kariah members can post comments/questions
- Admin moderation:
  - approve
  - hide
  - delete
  - flag
  - pin
- Comment notifications to admin
- Private access only for verified kariah members

### Acceptance Criteria

- Non-kariah users cannot access board.
- Kariah members can post comments.
- Admin can moderate content.
- Pinned posts appear at the top.

---

# 6. Religious Authority Portal MVP

## Module S — Authority Dashboard

### Features

- State-level dashboard
- National dashboard for super admin
- KPI cards:
  - total mosques
  - total suraus
  - active profiles
  - inactive profiles
  - pending approvals
  - suspended profiles
  - officer vacancy alerts
  - pending statutory submissions
- Drill-down:
  - National > State > District > Mosque
- Activity feed:
  - new mosque applications
  - profile updates
  - statutory submissions
  - cooperative event RSVPs

### Acceptance Criteria

- State authority sees only assigned state.
- National super admin sees national overview.
- Dashboard data is accurate and filtered by jurisdiction.

---

## Module T — Mosque Governance

### Features

- Register mosque/surau
- Review mosque self-registration applications
- Approve/reject mosque
- Verify profile information
- Set status:
  - active
  - pending_approval
  - suspended
  - under_review
- Define kariah boundary
- Classify mosque:
  - Masjid Negeri
  - Masjid Daerah
  - Masjid Kariah
  - Surau
- Store official documents

### Acceptance Criteria

- Authority can approve mosque before it appears publicly.
- Suspended mosque is hidden or clearly disabled from public actions.
- Mosque classification and jurisdiction control are enforced.

---

## Module U — Officer Appointments

### Features

- Appoint:
  - Imam
  - Bilal
  - Khatib
  - AJK
- Set tenure start/end date
- Transfer officer between mosques
- End appointment
- Vacancy dashboard
- Automatic notification to mosque admin
- Appointment shown on public profile
- Audit log for every appointment action

### Acceptance Criteria

- Authority can appoint officer to mosque.
- Mosque admin is notified.
- Public profile reflects appointment.
- Appointment history is preserved.

---

## Module V — Financial Oversight

### Features

- Read-only mosque financial summary
- View total income
- View total expenses
- View current fund balance
- View Khairat fund balance
- View submitted reports
- Download reports
- Send financial query to mosque admin
- Audit all authority financial views

### Acceptance Criteria

- Authority cannot edit mosque financial records.
- Authority can view only mosques within jurisdiction.
- Financial query can be sent and tracked.

---

## Module W — Authority Communications

### Features

- Create official memo/circular/announcement
- Target by:
  - all state mosques
  - district
  - mosque type
  - selected mosques
- Attach PDF/images
- Mark urgent
- Send by:
  - in-app
  - push
  - email
- Read receipt
- Archive sent communications

### Acceptance Criteria

- Authority can broadcast circular.
- Mosque admin receives notification.
- Read receipt is captured where possible.
- Circular remains archived and searchable.

---

## Module X — Cooperative Events

### Features

- Create state/multi-mosque event
- Invite selected/all mosques
- Mosque RSVP:
  - confirmed
  - tentative
  - unable_to_participate
- RSVP tracker
- Reminder to non-respondents
- Post-event attendance record
- Attach event report

### Acceptance Criteria

- Authority can create cooperative event.
- Mosque admin can RSVP.
- Authority can track responses.
- Reminder can be sent to non-respondents.

---

## Module Y — Multi-Authority Access Control

### Features

- National super admin account management
- State authority admin management
- State authority officer permission assignment
- Jurisdiction enforcement
- Permission matrix
- Audit logs

### Acceptance Criteria

- State authority users cannot access other states.
- Permission changes are logged.
- National super admin can manage authority accounts.

---

# 7. Recommended Database Entities

**MVP vs schema completeness:** Some entities below exist for the **integrations phase** (e.g. `payment_intents`, `payment_webhooks`, `youtube_connections`). For MVP you may implement them as **nullable / unused** tables, omit them until Phase 2, or model donations with simpler tables (`donation_transactions` only) and migrate later.

## 7.1 Core Entities

- users
- user_profiles
- roles
- permissions
- user_roles
- states
- districts
- mosques
- mosque_profiles
- mosque_facilities
- mosque_images
- mosque_floor_plans
- mosque_zones
- mosque_subscriptions
- mosque_admin_assignments
- authority_users
- audit_logs

## 7.2 Prayer Entities

- prayer_zones
- prayer_times_cache
- mosque_jamaat_times
- prayer_notification_preferences

## 7.3 Donation Entities

- donation_transactions
- payment_intents
- payment_webhooks
- donation_receipts
- recurring_donations

## 7.4 Khairat Entities

- khairat_schemes
- khairat_memberships
- khairat_applications
- khairat_contributions
- khairat_certificates
- khairat_claims
- khairat_payouts
- khairat_documents

## 7.5 Kariah Entities

- kariah_members
- family_units
- family_relationships
- member_contributions
- asnaf_records

## 7.6 Finance Entities

- financial_accounts
- financial_categories
- financial_transactions
- budgets
- bank_reconciliations
- financial_reports
- financial_queries

## 7.7 Events and Content Entities

- events
- event_categories
- event_attendees
- announcements
- content_posts
- ceramah_videos
- youtube_connections

## 7.8 Facility Entities

- facility_areas
- facility_tasks
- cleaning_schedules
- maintenance_requests
- room_bookings
- duty_rosters

## 7.9 Statutory and Authority Entities

- statutory_circulars
- statutory_submissions
- statutory_documents
- officer_appointments
- authority_announcements
- cooperative_events
- cooperative_event_rsvps

## 7.10 Community Entities

- community_posts
- community_comments
- moderation_actions

## 7.11 Notification Entities

- notifications
- notification_recipients
- notification_preferences
- push_tokens
- email_logs

---

# 8. API Structure

## 8.1 Public / User APIs

```http
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/me
PATCH  /api/me
```

```http
GET    /api/mosques
GET    /api/mosques/nearby
GET    /api/mosques/:id
GET    /api/mosques/:id/events
GET    /api/mosques/:id/ceramah
GET    /api/mosques/:id/floor-plan
POST   /api/mosques/:id/subscribe
DELETE /api/mosques/:id/subscribe
POST   /api/users/my-mosque
```

```http
GET    /api/prayer-times
GET    /api/prayer-times/zones
GET    /api/mosques/:id/jamaat-times
PATCH  /api/users/prayer-notification-preferences
```

```http
POST   /api/donations
GET    /api/donations/history
GET    /api/donations/:id/receipt
# POST   /api/payments/webhook   — post-MVP (payment gateway phase)
```

```http
GET    /api/khairat/schemes
POST   /api/khairat/applications
GET    /api/khairat/memberships/me
GET    /api/khairat/contributions/me
GET    /api/khairat/certificates/:id
```

---

## 8.2 Mosque Admin APIs

```http
GET    /api/admin/mosque/profile
PATCH  /api/admin/mosque/profile
POST   /api/admin/mosque/images
POST   /api/admin/mosque/floor-plans
POST   /api/admin/mosque/zones
PATCH  /api/admin/mosque/jamaat-times
```

```http
GET    /api/admin/kariah-members
POST   /api/admin/kariah-members
GET    /api/admin/kariah-members/:id
PATCH  /api/admin/kariah-members/:id
DELETE /api/admin/kariah-members/:id
POST   /api/admin/kariah-members/import
GET    /api/admin/kariah-reports
```

```http
GET    /api/admin/finance/summary
GET    /api/admin/finance/transactions
POST   /api/admin/finance/transactions
PATCH  /api/admin/finance/transactions/:id
DELETE /api/admin/finance/transactions/:id
GET    /api/admin/finance/budgets
POST   /api/admin/finance/budgets
GET    /api/admin/finance/reports
POST   /api/admin/finance/reconciliations
```

```http
GET    /api/admin/events
POST   /api/admin/events
PATCH  /api/admin/events/:id
DELETE /api/admin/events/:id
POST   /api/admin/announcements
GET    /api/admin/announcements
```

```http
# POST   /api/admin/youtube/connect   — post-MVP (YouTube OAuth)
# POST   /api/admin/ceramah/upload    — post-MVP if using YouTube Data API upload
POST   /api/admin/ceramah
GET    /api/admin/ceramah
PATCH  /api/admin/ceramah/:id
DELETE /api/admin/ceramah/:id
```

```http
GET    /api/admin/khairat/applications
PATCH  /api/admin/khairat/applications/:id/status
GET    /api/admin/khairat/memberships
POST   /api/admin/khairat/certificates
POST   /api/admin/khairat/claims
PATCH  /api/admin/khairat/claims/:id
POST   /api/admin/khairat/payouts
GET    /api/admin/khairat/reports
```

```http
GET    /api/admin/facilities/areas
POST   /api/admin/facilities/areas
GET    /api/admin/facilities/tasks
POST   /api/admin/facilities/tasks
PATCH  /api/admin/facilities/tasks/:id
GET    /api/admin/facilities/maintenance
POST   /api/admin/facilities/maintenance
PATCH  /api/admin/facilities/maintenance/:id
GET    /api/admin/facilities/bookings
POST   /api/admin/facilities/bookings
PATCH  /api/admin/facilities/bookings/:id/status
```

```http
GET    /api/admin/statutory/circulars
GET    /api/admin/statutory/submissions
POST   /api/admin/statutory/submissions
PATCH  /api/admin/statutory/submissions/:id
GET    /api/admin/statutory/archive
```

```http
POST   /api/admin/notifications
GET    /api/admin/notifications/history
GET    /api/admin/community/posts
PATCH  /api/admin/community/posts/:id/moderate
```

---

## 8.3 Authority APIs

```http
GET    /api/authority/dashboard
GET    /api/authority/mosques
POST   /api/authority/mosques
GET    /api/authority/mosques/:id
PATCH  /api/authority/mosques/:id/status
PATCH  /api/authority/mosques/:id/verify
POST   /api/authority/mosques/:id/documents
```

```http
GET    /api/authority/appointments
POST   /api/authority/appointments
PATCH  /api/authority/appointments/:id
POST   /api/authority/appointments/:id/transfer
POST   /api/authority/appointments/:id/end
GET    /api/authority/vacancies
```

```http
GET    /api/authority/finance/mosques/:id/summary
GET    /api/authority/finance/mosques/:id/reports
POST   /api/authority/finance/mosques/:id/query
```

```http
POST   /api/authority/circulars
GET    /api/authority/circulars
GET    /api/authority/circulars/:id/read-receipts
POST   /api/authority/cooperative-events
GET    /api/authority/cooperative-events
GET    /api/authority/cooperative-events/:id/rsvps
POST   /api/authority/cooperative-events/:id/reminders
```

```http
GET    /api/authority/users
POST   /api/authority/users
PATCH  /api/authority/users/:id
DELETE /api/authority/users/:id
```

---

# 9. MVP Screens

## 9.1 Mobile App Screens

### Guest / Public
- Splash screen
- Language selection
- Login/register
- Home
- Mosque finder map
- Mosque finder list
- Mosque profile
- Prayer times
- Qiblat compass
- Event details
- Ceramah library

### Registered User
- User dashboard
- My Mosque
- Subscribed mosques
- Donation flow (MVP: record / bank-in; post-MVP: in-app gateway)
- Donation history
- Khairat application
- Khairat membership status
- Digital certificate
- Notifications
- Profile settings
- Notification preferences

### Kariah Member
- Private community board
- Post/comment view
- Member-specific announcements

---

## 9.2 Mosque Admin Web Screens

- Admin login
- Mosque dashboard
- Mosque profile management
- Kariah member list
- Kariah member detail
- Family unit management
- Bulk import
- Finance dashboard
- Income/expense ledger
- Budget planner
- Bank reconciliation
- Financial reports
- Event management
- Announcement management
- Ceramah library (URL + metadata)
- Khairat applications
- Khairat memberships
- Khairat claims
- Khairat payout records
- Facility areas
- Cleaning schedules
- Maintenance requests
- Room bookings
- Statutory circular inbox
- Statutory submission page
- Notification broadcast
- Community board moderation
- Audit log view, if permitted

---

## 9.3 Authority Web Screens

- Authority login
- State dashboard
- National dashboard, super admin only
- Mosque approval queue
- Mosque profile verification
- Mosque status management
- Officer appointment management
- Vacancy dashboard
- Financial oversight summary
- Financial query page
- Circular composer
- Circular archive
- Cooperative event management
- RSVP tracker
- Authority user management
- Audit logs

---

# 10. Integrations (post-MVP / Phase 2)

**MVP does not require any of the following to be built or switched on for launch** (see §2.6). Implement native apps and backend first; add integrations in a dedicated phase after core journeys and ops are stable.

Planned integration backlog (same capabilities as previously specified, deferred):

| # | Integration | Purpose (when enabled) |
|---|----------------|-------------------------|
| 10.1 | JAKIM e-Solat (or official successor) | Live official prayer times by zone; daily sync; offline cache |
| 10.2 | Maps SDK (vendor TBD) | Embedded maps, markers, advanced routing (MVP uses deep links only) |
| 10.3 | Payment gateway + webhooks | FPX/cards/e-wallets; automated receipt on success |
| 10.4 | YouTube Data API v3 | OAuth per mosque; upload/publish; analytics |
| 10.5 | Push (FCM + APNs) + optional SMTP | Reminders and transactional email |

Native stack reminder: **APNs** (Swift/iOS) and **FCM** (Java/Android) are the typical pair when this phase starts.

---

# 11. Security and Compliance Requirements

## 11.1 Security

- HTTPS only
- TLS 1.2 or higher
- Password hashing with bcrypt/argon2
- JWT access token with short expiry
- Refresh token rotation
- RBAC at API and UI level
- Field-level encryption for IC numbers and sensitive records
- Audit logs for sensitive actions
- MFA for admin and authority accounts
- Rate limiting for auth and sensitive write endpoints (extend to payment webhooks when gateway phase is enabled)
- Secure file upload validation
- Virus scanning for uploaded documents if possible

## 11.2 Privacy

- PDPA-compliant user consent
- Privacy policy acceptance during registration
- Data access, correction, and deletion request mechanism
- Sensitive Asnaf data hidden from public users
- Mosque admin data not visible across states
- Financial records retained according to defined retention policy

## 11.3 Audit Log Events

Audit the following:

- login/logout for admin and authority
- failed login attempts
- mosque profile changes
- role/permission changes
- financial record create/edit/delete
- donation / contribution status changes (including admin-confirmed bank-in for MVP)
- Khairat application approval/rejection
- Khairat claim approval/payout
- officer appointment/transfer/end
- authority circular send
- statutory submission actions
- Asnaf record view/create/edit/delete
- document upload/download for sensitive records

---

# 12. Non-Functional Requirements

## Performance

- App launch target: under 3 seconds on standard 4G.
- GPS mosque search: under 2 seconds.
- Cached prayer time response: under 500ms.
- Financial report generation: under 10 seconds for up to 12 months of data.
- Architecture should support future national scale.

## Availability

- Target uptime: 99.5% or higher.
- Daily database backup.
- 30-day backup retention.
- Disaster recovery target RTO under 4 hours.

## Accessibility

- Bilingual BM/English.
- Mobile-first design.
- Minimum readable font size.
- WCAG 2.1 AA colour contrast.
- Screen reader support where possible.
- OKU-friendly UI considerations.

## Scalability

- Multi-tenant design.
- Jurisdiction-aware data model.
- Modular architecture for Phase 2 and Phase 3 expansion.
- API-first structure.

---

# 13. MVP Development Milestones

## Milestone 1 — Foundation

- Project setup
- Database schema
- Authentication
- RBAC
- Audit log framework
- Bilingual framework
- File upload service (local filesystem on VPS; storage abstraction ready for optional S3-compatible backend later)
- Basic admin layouts

## Milestone 2 — Mosque Directory and Prayer Features

- Mosque database
- Mosque profile
- Map/list search
- GPS search (server-side geospatial or simple radius; maps deep link for directions)
- Prayer times from **stored data** (admin/authority import or seed); device cache; jamaat configuration
- Qiblat compass
- My Mosque/subscriptions

## Milestone 3 — Mosque Admin Core

- Mosque profile management
- Kariah management
- Events/announcements
- Facility management basics
- Notification broadcast

## Milestone 4 — Payments, Donations, and Khairat

- Donation and Khairat **recording** flows (manual / bank transfer / admin confirmation) — **no payment gateway required for MVP**
- Receipt generation (aligned with chosen MVP confirmation model)
- Khairat application
- Khairat admin review
- Subscription / renewal tracking (manual or admin-marked paid until gateway phase)
- Certificate generation
- **Post-Milestone:** Payment gateway + webhooks (Phase 2)

## Milestone 5 — Finance and Reports

- Income/expense records
- Budget planning
- Finance dashboard
- Reports
- Authority read-only financial summary

## Milestone 6 — Authority Portal

- Authority dashboard
- Mosque approval workflow
- Officer appointment system
- Circulars
- Cooperative events
- Jurisdiction control

## Milestone 7 — Ceramah, Interior Map, and Final MVP Hardening

- Ceramah library (**URL + metadata**, no YouTube API)
- Floor plan/interior map upload
- Security testing
- QA testing
- UAT preparation
- Production deployment

---

# 14. MVP Testing Checklist

## Functional Testing

- User registration/login
- Role permission enforcement
- Mosque search by GPS
- Mosque search by keyword
- Mosque profile display
- Prayer time display
- Prayer notification preferences (UI only or in-app; push post-MVP)
- Qiblat compass
- Donation recording / confirmation flow (MVP); gateway success/failure (post-MVP)
- Receipt generation
- Khairat application
- Khairat approval/rejection
- Kariah member management
- Finance transaction entry
- Financial reports
- Event creation; subscriber sees update in-app (push post-MVP)
- Ceramah library CRUD (URL + metadata)
- Facility task management
- Statutory circular and submission
- Authority approval workflow
- Officer appointment
- Cooperative event RSVP

## Security Testing

- Unauthorized API access
- Cross-state access prevention
- Cross-mosque access prevention
- Payment webhook validation (**post-MVP**, when gateway enabled)
- File upload validation
- Rate limiting
- Audit log creation
- Sensitive data encryption

## Performance Testing

- Mosque search response time
- Prayer time cache response time
- Report generation time
- Concurrent user simulation
- Push notification delivery (**post-MVP**)

## UAT Testing

- General user journey
- Mosque admin journey
- Treasurer journey
- State authority journey
- National super-admin journey

---

# 15. Items To Confirm Before Development Kickoff

The following decisions must be finalised before or during early sprint planning:

1. User identity verification method: email/phone only, MyKad, or social login (social login **post-MVP** unless explicitly in scope).
2. Mosque onboarding pathway: self-register pending approval or authority-created only.
3. **Post-MVP:** Preferred Maps SDK (Google Maps, OpenStreetMap, or local provider) — MVP uses deep links only.
4. 3D/interior mapping approach: floor plan MVP, indoor map, or full 3D.
5. **Post-MVP:** Payment gateway provider and webhook strategy.
6. Cloud hosting provider (MVP may be single VPS).
7. Exact statutory submission formats.
8. Whether public donation fund balance should always be visible or controlled by mosque admin.
9. Whether Khairat payment occurs before or after approval.
10. Whether mosque admin accounts are created by authority or invited by mosque.

---

# 16. Out of Scope for MVP

The following should not block MVP launch:

- Third-party **integrations** listed in §10 (JAKIM live feed, embedded Maps SDK, payment gateway + webhooks, YouTube Data API, FCM/APNs, SMTP) — entire phase is after MVP
- Full government system integration
- Legacy data migration from existing mosque systems
- Full 3D mosque walkthrough engine
- WhatsApp/SMS gateway
- Paid event ticketing
- Paid class/programme registration
- External facility rental monetisation
- Annual mosque subscription billing
- Staff attendance and payroll integration
- Full statutory workflow embedment as official national infrastructure

These items should remain in Phase 2 or Phase 3 roadmap.

---

# 17. Definition of Done for MVP

The MVP is considered complete when:

1. General users can search mosques, view mosque profiles, prayer times, events, donate, and apply for Khairat.
2. Mosque admins can manage mosque profile, kariah, finance, events, Khairat, facilities, announcements, statutory submissions, and community board.
3. Authority users can approve mosques, manage officer appointments, view dashboards, send circulars, view read-only financial summaries, and manage cooperative events.
4. Role-based and jurisdiction-based access control is enforced.
5. **No third-party integration is required for MVP sign-off** (§2.6): prayer data is served from your stack; maps open externally; donations/Khairat fees can be recorded without a gateway; ceramah uses stored URLs; pushes/email providers are optional post-MVP.
6. Audit logging is active for all sensitive actions.
7. Bilingual BM/English UI is available.
8. Security, privacy, and basic performance requirements are met.
9. The system is deployable to staging and production environments.
10. UAT feedback from pilot users has been resolved or logged for post-MVP enhancement.

---

# 18. Developer Notes

- Build the system as a modular platform, not a one-off mosque app.
- Every record should belong to a mosque, state, authority, or user context where applicable.
- Avoid hardcoding Malaysian states, mosque categories, or authority names; use configurable tables.
- Use UUID/CUID primary keys.
- Use soft delete for important operational records.
- Keep financial and Khairat records immutable where possible. Use adjustment entries instead of destructive edits.
- All public data must come only from approved mosque profiles.
- All admin dashboards must be filtered by role and jurisdiction.
- Design Phase 2 and Phase 3 modules as inactive feature flags where possible.

---

# 19. Suggested Environment Variables

```env
NODE_ENV=development
APP_URL=http://localhost:5173
API_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/imarah
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=change_me
JWT_REFRESH_SECRET=change_me
ENCRYPTION_KEY=change_me_32_bytes
# Storage — MVP: local filesystem on the VPS (use absolute path; persist in backups)
STORAGE_DRIVER=local
UPLOAD_ROOT=/var/lib/imarah/uploads
# Base URL used to build public URLs for files served statically (adjust for your VPS domain)
PUBLIC_FILES_BASE_URL=https://api.example.com/files

# --- Post-MVP (integrations phase) — omit from .env until needed ---
# JAKIM_ESOLAT_BASE_URL=
# MAPS_API_KEY=
# PAYMENT_GATEWAY_SECRET=
# PAYMENT_WEBHOOK_SECRET=
# YOUTUBE_CLIENT_ID=
# YOUTUBE_CLIENT_SECRET=
# FCM_SERVER_KEY=
# SMTP_HOST=
# SMTP_PORT=
# SMTP_USER=
# SMTP_PASS=
```

---

# 20. Final Build Priority

For fastest MVP delivery, build in this priority order:

1. Authentication, RBAC, jurisdiction control, audit logs
2. Mosque directory, mosque profile, external-map deep links, stored prayer times + jamaat
3. User personalisation, in-app activity / My Mosque (push later)
4. Mosque admin profile, kariah, events, announcements
5. Donations and Khairat
6. Finance management and read-only authority financial oversight
7. Authority dashboard, mosque approval, officer appointments, circulars
8. Facility management, community board, statutory submissions
9. Ceramah library (URL + metadata) and interior map/floor plan
10. QA, security hardening, deployment, UAT

