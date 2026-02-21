const express = require('express');
const Goal = require('./goal.model');
const { calculateBMR, calculateTDEE, calculateDailyTarget } = require('./calculator');

const router = express.Router();

// ─── POST /goals ──────────────────────────────────────────────────────────────
// Create or update a user's body details and calculate their calorie target.
router.post('/', async (req, res) => {
  try {
    const { userEmail, weight, height, age, gender, activityLevel, goalType } = req.body;

    if (!userEmail || !weight || !height || !age || !gender) {
      return res.status(400).json({
        error: 'userEmail, weight, height, age, and gender are required.',
      });
    }

    // Calculate calorie targets
    const bmr = Math.round(calculateBMR(weight, height, age, gender));
    const tdee = calculateTDEE(bmr, activityLevel || 'sedentary');
    const dailyCalorieTarget = calculateDailyTarget(tdee, goalType || 'maintain');

    const goal = await Goal.findOneAndUpdate(
      { userEmail: userEmail.toLowerCase().trim() },
      {
        userEmail: userEmail.toLowerCase().trim(),
        weight,
        height,
        age,
        gender,
        activityLevel: activityLevel || 'sedentary',
        goalType: goalType || 'maintain',
        bmr,
        tdee,
        dailyCalorieTarget,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      message: 'Goal saved successfully.',
      goal,
    });
  } catch (err) {
    console.error('[post-goal]', err);
    return res.status(500).json({ error: 'Failed to save goal.' });
  }
});

// ─── GET /goals/:email ────────────────────────────────────────────────────────
// Retrieve a user's goal and calorie target.
router.get('/:email', async (req, res) => {
  try {
    const goal = await Goal.findOne({
      userEmail: req.params.email.toLowerCase().trim(),
    });

    if (!goal) {
      return res.status(404).json({ error: 'No goal found for this user.' });
    }

    return res.status(200).json({ goal });
  } catch (err) {
    console.error('[get-goal]', err);
    return res.status(500).json({ error: 'Failed to retrieve goal.' });
  }
});

// ─── GET /goals/:email/target ─────────────────────────────────────────────────
// Lightweight endpoint — returns just the daily calorie target.
// Used by DailyLogService to determine goal status.
router.get('/:email/target', async (req, res) => {
  try {
    const goal = await Goal.findOne({
      userEmail: req.params.email.toLowerCase().trim(),
    }).select('dailyCalorieTarget goalType');

    if (!goal) {
      return res.status(404).json({ error: 'No goal found for this user.' });
    }

    return res.status(200).json({
      dailyCalorieTarget: goal.dailyCalorieTarget,
      goalType: goal.goalType,
    });
  } catch (err) {
    console.error('[get-target]', err);
    return res.status(500).json({ error: 'Failed to retrieve target.' });
  }
});

module.exports = router;
