/**
 * Calculates BMR using the Mifflin-St Jeor equation.
 * This is considered more accurate than Harris-Benedict for modern use.
 *
 * Male:   BMR = (10 × weight kg) + (6.25 × height cm) − (5 × age) + 5
 * Female: BMR = (10 × weight kg) + (6.25 × height cm) − (5 × age) − 161
 *
 * @param {number} weight - in kg
 * @param {number} height - in cm
 * @param {number} age
 * @param {'male'|'female'} gender
 * @returns {number} BMR in kcal/day
 */
function calculateBMR(weight, height, age, gender) {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
}

/**
 * Activity multipliers for TDEE calculation.
 */
const ACTIVITY_MULTIPLIERS = {
  sedentary:   1.2,   // Little or no exercise
  light:       1.375, // Light exercise 1–3 days/week
  moderate:    1.55,  // Moderate exercise 3–5 days/week
  active:      1.725, // Hard exercise 6–7 days/week
  very_active: 1.9,   // Very hard exercise + physical job
};

/**
 * Calculates TDEE from BMR and activity level.
 * @param {number} bmr
 * @param {string} activityLevel
 * @returns {number} TDEE in kcal/day
 */
function calculateTDEE(bmr, activityLevel) {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
}

/**
 * Calorie adjustments per goal type.
 * Based on standard nutritional guidelines:
 * - Lose fat:  ~500 kcal deficit (safe ~0.5kg/week loss)
 * - Gain weight: ~300 kcal surplus (lean bulk)
 */
const GOAL_ADJUSTMENTS = {
  maintain:  0,
  lose:     -500,
  gain:     +300,
};

/**
 * Calculates the daily calorie target from TDEE + goal adjustment.
 * @param {number} tdee
 * @param {'maintain'|'lose'|'gain'} goalType
 * @returns {number} Daily calorie target in kcal
 */
function calculateDailyTarget(tdee, goalType) {
  const adjustment = GOAL_ADJUSTMENTS[goalType] ?? 0;
  return Math.max(1200, tdee + adjustment); // Never below 1200 kcal for safety
}

module.exports = { calculateBMR, calculateTDEE, calculateDailyTarget };
