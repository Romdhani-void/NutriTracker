require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const promBundle = require("express-prom-bundle");
const dailyLogRoutes = require('./daily-log.routes');

const app = express();
const PORT = process.env.PORT || 3003;

// ─── 1. Prometheus Middleware (MUST BE AT THE VERY TOP) ───────────────────────
const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeUp: true,
  promClient: {
    collectDefaultMetrics: {} // Tracks CPU, Memory, and Node.js event loop
  }
});
app.use(metricsMiddleware);

// ─── 2. Standard Middleware ───────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── 3. Routes ────────────────────────────────────────────────────────────────
app.use('/logs', dailyLogRoutes);

// ─── 4. Health Check ──────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ service: 'DailyLogService', status: 'ok', port: PORT });
});

// ─── 5. Database + Server ─────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ DailyLogService connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🫖 DailyLogService running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });