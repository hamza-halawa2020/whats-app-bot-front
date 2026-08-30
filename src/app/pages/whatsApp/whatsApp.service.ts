import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface WhatsAppResponse {
  success: boolean;
  message?: string;
  qrCode?: string | null;
  status?: string;
  session?: {
    qrCode?: string | null;
    status?: string;
  } | null;
}

@Injectable({
  providedIn: 'root',
})
export class WhatsAppService {
  private apiUrl = `${environment.apiUrl}/whatsapp`;

  constructor(private http: HttpClient) {}

  startWhatsApp(): Observable<WhatsAppResponse> {
    return this.http.post<WhatsAppResponse>(`${this.apiUrl}/start`, {});
  }

  getStatus(): Observable<WhatsAppResponse> {
    return this.http.get<WhatsAppResponse>(`${this.apiUrl}/status`, {
      params: { _: Date.now() },
    });
  }

  restartWhatsApp(): Observable<WhatsAppResponse> {
    return this.http.post<WhatsAppResponse>(`${this.apiUrl}/restart`, {});
  }

  deleteWhatsApp(): Observable<WhatsAppResponse> {
    return this.http.post<WhatsAppResponse>(`${this.apiUrl}/delete`, {});
  }
}
