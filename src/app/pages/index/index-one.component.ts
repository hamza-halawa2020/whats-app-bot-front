import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { HowItsWorkComponent } from "../../components/how-its-work/how-its-work.component";
import { ClientComponent } from "../../components/client/client.component";
import { FooterComponent } from "../../components/footer/footer.component";

@Component({
  selector: 'app-index-one',
  imports: [
    CommonModule,
    NavbarComponent,
    HowItsWorkComponent,
    
    ClientComponent,
    FooterComponent,
],
  templateUrl: './index-one.component.html',
  styleUrl: './index-one.component.css'
})
export class IndexOneComponent {
}
