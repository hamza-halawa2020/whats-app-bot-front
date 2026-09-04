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

export interface PointPackage {
  id: number;
  name: string;
  points: number;
  price: number;
  currency: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PointPurchase {
  id: number;
  userId: number;
  packageId?: number | null;
  paymentMethod: 'manual' | 'automatic';
  status: 'pending' | 'approved' | 'refused' | 'canceled';
  points: number;
  amount: number;
  currency: string;
  proofReference?: string | null;
  proofFileName?: string | null;
  proofFileType?: string | null;
  userNote?: string | null;
  adminNote?: string | null;
  reviewedBy?: number | null;
  reviewedAt?: string | null;
  walletTransactionId?: number | null;
  createdAt: string;
  updatedAt?: string;
  user?: AppUser;
  package?: PointPackage | null;
}

export interface AdminUsersResponse {
  success: boolean;
  users: AppUser[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdminAnalytics {
  totalUsers: number;
  verifiedUsers: number;
  adminUsers: number;
  pendingPayments: number;
  activePackages: number;
  walletPoints: number;
}

export interface PaginatedPackagesResponse {
  success: boolean;
  packages: PointPackage[];
  total: number;
  page: number;
  totalPages: number;
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
  pointUnitPrice: number;
  pointCurrency: string;
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

  getTransactions(page = 1, limit = 10): Observable<WalletResponse> {
    return this.http.get<WalletResponse>(
      `${this.apiUrl}/wallet/transactions?page=${page}&limit=${limit}`
    );
  }

  getPointPackages(page = 1, limit = 10): Observable<PaginatedPackagesResponse> {
    return this.http.get<PaginatedPackagesResponse>(
      `${this.apiUrl}/wallet/packages?page=${page}&limit=${limit}`
    );
  }

  createPointPurchase(payload: {
    packageId?: number | null;
    paymentMethod: 'manual' | 'automatic';
    points?: number | null;
    proofReference?: string;
    proofFile?: { name: string; type: string; data: string } | null;
    userNote?: string;
  }): Observable<{ success: boolean; message: string; purchase: PointPurchase }> {
    return this.http.post<{ success: boolean; message: string; purchase: PointPurchase }>(
      `${this.apiUrl}/wallet/purchases`,
      payload
    );
  }

  getPointPurchases(page = 1, limit = 10): Observable<{
    success: boolean;
    purchases: PointPurchase[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.http.get<{
      success: boolean;
      purchases: PointPurchase[];
      total: number;
      page: number;
      totalPages: number;
    }>(`${this.apiUrl}/wallet/purchases?page=${page}&limit=${limit}`);
  }

  updatePointPurchase(
    purchaseId: string | number,
    payload: {
      proofReference?: string;
      proofFile?: { name: string; type: string; data: string } | null;
      userNote?: string;
    }
  ): Observable<{ success: boolean; message: string; purchase: PointPurchase }> {
    return this.http.patch<{ success: boolean; message: string; purchase: PointPurchase }>(
      `${this.apiUrl}/wallet/purchases/${purchaseId}`,
      payload
    );
  }

  getPointPurchaseProof(purchaseId: string | number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/wallet/purchases/${purchaseId}/proof`, {
      responseType: 'blob',
    });
  }

  getAdminUsers(page = 1, limit = 10): Observable<AdminUsersResponse> {
    return this.http.get<AdminUsersResponse>(
      `${this.apiUrl}/admin/users?page=${page}&limit=${limit}`
    );
  }

  getAdminAnalytics(): Observable<{ success: boolean; analytics: AdminAnalytics }> {
    return this.http.get<{ success: boolean; analytics: AdminAnalytics }>(
      `${this.apiUrl}/admin/users/analytics`
    );
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

  getAdminPointPackages(page = 1, limit = 10): Observable<PaginatedPackagesResponse> {
    return this.http.get<PaginatedPackagesResponse>(
      `${this.apiUrl}/admin/payments/packages?page=${page}&limit=${limit}`
    );
  }

  createAdminPointPackage(
    payload: Omit<PointPackage, 'id' | 'createdAt' | 'updatedAt'>
  ): Observable<{ success: boolean; message: string; package: PointPackage }> {
    return this.http.post<{ success: boolean; message: string; package: PointPackage }>(
      `${this.apiUrl}/admin/payments/packages`,
      payload
    );
  }

  updateAdminPointPackage(
    packageId: string | number,
    payload: Partial<Omit<PointPackage, 'id' | 'createdAt' | 'updatedAt'>>
  ): Observable<{ success: boolean; message: string; package: PointPackage }> {
    return this.http.patch<{ success: boolean; message: string; package: PointPackage }>(
      `${this.apiUrl}/admin/payments/packages/${packageId}`,
      payload
    );
  }

  getAdminPointPurchases(status = '', page = 1, limit = 10): Observable<{
    success: boolean;
    purchases: PointPurchase[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (status) {
      query.set('status', status);
    }

    return this.http.get<{
      success: boolean;
      purchases: PointPurchase[];
      total: number;
      page: number;
      totalPages: number;
    }>(`${this.apiUrl}/admin/payments/purchases?${query.toString()}`);
  }

  reviewPointPurchase(
    purchaseId: string | number,
    payload: { status: 'approved' | 'refused' | 'canceled'; adminNote?: string }
  ): Observable<{ success: boolean; message: string; purchase: PointPurchase }> {
    return this.http.patch<{ success: boolean; message: string; purchase: PointPurchase }>(
      `${this.apiUrl}/admin/payments/purchases/${purchaseId}/review`,
      payload
    );
  }
}
