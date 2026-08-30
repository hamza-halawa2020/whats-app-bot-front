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
  points = [
    'Connect with QR code',
    'Manage clients and groups',
    'Send from dashboard or API'
  ];
}
