import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import '../styles/admin.css';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [contactFilterStatus, setContactFilterStatus] = useState('all');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const statsData = await api.admin.getStats();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      if (activeTab === 'applications' || activeTab === 'overview') {
        const appsData = await api.admin.getApplications();
        if (appsData.success) {
          setApplications(appsData.applications);
        }
      }

      if (activeTab === 'users') {
        const usersData = await api.admin.getUsers();
        if (usersData.success) {
          setUsers(usersData.users);
        }
      }

      if (activeTab === 'contacts') {
        const contactsData = await api.contact.getAll();
        if (contactsData.success) {
          setContacts(contactsData.contacts);
        }
      }

      if (activeTab === 'chats') {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/all`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setChats(data.chats);
        }
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appId, status) => {
    if (!window.confirm(`Mark this application as ${status}?`)) return;

    try {
      const data = await api.admin.updateApplicationStatus(appId, status);
      if (data.success) {
        toast.success(`Application ${status}!`);
        loadData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleExport = async (type) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = type === 'applications' ? 'export-applications' : 'export-users';
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast.success(`${type} exported successfully!`);
      } else {
        toast.error('Failed to export');
      }
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setReplyMessage('');
  };

  const handleSendReply = async (e) => {
    e.preventDefault();

    if (!replyMessage.trim() || !selectedChat) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chat/${selectedChat._id}/reply`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ message: replyMessage })
        }
      );

      const data = await response.json();
      if (data.success) {
        setSelectedChat(data.chat);
        setReplyMessage('');
        toast.success('Reply sent!');
        loadData();
      }
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  const handleContactStatusUpdate = async (id, status) => {
    try {
      const data = await api.contact.updateStatus(id, status);
      if (data.success) {
        toast.success('Status updated');
        loadData();
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm('Delete this message?')) return;

    try {
      const data = await api.contact.delete(id);
      if (data.success) {
        toast.success('Message deleted');
        loadData();
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatProgram = (program) => {
    if (!program) return '';
    return program.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.program?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || app.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pieData = [
    { name: 'Pending', value: stats.pendingApplications || 0, color: '#fbbc04' },
    { name: 'Approved', value: stats.approvedApplications || 0, color: '#34a853' },
    { name: 'Rejected', value: stats.rejectedApplications || 0, color: '#ea4335' }
  ];

  const programData = [
    { name: 'Web Dev', value: applications.filter(a => a.program === 'web-development').length },
    { name: 'Java Dev', value: applications.filter(a => a.program === 'java-development').length },
    { name: 'Python Dev', value: applications.filter(a => a.program === 'python-development').length }
  ];

  if (loading && activeTab === 'overview') {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
            RKS <span>Nexus</span>
          </Link>
          <span className="admin-badge">🛡️ Admin Panel</span>
        </div>
        <div className="header-right">
          <Link to="/" className="home-btn-admin">
            🏠 Home
          </Link>
          <button className="logout-btn" onClick={() => {
            logout();
            navigate('/');
            toast.success('Logged out successfully');
          }}>
            Logout 🚪
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`tab ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          📝 Applications
        </button>
        <button
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button
          className={`tab ${activeTab === 'chats' ? 'active' : ''}`}
          onClick={() => setActiveTab('chats')}
        >
          💬 Chats
        </button>
        <button
          className={`tab ${activeTab === 'contacts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contacts')}
        >
          📧 Contact Messages
        </button>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div className="stats-grid">
              <div className="stat-card total">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>{stats.totalUsers || 0}</h3>
                  <p>Total Users</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📝</div>
                <div className="stat-info">
                  <h3>{stats.totalApplications || 0}</h3>
                  <p>Total Applications</p>
                </div>
              </div>
              <div className="stat-card pending">
                <div className="stat-icon">⏳</div>
                <div className="stat-info">
                  <h3>{stats.pendingApplications || 0}</h3>
                  <p>Pending</p>
                </div>
              </div>
              <div className="stat-card approved">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <h3>{stats.approvedApplications || 0}</h3>
                  <p>Approved</p>
                </div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <h3>Application Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
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

              <div className="chart-card">
                <h3>Applications by Program</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={programData}>
                    <XAxis dataKey="name" stroke="#9aa0a6" />
                    <YAxis stroke="#9aa0a6" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1f29',
                        border: '1px solid #7df9ff',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="value" fill="#7df9ff" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="recent-section">
              <h2>Recent Applications</h2>
              <div className="applications-list">
                {applications.slice(0, 5).map((app) => (
                  <div key={app._id} className="application-item">
                    <div className="app-user">
                      <div className="user-avatar">
                        {app.userId?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-info">
                        <h4>{app.userId?.name || 'Unknown'}</h4>
                        <p>{formatProgram(app.program)}</p>
                      </div>
                    </div>
                    <div className={`app-status status-${app.status}`}>
                      {app.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <>
            <div className="export-section">
              <button className="export-btn" onClick={() => handleExport('applications')}>
                📥 Export to CSV
              </button>
            </div>

            <div className="filters-section">
              <input
                type="text"
                className="search-input"
                placeholder="Search by name, email, or program..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Email</th>
                    <th>Program</th>
                    <th>Experience</th>
                    <th>Applied</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty-cell">
                        No applications found
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map((app) => (
                      <tr key={app._id}>
                        <td className="user-cell">
                          <div className="user-avatar-sm">
                            {app.userId?.name?.charAt(0).toUpperCase()}
                          </div>
                          <span>{app.userId?.name || 'Unknown'}</span>
                        </td>
                        <td>{app.userId?.email || '-'}</td>
                        <td>{formatProgram(app.program)}</td>
                        <td>{app.experience || '-'}</td>
                        <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge status-${app.status}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="actions-cell">
                          {app.status === 'pending' && (
                            <>
                              <button
                                className="action-btn approve"
                                onClick={() => handleStatusUpdate(app._id, 'approved')}
                              >
                                ✓
                              </button>
                              <button
                                className="action-btn reject"
                                onClick={() => handleStatusUpdate(app._id, 'rejected')}
                              >
                                ✕
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <>
            <div className="export-section">
              <button className="export-btn" onClick={() => handleExport('users')}>
                📥 Export to CSV
              </button>
            </div>

            <div className="filters-section">
              <input
                type="text"
                className="search-input"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Program</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-cell">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user._id}>
                        <td className="user-cell">
                          <div className="user-avatar-sm">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <span>{user.name}</span>
                          {user.role === 'admin' && ' 👑'}
                        </td>
                        <td>{user.email}</td>
                        <td>{user.phone || '-'}</td>
                        <td>{formatProgram(user.program) || '-'}</td>
                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Chats Tab */}
        {activeTab === 'chats' && (
          <div className="chats-container">
            <div className="chats-list">
              <h3>Active Chats ({chats.length})</h3>
              {chats.length === 0 ? (
                <div className="empty-chats">
                  <p>No chats yet</p>
                </div>
              ) : (
                chats.map((chat) => (
                  <div 
                    key={chat._id} 
                    className={`chat-item ${selectedChat?._id === chat._id ? 'active' : ''}`}
                    onClick={() => handleSelectChat(chat)}
                  >
                    <div className="chat-item-avatar">
                      {chat.userId?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="chat-item-info">
                      <h4>{chat.userId?.name}</h4>
                      <p className="chat-item-preview">
                        {chat.messages[chat.messages.length - 1]?.message.substring(0, 40)}...
                      </p>
                    </div>
                    <div className="chat-item-meta">
                      <span className="chat-item-time">
                        {formatTime(chat.lastMessage)}
                      </span>
                      {chat.status === 'open' && (
                        <span className="chat-badge-new">New</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="chat-view">
              {!selectedChat ? (
                <div className="chat-empty-state">
                  <div className="empty-icon">💬</div>
                  <h3>Select a chat to view messages</h3>
                </div>
              ) : (
                <>
                  <div className="chat-view-header">
                    <div className="chat-view-user">
                      <div className="chat-view-avatar">
                        {selectedChat.userId?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3>{selectedChat.userId?.name}</h3>
                        <p>{selectedChat.userId?.email}</p>
                      </div>
                    </div>
                    <span className={`chat-status-badge ${selectedChat.status}`}>
                      {selectedChat.status}
                    </span>
                  </div>

                  <div className="chat-view-messages">
                    {selectedChat.messages.map((msg, index) => (
                      <div 
                        key={index} 
                        className={`chat-msg ${msg.isAdmin ? 'admin' : 'user'}`}
                      >
                        <div className="chat-msg-content">
                          <div className="chat-msg-sender">
                            {msg.senderName}
                            {msg.isAdmin && ' 👑'}
                          </div>
                          <div className="chat-msg-text">{msg.message}</div>
                          <div className="chat-msg-time">
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <form className="chat-reply-form" onSubmit={handleSendReply}>
                    <input
                      type="text"
                      placeholder="Type your reply..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="chat-reply-input"
                    />
                    <button 
                      type="submit" 
                      className="chat-reply-btn"
                      disabled={!replyMessage.trim()}
                    >
                      Send ➤
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="contacts-section">
            <div className="section-header">
              <h2>📧 Contact Messages ({contacts.length})</h2>
              <div className="contact-filters">
                <button 
                  className={`filter-btn ${contactFilterStatus === 'all' ? 'active' : ''}`}
                  onClick={() => setContactFilterStatus('all')}
                >
                  All ({contacts.length})
                </button>
                <button 
                  className={`filter-btn ${contactFilterStatus === 'new' ? 'active' : ''}`}
                  onClick={() => setContactFilterStatus('new')}
                >
                  New ({contacts.filter(c => c.status === 'new').length})
                </button>
                <button 
                  className={`filter-btn ${contactFilterStatus === 'read' ? 'active' : ''}`}
                  onClick={() => setContactFilterStatus('read')}
                >
                  Read ({contacts.filter(c => c.status === 'read').length})
                </button>
              </div>
            </div>

            <div className="contacts-grid">
              {contacts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <h3>No contact messages yet</h3>
                </div>
              ) : (
                contacts
                  .filter(c => contactFilterStatus === 'all' || c.status === contactFilterStatus)
                  .map(contact => (
                    <div key={contact._id} className={`contact-card status-${contact.status}`}>
                      <div className="contact-header">
                        <div className="contact-user-info">
                          <div className="contact-avatar">
                            {contact.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3>{contact.name}</h3>
                            <p className="contact-email">{contact.email}</p>
                            {contact.phone && (
                              <p className="contact-phone">📱 {contact.phone}</p>
                            )}
                          </div>
                        </div>
                        <span className={`status-badge status-${contact.status}`}>
                          {contact.status}
                        </span>
                      </div>

                      <div className="contact-body">
                        <p className="contact-subject">
                          <strong>Subject:</strong> {contact.subject}
                        </p>
                        <p className="contact-message">{contact.message}</p>
                        <p className="contact-date">
                          📅 {new Date(contact.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="contact-actions">
                        <select 
                          value={contact.status} 
                          onChange={(e) => handleContactStatusUpdate(contact._id, e.target.value)}
                          className="contact-status-select"
                        >
                          <option value="new">New</option>
                          <option value="read">Read</option>
                          <option value="replied">Replied</option>
                          <option value="archived">Archived</option>
                        </select>
                        
                        <a 
                          href={`mailto:${contact.email}?subject=Re: ${contact.subject}`}
                          className="contact-btn-reply"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          📧 Reply
                        </a>
                        
                        <button 
                          onClick={() => handleDeleteContact(contact._id)}
                          className="contact-btn-delete"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
