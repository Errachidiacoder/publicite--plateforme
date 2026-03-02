import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
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
            <p>Rejoignez des milliers de vendeurs et clients sur la plateforme e-commerce 100% marocaine.</p>
          </div>
          <div class="auth-features">
            <div class="feature">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span>Inscription gratuite</span>
            </div>
            <div class="feature">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span>Validation rapide</span>
            </div>
            <div class="feature">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span>Étude de marché offerte</span>
            </div>
          </div>
        </div>

        <div class="auth-right">
          <div class="auth-form-box">
            <h2 style="display: flex; align-items: center; gap: 8px;">
              Créer un compte
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--sb-primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </h2>
            <p class="auth-subtitle">Commencez à acheter ou vendre en quelques minutes</p>

            @if (errorMsg) {
              <div class="alert alert-error">⚠️ {{ errorMsg }}</div>
            }
            @if (successMsg) {
              <div class="alert alert-success">✅ {{ successMsg }}</div>
            }

            <form (ngSubmit)="onRegister()" #regForm="ngForm">
              <div class="input-group">
                <label>Nom complet</label>
                <input type="text" class="form-input" [(ngModel)]="regData.nomComplet" name="nomComplet"
                       placeholder="Ex: Ahmed Benali" required [disabled]="loading">
              </div>

              <div class="input-group">
                <label>Email</label>
                <input type="email" class="form-input" [(ngModel)]="regData.email" name="email"
                       placeholder="votre@email.com" required [disabled]="loading">
              </div>

              <div class="input-row">
                <div class="input-group">
                  <label>Téléphone</label>
                  <input type="tel" class="form-input" [(ngModel)]="regData.telephone" name="telephone"
                         placeholder="06 00 00 00 00" required [disabled]="loading">
                </div>
                <div class="input-group">
                  <label>Ville</label>
                  <select class="form-input" [(ngModel)]="regData.ville" name="ville" [disabled]="loading">
                    <option value="">Choisir...</option>
                    @for (v of villes; track v) {
                      <option [value]="v">{{ v }}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="input-group">
                <label>Type d'activité</label>
                <div class="type-grid">
                  @for (type of types; track type.value) {
                    <div class="type-card" [class.selected]="regData.typeActivite === type.value"
                         (click)="regData.typeActivite = type.value">
                      <span class="type-icon">{{ type.icon }}</span>
                      <span class="type-label">{{ type.label }}</span>
                    </div>
                  }
                </div>
              </div>

              <div class="input-group">
                <label>Mot de passe</label>
                <input type="password" class="form-input" [(ngModel)]="regData.password" name="password"
                       placeholder="Minimum 6 caractères" required minlength="6" [disabled]="loading">
              </div>

              <button type="submit" class="btn btn-primary btn-full" [disabled]="loading || !regForm.form.valid">
                @if (!loading) { Créer mon compte } @else { ⏳ Création... }
              </button>
            </form>

            <div class="auth-divider"><span>Déjà inscrit ?</span></div>
            <a routerLink="/login" class="btn btn-outline btn-full">Se connecter</a>
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
      flex: 0.8;
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
      flex: 1.2;
      background: var(--sb-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 60px;
      overflow-y: auto;
    }
    .auth-form-box { width: 100%; max-width: 500px; }
    .auth-form-box h2 { font-size: 1.8rem; font-weight: 800; color: var(--sb-text); margin-bottom: 8px; }
    .auth-subtitle { color: var(--sb-text-secondary); margin-bottom: 28px; }

    .alert {
      padding: 12px 16px;
      border-radius: var(--sb-radius-md);
      margin-bottom: 20px;
      font-size: 0.88rem;
      font-weight: 500;
    }
    .alert-error { background: rgba(239,68,68,0.1); color: var(--sb-danger); border: 1px solid rgba(239,68,68,0.2); }
    .alert-success { background: rgba(16,185,129,0.1); color: var(--sb-success); border: 1px solid rgba(16,185,129,0.2); }

    .input-group { margin-bottom: 16px; }
    .input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    select.form-input {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      padding-right: 36px;
    }

    /* Type selector grid */
    .type-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }
    .type-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 12px 8px;
      border: 1.5px solid var(--sb-border);
      border-radius: var(--sb-radius-md);
      cursor: pointer;
      transition: var(--sb-transition);
      background: var(--sb-bg-elevated);
    }
    .type-card:hover { border-color: var(--sb-primary); }
    .type-card.selected {
      border-color: var(--sb-primary);
      background: var(--sb-primary-light);
      box-shadow: 0 0 0 2px rgba(26,175,165,0.15);
    }
    .type-icon { font-size: 1.3rem; }
    .type-label { font-size: 0.7rem; font-weight: 700; color: var(--sb-text); text-align: center; }

    .btn-full { width: 100%; margin-top: 8px; }
    .auth-divider { text-align: center; color: var(--sb-text-muted); margin: 20px 0 12px; font-size: 0.88rem; }

    @media (max-width: 768px) {
      .auth-left { display: none; }
      .auth-right { padding: 30px 20px; }
      .type-grid { grid-template-columns: repeat(2, 1fr); }
      .input-row { grid-template-columns: 1fr; }
    }
  `]
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  regData = {
    nomComplet: '',
    email: '',
    telephone: '',
    password: '',
    ville: '',
    typeActivite: 'CLIENT'
  };
  loading = false;
  errorMsg = '';
  successMsg = '';

  types = [
    { value: 'CLIENT', label: 'Client', icon: '🛒' },
    { value: 'AUTO_ENTREPRENEUR', label: 'Auto-Entrepreneur', icon: '💼' },
    { value: 'MAGASIN', label: 'Magasin', icon: '🏪' },
    { value: 'COOPERATIVE', label: 'Coopérative', icon: '🤝' },
    { value: 'SARL', label: 'SARL / Société', icon: '🏢' },
    { value: 'LIVREUR', label: 'Livraison / Stockage', icon: '🚚' }
  ];

  villes = [
    'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Meknès',
    'Agadir', 'Oujda', 'Kénitra', 'Tétouan', 'Safi', 'El Jadida',
    'Nador', 'Béni Mellal', 'Mohammédia', 'Khouribga', 'Errachidia'
  ];

  onRegister() {
    if (this.loading) return;
    this.errorMsg = '';
    this.successMsg = '';
    this.loading = true;

    this.authService.register(this.regData).subscribe({
      next: () => {
        this.successMsg = 'Compte créé avec succès ! Redirection...';
        setTimeout(() => this.router.navigate(['/home']), 1500);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 0) {
          this.errorMsg = 'Impossible de contacter le serveur.';
        } else if (err.status === 409 || err.status === 400) {
          this.errorMsg = 'Un compte existe déjà avec cet email.';
        } else {
          this.errorMsg = `Erreur d'inscription (${err.status}).`;
        }
      }
    });
  }
}
