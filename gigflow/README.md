# GigFlow – Smart Leads Dashboard

A full-stack Lead Management Dashboard built with the MERN stack and TypeScript.

## Features

- **JWT Authentication** with role-based access (Admin & Sales User)
- **Leads CRUD** — Create, Read, Update, Delete leads
- **Advanced Filtering** — Filter by status, source, search by name/email
- **Debounced Search** — Optimized search with 400ms debounce
- **Backend Pagination** — 10 records per page with metadata
- **CSV Export** — Export filtered leads to CSV
- **Dark Mode** — Toggle between light/dark themes
- **Docker Setup** — Full containerized deployment
- **Responsive UI** — Works on mobile and desktop

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript, TailwindCSS, Vite |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt |
| DevOps | Docker, Docker Compose |

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm

### Setup (Without Docker)

**1. Clone the repo**
```bash
git clone <repo-url>
cd gigflow
```

**2. Backend setup**
```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev
```

**3. Frontend setup**
```bash
cd client
npm install
npm run dev
```

App runs at: http://localhost:3000  
API runs at: http://localhost:5000

### Setup (With Docker)

```bash
cp .env.example .env  # set JWT_SECRET
docker-compose up --build
```

App: http://localhost:3000

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gigflow
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

## API Documentation

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |

### Leads (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/leads | Get all leads (with filters) |
| POST | /api/leads | Create lead |
| GET | /api/leads/:id | Get single lead |
| PUT | /api/leads/:id | Update lead |
| DELETE | /api/leads/:id | Delete lead (Admin only) |
| GET | /api/leads/export/csv | Export to CSV |

### Query Parameters (GET /api/leads)
- `status` — New | Contacted | Qualified | Lost
- `source` — Website | Instagram | Referral
- `search` — search by name or email
- `sort` — latest | oldest
- `page` — page number (default: 1)
- `limit` — per page (default: 10)

## Roles
- **Admin** — Full access, can delete leads
- **Sales User** — Can create/update their own leads, no delete

## Project Structure

```
gigflow/
├── client/                  # React + TypeScript frontend
│   └── src/
│       ├── api/             # Axios instance + API calls
│       ├── components/      # Reusable components
│       ├── context/         # Auth context
│       ├── hooks/           # useLeads, useDebounce
│       ├── pages/           # Login, Register, Dashboard, Leads
│       └── types/           # TypeScript interfaces
├── server/                  # Express + TypeScript backend
│   └── src/
│       ├── controllers/     # Business logic
│       ├── middleware/       # auth, errorHandler
│       ├── models/          # Mongoose schemas
│       ├── routes/          # Express routes
│       └── types/           # TypeScript interfaces
├── docker-compose.yml
└── README.md
```
