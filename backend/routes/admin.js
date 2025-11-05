const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Application = require('../models/Application');
const sendEmail = require('../utils/mailer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');

const router = express.Router();

// ============================================
// AUTH MIDDLEWARE - CHECK IF USER IS ADMIN
// ============================================
const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Admin only.' 
      });
    }
    
    req.userId = decoded.userId;
    req.user = user;
    next();
    
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      message: 'Invalid token' 
    });
  }
};

// ============================================
// GET ALL USERS
// ============================================
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({ 
      success: true,
      count: users.length,
      users 
    });
    
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch users',
      error: error.message 
    });
  }
});

// ============================================
// GET ALL APPLICATIONS WITH USER DETAILS
// ============================================
router.get('/applications', adminAuth, async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('userId', 'name email phone')
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

// ============================================
// UPDATE APPLICATION STATUS (WITH EMAIL NOTIFICATION)
// ============================================
router.put('/applications/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'in-progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid status' 
      });
    }
    
    const application = await Application.findByIdAndUpdate(
      id,
      { 
        status,
        notes: notes || '',
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('userId', 'name email');
    
    if (!application) {
      return res.status(404).json({ 
        success: false,
        message: 'Application not found' 
      });
    }
    
    // ✅ SEND STATUS UPDATE EMAIL TO USER
    try {
      const programName = application.program
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      
      const statusColors = {
        approved: '#34a853',
        rejected: '#ea4335',
        'in-progress': '#fbbc04',
        completed: '#32b8c6'
      };
      
      const statusMessages = {
        approved: '✅ Your application has been approved!',
        rejected: '❌ Your application has been rejected',
        'in-progress': '⏳ Your application is in progress',
        completed: '🎉 You have completed the program!'
      };
      
      const statusEmail = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: ${statusColors[status]}; margin: 0;">
                ${statusMessages[status]}
              </h1>
            </div>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Hi <strong>${application.userId.name}</strong>,
            </p>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Your application for <strong>${programName}</strong> has been updated.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #666;">
                <strong>Program:</strong> ${programName}<br>
                <strong>Status:</strong> <span style="color: ${statusColors[status]}; font-weight: bold;">${status.toUpperCase()}</span>
              </p>
              ${notes ? `
                <p style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 14px; color: #555;">
                  <strong>Admin Notes:</strong><br>
                  ${notes}
                </p>
              ` : ''}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}/dashboard" 
                 style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #32b8c6, #7df9ff); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                View Dashboard
              </a>
            </div>
            
            <p style="font-size: 14px; color: #777; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
              Best regards,<br>
              <strong>RKS Nexus Team</strong>
            </p>
          </div>
        </div>
      `;
      
      await sendEmail(
        application.userId.email,
        `Application ${status.toUpperCase()} - RKS Nexus`,
        statusEmail
      );
      
      console.log(`✅ Status email sent to ${application.userId.email}`);
    } catch (emailError) {
      console.error('❌ Status email failed:', emailError.message);
      // Don't fail status update if email fails
    }
    
    res.json({ 
      success: true,
      message: `Application ${status} successfully. Email notification sent to user.`,
      application 
    });
    
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update status',
      error: error.message 
    });
  }
});

// ============================================
// EXPORT APPLICATIONS TO CSV
// ============================================
router.get('/export-applications', adminAuth, async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    const csvPath = path.join(__dirname, '../exports/applications.csv');
    
    // Create exports directory if it doesn't exist
    const exportsDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    const csvWriter = createCsvWriter({
      path: csvPath,
      header: [
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'phone', title: 'Phone' },
        { id: 'program', title: 'Program' },
        { id: 'experience', title: 'Experience' },
        { id: 'skills', title: 'Skills' },
        { id: 'status', title: 'Status' },
        { id: 'appliedDate', title: 'Applied Date' }
      ]
    });

    const records = applications.map(app => ({
      name: app.userId?.name || 'N/A',
      email: app.userId?.email || 'N/A',
      phone: app.userId?.phone || 'N/A',
      program: app.program,
      experience: app.experience,
      skills: app.skills,
      status: app.status,
      appliedDate: new Date(app.createdAt).toLocaleDateString()
    }));

    await csvWriter.writeRecords(records);

    res.download(csvPath, 'applications.csv', (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Delete file after download
      try {
        fs.unlinkSync(csvPath);
      } catch (e) {
        console.error('File cleanup error:', e);
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to export data',
      error: error.message 
    });
  }
});

// ============================================
// EXPORT USERS TO CSV
// ============================================
router.get('/export-users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    const csvPath = path.join(__dirname, '../exports/users.csv');
    
    const exportsDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    const csvWriter = createCsvWriter({
      path: csvPath,
      header: [
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'phone', title: 'Phone' },
        { id: 'program', title: 'Program' },
        { id: 'role', title: 'Role' },
        { id: 'joinedDate', title: 'Joined Date' }
      ]
    });

    const records = users.map(user => ({
      name: user.name,
      email: user.email,
      phone: user.phone || 'N/A',
      program: user.program || 'N/A',
      role: user.role,
      joinedDate: new Date(user.createdAt).toLocaleDateString()
    }));

    await csvWriter.writeRecords(records);

    res.download(csvPath, 'users.csv', (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      try {
        fs.unlinkSync(csvPath);
      } catch (e) {
        console.error('File cleanup error:', e);
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to export data',
      error: error.message 
    });
  }
});

// ============================================
// GET DASHBOARD STATS
// ============================================
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    const approvedApplications = await Application.countDocuments({ status: 'approved' });
    const inProgressApplications = await Application.countDocuments({ status: 'in-progress' });
    const rejectedApplications = await Application.countDocuments({ status: 'rejected' });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    
    // Get program-wise stats
    const programStats = await Application.aggregate([
      {
        $group: {
          _id: '$program',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({ 
      success: true,
      stats: {
        totalUsers,
        verifiedUsers,
        totalApplications,
        pendingApplications,
        approvedApplications,
        inProgressApplications,
        rejectedApplications,
        programStats
      }
    });
    
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch stats',
      error: error.message 
    });
  }
});

// ============================================
// VERIFY USER
// ============================================
router.put('/users/:id/verify', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndUpdate(
      id,
      { isVerified: true },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    res.json({ 
      success: true,
      message: 'User verified successfully',
      user 
    });
    
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to verify user',
      error: error.message 
    });
  }
});

// ============================================
// DELETE USER
// ============================================
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Don't allow deleting yourself
    if (id === req.userId.toString()) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot delete your own account' 
      });
    }
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Also delete user's applications
    await Application.deleteMany({ userId: id });
    
    res.json({ 
      success: true,
      message: 'User deleted successfully' 
    });
    
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete user',
      error: error.message 
    });
  }
});

// ============================================
// MAKE USER ADMIN (USE CAREFULLY!)
// ============================================
router.put('/users/:id/make-admin', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndUpdate(
      id,
      { role: 'admin' },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    res.json({ 
      success: true,
      message: 'User is now admin',
      user 
    });
    
  } catch (error) {
    console.error('Make admin error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to make admin',
      error: error.message 
    });
  }
});

module.exports = router;
