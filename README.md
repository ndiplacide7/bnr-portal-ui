# BNR Licensing Portal — Frontend

The web interface for the BNR licensing system. Built as an internal tool for regulators and applicants — clarity and correctness over decoration. Every action a user cannot perform is hidden, not just disabled.

Built by **Eng. Placide** · [ndiplacide7@gmail.com](mailto:ndiplacide7@gmail.com)

---

## Tech Stack

| | |
|--|--|
| Framework | React 18 + Vite |
| Routing | React Router v6 |
| HTTP | Axios |
| Styling | Bootstrap 5 (CDN) |
| State | React Context + localStorage |

---

## Prerequisites

- Node.js 18+
- The backend running at `http://localhost:8080`

---

## Running Locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Login

Use any seeded account. All share password `Password1!`

| Email | Role |
|-------|------|
| `admin@bnr.rw` | SYSTEM_ADMIN |
| `applicant@bnr.rw` | APPLICANT |
| `reviewer@bnr.rw` | REVIEWER |
| `approver@bnr.rw` | APPROVER |
| `compliance@bnr.rw` | COMPLIANCE_OFFICER |
| `auditor@bnr.rw` | AUDITOR |

---

## Role-Based Access

Each role sees only what it can act on. Nav links, buttons, and action forms are not rendered at all for roles that cannot use them.

| Role | What they can do |
|------|-----------------|
| APPLICANT | Create applications, upload documents, submit, withdraw |
| REVIEWER | Assign self as reviewer, mark review complete |
| COMPLIANCE_OFFICER | Assign reviewer, view audit logs |
| APPROVER | Approve or reject completed reviews |
| SYSTEM_ADMIN | Everything + user management + audit logs |
| AUDITOR | Read-only audit log viewer |

---

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Sign in |
| `/applications` | Paginated application list |
| `/applications/new` | Create application — APPLICANT only |
| `/applications/:id` | Application detail: actions, documents, audit trail |
| `/admin/users` | User management — SYSTEM_ADMIN only |
| `/audit-logs` | Full audit trail — SYSTEM_ADMIN, AUDITOR, COMPLIANCE_OFFICER |

---

## Backend

API base URL is configured in `src/api/client.js`:
```js
baseURL: 'http://localhost:8080/api'
```

Change this if your backend runs on a different port.
