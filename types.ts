export enum UserRole {
  USA = 'USA',
  BITCOIN = 'BITCOIN',
}

export interface ExchangeRateData {
  currency: string;
  rate: number;
  timestamp: string;
}

export interface NotificationLog {
  id: string;
  from: UserRole;
  message: string;
  timestamp: Date;
  type: 'success' | 'error';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}