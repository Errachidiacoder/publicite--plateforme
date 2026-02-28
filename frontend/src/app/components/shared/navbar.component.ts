import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeToggleComponent } from './theme-toggle.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, ThemeToggleComponent],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <!-- Logo -->
        <a routerLink="/home" class="nav-logo">
          <span class="logo-icon">🛍️</span>
          <span class="logo-text">Souq<span class="logo-accent">Bladi</span></span>
        </a>

        <!-- Search Bar -->
        <div class="nav-search">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="Rechercher sur SouqBladi..." class="search-input" />
        </div>

        <!-- Actions -->
        <div class="nav-actions">
          <app-theme-toggle />

          @if (auth.isLoggedIn()) {
            <a routerLink="/panier" class="nav-icon-btn" title="Mon panier">
              🛒
            </a>

            @if (isVendeur()) {
              <a routerLink="/vendeur" class="nav-icon-btn" title="Ma boutique">
                🏪
              </a>
            }

            @if (auth.isAdmin()) {
              <a routerLink="/admin" class="nav-icon-btn" title="Administration">
                ⚙️
              </a>
            }

            <div class="nav-user" (click)="menuOpen = !menuOpen">
              <div class="user-avatar">{{ getInitials() }}</div>
              <span class="user-name">{{ auth.getNomComplet() }}</span>

              @if (menuOpen) {
                <div class="user-dropdown">
                  <div class="dropdown-header">
                    <strong>{{ auth.getNomComplet() }}</strong>
                    <span class="user-role">{{ auth.getPrimaryRole() }}</span>
                  </div>
                  <div class="dropdown-divider"></div>
                  <a routerLink="/profil" class="dropdown-item" (click)="menuOpen = false">👤 Mon profil</a>
                  <a routerLink="/commandes" class="dropdown-item" (click)="menuOpen = false">📦 Mes commandes</a>
                  @if (isVendeur()) {
                    <a routerLink="/vendeur" class="dropdown-item" (click)="menuOpen = false">🏪 Ma boutique</a>
                  }
                  <div class="dropdown-divider"></div>
                  <button class="dropdown-item logout" (click)="logout()">🚪 Déconnexion</button>
                </div>
              }
            </div>
          } @else {
            <a routerLink="/login" class="btn btn-secondary btn-sm">Connexion</a>
            <a routerLink="/register" class="btn btn-primary btn-sm">Inscription</a>
          }
        </div>

        <!-- Mobile menu toggle -->
        <button class="mobile-toggle" (click)="mobileOpen = !mobileOpen">
          {{ mobileOpen ? '✕' : '☰' }}
        </button>
      </div>

      <!-- Mobile Nav -->
      @if (mobileOpen) {
        <div class="mobile-nav">
          <div class="mobile-search">
            <input type="text" placeholder="Rechercher..." class="search-input" />
          </div>
          <a routerLink="/home" class="mobile-link" (click)="mobileOpen = false">🏠 Accueil</a>
          @if (auth.isLoggedIn()) {
            <a routerLink="/panier" class="mobile-link" (click)="mobileOpen = false">🛒 Mon panier</a>
            <a routerLink="/commandes" class="mobile-link" (click)="mobileOpen = false">📦 Mes commandes</a>
            @if (isVendeur()) {
              <a routerLink="/vendeur" class="mobile-link" (click)="mobileOpen = false">🏪 Ma boutique</a>
            }
            @if (auth.isAdmin()) {
              <a routerLink="/admin" class="mobile-link" (click)="mobileOpen = false">⚙️ Admin</a>
            }
            <button class="mobile-link logout" (click)="logout()">🚪 Déconnexion</button>
          } @else {
            <a routerLink="/login" class="mobile-link" (click)="mobileOpen = false">Connexion</a>
            <a routerLink="/register" class="mobile-link" (click)="mobileOpen = false">Inscription</a>
          }
          <div class="mobile-theme">
            <app-theme-toggle />
          </div>
        </div>
      }
    </nav>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: var(--sb-bg-elevated);
      border-bottom: 1px solid var(--sb-border);
      backdrop-filter: blur(12px);
      transition: background 0.3s ease;
    }
    .nav-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 24px;
      height: var(--sb-nav-height);
      display: flex;
      align-items: center;
      gap: 24px;
    }
    .nav-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      flex-shrink: 0;
    }
    .logo-icon { font-size: 1.6rem; }
    .logo-text {
      font-family: 'Outfit', sans-serif;
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--sb-text);
      letter-spacing: -0.02em;
    }
    .logo-accent { color: var(--sb-primary); }

    .nav-search {
      flex: 1;
      max-width: 520px;
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-icon {
      position: absolute;
      left: 14px;
      font-size: 0.9rem;
      pointer-events: none;
    }
    .search-input {
      width: 100%;
      padding: 10px 16px 10px 40px;
      border-radius: var(--sb-radius-full);
      border: 1.5px solid var(--sb-border);
      background: var(--sb-bg-alt);
      color: var(--sb-text);
      font-size: 0.88rem;
      font-family: inherit;
      outline: none;
      transition: var(--sb-transition);
    }
    .search-input:focus {
      border-color: var(--sb-primary);
      box-shadow: 0 0 0 3px rgba(26, 175, 165, 0.1);
      background: var(--sb-bg);
    }
    .search-input::placeholder { color: var(--sb-text-muted); }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }
    .nav-icon-btn {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      text-decoration: none;
      border: 1.5px solid var(--sb-border);
      background: var(--sb-bg-elevated);
      transition: var(--sb-transition);
      cursor: pointer;
    }
    .nav-icon-btn:hover {
      transform: translateY(-2px);
      box-shadow: var(--sb-shadow-sm);
      border-color: var(--sb-primary);
    }

    .nav-user {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      position: relative;
      padding: 6px 10px;
      border-radius: var(--sb-radius-md);
      transition: var(--sb-transition);
    }
    .nav-user:hover { background: var(--sb-surface); }
    .user-avatar {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: var(--sb-primary-gradient);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.8rem;
    }
    .user-name {
      font-weight: 600;
      font-size: 0.85rem;
      color: var(--sb-text);
    }

    .user-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      min-width: 220px;
      background: var(--sb-bg-elevated);
      border: 1px solid var(--sb-border);
      border-radius: var(--sb-radius-lg);
      box-shadow: var(--sb-shadow-lg);
      overflow: hidden;
      animation: dropIn 0.2s ease;
      z-index: 100;
    }
    @keyframes dropIn {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .dropdown-header {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .dropdown-header strong {
      font-size: 0.9rem;
      color: var(--sb-text);
    }
    .user-role {
      font-size: 0.7rem;
      color: var(--sb-primary);
      font-weight: 700;
      text-transform: uppercase;
    }
    .dropdown-divider {
      height: 1px;
      background: var(--sb-border);
    }
    .dropdown-item {
      display: block;
      padding: 10px 16px;
      font-size: 0.85rem;
      color: var(--sb-text);
      text-decoration: none;
      transition: 0.15s;
      cursor: pointer;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      font-family: inherit;
    }
    .dropdown-item:hover {
      background: var(--sb-surface);
    }
    .dropdown-item.logout {
      color: var(--sb-danger);
    }

    .mobile-toggle {
      display: none;
      width: 40px;
      height: 40px;
      border: 1.5px solid var(--sb-border);
      border-radius: 10px;
      background: var(--sb-bg-elevated);
      font-size: 1.2rem;
      cursor: pointer;
      color: var(--sb-text);
      align-items: center;
      justify-content: center;
    }

    .mobile-nav {
      display: none;
      padding: 16px 24px 24px;
      border-top: 1px solid var(--sb-border);
      background: var(--sb-bg-elevated);
    }
    .mobile-search { margin-bottom: 12px; }
    .mobile-link {
      display: block;
      padding: 12px 0;
      font-size: 0.95rem;
      color: var(--sb-text);
      text-decoration: none;
      border-bottom: 1px solid var(--sb-border-light);
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      font-family: inherit;
      cursor: pointer;
    }
    .mobile-link:hover { color: var(--sb-primary); }
    .mobile-link.logout { color: var(--sb-danger); }
    .mobile-theme { margin-top: 16px; }

    @media (max-width: 768px) {
      .nav-search { display: none; }
      .nav-actions .btn { display: none; }
      .nav-actions .nav-icon-btn { display: none; }
      .nav-user .user-name { display: none; }
      .mobile-toggle { display: flex; }
      .mobile-nav { display: block; }
    }
  `]
})
export class NavbarComponent {
  auth = inject(AuthService);
  menuOpen = false;
  mobileOpen = false;

  getInitials(): string {
    const nom = this.auth.getNomComplet();
    if (!nom) return '?';
    return nom.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  isVendeur(): boolean {
    const role = this.auth.getPrimaryRole();
    return ['AUTO_ENTREPRENEUR', 'MAGASIN', 'COOPERATIVE', 'SARL'].includes(role);
  }

  logout() {
    this.menuOpen = false;
    this.mobileOpen = false;
    this.auth.logout();
  }
}
