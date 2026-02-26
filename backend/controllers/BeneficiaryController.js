// controllers/beneficiaryController.js
const Beneficiary = require('../models/Beneficiary');

// Get all beneficiaries
const getAllBeneficiaries = (req, res) => {
  Beneficiary.findAll((err, beneficiaries) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching beneficiaries',
        error: err.message 
      });
    }
    
    // Format beneficiaries with status from aid_applications
    const formattedBeneficiaries = (beneficiaries || []).map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.location, // location field stores address
      status: 'pending', // Default status
      created_at: user.created_at,
      updated_at: user.updated_at
    }));
    
    res.json({
      success: true,
      data: formattedBeneficiaries,
      count: formattedBeneficiaries.length
    });
  });
};

// Get beneficiary by ID
const getBeneficiaryById = (req, res) => {
  const { id } = req.params;
  
  Beneficiary.findById(id, (err, beneficiary) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching beneficiary',
        error: err.message
      });
    }
    
    if (!beneficiary) {
      return res.status(404).json({
        success: false,
        message: 'Beneficiary not found'
      });
    }
    
    // Format response
    const formattedBeneficiary = {
      id: beneficiary.id,
      name: beneficiary.name,
      email: beneficiary.email,
      phone: beneficiary.phone,
      address: beneficiary.location,
      status: 'pending',
      created_at: beneficiary.created_at
    };
    
    res.json({
      success: true,
      data: formattedBeneficiary
    });
  });
};

// Create new beneficiary
const createBeneficiary = (req, res) => {
  const { name, email, phone, address, needs_description } = req.body;

  // Basic validation
  if (!name || !email || !needs_description) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and needs description are required'
    });
  }

  const beneficiaryData = {
    name,
    email,
    phone: phone || '',
    address: address || '',
    needs_description
  };

  Beneficiary.create(beneficiaryData, (err, result) => {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Error creating beneficiary',
        error: err.message
      });
    }

    // Create an aid application to store the needs_description
    Beneficiary.createApplication(
      {
        project_id: 1, // Default project ID - adjust as needed
        beneficiary_id: result.id,
        description: needs_description,
        amount_requested: 0
      },
      (appErr, application) => {
        if (appErr) {
          console.error('Warning: Failed to create application for beneficiary:', appErr);
          // Don't fail the request, just log the warning
        }
        
        res.status(201).json({
          success: true,
          message: 'Beneficiary application submitted successfully',
          data: {
            id: result.id,
            name: result.name,
            email: result.email,
            phone: result.phone,
            address: result.address,
            needs_description: result.needs_description,
            status: result.status || 'pending',
            application_id: application?.id
          }
        });
      }
    );
  });
};

// Update beneficiary status
const updateBeneficiaryStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Status is required'
    });
  }

  const validStatuses = ['pending', 'approved', 'rejected', 'completed', 'under_review'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    });
  }

  Beneficiary.updateStatus(id, status, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error updating beneficiary status',
        error: err.message
      });
    }

    res.json({
      success: true,
      message: 'Beneficiary status updated successfully'
    });
  });
};

// Delete beneficiary
const deleteBeneficiary = (req, res) => {
  const { id } = req.params;

  Beneficiary.delete(id, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error deleting beneficiary',
        error: err.message
      });
    }

    res.json({
      success: true,
      message: 'Beneficiary deleted successfully'
    });
  });
};

// Get beneficiaries by email (for user-specific view)
const getBeneficiariesByEmail = (req, res) => {
  const { email } = req.params;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  Beneficiary.findByEmail(email, (err, beneficiaries) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching beneficiaries',
        error: err.message
      });
    }
    
    res.json({
      success: true,
      data: beneficiaries,
      count: beneficiaries.length
    });
  });
};

// Get beneficiary dashboard data
const getBeneficiaryDashboard = (req, res) => {
  const { email } = req.params;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  Beneficiary.getDashboardData(email, (err, dashboardData) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching dashboard data',
        error: err.message
      });
    }
    
    res.json({
      success: true,
      data: dashboardData
    });
  });
};

module.exports = {
  getAllBeneficiaries,
  getBeneficiaryById,
  createBeneficiary,
  updateBeneficiaryStatus,
  deleteBeneficiary,
  getBeneficiariesByEmail,
  getBeneficiaryDashboard
};