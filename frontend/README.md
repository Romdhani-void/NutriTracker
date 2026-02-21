# 🫖 Cozy Calories — Frontend

Angular 17 + TailwindCSS frontend for the Cozy Calories calorie tracker.

## Setup

```bash
npm install
npm start
# → http://localhost:4200
```

Make sure all three backend services are running first (`bash start-services.sh` from project root).

## Pages

| Route | Description |
|---|---|
| `/auth` | Register + email token verification |
| `/onboarding` | Body details + goal setup (3-step wizard) |
| `/dashboard` | Today's log — add food, view progress, goal status |
| `/history` | Chronological view of all past daily logs |

## Design

- **Font:** Playfair Display (headings) + Lora (body) — warm editorial serif pair
- **Colors:** Parchment, terracotta, bark — cozy kitchen journal palette
- **Theme:** Soft paper texture, warm shadows, rounded cards
- **Status:** 🟢 Green = goal met · 🔴 Red = goal not met · ⚪ Neutral = pending
- **Animations:** Staggered fade-in-up on page load, smooth progress bar fills
