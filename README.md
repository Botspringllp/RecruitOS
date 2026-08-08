# RecruitOS — Recruitment Operations System

**RecruitOS** is an enterprise-grade operational SaaS platform built for independent recruiters and recruitment agency founders. Unlike standard Applicant Tracking Systems (ATS) that function as static "data graveyards," RecruitOS acts as an early-warning radar and automated workflow engine. It enforces strict SLAs on client feedback, eliminates manual WhatsApp/Excel double-entry, and protects placement revenue across the candidate lifecycle—from initial intake to probation completion.

---

## 🏗️ Master Architectural Overview & Tech Stack

### Core Technologies
- **Framework**: Next.js 16 (App Router, Type-safe Server API Routes & Server Components)
- **Database**: PostgreSQL (Multi-Tenancy isolated via Row-Level Security)
- **ORM & Migrations**: Drizzle ORM (Type-safe queries, relational joins & schema migrations)
- **Validation**: Zod (Type-safe schema validation for all incoming API payloads)
- **Styling & UI**: Vanilla CSS + Tailwind CSS (Deep Navy `#0F172A` / `#0B132B` theme, Glassmorphism, Accent Yellow `#FFD400`)
- **Authentication**: JWT HTTP-Only Cookies + Header Fallback (`x-agency-id`, `x-user-id`, `userRole`)
- **Testing**: `tsx` Node.js test scripts for automated end-to-end workflow verification

### Multi-Tenant Security & Row-Level Security (RLS)
RecruitOS uses a **Shared Database with Row-Level Security (RLS)** model:
1. Every request is scoped to an `agency_id` (Tenant ID).
2. The middleware extracts `agency_id` and `userRole` from authentication tokens and attaches it to the request context.
3. Database queries set PostgreSQL transaction session variables:
   ```sql
   SET LOCAL app.current_agency_id = '<agency_id>';
   ```
4. Row-Level Security policies filter data automatically at the engine level, preventing cross-tenant data leakage.

---

## 📂 Project Directory Structure

```text
RecruitOS/
├── scratch/                      # Automated E2E integration test scripts
│   ├── test_workflow2.ts
│   ├── test_workflow3.ts
│   ├── test_workflow4.ts
│   ├── test_workflow5.ts
│   ├── test_workflow6.ts
│   └── test_workflow7.ts
├── src/
│   ├── app/                      # Next.js App Router (Pages & API routes)
│   │   ├── cockpit/              # Recruiter Cockpit Dashboard (/cockpit)
│   │   ├── login/                # Authentication page (/login)
│   │   ├── portal/[token]/       # Zero-Login Client Review Portal
│   │   ├── prep-kit/[token]/     # Candidate T-24h Interview Prep Kit
│   │   ├── debrief/[interviewId]/ # Candidate T+15m Post-Interview Debrief Survey
│   │   ├── storefront/[subdomain]/# Public Agency Storefront & Job Portal
│   │   └── api/v1/               # 26 End-to-End API Entrypoints
│   │       ├── auth/
│   │       ├── cockpit/
│   │       ├── communications/
│   │       ├── cron/
│   │       ├── invoices/
│   │       ├── jobs/
│   │       ├── ledgers/
│   │       ├── mandates/
│   │       ├── offers/
│   │       ├── parser/
│   │       ├── probation/
│   │       ├── public/
│   │       ├── settlements/
│   │       ├── submissions/
│   │       └── webhooks/
│   ├── backend/                  # Business Logic Layer
│   │   ├── auth/                 # Tenant context extraction & RLS wrappers
│   │   ├── controllers/          # API Handlers logic
│   │   └── services/             # Core engines (Parsing, Messaging, SLA Checkers)
│   ├── db/                       # Database Infrastructure
│   │   ├── index.ts              # PostgreSQL Pool & Drizzle Connection
│   │   ├── schema.ts             # 23 Drizzle Schema Definitions
│   │   └── schema.sql            # Raw RLS Policy Scripts
│   └── frontend/                 # UI Component & Layout Layer
│       ├── components/           # Reusable UI widgets (Dropzone, Parser Modal)
│       ├── views/                # Full Page Layouts (CockpitView, LoginView)
│       └── styles/               # CSS Styling Tokens & Material Symbols
```

---

## 🗺️ Master Workflows (1 to 7) & Feature Coverage Matrix

### Consolidated 29-Feature Matrix (FOUNDATION-01 to PO-04)

| Feature Code | Feature Name | Primary Assigned Workflow | Description & System Implementation |
| :--- | :--- | :--- | :--- |
| **FOUNDATION-01** | Multi-Tenant Architecture & RLS | System Infrastructure | Tenant context middleware, `agency_id` scoping, PostgreSQL RLS policies on core tables |
| **AS-01** | Public Agency Storefront | Workflow 1 (Demand Acquisition) | `/storefront/[subdomain]` custom branded agency storefront page |
| **AS-02** | Self-Serve Client Mandate Ingestion | Workflow 1 (Demand Acquisition) | Self-serve mandate intake form for hiring managers |
| **AS-03** | Hot Talent Showcase Gallery | Workflow 2 (Supply Ingestion) | `/storefront/[subdomain]/hot-talent` gallery displaying anonymized top candidates |
| **AS-04** | Candidate Application Portal | Workflow 2 (Supply Ingestion) | `/storefront/[subdomain]/apply` candidate direct CV application page |
| **RC-01** | Unified WhatsApp & Email Log | Workflow 3 (Daily Execution) | Two-way communication timeline, negative keyword sentiment detection (`HIGH_RISK` flag), template composer (`#FFD400`) |
| **RC-02** | Auto CV Parsing & Intake Engine | Workflow 2 (Supply Ingestion) | Floating drag-and-drop dropzone, regex/LLM entity extraction, duplicate warning |
| **RC-03** | Pipeline SLA & Stagnation Aging Radar | Workflows 1 & 3 | Morning velocity gauge, color-coded aging pills (<24h Green, 36h Yellow, >72h Red Glow breach), 1-click WhatsApp client chase |
| **RC-04** | Relational Talent & Household Mapping | Workflow 2 (Supply Ingestion) | Relational linking (Spouse, Ex-Colleague, Referral), auto-sync target location inheritance on relocation (e.g. Dubai) |
| **RC-05** | Post-Offer 90-Day Drop-Off Radar | Workflow 6 (Offer & Notice Period) | 30/60/90-day cadence matrix (Day 7, 20, 35, 50 touchpoints), 2-Tier unresponded escalation radar (Recruiter alert $\rightarrow$ Team Lead escalation) |
| **RC-06** | Lifecycle-Triggered Settlement Engine | Workflow 7 (Settlement & Probation) | Placement invoice dispatch, credit notes, Financial Permission Guard (403 for Recruiters on Credit Notes) |
| **RC-07** | Talent Database Recycling Engine | Workflow 2 (Supply Ingestion) | Silver Medalist Recycler drawer, filtering out technical/behavioral red flags, 1-click WhatsApp re-engage (`#FFD400`) |
| **RC-08** | Job Board Multi-Broadcast & Webhooks | Workflows 1 & 2 | Multi-posting to Naukri, Bayt & LinkedIn with API key credentials, inbound application webhook receiver, duplicate arbitration |
| **CF-01** | Zero-Login Magic Link Candidate Presenter | Workflow 4 (Client Presentation) | Encrypted SHA-256 magic link portal (`/portal/[token]`), 1.2s page load, client branding, sanitized candidate cards, slide-over panel with embedded CV viewer |
| **CF-02** | One-Click Decision Matrix | Workflow 4 (Client Presentation) | Decision matrix (`Shortlist`, `Reject`, `Hold`), mandatory rejection reason popover (`Over Budget`, `Technical Skill Gap`, etc.) |
| **CF-03** | Asynchronous Interview Slot Selector | Workflow 4 (Client Presentation) | 3-Slot visual availability calendar selector, Past Time Guard validation (`start_time >= NOW() + 12h`) |
| **CF-04** | Automated Client Chase Sequence | Workflow 4 (Client Presentation) | `/api/v1/cron/client-sla-reminders` (24h soft nudge, 48h SLA alert, 72h Cockpit breach alert), DND hours protection (8 PM to 9 AM) |
| **CE-01** | 1-Click WhatsApp Slot Confirmator | Workflow 4 (Client Presentation) | Candidate 1-click slot confirmation portal (`/interview-confirm/[submissionId]`) |
| **CE-02** | Automated Interview Prep Kit Trigger | Workflow 5 (Interview Prep & Debrief) | T-24h automated WhatsApp prep kit link (`/prep-kit/[token]`) with company intelligence, interviewer notes & The Orange Test readiness toggle |
| **CE-03** | Post-Interview Feedback Collector | Workflow 5 (Interview Prep & Debrief) | T+15m automated survey (`/debrief/[interviewId]`) with 5-star rating, sentiment tags, and voice note upload |
| **CE-04** | Notice Period Counter-Offer Pulse Checks | Workflow 6 (Offer & Notice Period) | Candidate bi-weekly pulse check API & counter-offer risk detection |
| **HC-01** | Automated Compliance Document Vault | Workflow 6 (Offer & Notice Period) | Candidate mobile compliance upload with **900s (15-minute) expiring temporary signed URLs** for PII security |
| **HC-02** | Offer Audit & CTC Verification Engine | Workflow 6 (Offer & Notice Period) | Fixed/Variable CTC verification, auto-placement fee calculation (`Fixed CTC * Agreed Fee %`), pre-drafted invoice generation |
| **HC-03** | Zero-Touch Client HR Handoff Portal | Workflows 6 & 7 | Day 1 physical joining verification portal (`/public/client/hr-handoff/[token]`), 1-click joining confirmation |
| **HC-04** | Probation Guarantee Clock & Milestone | Workflow 7 (Settlement & Probation) | 90-day probation replacement clock, early departure workflow, **Multi-Party Alerts (Owner/TL, Recruiter, Partner)**, **$0 Free Replacement Mandate creation**, **Partner Payout Freezing** |
| **PO-01** | Anonymized Mandate Sharing & Masking | Workflow 1 (Demand Acquisition) | Anonymized partner mandate share portal (`/partner-vault/[token]`) with fee split terms |
| **PO-02** | Isolated Partner Submission Vault | Workflow 2 (Supply Ingestion) | Partner candidate submission vault |
| **PO-03** | Automated Candidate Ownership Arbitrator | Workflow 2 (Supply Ingestion) | **200ms First-Touch Rule Arbitrator** preventing agency-partner duplicate ownership disputes |
| **PO-04** | Split-Fee Ledger & Auto-Settlement | Workflow 7 (Settlement & Probation) | Manual operational split ledgers (`Pending_Client_Payment`, `Frozen_Probation_Breach`, `Ready_For_Payout`, `Paid`) |

---

## 🗄️ Database Schemas (23 PostgreSQL Tables)

1. `agencies` — Agency tenant records
2. `users` — Recruiter, Team Lead, Agency Owner credentials & roles
3. `client_records` — Client companies, primary HR details, agreed fee percentages
4. `job_mandates` — Mandate titles, status, requirements, budget
5. `candidate_records` — Full candidate profiles, contact info, CTC, notice period
6. `candidate_submissions` — Pipeline stage tracking, client decisions, rejection reasons
7. `communication_log` — Two-way WhatsApp and Email activity stream
8. `agency_channels` — Webhook inbound address matching configurations
9. `partner_mandate_shares` — Anonymized partner mandate share tokens & split percentages
10. `partner_submissions` — Submissions made via partner recruiter vault
11. `agency_job_board_credentials` — API credentials for Naukri, Bayt, LinkedIn
12. `job_board_postings` — Job board multi-posting logs & application counts
13. `client_portal_tokens` — Magic link tokens for zero-login client presenter
14. `proposed_interview_slots` — Client-proposed interview time slots
15. `client_sla_reminders` — Audit log of client chase nudges
16. `interview_schedules` — Scheduled interviews, candidate readiness, no-show flags
17. `interview_debriefs` — Candidate post-interview 5-star ratings, sentiment, voice notes
18. `job_offer_audits` — Signed CTC metrics, agreed fee %, calculated placement fees
19. `notice_period_pulse_logs` — Candidate notice period touchpoints & 2-tier escalation attempts
20. `compliance_documents` — Pre-onboarding compliance files (National ID, Pay Slips, Relieving Letter)
21. `invoice_records` — Day-1 placement invoices & credit note statuses
22. `probation_guarantee_trackers` — 90-day probation replacement clocks & breach logs
23. `partner_split_ledgers` — Split-commission operational ledgers & frozen payout statuses

---

## ⚡ API Endpoints Summary (26 Routes)

### Authentication & Agency
- `POST /api/v1/auth/login` — Recruiter / Owner JWT authentication
- `POST /api/v1/mandates/[jobId]/convert` — Mandate intake & converter

### Cockpit & Daily Execution
- `GET /api/v1/cockpit/daily-queue` — Morning Focus Queue & SLA Aging Radar
- `GET /api/v1/cockpit/submissions` — Candidate pipeline submissions
- `GET /api/v1/cockpit/mandates/[jobId]/silver-medalists` — Silver Medalist database recycler

### Parsing & Webhooks
- `POST /api/v1/parser` — Auto CV Parsing Engine (PDF/DOCX extraction & duplicate check)
- `POST /api/v1/webhooks/inbound` — Inbound WhatsApp/Email webhook processor
- `POST /api/v1/webhooks/job-boards/[boardName]` — Inbound job portal application receiver

### Communication & Job Board Broadcasting
- `POST /api/v1/communications/send` — Send WhatsApp/Email template
- `GET /api/v1/communications/logs` — Fetch communication feed
- `POST /api/v1/jobs/[jobId]/broadcast` — One-click broadcast to Naukri, Bayt, LinkedIn
- `POST /api/v1/jobs/[jobId]/partner-share` — Generate anonymized partner vault link

### Client Portal & Feedback
- `GET /api/v1/public/portal/[token]` — Zero-login client presenter portal
- `POST /api/v1/public/portal/[token]/decision` — Submit shortlist/reject/hold decision & interview slots
- `GET /api/v1/cron/client-sla-reminders` — Client SLA chase sequence cron worker

### Interview Lifecycle
- `POST /api/v1/public/candidate/confirm-slot` — Candidate 1-click slot confirmation
- `GET /api/v1/public/candidate/prep-kit/[token]` — Candidate T-24h Prep Kit
- `POST /api/v1/public/candidate/prep-kit/[token]/acknowledge` — Candidate readiness acknowledgment
- `POST /api/v1/public/candidate/debrief` — Post-interview candidate debrief survey
- `POST /api/v1/submissions/[submissionId]/interview-outcome` — Stage-Gate outcome logger
- `PATCH /api/v1/submissions/[submissionId]/stage` — Stage progression with Stage-Gate enforcement

### Offer Audit, Compliance & Retention
- `POST /api/v1/offers/audit` — Offer CTC audit & fee calculation engine
- `POST /api/v1/public/candidate/notice-pulse` — Candidate bi-weekly notice pulse check
- `GET /api/v1/cron/notice-pulse-escalation` — 2-Tier unresponded notice pulse escalation worker
- `POST /api/v1/public/candidate/compliance-upload` — Mobile compliance document upload (900s signed URLs)
- `GET /api/v1/public/client/hr-handoff/[token]` — Client HR Day 1 handoff package
- `POST /api/v1/public/client/hr-handoff/[token]/confirm-joining` — Confirm physical joining & issue invoice

### Settlements, Probation Breach & Ledgers
- `POST /api/v1/probation/breach` — Early departure workflow ($0 replacement mandate & frozen payout)
- `POST /api/v1/invoices/[invoiceId]/credit-note` — Financial Permission Guard (Owner-only Credit Notes)
- `PATCH /api/v1/ledgers/partner-split` — Manual operational partner split ledger manager
- `GET /api/v1/settlements/dashboard` — Settlements overview dashboard metrics

---

## 🛠️ Local Development & Testing Instructions

### 1. Environment Setup
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 2. Database Migration
Apply schema migrations to your PostgreSQL database:
```bash
npx tsx --env-file=.env.local scratch/apply_w7_migrations.ts
```

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000/cockpit` in your browser.

### 4. Run Automated End-to-End Workflow Tests
Execute any workflow integration test script:
```bash
npx tsx --env-file=.env.local scratch/test_workflow2.ts
npx tsx --env-file=.env.local scratch/test_workflow3.ts
npx tsx --env-file=.env.local scratch/test_workflow4.ts
npx tsx --env-file=.env.local scratch/test_workflow5.ts
npx tsx --env-file=.env.local scratch/test_workflow6.ts
npx tsx --env-file=.env.local scratch/test_workflow7.ts
```

### 5. Production Build Verification
Verify production compilation:
```bash
npm run build
```
*(Expected Output: Compiled successfully with Exit code: 0)*
