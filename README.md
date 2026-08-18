# RecruitOS — Enterprise Recruitment Operations System

**RecruitOS** is a high-performance recruitment operations SaaS platform built for staffing agencies, headhunters, and talent acquisition teams. Built to automate end-to-end recruitment workflows, RecruitOS enforces SLA radar tracking, automates candidate presentation, unifies WhatsApp and email dispatch channels, and protects placement revenue across the candidate lifecycle.

---

## 🚀 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router, Server Actions, Server API Routes) |
| **Frontend** | React 19, TypeScript 5+, Tailwind CSS, Material Symbols Icons |
| **Database** | PostgreSQL (Isolated Multi-Tenancy via Row-Level Security) |
| **ORM & Migrations** | Drizzle ORM (Type-safe schemas, relational queries, migrations) |
| **Validation** | Zod (Runtime type validation for API request payloads) |
| **Dispatch & Communication** | Dual-Trigger Messaging Engine (WhatsApp Web API + Mailto Protocol) |
| **Clipboard Engine** | Browser `ClipboardItem` API (Rich HTML 19-Column Summary Tracker) |
| **Authentication** | JWT HTTP-Only Cookies & Middleware Tenant Context Isolation |

---

## 🏗️ Architecture & Directory Structure

```text
RecruitOS/
├── scratch/                      # E2E integration test scripts
├── src/
│   ├── app/                      # Next.js App Router & API Endpoints
│   │   ├── cockpit/              # Recruiter Operations Command Center (/cockpit)
│   │   ├── portal/[token]/       # Zero-Login Client Review & Decision Portal
│   │   ├── prep-kit/[token]/     # Candidate T-24h Interview Preparation Kit
│   │   ├── interview-confirm/    # Candidate Slot Selection & Confirmation
│   │   ├── client-schedule-confirm/# Client Interview Meeting Lock & Calendar Link
│   │   ├── debrief/[interviewId]/ # Candidate Post-Interview Debrief Survey
│   │   ├── storefront/           # Agency Storefront & Inbound Job Portal
│   │   └── api/v1/               # Production API Entrypoints
│   ├── backend/                  # Business Logic, Controllers & Services
│   ├── db/                       # PostgreSQL Pool, Drizzle Schema & RLS Scripts
│   └── frontend/                 # UI Components, Layout Views & CSS Styling
```

---

## 🔑 Core Features & System Capabilities

### 1. Unified Dispatch Engine (WhatsApp + Email)
- Single-action dual-trigger dispatch system that simultaneously launches WhatsApp communication links and email composition.
- Configurable default recipient channels for instant 1-click recruiter dispatches.

### 2. Candidate Summary Tracker (19-Column Tabular Generator)
- Generates a structured 19-column candidate data table for client presentations:
  - `Date`, `Source`, `Client Name`, `Applied Position`, `Candidate Name`, `Email ID`, `Phone`, `Location`, `Relocate Status`, `Total Exp`, `Relevant Exp`, `Designation`, `Qualification`, `Current Company`, `Current CTC`, `Expected CTC`, `Notice Period`, `Reason of Leaving`, `Offer in Hand`.
- Native `ClipboardItem` rich-text HTML copy engine allowing recruiters to paste formatted tables with styled headers directly into Outlook or Gmail.

### 3. Dynamic Candidate Selection & Portal Persistence
- Recruiter candidate selection filters persist seamlessly to secure client portals (`/portal/[token]`).
- Supports dynamic multi-candidate reviews, candidate resume PDF downloads, and interactive feedback submission (`Shortlist`, `Hold`, `Reject`).

### 4. SLA Radar & Pipeline Stagnation Tracking
- Color-coded SLA aging indicators (<24h Green, 36h Yellow, >72h Red Glow).
- Automated client chase sequence engine and recruiter notifications.

---

## 🗄️ Database Schemas (23 Tables)

- **Tenant & Identity**: `agencies`, `users`, `agency_channels`
- **Core Operations**: `client_records`, `job_mandates`, `candidate_records`, `candidate_submissions`
- **Communication & Portals**: `communication_log`, `client_portal_tokens`, `partner_mandate_shares`
- **Interview & Retention**: `proposed_interview_slots`, `interview_schedules`, `interview_debriefs`, `job_offer_audits`, `compliance_documents`
- **Settlement & Guarantee**: `invoice_records`, `probation_guarantee_trackers`, `partner_split_ledgers`

---

## ⚡ API Endpoints Summary

- **Authentication**: `POST /api/v1/auth/login`
- **Cockpit Operations**: `GET /api/v1/cockpit/daily-queue`, `GET /api/v1/cockpit/submissions`
- **Parsing & Webhooks**: `POST /api/v1/parser`, `POST /api/v1/webhooks/inbound`
- **Client Presentation**: `GET /api/v1/public/portal/[token]`, `POST /api/v1/public/portal/[token]/decision`
- **Interview Lifecycle**: `POST /api/v1/public/candidate/confirm-slot`, `GET /api/v1/public/candidate/prep-kit/[token]`
- **Offer & Settlements**: `POST /api/v1/offers/audit`, `POST /api/v1/probation/breach`

---

## 💻 Local Setup & Development

### 1. Prerequisites
- Node.js 18+
- PostgreSQL database instance

### 2. Installation
```bash
# Clone the repository & install dependencies
npm install

# Setup environment configuration
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```
Access the application at `http://localhost:3000/cockpit`.

### 4. Production Build Verification
```bash
npm run build
```

---

## 📄 License
Enterprise Commercial License — All rights reserved by BotSpring Recruitment Operations.
