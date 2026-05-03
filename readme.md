<div align="center">

# SmartExam AI

**Intelligent Assessment Platform powered by Google Gemini**

[![Next.js](https://img.shields.io/badge/Next.js-16.0.8-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=flat-square&logo=postgresql)](https://neon.tech)

SmartExam AI is a full-stack exam management and learning analytics platform that gives instructors instant AI-generated assessments and gives students predictive coaching — all in one application.

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Environment Variables](#-environment-variables) · [API Reference](#-api-reference) · [Project Structure](#-project-structure)

</div>

---

## ✨ Features

### For Instructors
- **AI Exam Generation** — Paste a topic or syllabus; Gemini 2.5 Flash generates a complete, balanced MCQ assessment in seconds
- **Manual Question Authoring** — Add and manage questions manually with full control over options and correct answers
- **Exam Publishing** — Control exam visibility with draft/live status toggling
- **Student Analytics** — View class-wide performance, top performers leaderboard, and per-exam statistics
- **Exam History** — Full audit trail of all published assessments with average scores and participation counts

### For Students
- **Exam Library** — Browse and take all published assessments
- **Timed Exam Sessions** — Live countdown timer with question-dot navigator and progress tracking
- **Instant Results** — Animated score ring with pass/fail status immediately after submission
- **AI Performance Coaching** — Gemini analyses responses and returns personalised feedback, weak topic identification, and a predicted score for the next attempt
- **Learning Progress** — Full history of all attempts with trend chart and focus area recommendations

### Platform
- **JWT Authentication** — Secure `httpOnly` cookie-based sessions with `jose`
- **Role-based Access Control** — Separate instructor and student experiences from a single codebase
- **Responsive Design** — Fully responsive across mobile, tablet, and desktop
- **Hydration-safe** — Zero hydration mismatches; auth state is managed carefully across SSR and client

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4, Radix UI primitives |
| **Database** | PostgreSQL via [Neon](https://neon.tech) (serverless) |
| **ORM** | Prisma 5 |
| **Auth** | JWT (`jose`) + `bcryptjs` for password hashing |
| **AI** | Google Gemini 2.5 Flash (`@google/generative-ai`) |
| **Charts** | Recharts |
| **Validation** | Zod |
| **Icons** | Lucide React |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.17 or later
- **npm** 9+ or **pnpm**
- A **PostgreSQL** database (local or [Neon](https://neon.tech) free tier)
- A **Google Gemini API key** — get one at [aistudio.google.com](https://aistudio.google.com/app/apikey)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/smart-exam-platform.git
cd smart-exam-platform
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

See [Environment Variables](#-environment-variables) for details on each key.

### 4. Set up the database

Run Prisma migrations to create all tables:

```bash
npx prisma migrate dev --name init
```

Or push the schema directly without migration history:

```bash
npx prisma db push
```

Generate the Prisma client:

```bash
npx prisma generate
```

Optionally seed the database with sample data:

```bash
npm run db:seed
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

Create a `.env` file in the project root with the following variables:

```dotenv
# ── Database ────────────────────────────────────────────────────────────────
# PostgreSQL connection string
# Neon example: postgresql://user:pass@host/dbname?sslmode=require
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/smartexam"

# ── Authentication ───────────────────────────────────────────────────────────
# Long random string used to sign JWT tokens
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET="your-long-random-secret-here"

# ── AI Integration ───────────────────────────────────────────────────────────
# Google Gemini API key
# Get one at: https://aistudio.google.com/app/apikey
AI_API_KEY="your-gemini-api-key-here"
```

> **Neon users:** Remove `&channel_binding=require` from the connection string if present — it is not supported by Neon's pooler and will cause connection failures.

---

## 📁 Project Structure

```
smart-exam-platform/
├── app/
│   ├── api/                        # API route handlers
│   │   ├── ai/predict/             # POST — Gemini performance prediction
│   │   ├── analytics/
│   │   │   ├── instructor/         # GET — instructor dashboard stats
│   │   │   └── student/            # GET — student dashboard stats
│   │   ├── attempts/
│   │   │   ├── route.ts            # POST — start a new exam attempt
│   │   │   └── [id]/route.ts       # GET / PUT — fetch or submit an attempt
│   │   ├── auth/
│   │   │   ├── login/              # POST — authenticate and issue JWT cookie
│   │   │   ├── logout/             # POST — expire JWT cookie server-side
│   │   │   ├── me/                 # GET — return current session user
│   │   │   └── register/           # POST — create a new user account
│   │   ├── exams/
│   │   │   ├── route.ts            # GET (list) / POST (create)
│   │   │   └── [id]/
│   │   │       ├── route.ts        # GET — fetch single exam with questions
│   │   │       ├── attempts/       # GET — list all attempts for an exam
│   │   │       ├── generate/       # POST — AI question generation
│   │   │       ├── questions/      # POST — manual question creation
│   │   │       ├── stats/          # GET — exam-level analytics
│   │   │       └── top-performers/ # GET — leaderboard for an exam
│   │   ├── instructor/
│   │   │   └── exams-history/      # GET — instructor's full exam history
│   │   ├── student/
│   │   │   └── results/            # GET — student's full attempt history
│   │   └── topics/                 # GET — all available topics
│   ├── dashboard/                  # Dashboard page (role-aware)
│   ├── exams/
│   │   ├── page.tsx                # Exam library listing
│   │   ├── create/                 # Create exam page (instructor only)
│   │   └── [id]/
│   │       ├── page.tsx            # Exam detail / start page
│   │       ├── take/               # Active exam session
│   │       ├── results/            # Post-submission result page
│   │       └── analytics/          # AI coaching and analytics page
│   ├── login/                      # Login page
│   ├── register/                   # Registration page
│   ├── results/                    # Student learning progress page
│   ├── topics/                     # Instructor exam history page
│   ├── globals.css                 # Design system tokens and utilities
│   └── layout.tsx                  # Root layout with Navbar
├── components/
│   ├── ui/                         # Base UI primitives (Button, Input, etc.)
│   ├── navbar.tsx                  # Top navigation bar
│   ├── analytics-chart.tsx         # Recharts performance trend chart
│   ├── attempt-timer.tsx           # Live countdown timer component
│   ├── exam-card.tsx               # Reusable exam card for listings
│   ├── question-form.tsx           # Manual question authoring form
│   └── role-guard.tsx              # Client-side route protection wrapper
├── hooks/
│   └── useAuth.ts                  # Auth state hook with localStorage cache
├── lib/
│   ├── ai.ts                       # Gemini AI client and question generation
│   ├── analytics.ts                # Analytics query helpers
│   ├── auth.ts                     # JWT sign/verify, password hash, session
│   ├── errors.ts                   # Typed API error helpers
│   ├── prisma.ts                   # Prisma client singleton
│   ├── rate-limit.ts               # Basic rate limiting utility
│   ├── utils.ts                    # cn(), formatDate(), etc.
│   └── validators.ts               # Zod schemas for all API inputs
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── seed.ts                     # Database seeder
├── types/
│   └── index.ts                    # Shared TypeScript types
├── next.config.ts                  # Next.js configuration
└── .env.example                    # Example environment variables
```

---

## 📡 API Reference

All API routes are under `/api`. Protected routes require a valid `token` cookie set by the login endpoint.

### Auth

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Create a new user account | Public |
| `POST` | `/api/auth/login` | Authenticate and receive session cookie | Public |
| `POST` | `/api/auth/logout` | Expire the session cookie | Public |
| `GET` | `/api/auth/me` | Return the current authenticated user | Required |

### Exams

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/exams` | List all exams | Required |
| `POST` | `/api/exams` | Create a new exam | Instructor |
| `GET` | `/api/exams/:id` | Get exam details with questions and topics | Required |
| `POST` | `/api/exams/:id/generate` | Generate questions via Gemini AI | Instructor |
| `POST` | `/api/exams/:id/questions` | Manually add a question to an exam | Instructor |
| `GET` | `/api/exams/:id/attempts` | List all student attempts for an exam | Instructor |
| `GET` | `/api/exams/:id/stats` | Aggregate stats for an exam | Instructor |
| `GET` | `/api/exams/:id/top-performers` | Top-scoring students for an exam | Instructor |

### Attempts

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/attempts` | Start a new exam attempt | Student |
| `GET` | `/api/attempts/:id` | Fetch attempt with exam and answers | Required |
| `PUT` | `/api/attempts/:id` | Submit answers and calculate score | Student |

### Analytics & AI

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/analytics/student` | Dashboard stats for the current student | Student |
| `GET` | `/api/analytics/instructor` | Dashboard stats for the current instructor | Instructor |
| `GET` | `/api/student/results` | Full attempt history with weak topic analysis | Student |
| `GET` | `/api/instructor/exams-history` | All exams with participation and score averages | Instructor |
| `POST` | `/api/ai/predict` | Gemini-powered feedback and next-attempt prediction | Student |

---

## 🗄 Database Schema

```
User ──< Exam          (instructor creates many exams)
User ──< ExamAttempt   (student takes many attempts)
Exam ──< Question
Exam ──< ExamTopic >── Topic   (many-to-many)
Exam ──< ExamAttempt
ExamAttempt ──< Answer
Question    ──< Answer
```

**Key design decisions:**
- Question `options` are stored as `Json` — flexible for MCQ and True/False without a separate options table
- `ExamAttempt` stores `aiFeedback`, `weakTopics`, and `predictedScore` directly — no separate AI response table needed
- `Answer.timeTakenSeconds` is captured per-question for future granular analytics
- Cascade deletes are set on all child relationships so removing an exam cleans up all related data

---

## 🧑‍💻 Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Generate Prisma client then build for production
npm run start        # Start production server
npm run lint         # Run ESLint

npx prisma studio                      # Visual database browser
npx prisma migrate dev --name <name>   # Create and apply a new migration
npx prisma db push                     # Push schema without migration history
npx prisma generate                    # Regenerate Prisma client after schema changes
```

---

## 🚢 Deployment

### Vercel (recommended)

1. Push your repository to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables from `.env.example` in the Vercel dashboard
4. Deploy — Vercel auto-detects Next.js and configures the build

> **Note:** `npx prisma generate` runs automatically as part of `npm run build`. For database migrations in production, run `npx prisma migrate deploy` manually or via a post-build hook.

### Other Platforms

The app is a standard Next.js application and deploys to any Node.js host — Railway, Render, Fly.io, AWS App Runner, etc. Ensure all environment variables are configured and the `build` script (`prisma generate && next build`) runs correctly.

---


<div align="center">

Built with ❤️ using Next.js, Prisma, and Google Gemini

</div>