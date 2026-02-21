const express = require('express');
const axios = require('axios');
const DailyLog = require('./daily-log.model');

const router = express.Router();

// ─── Helper: fetch daily calorie target from GoalService ─────────────────────
async function fetchCalorieTarget(userEmail) {
  try {
    const res = await axios.get(
      `${process.env.GOAL_SERVICE_URL}/goals/${encodeURIComponent(userEmail)}/target`
    );
    return res.data.dailyCalorieTarget || null;
  } catch {
    return null; // GoalService unreachable or no goal set
  }
}

// ─── Helper: recalculate totals + goal status ─────────────────────────────────
function recalculate(log) {
  log.totalCalories = log.foodEntries.reduce((sum, e) => sum + e.calories, 0);
  if (log.dailyCalorieTarget !== null) {
    log.goalStatus = log.totalCalories >= log.dailyCalorieTarget ? 'met' : 'not_met';
  } else {
    log.goalStatus = 'pending';
  }
}

// ─── Helper: get today's date as YYYY-MM-DD ───────────────────────────────────
function todayString() {
  return new Date().toISOString().slice(0, 10);
}

// ─── POST /logs/:email/food ───────────────────────────────────────────────────
// Add a food entry to today's log (creates the day's log if it doesn't exist).
router.post('/:email/food', async (req, res) => {
  try {
    const userEmail = req.params.email.toLowerCase().trim();
    const { name, calories, date } = req.body;
    const logDate = date || todayString();

    if (calories === undefined || calories === null) {
      return res.status(400).json({ error: 'calories is required.' });
    }

    // Fetch the daily target from GoalService
    const dailyCalorieTarget = await fetchCalorieTarget(userEmail);

    // Find or create the daily log
    let log = await DailyLog.findOne({ userEmail, date: logDate });
    if (!log) {
      log = new DailyLog({ userEmail, date: logDate, dailyCalorieTarget });
    } else if (dailyCalorieTarget !== null) {
      log.dailyCalorieTarget = dailyCalorieTarget;
    }

    // Add the new food entry
    log.foodEntries.push({ name: name || 'Unnamed food', calories });
    recalculate(log);
    await log.save();

    return res.status(201).json({
      message: 'Food entry added.',
      log,
    });
  } catch (err) {
    console.error('[add-food]', err);
    return res.status(500).json({ error: 'Failed to add food entry.' });
  }
});

// ─── DELETE /logs/:email/food/:entryId ───────────────────────────────────────
// Remove a specific food entry from a day's log.
router.delete('/:email/food/:entryId', async (req, res) => {
  try {
    const userEmail = req.params.email.toLowerCase().trim();
    const { date } = req.query;
    const logDate = date || todayString();

    const log = await DailyLog.findOne({ userEmail, date: logDate });
    if (!log) {
      return res.status(404).json({ error: 'Daily log not found.' });
    }

    const entryIndex = log.foodEntries.findIndex(
      (e) => e._id.toString() === req.params.entryId
    );
    if (entryIndex === -1) {
      return res.status(404).json({ error: 'Food entry not found.' });
    }

    log.foodEntries.splice(entryIndex, 1);
    recalculate(log);
    await log.save();

    return res.status(200).json({ message: 'Food entry removed.', log });
  } catch (err) {
    console.error('[delete-food]', err);
    return res.status(500).json({ error: 'Failed to remove food entry.' });
  }
});

// ─── GET /logs/:email/today ───────────────────────────────────────────────────
// Returns today's log for the user.
router.get('/:email/today', async (req, res) => {
  try {
    const userEmail = req.params.email.toLowerCase().trim();
    const logDate = todayString();

    const log = await DailyLog.findOne({ userEmail, date: logDate });

    if (!log) {
      // No entries yet today — return an empty shell with the target
      const dailyCalorieTarget = await fetchCalorieTarget(userEmail);
      return res.status(200).json({
        userEmail,
        date: logDate,
        foodEntries: [],
        totalCalories: 0,
        dailyCalorieTarget,
        goalStatus: 'pending',
      });
    }

    return res.status(200).json({ log });
  } catch (err) {
    console.error('[get-today]', err);
    return res.status(500).json({ error: 'Failed to get today\'s log.' });
  }
});

// ─── GET /logs/:email/date/:date ──────────────────────────────────────────────
// Returns the log for a specific date (YYYY-MM-DD).
router.get('/:email/date/:date', async (req, res) => {
  try {
    const userEmail = req.params.email.toLowerCase().trim();
    const { date } = req.params;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format.' });
    }

    const log = await DailyLog.findOne({ userEmail, date });
    if (!log) {
      return res.status(404).json({ error: 'No log found for this date.' });
    }

    return res.status(200).json({ log });
  } catch (err) {
    console.error('[get-date]', err);
    return res.status(500).json({ error: 'Failed to get log for date.' });
  }
});

// ─── GET /logs/:email/history ─────────────────────────────────────────────────
// Returns all past daily logs in reverse chronological order.
router.get('/:email/history', async (req, res) => {
  try {
    const userEmail = req.params.email.toLowerCase().trim();
    const limit = parseInt(req.query.limit, 10) || 30;

    const logs = await DailyLog.find({ userEmail })
      .sort({ date: -1 })
      .limit(limit)
      .select('-foodEntries'); // Summary only — omit food entries for performance

    return res.status(200).json({
      count: logs.length,
      logs,
    });
  } catch (err) {
    console.error('[get-history]', err);
    return res.status(500).json({ error: 'Failed to get history.' });
  }
});

// ─── GET /logs/:email/history/full ───────────────────────────────────────────
// Returns all past logs including food entries (paginated).
router.get('/:email/history/full', async (req, res) => {
  try {
    const userEmail = req.params.email.toLowerCase().trim();
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      DailyLog.find({ userEmail }).sort({ date: -1 }).skip(skip).limit(limit),
      DailyLog.countDocuments({ userEmail }),
    ]);

    return res.status(200).json({
      page,
      totalPages: Math.ceil(total / limit),
      total,
      logs,
    });
  } catch (err) {
    console.error('[get-history-full]', err);
    return res.status(500).json({ error: 'Failed to get full history.' });
  }
});

module.exports = router;
