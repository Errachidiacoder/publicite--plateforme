import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-wrapper">
        <div class="auth-panel left-panel">
          <div class="brand-area">
            <div class="brand-logo">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#00838f" stroke="#00838f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="#00838f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="#00838f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h1>PubPlatform</h1>
            <p>La plateforme publicitaire de référence. Diffusez vos annonces auprès de millions de personnes.</p>
          </div>
          <div class="features">
            <div class="feature-item">
              <span class="feature-icon">✓</span>
              <span>Annonces vérifiées manuellement</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">✓</span>
              <span>Portée nationale garantie</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">✓</span>
              <span>Statistiques en temps réel</span>
            </div>
          </div>
        </div>

        <div class="auth-panel right-panel">
          <div class="auth-form-container">
            <h2>Bon retour !</h2>
            <p class="subtitle">Connectez-vous à votre compte</p>

            <div class="error-banner" *ngIf="errorMsg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {{ errorMsg }}
            </div>

            <div class="success-banner" *ngIf="successMsg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              {{ successMsg }}
            </div>

            <form (ngSubmit)="onLogin()" #loginForm="ngForm">
              <div class="form-group">
                <label for="email">Adresse email</label>
                <div class="input-wrapper">
                  <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <input id="email" type="email" [(ngModel)]="loginData.email" name="email" placeholder="votre@email.com" required [disabled]="loading">
                </div>
              </div>

              <div class="form-group">
                <label for="password">Mot de passe</label>
                <div class="input-wrapper">
                  <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input id="password" type="password" [(ngModel)]="loginData.password" name="password" placeholder="••••••••" required [disabled]="loading">
                </div>
              </div>

              <button type="submit" class="btn-submit" [disabled]="loading || !loginForm.form.valid">
                <span *ngIf="!loading">Se connecter</span>
                <span *ngIf="loading" class="loading-spinner">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                  Connexion...
                </span>
              </button>
            </form>

            <div class="auth-divider">
              <span>Pas encore de compte ?</span>
            </div>
            <a routerLink="/register" class="btn-secondary">Créer un compte gratuit</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: stretch;
      margin: -40px -24px;
      background: #f5f5f5;
    }
    .auth-wrapper {
      display: flex;
      width: 100%;
    }
    .auth-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .left-panel {
      background: linear-gradient(160deg, #00838f 0%, #005662 100%);
      color: white;
      padding: 80px 60px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .brand-area {
      margin-bottom: 60px;
    }
    .brand-logo {
      background: white;
      width: 80px;
      height: 80px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.2);
    }
    .left-panel h1 {
      font-size: 2.5rem;
      font-weight: 800;
      color: white;
      margin-bottom: 16px;
    }
    .left-panel p {
      font-size: 1.1rem;
      opacity: 0.85;
      line-height: 1.8;
    }
    .features {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1rem;
      opacity: 0.9;
    }
    .feature-icon {
      background: rgba(255,255,255,0.2);
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      flex-shrink: 0;
    }
    .right-panel {
      background: #eeeeee;
      padding: 80px 60px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .auth-form-container {
      width: 100%;
      max-width: 420px;
    }
    h2 {
      font-size: 2rem;
      font-weight: 800;
      color: #263238;
      margin-bottom: 8px;
    }
    .subtitle {
      color: #546e7a;
      margin-bottom: 36px;
      font-size: 1rem;
    }
    .error-banner {
      background: #fce4ec;
      border: 1px solid #ef9a9a;
      color: #b71c1c;
      padding: 14px 18px;
      border-radius: 10px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.9rem;
      font-weight: 500;
    }
    .success-banner {
      background: #e8f5e9;
      border: 1px solid #a5d6a7;
      color: #1b5e20;
      padding: 14px 18px;
      border-radius: 10px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.9rem;
      font-weight: 500;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      font-weight: 600;
      font-size: 0.9rem;
      color: #37474f;
      margin-bottom: 8px;
    }
    .input-wrapper {
      position: relative;
    }
    .input-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: #90a4ae;
    }
    .input-wrapper input {
      width: 100%;
      padding: 14px 14px 14px 46px;
      border: 2px solid #cfd8dc;
      border-radius: 10px;
      background: #f5f5f5;
      font-size: 1rem;
      color: #263238;
      transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
      box-sizing: border-box;
    }
    .input-wrapper input:focus {
      outline: none;
      border-color: #00838f;
      background: white;
      box-shadow: 0 0 0 4px rgba(0,131,143,0.12);
    }
    .input-wrapper input:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .btn-submit {
      width: 100%;
      padding: 16px;
      background: #00838f;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      margin-top: 8px;
      transition: background-color 0.2s, transform 0.1s, box-shadow 0.2s;
      box-shadow: 0 4px 12px rgba(0,131,143,0.3);
    }
    .btn-submit:hover:not(:disabled) {
      background: #005662;
      box-shadow: 0 6px 16px rgba(0,131,143,0.4);
      transform: translateY(-1px);
    }
    .btn-submit:active:not(:disabled) {
      transform: translateY(0);
    }
    .btn-submit:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }
    .loading-spinner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .auth-divider {
      text-align: center;
      color: #90a4ae;
      margin: 24px 0 16px;
      font-size: 0.9rem;
    }
    .btn-secondary {
      display: block;
      width: 100%;
      padding: 14px;
      background: white;
      color: #00838f;
      border: 2px solid #00838f;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      text-align: center;
      transition: all 0.2s;
      box-sizing: border-box;
    }
    .btn-secondary:hover {
      background: #00838f;
      color: white;
    }
    @media (max-width: 768px) {
      .auth-page { margin: -40px -12px; }
      .left-panel { display: none; }
      .right-panel { padding: 40px 24px; }
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  loginData = { email: '', password: '' };
  loading = false;
  errorMsg = '';
  successMsg = '';

  onLogin() {
    if (this.loading) return;
    this.errorMsg = '';
    this.successMsg = '';
    this.loading = true;

    this.authService.login(this.loginData).subscribe({
      next: () => {
        this.successMsg = 'Connexion réussie ! Redirection...';
        setTimeout(() => this.router.navigate(['/home']), 1000);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 0) {
          this.errorMsg = 'Impossible de contacter le serveur. Vérifiez que le backend est démarré.';
        } else if (err.status === 401 || err.status === 403) {
          this.errorMsg = 'Email ou mot de passe incorrect.';
        } else if (err.status === 404) {
          this.errorMsg = 'Aucun compte trouvé avec cet email.';
        } else {
          this.errorMsg = `Erreur lors de la connexion (${err.status}). Veuillez réessayer.`;
        }
      }
    });
  }
}
