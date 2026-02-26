// routes/impact.js
const express = require('express');
const router = express.Router();

const {
  getAllImpactRecords,
  getImpactRecordById,
  createImpactRecord,
  getImpactSummary,
  getDonorImpact,
  debugDatabase
} = require('../controllers/impactController');

// GET /api/impact - Get all impact records
router.get('/', getAllImpactRecords);

// GET /api/impact/summary - Get impact summary
router.get('/summary', getImpactSummary);

// GET /api/impact/debug - Debug database content
router.get('/debug', debugDatabase);

// GET /api/impact/donor/:donorId - Get donor impact dashboard
router.get('/donor/:donorId', getDonorImpact);

// GET /api/impact/:id - Get impact record by ID
router.get('/:id', getImpactRecordById);

// POST /api/impact - Create new impact record
router.post('/', createImpactRecord);

module.exports = router;