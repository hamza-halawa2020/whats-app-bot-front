import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { FooterComponent } from "../../components/footer/footer.component";

@Component({
  selector: 'app-about-us',
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent,
    FooterComponent
],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css'
})
export class AboutUsComponent {
  teamData = [
    {
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face&auto=format&q=80',
      name:'Ahmed Hassan',
      position:'CEO & Founder',
      bio: 'Visionary leader with 10+ years in tech entrepreneurship, driving innovation in business communication.',
      skills: ['Leadership', 'Strategy', 'Innovation', 'Business Development'],
      quote: 'Communication is the bridge between confusion and clarity. We build those bridges every day.'
    },
    {
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face&auto=format&q=80',
      name:'Omar Al-Rashid',
      position:'CTO',
      bio: 'Technology expert specializing in scalable messaging platforms and API integrations with enterprise focus.',
      skills: ['Cloud Architecture', 'API Design', 'DevOps', 'Security'],
      quote: 'Great technology should be invisible to users but transformative for businesses.'
    },
    {
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face&auto=format&q=80',
      name:'Michael Rodriguez',
      position:'Head of Product',
      bio: 'Product strategist focused on user experience and feature development for WhatsApp business solutions.',
      skills: ['Product Strategy', 'UX Design', 'Analytics', 'Agile'],
      quote: 'Every feature we build should solve a real problem and delight our users.'
    },
    {
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=face&auto=format&q=80',
      name:'Alex Chen',
      position:'Lead Developer',
      bio: 'Full-stack developer with expertise in real-time messaging systems and modern web technologies.',
      skills: ['React', 'Node.js', 'WebSocket', 'Database Design'],
      quote: 'Clean code is not just about functionality, it\'s about creating digital experiences that last.'
    },
    {
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face&auto=format&q=80',
      name:'David Johnson',
      position:'Customer Success',
      bio: 'Customer advocate ensuring businesses maximize their WhatsApp messaging potential with dedicated support.',
      skills: ['Customer Relations', 'Training', 'Support', 'Analytics'],
      quote: 'Success is measured not by what we build, but by how it transforms our customers\' businesses.'
    },
    {
      image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=300&h=300&fit=crop&crop=face&auto=format&q=80',
      name:'James Parker',
      position:'Marketing Director',
      bio: 'Marketing strategist specializing in B2B growth and digital marketing for SaaS platforms.',
      skills: ['Digital Marketing', 'Content Strategy', 'SEO', 'Brand Management'],
      quote: 'Great marketing tells a story that resonates, educates, and inspires action.'
    },
  ]



  aboutData = [
    {
      icon:'fa-solid fa-shield-halved text-primary',
      title:'Enterprise Security',
      desc:'Bank-level encryption and security protocols ensure your business communications remain private and secure at all times.'
    },
    {
      icon:'fa-solid fa-rocket text-primary',
      title:'Lightning Fast Delivery',
      desc:'Our optimized infrastructure delivers messages instantly with 99.9% uptime, ensuring your communications reach customers without delay.'
    },
    {
      icon:'fa-solid fa-chart-line text-primary',
      title:'Advanced Analytics',
      desc:'Comprehensive reporting and analytics help you track message performance, engagement rates, and ROI to optimize your campaigns.'
    },
    {
      icon:'fa-solid fa-cogs text-primary',
      title:'Easy Integration',
      desc:'Simple API integration with detailed documentation allows you to connect our platform with your existing systems in minutes.'
    },
    {
      icon:'fa-solid fa-headset text-primary',
      title:'24/7 Expert Support',
      desc:'Our dedicated support team is available around the clock to help you maximize the potential of your WhatsApp messaging campaigns.'
    },
    {
      icon:'fa-solid fa-globe text-primary',
      title:'Global Reach',
      desc:'Send messages worldwide with multi-language support and local compliance, helping you connect with customers across different markets.'
    },
  ]
}
