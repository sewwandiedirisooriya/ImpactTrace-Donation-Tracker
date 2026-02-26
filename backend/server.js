// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { initDatabase } = require('./config/database');

// Import routes
const userRoutes = require('./routes/users');
const beneficiaryRoutes = require('./routes/beneficiaries');
const donationRoutes = require('./routes/donations');
const projectRoutes = require('./routes/projects');
const impactRoutes = require('./routes/impact');
const applicationRoutes = require('./routes/applications');

const app = express();
const PORT = 5000;

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:8081',
    'exp://localhost:19000',
    'http://localhost:19006',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Check database initialization (won't recreate if already exists)
initDatabase().catch(err => {
  console.error('Database initialization check failed:', err);
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/beneficiaries', beneficiaryRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/applications', applicationRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ImpactTrace API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to ImpactTrace API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      beneficiaries: '/api/beneficiaries',
      donations: '/api/donations',
      projects: '/api/projects',
      impact: '/api/impact',
      health: '/api/health'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);

  // SQLite constraint error
  if (err.message.includes('SQLITE_CONSTRAINT')) {
    return res.status(400).json({
      success: false,
      message: 'Database constraint error',
      error: err.message
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(` ImpactTrace Server running on port ${PORT}`);
  console.log(` Local: http://localhost:${PORT}`);
  console.log(` Network: http://0.0.0.0:${PORT}`);
  console.log(` API Documentation available at http://localhost:${PORT}`);
});

module.exports = app;