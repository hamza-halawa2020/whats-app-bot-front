import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface ApiResponse {
  id?: string;
  phone?: string;
  addedBy?: string;
  name?: string;
  tags?: string[];
  segment?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ClientsService {
  private apiUrl = environment.apiUrl;
  private data = '/clients';

  constructor(private http: HttpClient) {}


  getClients(page: number, limit: number): Observable<{ clients: ApiResponse[]; total: number }> {
    return this.http.get<{ clients: ApiResponse[]; total: number }>(`${this.apiUrl}${this.data}?page=${page}&limit=${limit}`);
  }


  createClient(client: { phone: string; name?: string; tags?: string[]; segment?: string }): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}${this.data}`, client);
  }

  updateClient(
    id: string,
    client: { phone: string; name?: string; tags?: string[]; segment?: string }
  ): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(
      `${this.apiUrl}${this.data}/${id}`,
      client
    );
  }

  deleteClient(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${this.data}/${id}`);
  }
}
