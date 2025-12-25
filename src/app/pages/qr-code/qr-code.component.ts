import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-qr-code',
  standalone: true,
  imports: [CommonModule],
  template: `<canvas #canvas></canvas>`,
  styles: [
    `
      canvas {
        display: block;
        margin: 0 auto;
      }
    `,
  ],
})
export class QrCodeComponent implements OnChanges {
  @Input() value: string = '';
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && this.value) {
      console.log('QrCodeComponent rendering QR code for value:', this.value);
      QRCode.toCanvas(
        this.canvas.nativeElement,
        this.value,
        {
          width: 300,
          errorCorrectionLevel: 'M',
        },
        (error: Error | null) => {
          if (error) {
            console.error('QR Code generation error:', error);
          } else {
            console.log('QR Code generated successfully');
          }
        }
      );
    }
  }
}
