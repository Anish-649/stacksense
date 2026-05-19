'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const explainRoute = require('./routes/explain');

const app = express();
const PORT = process.env.PORT || 3000;

// security middleware
app.use(helmet());

// cors — allows CLI to talk to server
app.use(cors());

// parse JSON request bodies
app.use(express.json({ limit: '50kb' }));

// rate limiting — max 30 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    success: false,
    error: 'Too many requests — please wait a moment before trying again'
  }
});

app.use('/api', limiter);

// routes
app.use('/api', explainRoute);

// health check — Render uses this to verify server is running
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'StackSense API',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found`
  });
});

// global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`StackSense API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;