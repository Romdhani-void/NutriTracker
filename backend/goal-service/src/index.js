require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const goalRoutes = require('./goal.routes');

const app = express();
const PORT = process.env.PORT || 3002;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/goals', goalRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ service: 'GoalService', status: 'ok', port: PORT });
});

// ─── Database + Server ────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ GoalService connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🫖 GoalService running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
