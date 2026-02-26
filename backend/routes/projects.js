// routes/projects.js
const express = require('express');
const router = express.Router();

const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProjectProgress,
  getProjectProgress,
  updateProject,
  deleteProject,
  getTrendingProjects
} = require('../controllers/projectController');

// GET /api/projects - Get all projects
router.get('/', getAllProjects);

// GET /api/projects/trending - Get trending projects (highest goal amount)
router.get('/trending', getTrendingProjects);

// GET /api/projects/progress - Get project progress
router.get('/progress', getProjectProgress);

// GET /api/projects/:id - Get project by ID
router.get('/:id', getProjectById);

// POST /api/projects - Create new project
router.post('/', createProject);

// PUT /api/projects/:id - Update project
router.put('/:id', updateProject);

// PUT /api/projects/:id/progress - Update project progress
router.put('/:id/progress', updateProjectProgress);

// DELETE /api/projects/:id - Delete project
router.delete('/:id', deleteProject);

module.exports = router;