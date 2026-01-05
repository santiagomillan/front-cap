import axios, { AxiosError, AxiosInstance } from "axios";
import {
  LoginRequest,
  LoginResponse,
  Transaction,
  CreateTransactionRequest,
  TransactionStats,
  TransactionStatus,
} from "@/types";

const API_BASE_URL = "https://fastapi-capv1-production.up.railway.app";

/**
 * API Versions:
 * - v1: Public endpoints (no authentication required) - Used for login
 * - v2: Protected endpoints (authentication required) - Used for transactions and operations
 */

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  return client;
};

const api = createApiClient();

// Auth endpoints (v1 - public, no authentication required)
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const formData = new URLSearchParams();
    formData.append("username", credentials.username);
    formData.append("password", credentials.password);

    const response = await axios.post(
      `${API_BASE_URL}/api/v1/auth/login`,
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data;
  },
};

// Helper function to normalize transaction data from backend
const normalizeTransaction = (
  transaction: Partial<Transaction> & {
    transaction_id?: string;
    amount?: string | number;
  }
): Transaction => {
  return {
    ...transaction,
    id: transaction.id || transaction.transaction_id || "",
    reference: transaction.reference || "",
    currency: transaction.currency || "",
    status: transaction.status || "DRAFT",
    created_by: transaction.created_by || "",
    created_at: transaction.created_at || new Date().toISOString(),
    updated_at: transaction.updated_at || new Date().toISOString(),
    amount:
      typeof transaction.amount === "string"
        ? parseFloat(transaction.amount)
        : transaction.amount || 0,
  };
};

// Transaction endpoints (v2 - protected, authentication required)
export const transactionApi = {
  getAll: async (status?: TransactionStatus): Promise<Transaction[]> => {
    const params = status ? { status } : {};
    const response = await api.get("/api/v2/transactions", { params });
    return response.data.map(normalizeTransaction);
  },

  getById: async (id: string): Promise<Transaction> => {
    const response = await api.get(`/api/v2/transactions/${id}`);
    return normalizeTransaction(response.data);
  },

  create: async (data: CreateTransactionRequest): Promise<Transaction> => {
    const response = await api.post("/api/v2/transactions", data);
    return normalizeTransaction(response.data);
  },

  submit: async (id: string): Promise<Transaction> => {
    const response = await api.post(`/api/v2/transactions/${id}/submit`);
    return normalizeTransaction(response.data);
  },

  approve: async (id: string): Promise<Transaction> => {
    const response = await api.post(`/api/v2/transactions/${id}/approve`);
    return normalizeTransaction(response.data);
  },

  reject: async (id: string): Promise<Transaction> => {
    const response = await api.post(`/api/v2/transactions/${id}/reject`);
    return normalizeTransaction(response.data);
  },

  execute: async (id: string): Promise<Transaction> => {
    const response = await api.post(`/api/v2/transactions/${id}/execute`);
    return normalizeTransaction(response.data);
  },

  getStats: async (): Promise<TransactionStats> => {
    const response = await api.get("/api/v2/transactions/stats");
    return response.data;
  },

  getPendingCount: async (): Promise<number> => {
    const response = await api.get("/api/v2/transactions", {
      params: { status: "PENDING_APPROVAL" },
    });
    return response.data.length;
  },
};

export default api;
