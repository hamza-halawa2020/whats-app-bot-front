import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from "../../components/footer/footer.component";

@Component({
  selector: 'app-index-one',
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent,
    FooterComponent,
],
  templateUrl: './index-one.component.html',
  styleUrl: './index-one.component.css'
})
export class IndexOneComponent {
  benefits = [
    {
      icon: 'fa-solid fa-paper-plane',
      title: 'Send from your own WhatsApp',
      description: 'Connect your number once, then send messages from the dashboard or API.'
    },
    {
      icon: 'fa-solid fa-users',
      title: 'Keep clients organized',
      description: 'Save contacts, import lists, and reuse them when sending campaigns.'
    },
    {
      icon: 'fa-solid fa-key',
      title: 'Simple API access',
      description: 'Generate tokens and connect your systems without extra manual work.'
    }
  ];

  steps = [
    'Create your account',
    'Scan the WhatsApp QR code',
    'Send messages or use the API'
  ];

  useCases = ['Customer updates', 'Payment reminders', 'Lead follow-ups', 'Team notifications'];
}
