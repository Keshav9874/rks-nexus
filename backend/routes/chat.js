const express = require('express');
const jwt = require('jsonwebtoken');
const Chat = require('../models/Chat');
const User = require('../models/User');

const router = express.Router();

// Auth Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-password');
    
    if (!req.user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Admin Middleware
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin only' });
  }
  next();
};

// Get or Create Chat for User
router.get('/my-chat', authMiddleware, async (req, res) => {
  try {
    let chat = await Chat.findOne({ userId: req.user._id });
    
    if (!chat) {
      chat = await Chat.create({
        userId: req.user._id,
        messages: []
      });
    }
    
    res.json({ success: true, chat });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ success: false, message: 'Failed to get chat' });
  }
});

// Send Message
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }
    
    let chat = await Chat.findOne({ userId: req.user._id });
    
    if (!chat) {
      chat = await Chat.create({
        userId: req.user._id,
        messages: []
      });
    }
    
    const newMessage = {
      sender: req.user._id,
      senderName: req.user.name,
      message: message.trim(),
      isAdmin: req.user.role === 'admin',
      timestamp: new Date()
    };
    
    chat.messages.push(newMessage);
    chat.lastMessage = new Date();
    await chat.save();
    
    res.json({ success: true, message: newMessage, chat });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

// Get All Chats (Admin Only)
router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const chats = await Chat.find()
      .populate('userId', 'name email')
      .sort({ lastMessage: -1 });
    
    res.json({ success: true, chats });
  } catch (error) {
    console.error('Get all chats error:', error);
    res.status(500).json({ success: false, message: 'Failed to get chats' });
  }
});

// Get Specific Chat (Admin Only)
router.get('/:chatId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('userId', 'name email');
    
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    
    res.json({ success: true, chat });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ success: false, message: 'Failed to get chat' });
  }
});

// Reply to Chat (Admin Only)
router.post('/:chatId/reply', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const chat = await Chat.findById(req.params.chatId);
    
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    
    const newMessage = {
      sender: req.user._id,
      senderName: req.user.name,
      message: message.trim(),
      isAdmin: true,
      timestamp: new Date()
    };
    
    chat.messages.push(newMessage);
    chat.lastMessage = new Date();
    await chat.save();
    
    res.json({ success: true, message: newMessage, chat });
  } catch (error) {
    console.error('Reply error:', error);
    res.status(500).json({ success: false, message: 'Failed to send reply' });
  }
});

// Close Chat (Admin Only)
router.put('/:chatId/close', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const chat = await Chat.findByIdAndUpdate(
      req.params.chatId,
      { status: 'closed' },
      { new: true }
    );
    
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    
    res.json({ success: true, chat });
  } catch (error) {
    console.error('Close chat error:', error);
    res.status(500).json({ success: false, message: 'Failed to close chat' });
  }
});

module.exports = router;
