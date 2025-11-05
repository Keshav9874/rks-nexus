const express = require('express');
const jwt = require('jsonwebtoken');
const Application = require('../models/Application');
const User = require('../models/User');

const router = express.Router();

// Middleware to verify JWT token
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();

  } catch (error) {
    return res.status(401).json({ 
      success: false,
      message: 'Invalid token' 
    });
  }
};

// SUBMIT APPLICATION
router.post('/submit', authMiddleware, async (req, res) => {
  try {
    const { program, experience, education, motivation } = req.body;

    if (!program) {
      return res.status(400).json({ 
        success: false,
        message: 'Program selection is required' 
      });
    }

    // Check if user already has an application
    const existingApplication = await Application.findOne({
      userId: req.userId,
      program,
      status: { $in: ['pending', 'approved', 'in-progress'] }
    });

    if (existingApplication) {
      return res.status(400).json({ 
        success: false,
        message: 'You already have an active application for this program' 
      });
    }

    // Create new application
    const application = new Application({
      userId: req.userId,
      program,
      experience,
      education,
      motivation
    });

    await application.save();

    res.status(201).json({ 
      success: true,
      message: 'Application submitted successfully',
      application 
    });

  } catch (error) {
    console.error('Application submission error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to submit application',
      error: error.message 
    });
  }
});

// GET USER'S APPLICATIONS
router.get('/my-applications', authMiddleware, async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.userId })
      .sort({ submittedAt: -1 });

    res.json({ 
      success: true,
      count: applications.length,
      applications 
    });

  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch applications',
      error: error.message 
    });
  }
});

// GET ALL APPLICATIONS (Admin only)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Admin only.' 
      });
    }

    const applications = await Application.find()
      .populate('userId', 'name email phone')
      .sort({ submittedAt: -1 });

    res.json({ 
      success: true,
      count: applications.length,
      applications 
    });

  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch applications',
      error: error.message 
    });
  }
});

module.exports = router;
