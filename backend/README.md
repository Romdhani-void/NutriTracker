# 🫖 Cozy Calories — Calorie Tracker

A minimal, cozy calorie tracking app built with a microservices architecture.

## Architecture

```
Nutri-Track/
├── user-service/        # Port 3001 — Auth, email tokens, user profiles
├── goal-service/        # Port 3002 — Body details & calorie goal calculation
├── daily-log-service/   # Port 3003 — Daily food logging & goal status
└── frontend/            # Port 4200 — Angular + TailwindCSS (coming soon)
```

## Microservices Overview

| Service         | Port | Responsibility                                                               |
| --------------- | ---- | ---------------------------------------------------------------------------- |
| UserService     | 3001 | Email registration, token generation/validation, display name                |
| GoalService     | 3002 | Weight/height/age/gender input, BMR & TDEE calculation, daily calorie target |
| DailyLogService | 3003 | Log food entries per day, sum calories, compute goal status (met/not met)    |

## Quick Start

Each service is independently runnable. You need MongoDB running locally (default: `mongodb://localhost:27017`).

```bash
# In each service folder:
npm install
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env` in each service folder and fill in the values.

## Tech Stack

- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Auth:** Passwordless email token (nodemailer)
- **Frontend:** Angular + TailwindCSS (coming soon)
