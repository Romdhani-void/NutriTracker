const mongoose = require('mongoose');

// Each individual food entry within a day
const foodEntrySchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: 'Unnamed food' },
    calories: { type: Number, required: true, min: 0 },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// The daily log document — one per user per date
const dailyLogSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    // Stored as YYYY-MM-DD string for easy querying and display
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    foodEntries: [foodEntrySchema],

    // Denormalized totals — recalculated on every mutation
    totalCalories: { type: Number, default: 0 },
    dailyCalorieTarget: { type: Number, default: null },
    goalStatus: {
      type: String,
      enum: ['met', 'not_met', 'pending'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Compound unique index: one log per user per day
dailyLogSchema.index({ userEmail: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyLog', dailyLogSchema);
