// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Signup controller
exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, and role'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    User.findByEmail(email, async (err, existingUser) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error checking existing user',
          error: err.message
        });
      }

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const userData = {
        name,
        email,
        phone: phone || null,
        password: hashedPassword,
        role
      };
      console.log('Creating user with data:', userData);

      User.create(userData, (err, user) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: err.message
          });
        }

        // Generate JWT token
        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        console.log('User created successfully:', user);

        res.status(201).json({
          success: true,
          message: 'User registered successfully',
          data: {
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              role: user.role
            },
            token
          }
        });
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during signup',
      error: error.message
    });
  }
};

// Login controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email
    User.findByEmail(email, async (err, user) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error finding user',
          error: err.message
        });
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
          },
          token
        }
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// Get current user profile
exports.getProfile = (req, res) => {
  User.findById(req.user.id, (err, user) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching user profile',
        error: err.message
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  });
};

// Update user profile
exports.updateProfile = (req, res) => {
  const { name, phone } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Name is required'
    });
  }

  User.update(req.user.id, { name, phone }, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error updating profile',
        error: err.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: result
    });
  });
};

// Get all users (admin only)
exports.getAllUsers = (req, res) => {
  User.getAll((err, users) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching users',
        error: err.message
      });
    }

    res.status(200).json({
      success: true,
      data: { users, count: users.length }
    });
  });
};
