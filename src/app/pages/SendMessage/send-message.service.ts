import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface MessageResponse {
  success: boolean;
  message: string;
  phone?: string;
}

interface BroadcastResponse {
  success: boolean;
  message: string;
  total?: number;
  batchSize?: number;
  intervalMs?: number;
  sentCount?: number;
  failedCount?: number;
  errors?: { phone: string; error: string }[];
  scheduleId?: number | string;
}

interface Schedule {
  id: string;
  phoneNumbers: string[];
  messagePool: string[];
  intervalMs: number;
  repeatCount: number;
  sentCount: number;
  status: 'active' | 'paused' | 'completed';
  lastSent?: string;
  createdAt: string;
}

interface SchedulesResponse {
  success: boolean;
  message: string;
  schedules: Schedule[];
}

interface ToggleScheduleResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class SendMessageService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Sends a single WhatsApp message to a specified phone number.
   * @param phone Phone number with country code (e.g., +123456789).
   * @param message Message content.
   * @returns Observable with the message response.
   */
  sendMessage(phone: string, message: string): Observable<MessageResponse> {
    return this.http
      .post<MessageResponse>(`${this.apiUrl}/messages/messages`, {
        phone,
        message,
      })
      .pipe(
        catchError((error) => {
          console.error('Send message error:', error);
          return throwError(
            () => new Error(error.error?.error || 'Failed to send message')
          );
        })
      );
  }

  /**
   * Sends random messages to specified phone numbers with optional scheduling.
   * @param messagePool Array of messages to choose from randomly.
   * @param phoneNumbers Array of phone numbers to send messages to.
   * @param batchSize Number of messages to send in each batch.
   * @param intervalMs Delay between batches in milliseconds.
   * @param repeatIntervalMs Interval for repeating messages (optional, in milliseconds).
   * @param repeatCount Number of times to repeat (optional, 0 for indefinite).
   * @returns Observable with broadcast response.
   */
  sendRandomMessages(
    messagePool: string[],
    phoneNumbers: string[],
    batchSize?: number,
    intervalMs?: number,
    repeatIntervalMs?: number,
    repeatCount?: number
  ): Observable<BroadcastResponse> {
    const payload = {
      messagePool,
      phoneNumbers,
      batchSize,
      intervalMs,
      repeatIntervalMs,
      repeatCount,
    };
    return this.http
      .post<BroadcastResponse>(`${this.apiUrl}/messages/broadcast`, payload)
      .pipe(
        catchError((error) => {
          console.error('Broadcast error:', error);
          return throwError(
            () => new Error(error.error?.error || 'Failed to send broadcast')
          );
        })
      );
  }

  /**
   * Fetches all scheduled message tasks for the user.
   * @returns Observable with schedules response.
   */
  getSchedules(): Observable<SchedulesResponse> {
    return this.http
      .get<SchedulesResponse>(`${this.apiUrl}/messages/schedules`)
      .pipe(
        catchError((error) => {
          console.error('Error fetching schedules:', error);
          return throwError(
            () => new Error(error.error?.error || 'Failed to fetch schedules')
          );
        })
      );
  }

  /**
   * Pauses or resumes a scheduled message task.
   * @param scheduleId ID of the schedule to toggle.
   * @param action 'pause' or 'resume'.
   * @returns Observable with toggle schedule response.
   */
  toggleSchedule(
    scheduleId: string,
    action: 'pause' | 'resume'
  ): Observable<ToggleScheduleResponse> {
    return this.http
      .post<ToggleScheduleResponse>(`${this.apiUrl}/messages/schedules/toggle`, {
        scheduleId,
        action,
      })
      .pipe(
        catchError((error) => {
          console.error('Error toggling schedule:', error);
          return throwError(
            () => new Error(error.error?.error || 'Failed to toggle schedule')
          );
        })
      );
  }
}
