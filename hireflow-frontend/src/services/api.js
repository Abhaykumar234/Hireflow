const API_BASE_URL = 'http://localhost:8080';

// Get JWT token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Handle token refresh on 401 errors
const fetchWithAuth = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  let response = await fetch(url, { ...options, headers });

  // If unauthorized and we have a refresh token, try to refresh
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          
          // Retry original request with new token
          headers.Authorization = `Bearer ${data.accessToken}`;
          response = await fetch(url, { ...options, headers });
        } else {
          // Refresh failed, clear tokens and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    }
  }

  return response;
};

export const api = {
  // Auth
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    const data = await response.json();
    
    // Store JWT tokens
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  register: async (email, password, fullName, role = 'CANDIDATE') => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName, role }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    return response.json();
  },

  verifyEmail: async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`, {
      method: 'GET',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Verification failed');
    }
    const data = await response.json();
    
    // Store JWT tokens
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  },

  resendVerification: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to resend verification email');
    }
    return response.json();
  },

  refreshToken: async (refreshToken) => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) throw new Error('Token refresh failed');
    return response.json();
  },

  // Health
  checkHealth: async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.text();
  },

  // Jobs
  getJobs: async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/jobs`);
    if (!response.ok) throw new Error('Failed to fetch jobs');
    return response.json();
  },

  createJob: async (jobData) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
    if (!response.ok) throw new Error('Failed to create job');
    return response.json();
  },

  // Applications
  getApplications: async () => {
    const response = await fetchWithAuth(`${API_BASE_URL}/applications`);
    if (!response.ok) throw new Error('Failed to fetch applications');
    return response.json();
  },

  createApplication: async (appData, jobId) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/applications?jobId=${jobId}`, {
      method: 'POST',
      body: JSON.stringify(appData),
    });
    if (!response.ok) throw new Error('Failed to create application');
    return response.json();
  },

  updateApplicationStage: async (id, stage) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/applications/${id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stage }),
    });
    if (!response.ok) throw new Error('Failed to update stage');
    return response.json();
  },

  // User profile and settings
  updateUser: async (id, userData) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update settings');
    }
    return response.json();
  },

  updatePassword: async (id, oldPassword, newPassword) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update password');
    }
    return response.json();
  },

  // Notifications
  getNotifications: async (userId) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/notifications?userId=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
  },

  markNotificationAsRead: async (id) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PATCH',
    });
    if (!response.ok) throw new Error('Failed to mark notification as read');
    return response.json();
  },

  markAllNotificationsAsRead: async (userId) => {
    const response = await fetchWithAuth(`${API_BASE_URL}/notifications/read-all?userId=${userId}`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to clear notifications');
    return response.json();
  },
};