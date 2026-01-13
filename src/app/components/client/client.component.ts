import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { clientData } from '../../data/data';

interface ClientData{
    image: string;
    quote: string;
    desc: string;
    name: string;
    position: string;
}

@Component({
  selector: 'app-client',
  imports: [
    CommonModule
  ],
  templateUrl: './client.component.html',
  styleUrl: './client.component.css'
})
export class ClientComponent {
 
  clientData:ClientData[] = clientData

  // Removed slick carousel initialization to fix the error
  // The component will now display testimonials in a simple grid layout
}
