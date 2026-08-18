# 🚀 RecruitOS — Enterprise Recruitment Operations Platform

> **Modern, SLA-driven Recruitment Operations SaaS for High-Velocity Agencies & Search Firms.**

RecruitOS replaces fragmented ATS spreadsheets with an automated operational command center. It enforces client SLA accountability, automates candidate presentation workflows with structured 19-column summary trackers, and unifies WhatsApp & Email client dispatching in a single click.

---

## 🛠️ Core Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router, React 19, TypeScript) |
| **Styling** | Vanilla CSS + Tailwind CSS (Slate & Emerald Dark Theme) |
| **Database & ORM** | PostgreSQL with Drizzle ORM & Row-Level Security (RLS) |
| **Validation** | Zod Schema Validation |
| **Communication** | Unified Dual-Trigger Engine (`wa.me` + `mailto:`) |
| **Clipboard Engine** | Native Rich HTML Clipboard API (`ClipboardItem`) |

---

## ✨ Key Platform Features

* **⚡ Recruiter Cockpit**: Real-time SLA aging radar, candidate pipeline management, and duplicate CV parser.
* **📋 Candidate Summary Tracker**: Auto-generates structured 19-column presentation tables with 1-click Rich HTML copying for Outlook/Gmail.
* **🚀 Unified Communication Dispatcher**: Single-click dual dispatch via pre-configured WhatsApp (`+91 7982416306`) and Email (`divyanshu@botspring.in`).
* **🔒 Zero-Login Client Portals**: Encrypted candidate review links (`/portal/[token]`) with 1-click Shortlist, Hold, or Reject decision matrix.
* **📅 Asynchronous Interview Scheduling**: Multi-slot proposal engine and candidate T-24h preparation kits.
* **🌐 Agency Storefront Builder**: Public branded portal (`/storefront`) for candidate self-apply and client mandate intake.

---

## 🚦 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/recruitos"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000/cockpit](http://localhost:3000/cockpit) in your browser.

---

## 📁 Key Application Routes

- `/cockpit` — Recruiter Command Center & Candidate Directory
- `/portal/[token]` — Client Candidate Review & Feedback Portal
- `/interview-confirm/[submissionId]` — Candidate Slot Confirmation Page
- `/prep-kit/[token]` — Candidate Placement Preparation Kit
- `/storefront` — Public Agency Storefront & Job Board

---

© 2026 **RecruitOS Operations** • Built for Recruitment Excellence.
