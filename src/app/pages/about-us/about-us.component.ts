import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { FooterComponent } from "../../components/footer/footer.component";

@Component({
  selector: 'app-about-us',
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent
],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css'
})
export class AboutUsComponent {
  teamData = [
    {
      image:'',
      name:'Shaurya Preet',
      position:'Co-Founder'
    },
    {
      image:'',
      name:'Dhananjay Preet',
      position:'CEO'
    },
    {
      image:'',
      name:'Rahul Gilkrist',
      position:'Manager'
    },
    {
      image:'',
      name:'Adam Wilcard',
      position:'Agent'
    },
    {
      image:'',
      name:'Rahul Gilkrist',
      position:'Agent'
    },
    {
      image:'',
      name:'Adam Wilcard',
      position:'Agent'
    },
  ]

  // Removed slick carousel initialization to fix the error
  // The component will now display team members in a responsive grid layout

  aboutData = [
    {
      icon:'fa-solid fa-unlock-keyhole text-primary',
      title:'Fully Secure & 24x7 Dedicated Support',
      desc:'If you are an individual client, or just a business startup looking for good backlinks for your website.'
    },
    {
      icon:'fa-brands fa-twitter text-primary',
      title:'Manage your Social & Busness Account Carefully',
      desc:'If you are an individual client, or just a business startup looking for good backlinks for your website.'
    },
    {
      icon:'fa-solid fa-layer-group text-primary',
      title:'We are Very Hard Worker and loving',
      desc:'If you are an individual client, or just a business startup looking for good backlinks for your website.'
    },
  ]
}
