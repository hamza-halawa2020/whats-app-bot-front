import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface TokenData {
  id: string;
  token?: string;
  name?: string;
  scopes?: string[];
  expiresAt?: string;
  lastUsedAt?: string;
  phone: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class TokensService {
  private apiUrl = environment.apiUrl;
  private tokensEndpoint = '/tokens';

  constructor(private http: HttpClient) {}

  getTokens(): Observable<{ tokens: TokenData[] }> {
    return this.http.get<{ tokens: TokenData[] }>(`${this.apiUrl}${this.tokensEndpoint}`);
  }

  revokeToken(tokenId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}${this.tokensEndpoint}/revoke`, { tokenId });
  }
}