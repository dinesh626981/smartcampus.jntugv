import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const isAuthPage =
        window.location.pathname.includes('/login') ||
        window.location.pathname.includes('/register') ||
        window.location.pathname === '/';

      if (!isAuthPage) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (identifier, password) => {
    const response = await api.post('/login', {
      email: identifier,
      identifier,
      password,
    });
    return response.data;
  },

  googleLogin: async (credential) => {
    const response = await api.post('/auth/google', { credential });
    return response.data;
  },

  getDepartments: async () => {
    const response = await api.get('/departments');
    return response.data;
  },

  register: async (payloadOrName, ...legacyArgs) => {
    if (typeof payloadOrName === 'object' && payloadOrName !== null) {
      const response = await api.post('/register', payloadOrName);
      return response.data;
    }
    const [
      email,
      password,
      phone,
      role = 'student',
      adminCode = '',
      registrationNumber = '',
      department = '',
      departmentId = null,
    ] = legacyArgs;

    const response = await api.post('/register', {
      name: payloadOrName,
      email,
      password,
      phone,
      role,
      admin_code: adminCode,
      registration_number: registrationNumber,
      department,
      department_id: departmentId,
    });
    return response.data;
  },

  registerAdmin: async (name, email, password, phone, adminCode) => {
    const response = await api.post('/register-admin', {
      name,
      email,
      password,
      phone,
      admin_code: adminCode,
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/profile');
    // Backend returns { user: {...} }
    return response.data?.user ?? response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/profile', profileData);
    // Backend returns { user: {...} }
    return response.data?.user ?? response.data;
  },

  completeAcademicProfile: async (academicData) => {
    const response = await api.put('/profile/academic', academicData);
    // Backend returns { user: {...} }
    return response.data?.user ? response.data : response.data;
  },

  linkGoogle: async (credential) => {
    const response = await api.post('/profile/link-google', { credential });
    return response.data;
  },

  unlinkGoogle: async () => {
    const response = await api.post('/profile/unlink-google');
    return response.data;
  },

  forgotPassword: async (identifier) => {
    const response = await api.post('/forgot-password', {
      email: identifier,
      identifier,
    });
    return response.data;
  },

  uploadProfilePhoto: async (formData) => {
    const response = await api.post('/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // Backend returns { user: {...} }
    return response.data?.user ? response.data : response.data;
  },

  deleteProfilePhoto: async () => {
    const response = await api.delete('/profile/photo');
    // Backend returns { user: {...} }
    return response.data?.user ? response.data : response.data;
  },
};

export const complaintsService = {
  createComplaint: async (formData) => {
    const response = await api.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getComplaints: async (params) => {
    const response = await api.get('/complaints', { params });
    return response.data?.complaints ?? response.data ?? [];
  },

  getComplaintDetails: async (id) => {
    const response = await api.get(`/complaints/${id}`);
    return response.data?.complaint ?? response.data;
  },

  updateComplaint: async (id, data, isMultipart = false) => {
    const headers = isMultipart ? { 'Content-Type': 'multipart/form-data' } : {};
    const response = await api.put(`/complaints/${id}`, data, { headers });
    return response.data;
  },

  deleteComplaint: async (id) => {
    const response = await api.delete(`/complaints/${id}`);
    return response.data;
  },
};

export const feedbackService = {
  submitFeedback: async (feedbackData) => {
    const response = await api.post('/feedback', feedbackData);
    return response.data;
  },

  getAllFeedback: async () => {
    const response = await api.get('/feedback');
    return response.data;
  },
};

export const adminService = {
  getDepartments: async () => {
    const response = await api.get('/admin/departments');
    return response.data;
  },

  createDepartment: async (departmentName, departmentCode = '', description = '') => {
    const payload =
      typeof departmentName === 'object'
        ? departmentName
        : {
            department_name: departmentName,
            department_code: departmentCode || departmentName.slice(0, 4).toUpperCase(),
            description,
          };
    const response = await api.post('/admin/departments', payload);
    return response.data;
  },

  deleteDepartment: async (id) => {
    const response = await api.delete(`/admin/departments/${id}`);
    return response.data;
  },

  getStudents: async (search = '') => {
    const response = await api.get('/admin/students', { params: { search } });
    return response.data?.students ?? response.data ?? [];
  },

  getAdmins: async () => {
    const response = await api.get('/admin/admins');
    return response.data?.admins ?? response.data ?? [];
  },

  getStaff: async () => {
    const response = await api.get('/admin/staff');
    return response.data?.staff ?? response.data ?? [];
  },

  createStaff: async (staffData) => {
    const response = await api.post('/admin/staff/create', staffData);
    return response.data;
  },

  getReports: async (params) => {
    const response = await api.get('/reports', { params });
    return response.data;
  },

  getCSVDownloadURL: () => {
    const token = localStorage.getItem('token');
    return `${API_BASE_URL}/reports?format=csv&Authorization=Bearer ${token}`;
  },

  getStorageUsage: async () => {
    const response = await api.get('/admin/storage/usage');
    return response.data;
  },

  previewCleanup: async (retentionDays = 30) => {
    const response = await api.get('/admin/storage/preview', {
      params: { retention_days: retentionDays },
    });
    return response.data;
  },

  executeCleanup: async (retentionDays = 30, confirmation = 'DELETE') => {
    const response = await api.post('/admin/storage/cleanup', {
      retention_days: retentionDays,
      confirmation,
    });
    return response.data;
  },

  getCleanupLogs: async () => {
    const response = await api.get('/admin/storage/logs');
    return response.data;
  },

  downloadBackup: async (retentionDays = 30) => {
    const response = await api.get('/admin/storage/backup', {
      params: { retention_days: retentionDays },
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'application/zip' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute(
      'download',
      `complaints_backup_${retentionDays}days_${new Date().toISOString().slice(0, 10)}.zip`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
    return true;
  },
};

export const aiService = {
  chat: async (messages, context = null) => {
    const response = await api.post('/chat', { messages, context });
    return response.data;
  },

  analyzeIssue: async (description) => {
    const response = await api.post('/analyze-issue', { description });
    return response.data;
  },

  reportQuality: async () => {
    return { status: 'Normal', reason: '' };
  },

  checkDuplicate: async () => {
    return { is_duplicate: false };
  },
};

export const dashboardService = {
  getDashboardData: async () => {
    const response = await api.get('/dashboard');
    // Return the full data object; pages extract their own keys
    return response.data ?? {};
  },
};

export default api;
