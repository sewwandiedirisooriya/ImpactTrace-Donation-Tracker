// controllers/applicationController.js
const Application = require('../models/applications');
const Project = require('../models/Project');

// Get all aid applications with related data
exports.getAllApplications = (req, res) => {
  Application.getAll((err, rows) => {
    if (err) {
      console.error('Error fetching applications:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching applications',
        error: err.message 
      });
    }
    res.json({ success: true, data: rows });
  });
};

// Get application by ID
exports.getApplicationById = (req, res) => {
  const { id } = req.params;
  
  Application.getById(id, (err, row) => {
    if (err) {
      console.error('Error fetching application:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching application',
        error: err.message 
      });
    }
    
    if (!row) {
      return res.status(404).json({ 
        success: false, 
        message: 'Application not found' 
      });
    }
    
    res.json({ success: true, data: row });
  });
};

// Get applications by beneficiary ID
exports.getApplicationsByBeneficiary = (req, res) => {
  const { beneficiaryId } = req.params;
  
  Application.getByBeneficiary(beneficiaryId, (err, rows) => {
    if (err) {
      console.error('Error fetching applications:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching applications',
        error: err.message 
      });
    }
    res.json({ success: true, data: rows });
  });
};

// Get applications by status
exports.getApplicationsByStatus = (req, res) => {
  const { status } = req.params;
  
  Application.getByStatus(status, (err, rows) => {
    if (err) {
      console.error('Error fetching applications:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching applications',
        error: err.message 
      });
    }
    res.json({ success: true, data: rows });
  });
};

// Create new application
exports.createApplication = (req, res) => {
  const {
    beneficiary_id,
    title,
    description,
    category,
    application_type,
    target_amount,
    location,
    items_requested,
    reason,
    image_url,
    start_date,
    end_date,
    voice_recording_url,
    documents
  } = req.body;

  // Validation
  if (!beneficiary_id || !title || !description || !category || !application_type || !target_amount || !location || !reason) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required fields: beneficiary_id, title, description, category, application_type, target_amount, location, reason' 
    });
  }

  // Validate target_amount is a positive number
  if (isNaN(target_amount) || target_amount <= 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Target amount must be a positive number' 
    });
  }

  Application.create(req.body, function(err) {
    if (err) {
      console.error('Error creating application:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error creating application',
        error: err.message 
      });
    }

    // Fetch the created application with related data
    Application.getCreatedWithDetails(this.lastID, (err, row) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Application created but error fetching details' 
        });
      }
      res.status(201).json({ 
        success: true, 
        message: 'Application created successfully',
        data: row 
      });
    });
  });
};

// Update application status
exports.updateApplicationStatus = (req, res) => {
  const { id } = req.params;
  const { status, reviewed_by, review_notes } = req.body;

  // Validation
  if (!status) {
    return res.status(400).json({ 
      success: false, 
      message: 'Status is required' 
    });
  }

  const validStatuses = ['pending', 'approved', 'rejected', 'under_review'];
  if (!validStatuses.includes(status)) {
    console.log('Invalid status provided:', status);
    return res.status(400).json({ 
      success: false, 
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
    });
  }

  Application.updateStatus(id, req.body, function(err) {
    if (err) {
      console.error('Error updating application status:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error updating application status',
        error: err.message 
      });
    }

    if (this.changes === 0) {
      console.log('No rows updated - application not found');
      return res.status(404).json({ 
        success: false, 
        message: 'Application not found' 
      });
    }

    console.log('Application status updated successfully. Rows changed:', this.changes);
    res.json({ 
      success: true, 
      message: 'Application status updated successfully' 
    });
  });
};

// Update application
exports.updateApplication = (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  Application.update(id, updates, function(err) {
    if (err) {
      if (err.message === 'No valid fields to update') {
        return res.status(400).json({ 
          success: false, 
          message: err.message 
        });
      }
      console.error('Error updating application:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error updating application',
        error: err.message 
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Application not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Application updated successfully' 
    });
  });
};

// Delete application
exports.deleteApplication = (req, res) => {
  const { id } = req.params;

  Application.delete(id, function(err) {
    if (err) {
      console.error('Error deleting application:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error deleting application',
        error: err.message 
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Application not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Application deleted successfully' 
    });
  });
};

// Get application statistics
exports.getApplicationStats = (req, res) => {
  Application.getStats((err, row) => {
    if (err) {
      console.error('Error fetching application stats:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching application statistics',
        error: err.message 
      });
    }
    res.json({ success: true, data: row });
  });
};

// Create project from approved application
exports.createProjectFromApplication = (req, res) => {
  const { id } = req.params; // application ID

  // First, get the application details
  Application.getById(id, (err, application) => {
    if (err) {
      console.error('Error fetching application:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching application',
        error: err.message 
      });
    }

    if (!application) {
      return res.status(404).json({ 
        success: false, 
        message: 'Application not found' 
      });
    }

    // Check if application is approved
    if (application.status !== 'approved') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only approved applications can be converted to projects' 
      });
    }

    // Check if a project already exists for this application
    if (application.project_title) {
      return res.status(400).json({ 
        success: false, 
        message: 'A project already exists for this application' 
      });
    }

    // Create project from application data
    const projectData = {
      application_id: application.id,
      title: application.title,
      description: application.description,
      category: application.category,
      target_amount: application.target_amount,
      location: application.location,
      image_url: application.image_url,
      start_date: application.start_date,
      end_date: application.end_date,
      created_by: req.user?.id || application.reviewed_by || 1
    };

    Project.create(projectData, (err, result) => {
      if (err) {
        console.error('Error creating project:', err);
        if (err.message && err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({
            success: false,
            message: 'A project already exists for this application'
          });
        }
        return res.status(500).json({
          success: false,
          message: 'Error creating project from application',
          error: err.message
        });
      }

      res.status(201).json({
        success: true,
        message: 'Project created successfully from application',
        data: result
      });
    });
  });
};
