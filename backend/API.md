# 🫖 Cozy Calories — API Reference

All services return JSON. All emails are case-insensitive.

---

## UserService · `http://localhost:3001`

### `GET /health`
Returns service health status.

---

### `POST /users/register`
Register a new user or re-request a login token. Sends a 6-digit token to their email.

**Body:**
```json
{
  "email": "alex@example.com",
  "displayName": "Alex"
}
```

**Response `200`:**
```json
{
  "message": "Token sent to alex@example.com. It expires in 15 minutes.",
  "email": "alex@example.com",
  "displayName": "Alex"
}
```

---

### `POST /users/verify-token`
Verify the 6-digit token the user received via email. On success, clears the token.

**Body:**
```json
{
  "email": "alex@example.com",
  "token": "482910"
}
```

**Response `200`:**
```json
{
  "message": "Token verified. Welcome!",
  "user": {
    "email": "alex@example.com",
    "displayName": "Alex",
    "isVerified": true
  }
}
```

**Errors:** `401` Invalid token · `401` Token expired · `404` User not found

---

### `GET /users/:email`
Retrieve a user's public profile (used internally by other services).

**Response `200`:**
```json
{
  "user": {
    "email": "alex@example.com",
    "displayName": "Alex",
    "isVerified": true,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

## GoalService · `http://localhost:3002`

### `GET /health`
Returns service health status.

---

### `POST /goals`
Create or update body details and calculate a daily calorie target.

**Activity levels:** `sedentary` · `light` · `moderate` · `active` · `very_active`  
**Goal types:** `maintain` · `lose` · `gain`

**Body:**
```json
{
  "userEmail": "alex@example.com",
  "weight": 75,
  "height": 175,
  "age": 28,
  "gender": "male",
  "activityLevel": "light",
  "goalType": "lose"
}
```

**Response `200`:**
```json
{
  "message": "Goal saved successfully.",
  "goal": {
    "userEmail": "alex@example.com",
    "weight": 75,
    "height": 175,
    "age": 28,
    "gender": "male",
    "activityLevel": "light",
    "goalType": "lose",
    "bmr": 1776,
    "tdee": 2442,
    "dailyCalorieTarget": 1942
  }
}
```

> **How it works:** BMR is calculated using the Mifflin-St Jeor equation.  
> TDEE = BMR × activity multiplier.  
> Final target = TDEE − 500 kcal (lose) / +300 kcal (gain) / ±0 (maintain).  
> Minimum target is always 1200 kcal.

---

### `GET /goals/:email`
Get full goal and body details for a user.

---

### `GET /goals/:email/target`
Lightweight endpoint — returns just the daily calorie target.

**Response `200`:**
```json
{
  "dailyCalorieTarget": 1942,
  "goalType": "lose"
}
```

---

## DailyLogService · `http://localhost:3003`

### `GET /health`
Returns service health status.

---

### `POST /logs/:email/food`
Add a food entry to a day's log. Creates the log for that day if it doesn't exist yet.  
Automatically fetches the calorie target from GoalService and recalculates goal status.

**Body:**
```json
{
  "name": "Oatmeal with berries",
  "calories": 320,
  "date": "2024-01-15"
}
```

> `date` is optional — defaults to today (YYYY-MM-DD).

**Response `201`:**
```json
{
  "message": "Food entry added.",
  "log": {
    "userEmail": "alex@example.com",
    "date": "2024-01-15",
    "foodEntries": [
      { "_id": "...", "name": "Oatmeal with berries", "calories": 320, "addedAt": "..." }
    ],
    "totalCalories": 320,
    "dailyCalorieTarget": 1942,
    "goalStatus": "not_met"
  }
}
```

---

### `DELETE /logs/:email/food/:entryId?date=YYYY-MM-DD`
Remove a specific food entry by its ID.

---

### `GET /logs/:email/today`
Returns today's full log including all food entries and goal status.

**`goalStatus` values:**
| Value | Meaning | UI Color |
|---|---|---|
| `met` | Calories ≥ daily target | 🟢 Green |
| `not_met` | Calories < daily target | 🔴 Red |
| `pending` | No goal set yet | ⚪ Neutral |

---

### `GET /logs/:email/date/:date`
Returns the log for a specific date (YYYY-MM-DD).

---

### `GET /logs/:email/history`
Returns all past daily logs (summary only, no food entries) sorted newest first.

**Query params:** `?limit=30` (default 30)

**Response `200`:**
```json
{
  "count": 7,
  "logs": [
    {
      "date": "2024-01-15",
      "totalCalories": 1820,
      "dailyCalorieTarget": 1942,
      "goalStatus": "not_met"
    }
  ]
}
```

---

### `GET /logs/:email/history/full`
Returns paginated full logs including food entries.

**Query params:** `?page=1&limit=10`
