import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AppUser } from './auth.service';

export interface WalletTransaction {
  id: number;
  userId: number;
  type: 'credit' | 'debit' | 'refund' | 'adjustment';
  source: 'admin' | 'message' | 'broadcast' | 'schedule' | 'payment' | 'system';
  points: number;
  balanceBefore: number;
  balanceAfter: number;
  messageId?: number | null;
  adminId?: number | null;
  note?: string | null;
  createdAt: string;
}

export interface WalletResponse {
  success: boolean;
  wallet: {
    userId: number;
    walletPoints: number;
  };
  transactions: WalletTransaction[];
}

export interface AdminUsersResponse {
  success: boolean;
  users: AppUser[];
}

export interface AdminCreateUserPayload {
  username: string;
  email: string;
  phone: string;
  password: string;
  role: 'admin' | 'user';
  walletPoints: number;
  isVerified?: boolean;
}

export interface WalletActionResponse {
  success: boolean;
  message: string;
  transaction: WalletTransaction;
  walletPoints: number;
}

export interface AppSettings {
  signupGiftPoints: number;
  messagePointCost: number;
  dailyMessageLimit: number;
}

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getWallet(): Observable<WalletResponse> {
    return this.http.get<WalletResponse>(`${this.apiUrl}/wallet`);
  }

  getTransactions(page = 1, limit = 20): Observable<WalletResponse> {
    return this.http.get<WalletResponse>(
      `${this.apiUrl}/wallet/transactions?page=${page}&limit=${limit}`
    );
  }

  getAdminUsers(): Observable<AdminUsersResponse> {
    return this.http.get<AdminUsersResponse>(`${this.apiUrl}/admin/users`);
  }

  createUser(payload: AdminCreateUserPayload): Observable<{ success: boolean; message: string; user: AppUser }> {
    return this.http.post<{ success: boolean; message: string; user: AppUser }>(
      `${this.apiUrl}/admin/users`,
      payload
    );
  }

  updateUser(
    userId: string | number,
    payload: Partial<Omit<AdminCreateUserPayload, 'walletPoints'>>
  ): Observable<{ success: boolean; message: string; user: AppUser }> {
    return this.http.patch<{ success: boolean; message: string; user: AppUser }>(
      `${this.apiUrl}/admin/users/${userId}`,
      payload
    );
  }

  creditUser(userId: string | number, points: number, note = ''): Observable<WalletActionResponse> {
    return this.http.post<WalletActionResponse>(
      `${this.apiUrl}/admin/users/${userId}/wallet/credit`,
      { points, note }
    );
  }

  debitUser(userId: string | number, points: number, note = ''): Observable<WalletActionResponse> {
    return this.http.post<WalletActionResponse>(
      `${this.apiUrl}/admin/users/${userId}/wallet/debit`,
      { points, note }
    );
  }

  getAdminSettings(): Observable<{ success: boolean; settings: AppSettings }> {
    return this.http.get<{ success: boolean; settings: AppSettings }>(
      `${this.apiUrl}/admin/settings`
    );
  }

  getSettings(): Observable<{ success: boolean; settings: AppSettings }> {
    return this.http.get<{ success: boolean; settings: AppSettings }>(
      `${this.apiUrl}/settings`
    );
  }

  updateAdminSettings(
    payload: Partial<AppSettings>
  ): Observable<{ success: boolean; message: string; settings: AppSettings }> {
    return this.http.patch<{ success: boolean; message: string; settings: AppSettings }>(
      `${this.apiUrl}/admin/settings`,
      payload
    );
  }
}
