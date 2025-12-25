import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface GroupData {
  id: string;
  name: string;
  participantCount: number;
}

interface ParticipantsResponse {
  groupId: string;
  groupName: string;
  participants: { id: string; phone: string; isLinkedDevice: boolean }[];
  addedClients: number;
  skippedClients: number;
  invalidClients: number;
}

@Injectable({
  providedIn: 'root',
})
export class GroupsService {
  private apiUrl = environment.apiUrl;
  private groupsEndpoint = '/groups';

  constructor(private http: HttpClient) {}

  getGroups(): Observable<{ groups: GroupData[] }> {
    return this.http.get<{ groups: GroupData[] }>(`${this.apiUrl}${this.groupsEndpoint}`);
  }

  getGroupParticipants(groupId: string): Observable<ParticipantsResponse> {
    return this.http.get<ParticipantsResponse>(`${this.apiUrl}${this.groupsEndpoint}/${groupId}/participants`);
  }
}