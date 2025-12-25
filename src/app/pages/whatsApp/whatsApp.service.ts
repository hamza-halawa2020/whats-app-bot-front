import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface WhatsAppResponse {
  success: boolean;
  message?: string;
  qrCode?: string | null;
  status?: string;
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

  restartWhatsApp(): Observable<WhatsAppResponse> {
    return this.http.post<WhatsAppResponse>(`${this.apiUrl}/restart`, {});
  }

  deleteWhatsApp(): Observable<WhatsAppResponse> {
    return this.http.post<WhatsAppResponse>(`${this.apiUrl}/delete`, {});
  }
}
