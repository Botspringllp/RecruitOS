# RecruitOS — Recruitment Operations Platform

RecruitOS is a multi-tenant operational SaaS platform built for recruitment agencies and independent recruiters. It optimizes hiring workflows, automates candidate tracking, and eliminates administrative drag.

---

## 🚀 Tech Stack

- **Framework**: Next.js (App Router, Type-safe Route Handlers)
- **Database**: PostgreSQL (Multi-Tenancy isolated via Row-Level Security)
- **ORM**: Drizzle ORM (Type-safe migrations and queries)
- **Validation**: Zod (Schema validation for all inbound payloads)
- **Authentication**: JWT token-based context mapping

---

## 🛡️ Multi-Tenancy Architecture

We use a **Shared Database with Row-Level Security (RLS)** model.
- Every tenant (agency) is assigned an `agency_id` (UUID).
- The application database connection **must not** run as a superuser/owner (which bypasses RLS policies). Instead, connect as a dedicated non-superuser role (e.g., `app_user`).
- Each API request extracts the tenant context (`agencyId` and `userId`) using the secure JWT cookie or dev headers.
- Queries are executed using the `withTenantTx(agencyId, async (tx) => { ... })` wrapper. This automatically starts a transaction and sets the Postgres session configuration parameter:
  ```sql
  SET LOCAL app.current_agency_id = '<agencyId>';
  ```
- Postgres automatically filters out data belonging to other agencies at the engine level.

---

## 💬 Feature RC-01: Unified WhatsApp & Email Communication Log

All communication logs (WhatsApp and Email) are centralized under `communication_log`:
- **Outbound Sending (`POST /api/v1/communications/send`)**: Fetches candidate contact information securely under RLS, dispatches messages using the unified messaging interface, and logs history.
- **Inbound Webhooks (`POST /api/v1/webhooks/inbound`)**: Processes incoming messages from WhatsApp/Email. It looks up the receiving address in `agency_channels` to resolve the tenant context (no session present), initiates a scoped RLS transaction, matches the sender address to a candidate, and links the log. If no match is found, it is tagged as `matched = false` ("Unlinked Lead" in the cockpit).
- **Stub Providers (`src/lib/messaging/provider.ts`)**: Real sending is currently stubbed to log to the console, allowing you to test UI and data logging end-to-end. Swap these for real API integrations (e.g., Meta Cloud API or Twilio) by implementing the `MessagingProvider` interface.

---

## 🛠️ Local Development Setup

### 1. Database Configuration
Run the schema setup script directly on your PostgreSQL instance:
```bash
psql $DATABASE_URL -f db/schema.sql
```
*Note: Make sure to grant your app database user permissions to execute queries on the tables, but do not make it a superuser.*

### 2. Environment Variables
Copy `.env.example` to `.env.local` and set your credentials:
```bash
cp .env.example .env.local
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Running the App
```bash
npm run dev
```

### 5. Testing the APIs (Postman / Insomnia)
In development mode, you can bypass JWT verification by providing custom headers in your API requests:
- `x-agency-id`: A valid Agency UUID from your database
- `x-user-id`: A valid User UUID from your database

#### Test Outbound Send:
- **Endpoint**: `POST http://localhost:3000/api/v1/communications/send`
- **Headers**:
  - `Content-Type`: `application/json`
  - `x-agency-id`: `<UUID>`
  - `x-user-id`: `<UUID>`
- **Body**:
  ```json
  {
    "candidateId": "<CANDIDATE_UUID>",
    "channel": "whatsapp",
    "body": "Hi, this is a test message regarding your interview scheduler."
  }
  ```

#### Test Inbound Webhook:
- **Endpoint**: `POST http://localhost:3000/api/v1/webhooks/inbound`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body**:
  ```json
  {
    "channel": "whatsapp",
    "to": "+919999999999",
    "from": "+919876543210",
    "body": "Yes, I am available tomorrow at 4 PM.",
    "externalMessageId": "msg_external_test_123"
  }
  ```
