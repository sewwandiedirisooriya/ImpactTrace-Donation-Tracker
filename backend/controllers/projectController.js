// controllers/projectController.js
const Project = require('../models/Project');

// Get all projects
const getAllProjects = (req, res) => {
  Project.findAll((err, projects) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching projects',
        error: err.message
      });
    }
    res.json({
      success: true,
      data: projects,
      count: projects.length
    });
  });
};

// Get project by ID
const getProjectById = (req, res) => {
  const { id } = req.params;

  Project.findById(id, (err, project) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching project',
        error: err.message
      });
    }

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: project
    });
  });
};

// Create new project
const createProject = (req, res) => {
  const { 
    application_id,
    name, 
    title, 
    description, 
    category, 
    target_amount, 
    location, 
    image_url, 
    start_date, 
    end_date 
  } = req.body;

  // Support both 'name' and 'title' for backwards compatibility
  const projectTitle = title || name;

  if (!application_id) {
    return res.status(400).json({
      success: false,
      message: 'Application ID is required to create a project'
    });
  }

  if (!projectTitle || !description || !target_amount || !location) {
    return res.status(400).json({
      success: false,
      message: 'Title/name, description, target amount, and location are required'
    });
  }

  if (target_amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Target amount must be greater than 0'
    });
  }

  const projectData = {
    application_id,
    title: projectTitle,
    description,
    category: category || 'General',
    target_amount: parseFloat(target_amount),
    location,
    image_url: image_url || null,
    start_date: start_date || null,
    end_date: end_date || null,
    created_by: req.user?.id || 1 // Use authenticated user or default to admin (1)
  };

  Project.create(projectData, (err, result) => {
    if (err) {
      // Check if it's a unique constraint error (application already has a project)
      if (err.message && err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({
          success: false,
          message: 'A project already exists for this application'
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Error creating project',
        error: err.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: result
    });
  });
};

// Update project progress
const updateProjectProgress = (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid amount is required'
    });
  }

  Project.updateCollectedAmount(id, parseFloat(amount), (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error updating project progress',
        error: err.message
      });
    }

    res.json({
      success: true,
      message: 'Project progress updated successfully'
    });
  });
};

// Get project progress
const getProjectProgress = (req, res) => {
  Project.getProgress((err, projects) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching project progress',
        error: err.message
      });
    }

    res.json({
      success: true,
      data: projects || []
    });
  });
};

// Update project
const updateProject = (req, res) => {
  const { id } = req.params;
  const { name, title, description, category, target_amount, location, image_url } = req.body;

  // Support both 'name' and 'title' for backwards compatibility
  const projectTitle = title || name;

  if (!projectTitle || !description || !target_amount) {
    return res.status(400).json({
      success: false,
      message: 'Title/name, description, and target amount are required'
    });
  }

  if (target_amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Target amount must be greater than 0'
    });
  }

  const projectData = {
    title: projectTitle,
    description,
    category: category || 'General',
    target_amount: parseFloat(target_amount),
    location: location || null,
    image_url: image_url || null
  };

  Project.update(id, projectData, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error updating project',
        error: err.message
      });
    }

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: { id, ...projectData }
    });
  });
};

// Delete project
const deleteProject = (req, res) => {
  const { id } = req.params;
  console.log('Deleting project with ID:', id);

  Project.delete(id, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error deleting project',
        error: err.message
      });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  });
};

// Get trending projects (highest goal/target amount)
const getTrendingProjects = (req, res) => {
  const limit = parseInt(req.query.limit) || 5; // Default to 5 trending projects

  Project.findTrending(limit, (err, projects) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching trending projects',
        error: err.message
      });
    }

    res.json({
      success: true,
      data: projects || [],
      count: projects?.length || 0
    });
  });
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProjectProgress,
  getProjectProgress,
  updateProject,
  deleteProject,
  getTrendingProjects
};