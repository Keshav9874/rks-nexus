// Email Templates
const emailTemplates = {
  
  // Welcome Email
  welcome: (name) => `
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
          <a href="http://localhost:5500/frontend/index.html" 
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
  `,
  
  // OTP Email
  otp: (otp, email) => `
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
  `,
  
  // Application Status Update
  applicationStatus: (name, program, status, notes = '') => {
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
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: ${statusColors[status]}; margin: 0;">
              ${statusMessages[status]}
            </h1>
          </div>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Hi <strong>${name}</strong>,
          </p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Your application for <strong>${program}</strong> has been updated.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              <strong>Program:</strong> ${program}<br>
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
            <a href="http://localhost:5500/frontend/dashboard.html" 
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
  }
};

module.exports = emailTemplates;
