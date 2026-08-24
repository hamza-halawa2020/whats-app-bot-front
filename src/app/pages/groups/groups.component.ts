import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { GroupsService } from './groups.service';

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

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
  ],
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css'],
})
export class GroupsComponent implements OnInit {
  groupData: GroupData[] = [];
  errorMessage: string | null = null;
  successMessage: string | null = null;
  loadingGroupId: string | null = null;
  loadingGroups: boolean = false;


  constructor(private groupsService: GroupsService) {}

  ngOnInit(): void {
    this.getGroups();
  }

  getGroups(): void {
    this.loadingGroups = true;
    this.groupsService.getGroups().subscribe(
      (data: { groups: GroupData[] }) => {
        this.groupData = data.groups || [];
        console.log('Groups fetched:', this.groupData);
        this.errorMessage = null;
      },
      (error) => {
        console.error('Error fetching groups:', error);
        this.errorMessage = 'Failed to load groups';
      },
      () => {
        this.loadingGroups = false;
      }
    );
  }

  saveParticipants(groupId: string): void {
    this.errorMessage = null;
    this.successMessage = null;
    this.loadingGroupId = groupId;
    this.groupsService.getGroupParticipants(groupId).subscribe(
      (response: ParticipantsResponse) => {
        this.successMessage = `Processed ${response.participants.length} participants: ${response.addedClients} added, ${response.skippedClients} skipped, ${response.invalidClients} invalid.`;
        console.log('Participants response:', response);
        this.loadingGroupId = null;
      },
      (error) => {
        console.error('Error fetching participants:', error);
        this.errorMessage = error.error?.error || 'Failed to fetch and save participants';
        this.loadingGroupId = null;
      },
      () => {
        this.loadingGroupId = null;
        }
    );
  }
}