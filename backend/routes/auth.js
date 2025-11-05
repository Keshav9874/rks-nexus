const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const sendEmail = require('../utils/mailer');

const router = express.Router();

// ============================================
// AUTH MIDDLEWARE
// ============================================
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
    req.user = await User.findById(decoded.userId).select('-password');
    
    if (!req.user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      message: 'Invalid token' 
    });
  }
};

// ============================================
// REGISTER NEW USER (WITH WELCOME EMAIL)
// ============================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, program } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Name, email, and password are required' 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email already exists' 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      program
    });

    await user.save();

    try {
      const welcomeEmail = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #32b8c6; margin: 0;">🎉 Welcome to RKS Nexus!</h1>
            </div>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Hi <strong>${name}</strong>,
            </p>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Thank you for registering with <strong>RKS Nexus</strong>! We're excited to have you on board.
            </p>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              You can now:
            </p>
            
            <ul style="font-size: 15px; color: #555; line-height: 1.8;">
              <li>Browse available internship programs</li>
              <li>Submit applications for programs</li>
              <li>Track your application status</li>
              <li>Update your profile</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}" 
                 style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #32b8c6, #7df9ff); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Login Now
              </a>
            </div>
            
            <p style="font-size: 14px; color: #777; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
              Best regards,<br>
              <strong>RKS Nexus Team</strong>
            </p>
          </div>
        </div>
      `;
      
      await sendEmail(email, 'Welcome to RKS Nexus! 🎉', welcomeEmail);
      console.log(`✅ Welcome email sent to ${email}`);
    } catch (emailError) {
      console.error('❌ Welcome email failed:', emailError.message);
    }

    res.status(201).json({ 
      success: true,
      message: 'User registered successfully! Welcome email sent. You can now login.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration',
      error: error.message 
    });
  }
});

// ============================================
// LOGIN USER
// ============================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({ 
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        program: user.program,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login',
      error: error.message 
    });
  }
});

// ============================================
// FORGOT PASSWORD - SEND OTP
// ============================================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Email is required' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'No account found with this email' 
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.deleteMany({ email });
    await OTP.create({ email, otp });

    try {
      const otpEmail = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #32b8c6; margin: 0;">🔐 Password Reset OTP</h1>
            </div>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Hi <strong>${user.name}</strong>,
            </p>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Your OTP for password reset is:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background: #f0f9ff; padding: 20px 40px; border-radius: 10px; border: 2px dashed #32b8c6;">
                <span style="font-size: 32px; font-weight: bold; color: #32b8c6; letter-spacing: 8px;">
                  ${otp}
                </span>
              </div>
            </div>
            
            <p style="font-size: 14px; color: #666; text-align: center;">
              This OTP will expire in <strong>10 minutes</strong>
            </p>
            
            <p style="font-size: 13px; color: #999; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
              If you didn't request this, please ignore this email.
            </p>
          </div>
        </div>
      `;
      
      await sendEmail(email, 'Password Reset OTP - RKS Nexus 🔐', otpEmail);
      console.log(`✅ Password reset OTP sent to ${email}`);
    } catch (emailError) {
      console.error('❌ OTP email failed:', emailError.message);
    }

    res.json({ 
      success: true,
      message: 'OTP sent to your email successfully'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to send OTP',
      error: error.message 
    });
  }
});

// ============================================
// RESET PASSWORD WITH OTP
// ============================================
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Email, OTP, and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters' 
      });
    }

    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid or expired OTP' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    await OTP.deleteOne({ email, otp });

    res.json({ 
      success: true,
      message: 'Password reset successful! You can now login.' 
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Password reset failed',
      error: error.message 
    });
  }
});

// ============================================
// UPDATE PROFILE (EMAIL DISABLED FOR SECURITY)
// ============================================
router.put('/update-profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, program } = req.body; // REMOVED email - can't be changed
    const userId = req.user._id;

    // Only allow name, phone, program updates - NOT EMAIL
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, phone, program },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.json({ success: false, message: 'Failed to update profile' });
  }
});

// ============================================
// CHANGE PASSWORD
// ============================================
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.json({ success: false, message: 'Failed to change password' });
  }
});

// ============================================
// SEND OTP (WITH EMAIL)
// ============================================
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Email is required' 
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.deleteMany({ email });
    await OTP.create({ email, otp });

    try {
      const otpEmail = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #32b8c6; margin: 0;">🔐 Your OTP Code</h1>
            </div>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Your One-Time Password (OTP) for email verification is:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background: #f0f9ff; padding: 20px 40px; border-radius: 10px; border: 2px dashed #32b8c6;">
                <span style="font-size: 32px; font-weight: bold; color: #32b8c6; letter-spacing: 8px;">
                  ${otp}
                </span>
              </div>
            </div>
            
            <p style="font-size: 14px; color: #666; text-align: center;">
              This OTP will expire in <strong>10 minutes</strong>
            </p>
            
            <p style="font-size: 13px; color: #999; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
              If you didn't request this OTP, please ignore this email.
            </p>
          </div>
        </div>
      `;
      
      await sendEmail(email, 'Your OTP Code - RKS Nexus 🔐', otpEmail);
      console.log(`✅ OTP email sent to ${email}`);
    } catch (emailError) {
      console.error('❌ OTP email failed:', emailError.message);
    }

    res.json({ 
      success: true,
      message: 'OTP sent to your email successfully',
      devOTP: process.env.NODE_ENV === 'development' ? otp : undefined
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to send OTP',
      error: error.message 
    });
  }
});

// ============================================
// VERIFY OTP
// ============================================
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and OTP are required' 
      });
    }

    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid or expired OTP' 
      });
    }

    await User.findOneAndUpdate({ email }, { isVerified: true });
    await OTP.deleteOne({ email, otp });

    res.json({ 
      success: true,
      message: 'Email verified successfully' 
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ 
      success: false,
      message: 'OTP verification failed',
      error: error.message 
    });
  }
});

// ============================================
// GET USER PROFILE
// ============================================
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    res.json({ 
      success: true,
      user: req.user 
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({ 
      success: false,
      message: 'Failed to get profile',
      error: error.message 
    });
  }
});

// ============================================
// TEST EMAIL ROUTE
// ============================================
router.get('/test-email', async (req, res) => {
  try {
    console.log('📧 Test email route hit!');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return res.status(500).json({
        success: false,
        message: 'Email credentials not configured'
      });
    }
    
    const result = await sendEmail(
      process.env.EMAIL_USER,
      'Test Email - RKS Nexus',
      `
        <div style="font-family: Arial; padding: 20px; background: #f5f5f5;">
          <div style="background: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #32b8c6;">🎉 Email Working!</h1>
            <p>Your email system is working perfectly!</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `
    );
    
    console.log('✅ Email sent successfully!');
    
    return res.json({ 
      success: true,
      message: 'Test email sent! Check your inbox.',
      recipient: process.env.EMAIL_USER,
      result 
    });
    
  } catch (error) {
    console.error('❌ Test email error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router;
