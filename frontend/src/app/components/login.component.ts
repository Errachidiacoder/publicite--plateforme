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

        <div class="auth-left">
          <div class="auth-brand">
            <span class="brand-logo">
              <svg width="64" height="64" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="12" width="24" height="22" rx="4" stroke="white" stroke-width="2.5"/>
                <path d="M14 14V10C14 6.68629 16.6863 4 20 4C23.3137 4 26 6.68629 26 10V14" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
                <circle cx="20" cy="22" r="3" fill="white" opacity="0.3"/>
                <path d="M14 22H26" stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
              </svg>
            </span>
            <h1>Souq<span>Bladi</span></h1>
            <p>Connectez-vous à votre espace SouqBladi pour acheter, vendre et développer votre activité.</p>
          </div>
          <div class="auth-features">
            <div class="feature">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span>Paiement sécurisé</span>
            </div>
            <div class="feature">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span>Livraison dans tout le Maroc</span>
            </div>
            <div class="feature">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span>Support vendeur dédié</span>
            </div>
          </div>
        </div>

        <div class="auth-right">
          <div class="auth-form-box">
            <h2 style="display: flex; align-items: center; gap: 8px; font-size: 1.8rem; font-weight: 800; color: var(--sb-text); margin-bottom: 8px;">
              Connexion
            </h2>
            <p class="auth-subtitle" style="color: var(--sb-text-secondary); margin-bottom: 32px;">Connectez-vous à votre compte</p>

            @if (errorMsg) {
              <div class="alert alert-error">⚠️ {{ errorMsg }}</div>
            }
            @if (successMsg) {
              <div class="alert alert-success">✅ {{ successMsg }}</div>
            }

            <form (ngSubmit)="onLogin()" #loginForm="ngForm">
              <div class="input-group">
                <label for="email">Email</label>
                <input id="email" type="email" class="form-input" [(ngModel)]="loginData.email" name="email"
                       placeholder="votre@email.com" required [disabled]="loading">
              </div>

              <div class="input-group">
                <label for="password">Mot de passe</label>
                <input id="password" type="password" class="form-input" [(ngModel)]="loginData.password" name="password"
                       placeholder="••••••••" required [disabled]="loading">
              </div>

              <button type="submit" class="btn btn-primary btn-full" [disabled]="loading || !loginForm.form.valid">
                @if (!loading) { Se connecter } @else { ⏳ Connexion... }
              </button>
            </form>

            <div class="auth-divider"><span>Pas encore inscrit ?</span></div>
            <a routerLink="/register" class="btn btn-outline btn-full">Créer un compte gratuit</a>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .auth-page { min-height: 100vh; display: flex; align-items: stretch; }
    .auth-wrapper { display: flex; width: 100%; min-height: 100vh; }

    .auth-left {
      flex: 1;
      background: var(--sb-primary-gradient);
      padding: 80px 60px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      color: white;
    }
    .brand-logo { display: block; margin-bottom: 24px; }
    .auth-left h1 { font-family: 'Outfit',sans-serif; font-size: 2.8rem; font-weight: 800; margin-bottom: 16px; color: white; letter-spacing: -0.02em; }
    .auth-left h1 span { color: rgba(255,255,255,0.8); }
    .auth-left p { font-size: 1.1rem; opacity: 0.9; line-height: 1.6; margin-bottom: 48px; max-width: 400px; }
    .auth-features { display: flex; flex-direction: column; gap: 16px; }
    .feature { display: flex; align-items: center; gap: 12px; font-size: 1.05rem; font-weight: 600; color: white; }
    .feature svg { color: white; flex-shrink: 0; }

    .auth-right {
      flex: 1;
      background: var(--sb-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px;
    }
    .auth-form-box { width: 100%; max-width: 420px; }
    .auth-form-box h2 { font-size: 1.8rem; font-weight: 800; color: var(--sb-text); margin-bottom: 8px; }
    .auth-subtitle { color: var(--sb-text-secondary); margin-bottom: 32px; }

    .alert {
      padding: 12px 16px;
      border-radius: var(--sb-radius-md);
      margin-bottom: 20px;
      font-size: 0.88rem;
      font-weight: 500;
    }
    .alert-error { background: rgba(239,68,68,0.1); color: var(--sb-danger); border: 1px solid rgba(239,68,68,0.2); }
    .alert-success { background: rgba(16,185,129,0.1); color: var(--sb-success); border: 1px solid rgba(16,185,129,0.2); }

    .input-group { margin-bottom: 18px; }
    .btn-full { width: 100%; margin-top: 8px; }

    .auth-divider {
      text-align: center;
      color: var(--sb-text-muted);
      margin: 24px 0 16px;
      font-size: 0.88rem;
    }

    @media (max-width: 768px) {
      .auth-left { display: none; }
      .auth-right { padding: 40px 24px; }
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
          this.errorMsg = 'Impossible de contacter le serveur.';
        } else if (err.status === 401 || err.status === 403) {
          this.errorMsg = 'Email ou mot de passe incorrect.';
        } else {
          this.errorMsg = `Erreur de connexion(${err.status}).`;
        }
      }
    });
  }
}
