import axios from 'axios';

const API_URL = process.env['REACT_APP_API_URL'] || 'http://localhost:3001/api';
console.log('API_URL em produção:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Serviço de autenticação
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  updateProfile: async (data: {
    name?: string;
    currentPassword?: string;
    newPassword?: string;
    photo?: string;
  }) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
  updateSettings: async (settings: {
    emailNotifications: boolean;
    monthlyReport: boolean;
    darkMode: boolean;
    language: string;
  }) => {
    const response = await api.put('/auth/settings', settings);
    return response.data;
  },
};

// Serviço de transações
export const transactionService = {
  list: async (params?: {
    search?: string;
    category?: string;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  getTransactions: async () => {
    const response = await api.get('/transactions');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/transactions/stats');
    return response.data;
  },

  create: async (data: {
    description: string;
    amount: number;
    type: 'receita' | 'despesa';
    category: string;
    date: string;
    status?: 'pendente' | 'concluida' | 'cancelada';
    observations?: string;
  }) => {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  update: async (id: number, data: {
    description?: string;
    amount?: number;
    type?: 'receita' | 'despesa';
    category?: string;
    date?: string;
    status?: 'pendente' | 'concluida' | 'cancelada';
    observations?: string;
  }) => {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/transactions/${id}`);
  },
};

// Serviço de economias
export const savingService = {
  list: async (params?: {
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/savings', { params });
    return response.data;
  },

  create: async (data: {
    name: string;
    targetAmount: number;
    deadline: string;
    category: string;
    description?: string;
  }) => {
    const response = await api.post('/savings', data);
    return response.data;
  },

  update: async (id: number, data: {
    name?: string;
    targetAmount?: number;
    currentAmount?: number;
    deadline?: string;
    category?: string;
    status?: 'em_andamento' | 'concluida' | 'cancelada';
    description?: string;
  }) => {
    const response = await api.put(`/savings/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/savings/${id}`);
  },

  addAmount: async (id: number, amount: number) => {
    const response = await api.post(`/savings/${id}/add`, { amount });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/savings/stats');
    return response.data;
  },
};

export default api; 