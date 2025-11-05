module.exports = (req, res, next) => {
  // Check if user role is admin
  if (req.userRole !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required' 
    });
  }
  
  next();
};
