export type UserRole = 'OPERATOR' | 'APPROVER';

export type TransactionStatus = 
  | 'DRAFT' 
  | 'PENDING_APPROVAL' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'EXECUTED';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

export interface Transaction {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  created_by: string;
  created_by_email?: string;
  approved_by?: string;
  approved_by_email?: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionStats {
  total: number;
  pending_approval: number;
  approved: number;
  rejected: number;
  executed: number;
  draft: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface CreateTransactionRequest {
  amount: number;
  currency: string;
}

export interface ApiError {
  detail: string;
  status?: number;
}
