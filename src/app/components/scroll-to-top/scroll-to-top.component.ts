import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-scroll-to-top',
  imports: [
    CommonModule
  ],
  templateUrl: './scroll-to-top.component.html',
  styleUrl: './scroll-to-top.component.css'
})
export class ScrollToTopComponent {
  scroll: boolean = false;

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.scroll = window.scrollY > 50;
  }

  topFunction(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
