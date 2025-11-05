import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import '../styles/profile.css';

export default function Profile() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    program: user?.program || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      // Don't send email in the update request
      const { email, ...updateData } = formData;
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      if (data.success) {
        login(localStorage.getItem('token'), data.user);
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  return (
    <div className="profile-container">
      {/* Header */}
      <header className="profile-header">
        <div className="header-left">
          <Link to="/" className="logo">
            RKS <span>Nexus</span>
          </Link>
          <span className="breadcrumb">/ Profile</span>
        </div>
        <div className="header-right">
          <Link to="/" className="home-btn">🏠 Home</Link>
          <Link to="/dashboard" className="dashboard-btn">📊 Dashboard</Link>
          <button className="logout-btn" onClick={() => {
            logout();
            navigate('/');
            toast.success('Logged out successfully');
          }}>
            Logout 🚪
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="user-avatar-large">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2>{user?.name}</h2>
          <p className="user-email">{user?.email}</p>
          <div className="user-badge">{user?.role === 'admin' ? '👑 Admin' : '🎓 Student'}</div>
        </div>

        <div className="profile-main">
          {/* Tabs */}
          <div className="profile-tabs">
            <button 
              className={`tab ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              Personal Info
            </button>
            <button 
              className={`tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
          </div>

          {/* Personal Info Tab */}
          {activeTab === 'info' && (
            <div className="tab-content">
              <div className="content-header">
                <h3>Personal Information</h3>
                {!isEditing ? (
                  <button className="edit-btn" onClick={() => setIsEditing(true)}>
                    ✏️ Edit
                  </button>
                ) : (
                  <button className="cancel-btn" onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user?.name || '',
                      email: user?.email || '',
                      phone: user?.phone || '',
                      program: user?.program || ''
                    });
                  }}>
                    ✕ Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleUpdate}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="form-input disabled-input"
                    title="Email cannot be changed for security reasons"
                  />
                  <small style={{ 
                    color: '#9aa0a6', 
                    fontSize: '12px', 
                    display: 'block', 
                    marginTop: '4px' 
                  }}>
                    🔒 Email cannot be changed for security reasons
                  </small>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Preferred Program</label>
                  <select
                    name="program"
                    value={formData.program}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="form-input"
                  >
                    <option value="">Select a program</option>
                    <option value="web-development">Web Development</option>
                    <option value="java-development">Java Development</option>
                    <option value="python-development">Python Development</option>
                  </select>
                </div>

                {isEditing && (
                  <button type="submit" className="save-btn">
                    💾 Save Changes
                  </button>
                )}
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="tab-content">
              <div className="content-header">
                <h3>Change Password</h3>
              </div>

              <form onSubmit={handlePasswordUpdate}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    className="form-input"
                  />
                </div>

                <button type="submit" className="save-btn">
                  🔒 Update Password
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
