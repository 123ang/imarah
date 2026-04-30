# IMARAH MVP Development To-Do List

**Project:** IMARAH — Integrated Ummah Centre of Excellence Management System  
**MVP Direction:** Use IMARAH's own stored database/API first. External integrations such as JAKIM e-Solat should be added later as sync/import services, not as blocking dependencies for the first build.

**Implementation status (repo):** Monorepo `web` + `backend` + Prisma + Docker Compose; migrasi `wave2_domain` menambah jadual domain (kariah, acara, pengumuman, kemudahan, derma rekod, Khairat, kewangan, janji temu pegawai, pemberitahu, dll.). API: auth (termasuk lupa/reset kata laluan & token sah e-mel), RBAC scoped masjid/negeri (`requireSuperOrMosqueAdminFor`, `requireSuperStateOrMosque`), `PATCH /api/mosques/:id/jamaat-times`, import waktu solat CSV + JSON, stub `POST /api/admin/jakim/sync`, jemputan pentadbir masjid (`POST /api/admin/invite-mosque-admin`), pembantu penyulitan medan (`crypto-field`). **E-mel transaksian (SMTP)** dan **apl native** masih luar skop pangkalan kod ini untuk kebanyakannya. Item bertajuk Mudah Alih sahaja kekal `[ ]` melainkan ciri sama wujud di web awam (cth. masa solat pada halaman masjid).

---

## 0. Core MVP Decision

### Prayer Times Direction

- [x] Store prayer zones in IMARAH database.
- [x] Store prayer times by zone and date in IMARAH database.
- [x] Serve prayer times from IMARAH backend API.
- [x] Allow admin/system operator to import prayer time data manually by CSV/Excel/JSON.
- [ ] Cache prayer times for offline mobile use.
- [x] Do **not** make mobile app or frontend depend directly on JAKIM API during MVP.
- [ ] Add JAKIM e-Solat integration later as a background sync/import service.
- [x] Keep mosque jamaat times separate from official azan/prayer times.
- [x] Mosque admins can configure jamaat times only.
- [x] Mosque admins cannot modify official prayer time records.

---

# Phase 1 — Project Foundation

## 1. Repository and Project Setup

- [x] Create monorepo structure.
- [x] Create backend app.
- [x] Create web admin portal app.
- [x] Create mobile app project.
- [ ] Add shared API/types package if needed.
- [x] Configure TypeScript.
- [x] Configure ESLint and Prettier.
- [x] Configure environment files.
- [x] Add Docker Compose for local development.
- [x] Add PostgreSQL service.
- [x] Add Redis service.
- [x] Add local upload storage volume.
- [x] Add README setup instructions.

## 2. Infrastructure Baseline

- [x] Create development environment.
- [x] Create staging environment.
- [x] Create production environment plan.
- [x] Configure Docker build.
- [x] Configure NGINX reverse proxy plan.
- [x] Configure HTTPS requirement.
- [x] Define backup strategy for PostgreSQL.
- [x] Define backup strategy for uploaded files.
- [x] Define deployment checklist.

## 3. Database Foundation

- [x] Install Prisma.
- [x] Configure PostgreSQL connection.
- [x] Create initial Prisma schema.
- [x] Use UUID/CUID primary keys.
- [x] Add created_at and updated_at fields.
- [x] Add soft delete fields where needed.
- [x] Add audit log table.
- [x] Add file upload table.
- [x] Add state/district reference tables.
- [x] Add configurable lookup tables instead of hardcoding values.
- [x] Add database seed script.
- [x] Add migration workflow.

---

# Phase 2 — Authentication, Roles, and Security

## 4. Authentication

- [x] Implement user registration.
- [x] Implement login.
- [x] Implement logout.
- [x] Implement forgot password.
- [x] Implement password reset.
- [x] Implement email verification.
- [x] Implement refresh token rotation.
- [x] Implement session timeout.
- [x] Hash passwords with bcrypt or argon2.
- [x] Add admin invitation flow.
- [x] Add MFA structure for admin and authority users.
- [x] Add language preference to user profile.

## 5. Roles and Permissions

- [x] Define system roles.
- [x] Implement RBAC middleware.
- [x] Implement frontend route guards.
- [x] Implement mosque-level access control.
- [x] Implement state-level jurisdiction control.
- [ ] Implement national read-only access rules.
- [ ] Prevent authority users from editing mosque-owned financial records.
- [x] Add permission seed data.
- [ ] Add tests for role restrictions.

## 6. Security Baseline

- [x] Enforce HTTPS in production.
- [x] Add rate limiting.
- [x] Add request validation with Zod/Joi.
- [x] Add secure headers.
- [x] Add CORS configuration.
- [x] Add input sanitisation.
- [x] Encrypt sensitive fields such as IC number.
- [x] Add audit logging middleware.
- [ ] Log all sensitive create/update/delete/approve/reject/view-financial actions.
- [x] Add document access logs.

---

# Phase 3 — Core Mosque Directory

## 7. Mosque and Surau Data Model

- [x] Create mosque/surau table.
- [x] Add type: masjid/surau.
- [x] Add address fields.
- [x] Add district/state/postcode.
- [x] Add latitude/longitude.
- [x] Add contact phone/email.
- [x] Add website/social links.
- [x] Add kariah boundary description.
- [x] Add prayer capacity fields.
- [x] Add parking capacity.
- [x] Add facilities.
- [x] Add OKU access status.
- [x] Add imam/bilal/khatib/AJK structure.
- [x] Add Khairat availability.
- [x] Add public status: active/pending/suspended/under_review.

## 8. Public Mosque Directory API

- [x] List public approved mosques.
- [x] Search by mosque name.
- [x] Search by area/district/state.
- [x] Filter by masjid/surau.
- [x] Filter by facilities.
- [x] Filter by Khairat availability.
- [x] Filter by OKU access.
- [x] Filter by parking availability.
- [x] Add nearest mosque query using latitude/longitude.
- [x] Add mosque detail endpoint.
- [x] Hide suspended/unapproved mosques from public API.

## 9. Public Mosque Directory UI

- [x] Build mosque list screen.
- [x] Build mosque search input.
- [x] Build filters.
- [x] Build mosque detail page.
- [x] Build map view.
- [x] Show distance indicator.
- [x] Add navigation link to Google Maps/Apple Maps.
- [x] Add bilingual labels.

---

# Phase 4 — Prayer Times Using Own Storage

## 10. Prayer Zone Data

- [x] Create prayer zone table.
- [x] Add state.
- [x] Add zone code.
- [x] Add zone name.
- [x] Add districts covered.
- [x] Add active/inactive status.
- [x] Add seed/import script for Malaysian prayer zones.

## 11. Stored Prayer Time Data

- [x] Create prayer time table.
- [x] Store date.
- [x] Store zone ID.
- [x] Store Subuh.
- [x] Store Syuruk.
- [x] Store Zohor.
- [x] Store Asar.
- [x] Store Maghrib.
- [x] Store Isyak.
- [x] Store source field: manual/imported/jakim_future.
- [x] Store import batch ID.
- [x] Prevent duplicate zone/date rows.
- [x] Add validation for time format.

## 12. Prayer Time Import Tools

- [x] Create CSV import format.
- [ ] Create Excel import format.
- [x] Create JSON import format.
- [x] Build backend import endpoint for system/admin users.
- [x] Validate required columns.
- [x] Validate zone/date/time values.
- [ ] Show import preview before confirm.
- [x] Store import batch result.
- [x] Report row-level errors.
- [ ] Support rollback of failed import batch if needed.

## 13. Prayer Time API

- [x] Get prayer time by zone/date.
- [x] Get prayer time by mosque/date using mosque prayer zone.
- [ ] Get prayer time by user location.
- [x] Get prayer time by manually selected zone.
- [x] Return next prayer calculation.
- [x] Return countdown data.
- [ ] Return latest available cached range.
- [x] Handle missing date gracefully.

## 14. Jamaat Time Configuration

- [x] Create mosque jamaat time table.
- [x] Allow mosque admin to set jamaat times.
- [x] Support fixed jamaat time.
- [ ] Support offset from azan time if required.
- [x] Show official prayer time separately from jamaat time.
- [x] Audit log jamaat time changes.

## 15. Mobile Prayer Time Features

- [ ] Show daily prayer times.
- [ ] Show next prayer countdown.
- [ ] Allow current location zone detection.
- [ ] Allow manual zone selection.
- [ ] Cache latest prayer time data offline.
- [ ] Add Qiblat compass.
- [ ] Add notification preference UI, even if push is post-MVP.

## 16. Future JAKIM Integration Preparation

- [x] Design JAKIM sync service interface.
- [x] Keep `source` column ready for JAKIM-imported data.
- [x] Add background job placeholder.
- [x] Add retry/failure log structure.
- [x] Add manual override/import fallback.
- [x] Document that JAKIM sync is post-MVP or later MVP enhancement.

---

# Phase 5 — Mosque Admin Portal

## 17. Mosque Admin Dashboard

- [ ] Build admin login routing.
- [ ] Build mosque admin layout.
- [ ] Build dashboard summary cards.
- [ ] Show mosque profile completeness.
- [ ] Show pending Khairat applications.
- [ ] Show recent donations.
- [ ] Show upcoming events.
- [ ] Show announcements status.

## 18. Mosque Profile Management

- [ ] Mosque admin can edit mosque profile.
- [ ] Upload mosque images.
- [ ] Manage contact details.
- [ ] Manage facilities.
- [ ] Manage accessibility details.
- [ ] Manage capacity details.
- [ ] Manage public visibility setting.
- [ ] Submit changes for authority review if required.
- [ ] Audit log profile changes.

## 19. Kariah Management

- [x] Create kariah member table.
- [ ] Add member manually.
- [ ] Import members by CSV/Excel.
- [ ] Search members.
- [ ] Filter members.
- [ ] Verify member status.
- [ ] Update member household details.
- [ ] Export member list.
- [x] Protect sensitive member data.

## 20. Events and Announcements

- [x] Create event table.
- [x] Create announcement table.
- [ ] Mosque admin can create event.
- [ ] Mosque admin can edit event.
- [ ] Mosque admin can cancel event.
- [ ] Upload event flyer.
- [ ] Publish/unpublish event.
- [ ] Create announcement.
- [ ] Pin important announcement.
- [ ] Show events and announcements on mosque profile.

## 21. Facility Management

- [x] Create facility table.
- [ ] Add facility availability status.
- [ ] Add opening hours.
- [ ] Add booking/request placeholder if needed.
- [ ] Manage hall/classroom/parking/funeral van/basic assets.
- [ ] Show facilities publicly where enabled.

---

# Phase 6 — Donations and Khairat

## 22. Donation Module

- [ ] Select mosque to donate to.
- [ ] Fixed donation amount.
- [ ] Custom donation amount.
- [ ] Anonymous donation option.
- [ ] Payment gateway integration.
- [ ] Payment webhook handling.
- [ ] Generate receipt after successful payment.
- [ ] User donation history.
- [ ] Mosque admin donation list.
- [ ] Mosque tabung balance summary.
- [ ] Reconciliation status.
- [ ] Refund support decision.

## 23. Khairat User Module

- [ ] Show mosques offering Khairat.
- [ ] Show Khairat scheme details.
- [ ] User can apply for membership.
- [ ] Submit personal details.
- [ ] Submit family/dependent details.
- [ ] Upload required documents.
- [ ] Pay annual/periodic subscription.
- [ ] View application status.
- [ ] View active/expired/suspended status.
- [ ] View contribution history.
- [ ] Download digital certificate.
- [ ] Receive renewal reminder.

## 24. Khairat Admin Module

- [ ] Mosque admin can view applications.
- [ ] Mosque admin can approve/reject applications.
- [ ] Mosque admin can request more information.
- [ ] Mosque admin can manage member status.
- [ ] Mosque admin can record contribution history.
- [ ] Mosque admin can manage claims/death assistance records.
- [ ] Generate Khairat member report.
- [ ] Audit log all Khairat status changes.

---

# Phase 7 — Finance Management

## 25. Mosque Finance Records

- [x] Create finance account/fund table.
- [x] Create transaction table.
- [ ] Record income.
- [ ] Record expenses.
- [ ] Categorise transactions.
- [ ] Upload supporting documents/receipts.
- [ ] Prevent destructive edits where possible.
- [ ] Use adjustment entries for corrections.
- [ ] Generate monthly summary.
- [ ] Generate yearly summary.
- [ ] Export CSV/PDF.
- [ ] Treasurer role can manage finance.
- [ ] Authority role can view read-only summary only.

## 26. Financial Oversight

- [ ] Authority dashboard can view read-only financial summaries.
- [ ] Authority cannot edit mosque financial data.
- [ ] Filter financial oversight by state/district/mosque.
- [ ] Show high-level fund balances.
- [ ] Show report submission status.
- [ ] Audit log financial data views.

---

# Phase 8 — Authority Portal

## 27. Authority Dashboard

- [ ] Build authority login routing.
- [ ] Build authority portal layout.
- [ ] Show mosque count by status.
- [ ] Show pending approvals.
- [ ] Show officer appointment summary.
- [ ] Show circular delivery status.
- [ ] Show financial summary overview.
- [ ] Enforce state jurisdiction.

## 28. Mosque Approval Workflow

- [ ] Mosque can be submitted for approval.
- [ ] Authority can review mosque profile.
- [ ] Authority can approve mosque.
- [ ] Authority can reject mosque with reason.
- [ ] Authority can suspend mosque.
- [ ] Authority can request changes.
- [ ] Public directory shows only approved active mosques.
- [ ] Audit log all approval decisions.

## 29. Officer Appointments

- [x] Create officer appointment table.
- [ ] Authority can appoint imam/bilal/khatib/AJK roles.
- [ ] Track appointment start date.
- [ ] Track appointment end date.
- [ ] Track appointment status.
- [ ] Notify mosque admin of appointment.
- [ ] Audit log appointment changes.

## 30. Authority Communications

- [ ] Authority can create circular.
- [ ] Upload circular attachment.
- [ ] Target circular by state/district/mosque.
- [ ] Mosque admin receives circular.
- [ ] Track read/unread status.
- [ ] Archive circulars.
- [ ] Audit log circular publishing.

---

# Phase 9 — Community, Content, and Interior Map

## 31. Private Kariah Community Board

- [ ] Create private posts for verified kariah members.
- [ ] Mosque admin can moderate posts.
- [ ] Report inappropriate content.
- [ ] Remove posts.
- [ ] Restrict access to verified kariah members only.

## 32. Ceramah and YouTube

- [x] Create ceramah content table.
- [ ] Add title, speaker, date, category.
- [ ] Support manual YouTube URL entry first.
- [ ] Display video on mosque profile.
- [ ] Add YouTube API upload later if needed.
- [ ] Store OAuth credentials securely if YouTube upload is implemented.

## 33. Interior Map / Floor Plan MVP

- [ ] Mosque admin can upload floor plan image/PDF.
- [ ] Store floor plan file in local upload storage.
- [ ] Define labelled zones.
- [ ] Show floor plan on mosque profile.
- [ ] Highlight OKU route.
- [ ] Show capacity indicators.
- [ ] Keep architecture ready for future 3D upgrade.

---

# Phase 10 — Notifications

## 34. Notification Foundation

- [x] Create notification table.
- [x] Create notification preferences.
- [ ] Support in-app notifications first.
- [ ] Notify for announcements.
- [ ] Notify for events.
- [ ] Notify for Khairat renewal.
- [ ] Notify for authority circulars.
- [ ] Notify for officer appointments.
- [ ] Add push notification service later.

## 35. Future Push Notifications

- [x] Prepare device token table.
- [ ] Prepare FCM integration.
- [ ] Prepare APNs integration.
- [ ] Add prayer reminder scheduling later.
- [ ] Add opt-in/out controls.

---

# Phase 11 — Mobile App

## 36. Public User Screens

- [ ] Onboarding.
- [ ] Language selection.
- [ ] Login/register.
- [ ] Mosque search.
- [ ] Nearby mosques.
- [ ] Mosque detail.
- [ ] Prayer times.
- [ ] Qiblat compass.
- [ ] Events list.
- [ ] Announcements.
- [ ] Donate.
- [ ] Khairat application.
- [ ] Profile.
- [ ] Notification preferences.

## 37. Registered User Features

- [ ] Set My Mosque.
- [ ] Subscribe to mosque updates.
- [ ] View donation history.
- [ ] View Khairat status.
- [ ] View Khairat contribution history.
- [ ] Download receipt/certificate.
- [ ] Manage personal information.

---

# Phase 12 — Web Admin UI

## 38. Mosque Admin Screens

- [ ] Login.
- [ ] Dashboard.
- [ ] Mosque profile editor.
- [ ] Kariah member list.
- [ ] Kariah import.
- [ ] Events.
- [ ] Announcements.
- [ ] Donations.
- [ ] Khairat applications.
- [ ] Khairat members.
- [ ] Finance records.
- [ ] Facility management.
- [ ] Floor plan management.
- [ ] Circular inbox.
- [ ] Settings.

## 39. Authority Screens

- [ ] Login.
- [ ] Dashboard.
- [ ] Mosque approval queue.
- [ ] Mosque directory by jurisdiction.
- [ ] Mosque detail review.
- [ ] Officer appointments.
- [ ] Circular management.
- [ ] Financial oversight.
- [ ] Authority user management.
- [ ] Audit logs.

---

# Phase 13 — Storage

## 40. Local File Storage MVP

- [ ] Configure upload root path.
- [ ] Create storage abstraction service.
- [ ] Store public files separately from private files.
- [ ] Store mosque images.
- [ ] Store event flyers.
- [ ] Store officer photos.
- [ ] Store circular attachments.
- [ ] Store Khairat documents.
- [ ] Store statutory documents.
- [ ] Store floor plan files.
- [ ] Use authenticated download routes for private files.
- [ ] Use public static serving only for public assets.
- [ ] Add file size limits.
- [ ] Add allowed MIME types.
- [ ] Add malware scanning placeholder/process.
- [ ] Include upload directory in backup plan.

## 41. Future Object Storage Readiness

- [ ] Keep storage driver configurable.
- [ ] Add S3/R2/Wasabi-compatible interface later.
- [ ] Avoid hardcoding local paths in business records.
- [ ] Store logical file keys.
- [ ] Store metadata in database.

---

# Phase 14 — Compliance and Privacy

## 42. PDPA and Sensitive Data

- [ ] Add privacy policy content.
- [ ] Add PDPA consent checkbox.
- [ ] Add consent timestamp.
- [ ] Add document retention policy.
- [ ] Add user data export process.
- [ ] Add user data deletion/anonymisation process.
- [x] Encrypt IC number.
- [ ] Protect Khairat documents.
- [ ] Restrict finance access.
- [x] Audit sensitive document access.

## 43. Audit Logs

- [ ] Login/logout events.
- [ ] Failed login events.
- [ ] Profile changes.
- [ ] Mosque approval decisions.
- [ ] Officer appointment changes.
- [ ] Donation payment status changes.
- [ ] Khairat approval/rejection/status changes.
- [ ] Finance record creation/adjustment.
- [ ] Circular publishing.
- [ ] Sensitive file downloads.
- [ ] Permission changes.

---

# Phase 15 — Testing

## 44. Backend Tests

- [ ] Auth tests.
- [ ] RBAC tests.
- [ ] Jurisdiction tests.
- [ ] Mosque directory tests.
- [ ] Prayer time tests.
- [ ] Prayer time import tests.
- [ ] Donation webhook tests.
- [ ] Khairat workflow tests.
- [ ] Finance immutability tests.
- [ ] Authority approval tests.
- [ ] File upload/download tests.
- [ ] Audit log tests.

## 45. Frontend Tests

- [ ] Mosque admin login flow.
- [ ] Authority login flow.
- [ ] Mosque profile edit flow.
- [ ] Prayer time display flow.
- [ ] Kariah import flow.
- [ ] Donation flow.
- [ ] Khairat application flow.
- [ ] Authority approval flow.
- [ ] Circular publishing flow.

## 46. Mobile Tests

- [ ] Register/login.
- [ ] Search mosque.
- [ ] Nearby mosque.
- [ ] View mosque profile.
- [ ] Prayer time offline cache.
- [ ] Manual prayer zone selection.
- [ ] Donation flow.
- [ ] Khairat application.
- [ ] Language switching.

## 47. Security Testing

- [ ] SQL injection checks.
- [ ] XSS checks.
- [ ] Broken access control checks.
- [ ] File upload abuse checks.
- [ ] Sensitive file access checks.
- [ ] Rate limit checks.
- [ ] Token expiry/refresh checks.
- [ ] Password reset abuse checks.

## 48. Performance Testing

- [ ] Mosque search response time.
- [ ] Nearby mosque query performance.
- [ ] Prayer time API response time.
- [ ] Dashboard loading time.
- [ ] File upload performance.
- [ ] Payment webhook reliability.

---

# Phase 16 — UAT and Pilot Launch

## 49. Pilot Preparation

- [ ] Select pilot mosques/suraus.
- [ ] Select pilot authority users.
- [ ] Prepare seed mosque data.
- [ ] Import prayer time data.
- [ ] Prepare admin training guide.
- [ ] Prepare user onboarding guide.
- [ ] Prepare support contact/process.

## 50. UAT Scenarios

- [ ] Public user finds nearest mosque.
- [ ] Public user views prayer times offline.
- [ ] Public user donates successfully.
- [ ] User applies for Khairat.
- [ ] Mosque admin approves Khairat.
- [ ] Mosque admin publishes announcement.
- [ ] Mosque admin creates event.
- [ ] Mosque admin records finance entry.
- [ ] Authority approves mosque.
- [ ] Authority sends circular.
- [ ] Authority views financial summary.

## 51. Launch Checklist

- [ ] Production environment deployed.
- [ ] Database migrated.
- [ ] Upload storage configured.
- [ ] Backups verified.
- [ ] HTTPS enabled.
- [ ] Admin users created.
- [ ] Authority users created.
- [ ] Payment gateway live keys configured.
- [ ] Email/SMTP configured.
- [ ] Monitoring configured.
- [ ] Error logging configured.
- [ ] UAT issues resolved or logged.

---

# Recommended Build Order

1. Project foundation, database, auth, RBAC, audit logs.
2. Mosque directory and mosque profile.
3. Prayer zones and stored prayer times using IMARAH's own database.
4. Prayer time import tool.
5. Mobile mosque search and prayer time screens.
6. Mosque admin profile, events, announcements, kariah.
7. Donations and Khairat.
8. Finance records and read-only authority oversight.
9. Authority mosque approval, officer appointments, circulars.
10. Local file storage, floor plan, community board, content.
11. Security hardening, tests, deployment, UAT.
12. Future JAKIM sync integration after stored prayer time system is stable.

---

# Immediate Next Actions

- [x] Confirm mobile technology choice: native Swift/Java vs React Native/Flutter.
- [ ] Confirm payment gateway provider.
- [ ] Confirm mosque onboarding method.
- [ ] Confirm authority approval workflow.
- [ ] Confirm first pilot scope.
- [ ] Confirm prayer time import data source for MVP.
- [ ] Confirm hosting/VPS provider.
- [ ] Confirm whether to build user mobile app and admin portal together or admin portal first.
