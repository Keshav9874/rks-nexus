import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import '../styles/dashboard.css';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  const [formData, setFormData] = useState({
    program: '',
    experience: '',
    skills: '',
    reason: ''
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await api.applications.getMyApplications();
      if (data.success) {
        setApplications(data.applications);
        calculateStats(data.applications);
      }
    } catch (error) {
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (apps) => {
    const stats = {
      total: apps.length,
      pending: apps.filter(a => a.status === 'pending').length,
      approved: apps.filter(a => a.status === 'approved').length,
      rejected: apps.filter(a => a.status === 'rejected').length
    };
    setStats(stats);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await api.applications.submit(formData);
      if (data.success) {
        toast.success('Application submitted successfully!');
        setShowApplyModal(false);
        setFormData({ program: '', experience: '', skills: '', reason: '' });
        fetchApplications();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to submit application');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const pieData = [
    { name: 'Pending', value: stats.pending, color: '#fbbc04' },
    { name: 'Approved', value: stats.approved, color: '#34a853' },
    { name: 'Rejected', value: stats.rejected, color: '#ea4335' }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#fbbc04';
      case 'approved': return '#34a853';
      case 'rejected': return '#ea4335';
      default: return '#9aa0a6';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      default: return '📝';
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
            RKS <span>Nexus</span>
          </Link>
          <span className="breadcrumb">/ Dashboard</span>
        </div>
        <div className="header-right">
          <Link to="/" className="home-btn">
            🏠 Home
          </Link>
          <div className="user-info">
            <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">Student</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout 🚪
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Welcome Section */}
        <section className="welcome-section">
          <div className="welcome-card">
            <h2>Welcome back, {user?.name}! 👋</h2>
            <p>Track your applications and manage your internship journey</p>
          </div>
          <button className="apply-btn" onClick={() => setShowApplyModal(true)}>
            + Apply for New Internship
          </button>
        </section>

        {/* Stats Grid */}
        <section className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>{stats.total}</h3>
              <p>Total Applications</p>
            </div>
          </div>
          <div className="stat-card pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{stats.pending}</h3>
              <p>Pending Review</p>
            </div>
          </div>
          <div className="stat-card approved">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{stats.approved}</h3>
              <p>Approved</p>
            </div>
          </div>
          <div className="stat-card rejected">
            <div className="stat-icon">❌</div>
            <div className="stat-info">
              <h3>{stats.rejected}</h3>
              <p>Rejected</p>
            </div>
          </div>
        </section>

        {/* Charts Section */}
        <section className="charts-section">
          <div className="chart-card">
            <h3>Application Status Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Applications Table */}
        <section className="applications-section">
          <h2>Your Applications</h2>
          {applications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No applications yet</h3>
              <p>Start your journey by applying for an internship</p>
              <button className="cta-btn" onClick={() => setShowApplyModal(true)}>
                Apply Now
              </button>
            </div>
          ) : (
            <div className="applications-grid">
              {applications.map((app) => (
                <div key={app._id} className="application-card">
                  <div className="app-header">
                    <div className="app-program">{app.program}</div>
                    <div 
                      className="app-status"
                      style={{ 
                        backgroundColor: `${getStatusColor(app.status)}20`,
                        color: getStatusColor(app.status)
                      }}
                    >
                      {getStatusIcon(app.status)} {app.status}
                    </div>
                  </div>
                  <div className="app-body">
                    <div className="app-field">
                      <span className="field-label">Experience:</span>
                      <span className="field-value">{app.experience}</span>
                    </div>
                    <div className="app-field">
                      <span className="field-label">Skills:</span>
                      <span className="field-value">{app.skills}</span>
                    </div>
                    <div className="app-field">
                      <span className="field-label">Applied:</span>
                      <span className="field-value">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="modal-overlay active" onClick={() => setShowApplyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowApplyModal(false)}>×</button>
            <h2 className="modal-title">Apply for Internship</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Program *</label>
                <select
                  name="program"
                  value={formData.program}
                  onChange={handleChange}
                  required
                  className="form-input"
                >
                  <option value="">Select Program</option>
                  <option value="web-development">Web Development</option>
                  <option value="java-development">Java Development</option>
                  <option value="python-development">Python Development</option>
                </select>
              </div>
              <div className="form-group">
                <label>Experience Level *</label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  required
                  className="form-input"
                >
                  <option value="">Select Experience</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="form-group">
                <label>Skills *</label>
                <input
                  type="text"
                  name="skills"
                  placeholder="e.g., HTML, CSS, JavaScript"
                  value={formData.skills}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Why do you want this internship? *</label>
                <textarea
                  name="reason"
                  placeholder="Tell us why you're interested..."
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  className="form-input"
                  rows="4"
                ></textarea>
              </div>
              <button type="submit" className="submit-btn">
                Submit Application
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
