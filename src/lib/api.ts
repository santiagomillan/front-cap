import axios, { AxiosError, AxiosInstance } from 'axios';
import { 
  LoginRequest, 
  LoginResponse, 
  Transaction, 
  CreateTransactionRequest,
  TransactionStats,
  TransactionStatus,
  UserRole
} from '@/types';

const API_BASE_URL = 'http://127.0.0.1:8000';
const USE_MOCK_AUTH = true; // Set to false when backend is available

// Helper to create a mock JWT token for demo purposes
const createMockJWT = (email: string, role: UserRole): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: `user-${Date.now()}`,
    email,
    role,
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
  }));
  const signature = btoa('mock-signature');
  return `${header}.${payload}.${signature}`;
};

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return client;
};

const api = createApiClient();

// Auth endpoints
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    // Mock authentication for demo
    if (USE_MOCK_AUTH) {
      const email = credentials.username.toLowerCase();
      
      if (email === 'operator@test.com') {
        return { access_token: createMockJWT(email, 'OPERATOR'), token_type: 'bearer' };
      } else if (email === 'approver@test.com') {
        return { access_token: createMockJWT(email, 'APPROVER'), token_type: 'bearer' };
      } else {
        throw new Error('Invalid credentials. Use operator@test.com or approver@test.com');
      }
    }
    
    // Real API call
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },
};

// Transaction endpoints
export const transactionApi = {
  getAll: async (status?: TransactionStatus): Promise<Transaction[]> => {
    const params = status ? { status } : {};
    const response = await api.get('/api/v2/transactions', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Transaction> => {
    const response = await api.get(`/api/v2/transactions/${id}`);
    return response.data;
  },

  create: async (data: CreateTransactionRequest): Promise<Transaction> => {
    const response = await api.post('/api/v2/transactions', data);
    return response.data;
  },

  submit: async (id: string): Promise<Transaction> => {
    const response = await api.post(`/api/v2/transactions/${id}/submit`);
    return response.data;
  },

  approve: async (id: string): Promise<Transaction> => {
    const response = await api.post(`/api/v2/transactions/${id}/approve`);
    return response.data;
  },

  reject: async (id: string): Promise<Transaction> => {
    const response = await api.post(`/api/v2/transactions/${id}/reject`);
    return response.data;
  },

  execute: async (id: string): Promise<Transaction> => {
    const response = await api.post(`/api/v2/transactions/${id}/execute`);
    return response.data;
  },

  getStats: async (): Promise<TransactionStats> => {
    const response = await api.get('/api/v2/transactions/stats');
    return response.data;
  },

  getPendingCount: async (): Promise<number> => {
    const response = await api.get('/api/v2/transactions', { 
      params: { status: 'PENDING_APPROVAL' } 
    });
    return response.data.length;
  },
};

export default api;
