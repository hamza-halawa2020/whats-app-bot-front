import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import { TokensService } from './token.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface TokenData {
  _id: string;
  token: string;
  phone: string;
  createdAt: string;
}

@Component({
  selector: 'app-tokens',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent,
    FooterComponent,
  ],
  templateUrl: './token.component.html',
  styleUrls: ['./token.component.css'],
})
export class TokensComponent implements OnInit {
  tokenData: TokenData[] = [];
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private tokensService: TokensService, private http: HttpClient) {}

  ngOnInit(): void {
    this.getTokens();
  }

  getTokens(): void {
    this.tokensService.getTokens().subscribe(
      (data: { tokens: TokenData[] }) => {
        this.tokenData = data.tokens || [];
        console.log('Tokens fetched:', this.tokenData);
        this.errorMessage = null;
      },
      (error) => {
        console.error('Error fetching tokens:', error);
        this.errorMessage = 'Failed to load tokens';
      }
    );
  }

  generateApiToken(): void {
    this.http.post(`${environment.apiUrl}/tokens/generate`, {}).subscribe(
      (response: any) => {
        this.successMessage = 'API token generated successfully!';
        this.errorMessage = null;
        this.getTokens(); // Refresh token list
      },
      (error) => {
        console.error('Error generating API token:', error);
        this.errorMessage = error.error?.message || 'Failed to generate API token';
      }
    );
  }

  revokeToken(tokenId: string): void {
    this.tokensService.revokeToken(tokenId).subscribe(
      () => {
        this.successMessage = 'Token revoked successfully!';
        this.errorMessage = null;
        this.getTokens(); // Refresh token list
      },
      (error) => {
        console.error('Error revoking token:', error);
        this.errorMessage = error.error?.message || 'Failed to revoke token';
      }
    );
  }
}