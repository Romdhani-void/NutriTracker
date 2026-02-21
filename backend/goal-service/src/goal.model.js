const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Body details
    weight: { type: Number, required: true },  // kg
    height: { type: Number, required: true },  // cm
    age:    { type: Number, required: true },
    gender: { type: String, enum: ['male', 'female'], required: true },

    // Activity level multiplier for TDEE
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      default: 'sedentary',
    },

    // User's selected goal type
    goalType: {
      type: String,
      enum: ['maintain', 'lose', 'gain'],
      default: 'maintain',
    },

    // Calculated fields (stored for quick access)
    bmr: { type: Number },               // Basal Metabolic Rate
    tdee: { type: Number },              // Total Daily Energy Expenditure
    dailyCalorieTarget: { type: Number },// Final target after goal adjustment
  },
  { timestamps: true }
);

module.exports = mongoose.model('Goal', goalSchema);
