# Study Abroad CRM — Counsellor Dashboard & Enterprise Platform

An enterprise Study Abroad CRM engineered with pixel-perfect visual fidelity matching the approved dashboard reference design, coupled with full-stack transactional workflows, relational persistence, and interactive CRM modules.

---

## 📸 Visual Baseline & Replication Fidelity

- **Reference Resolution:** 1536 × 1024 viewport (desktop benchmark)
- **Design Language:**
  - Dark Navy Sidebar (`#07182c` / `#0a294a`) with brand crest, active blue highlights (`#087cf5`), and notification badges.
  - Seven Pastel KPI Cards with exact iconography, values (`48 Total Leads`, `22 Contacted`, `15 Counselling Done`, `8 Enrolled`, `5 Transferred`, `2 In Process`, `1 Offer Received`), and period growth markers.
  - Leads Management Table with stage filtering tabs (`My Leads: 48`, `Counselling: 15`, `Enrolled: 8`, `Transferred: 5`, `On Hold: 6`, `Lost: 3`), table and drag-and-drop Kanban view modes, row actions (Phone, WhatsApp, Calendar, More).
  - Selected Student Details Panel (Rahul Sharma, `L2025100501`) featuring 5 tabs (`Profile`, `Academic`, `Test Score`, `Counselling`, `Notes`), visual stage progression stepper (`New Lead → Counselling → Enrolled → Documentation → Application`), Next Follow-up scheduler, and Quick Action buttons.
  - Analytics & Activity Widgets: Today's Tasks, Counselling Summary (5-bar colored distribution with values above bars), Lead Source Breakdown (doughnut chart with center lead count), and Country Interest horizontal progress bars.

---

## 🛠️ Technology Stack

### Frontend (`/client`)
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS with custom design tokens & enterprise CRM spacing
- **Icons:** Lucide React
- **Analytics & Data Viz:** Recharts (Bespoke Bar & Doughnut charts with zero-latency headless rendering)
- **Modals & Workflows:** Add Lead, Edit Lead, Mark as Enrolled, Schedule Follow-up, Email Composer, WhatsApp Opener, Task Manager, Transfer to Docs

### Backend (`/server`)
- **Runtime:** Node.js + Express with TypeScript
- **Database ORM:** Prisma ORM with SQLite engine (`dev.db`), zero external dependencies
- **Data Models:** `User`, `Lead`, `Student`, `Task`, `FollowUp`, `CounsellingSession`, `Document`, `University`, `Application`, `Notification`, `ActivityLog`
- **APIs:** RESTful CRUD, global debounced search across authorized fields, transactional workflow endpoints

---

## 🚀 Getting Started

### 1. Server Setup
```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run seed     # Seeds exactly 48 leads, tasks, and reference fixtures
npm run dev      # Runs Express API on http://localhost:5000
```

### 2. Client Setup
```bash
cd client
npm install
npm run dev      # Launches Vite dev server on http://localhost:5173
```

### 3. Production Build
```bash
# Server
cd server && npm run build

# Client
cd client && npm run build
```

---

## 🧭 System Workflows & Business Rules

1. **Lead Qualification:** Inbound inquiries across Google Ads, Website, Referrals, etc., auto-assigned to counsellors.
2. **Student Enrolment:** Marking a lead as enrolled transitions status, generates a permanent Student ID (e.g. `STU20251001`), seeds the 7 mandatory visa & academic document checklists, and notifies the documentation team.
3. **Documentation Verification:** Dossier handoff tracking passports, 10th/12th marksheets, degree certificates, IELTS/TOEFL scores, SOP, and LORs.
4. **Follow-ups & Tasks:** Full synchronization between Today's Tasks, Follow-up scheduling, and Calendar modules with persistent completion state.
