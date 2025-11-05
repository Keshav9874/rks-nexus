const API_BASE_URL = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

const api = {
  auth: {
    register: async (data) => {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    
    login: async (data) => {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    
    sendOTP: async (email) => {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return res.json();
    },
    
    verifyOTP: async (data) => {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    
    forgotPassword: async (email) => {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return res.json();
    },

    resetPassword: async (email, otp, newPassword) => {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      return res.json();
    },
    
    updateProfile: async (data) => {
      const res = await fetch(`${API_BASE_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(data)
      });
      return res.json();
    },

    changePassword: async (currentPassword, newPassword) => {
      const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      return res.json();
    },
    
    getProfile: async () => {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      return res.json();
    }
  },
  
  applications: {
    submit: async (data) => {
      const res = await fetch(`${API_BASE_URL}/applications/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    
    getMyApplications: async () => {
      const res = await fetch(`${API_BASE_URL}/applications/my-applications`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      return res.json();
    }
  },
  
  admin: {
    getStats: async () => {
      const res = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      return res.json();
    },
    
    getApplications: async () => {
      const res = await fetch(`${API_BASE_URL}/admin/applications`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      return res.json();
    },
    
    getUsers: async () => {
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      return res.json();
    },
    
    updateApplicationStatus: async (id, status) => {
      const res = await fetch(`${API_BASE_URL}/admin/applications/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ status })
      });
      return res.json();
    }
  },

  // NEW: Contact API
  contact: {
    submit: async (data) => {
      const res = await fetch(`${API_BASE_URL}/contact/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    
    getAll: async () => {
      const res = await fetch(`${API_BASE_URL}/contact/all`, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return res.json();
    },
    
    updateStatus: async (id, status) => {
      const res = await fetch(`${API_BASE_URL}/contact/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ status })
      });
      return res.json();
    },
    
    delete: async (id) => {
      const res = await fetch(`${API_BASE_URL}/contact/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${getToken()}`
        }
      });
      return res.json();
    }
  }
};

export default api;
