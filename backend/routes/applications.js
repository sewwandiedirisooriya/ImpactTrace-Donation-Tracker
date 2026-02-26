// routes/applications.js
const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');

// Get all applications
router.get('/', applicationController.getAllApplications);

// Get application statistics
router.get('/stats', applicationController.getApplicationStats);

// Get applications by status
router.get('/status/:status', applicationController.getApplicationsByStatus);

// Get applications by beneficiary (MUST be before /:id)
router.get('/beneficiary/:beneficiaryId', applicationController.getApplicationsByBeneficiary);

// Get application by ID
router.get('/:id', applicationController.getApplicationById);

// Create new application
router.post('/', applicationController.createApplication);

// Update application status
router.put('/:id/status', applicationController.updateApplicationStatus);

// Create project from approved application
router.post('/:id/create-project', applicationController.createProjectFromApplication);

// Update application
router.put('/:id', applicationController.updateApplication);

// Delete application
router.delete('/:id', applicationController.deleteApplication);

module.exports = router;
