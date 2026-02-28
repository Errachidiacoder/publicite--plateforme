import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-vendeur-layout',
    standalone: true,
    imports: [RouterModule],
    template: `
    <div class="vendor-layout">
      <aside class="vendor-sidebar" [class.collapsed]="collapsed">
        <div class="sidebar-header">
          <div class="shop-badge">
            <span class="shop-icon">🏪</span>
            @if (!collapsed) {
              <div class="shop-info">
                <span class="shop-name">Ma Boutique</span>
                <span class="shop-role">{{ auth.getPrimaryRole() }}</span>
              </div>
            }
          </div>
          <button class="collapse-btn" (click)="collapsed = !collapsed">
            {{ collapsed ? '→' : '←' }}
          </button>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/vendeur/dashboard" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📊</span>
            @if (!collapsed) { <span>Dashboard</span> }
          </a>
          <a routerLink="/vendeur/produits" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📦</span>
            @if (!collapsed) { <span>Mes Produits</span> }
          </a>
          <a routerLink="/vendeur/commandes" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🧾</span>
            @if (!collapsed) { <span>Commandes</span> }
          </a>
          <a routerLink="/vendeur/etude" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📈</span>
            @if (!collapsed) { <span>Étude de Marché</span> }
          </a>

          <div class="nav-divider"></div>

          <a routerLink="/home" class="nav-item">
            <span class="nav-icon">🏠</span>
            @if (!collapsed) { <span>Retour au site</span> }
          </a>
          <button class="nav-item logout" (click)="logout()">
            <span class="nav-icon">🚪</span>
            @if (!collapsed) { <span>Déconnexion</span> }
          </button>
        </nav>
      </aside>

      <main class="vendor-main">
        <router-outlet />
      </main>
    </div>
  `,
    styles: [`
    .vendor-layout { display: flex; min-height: calc(100vh - var(--sb-nav-height)); }

    .vendor-sidebar {
      width: 260px;
      background: var(--sb-bg-elevated);
      border-right: 1px solid var(--sb-border);
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease;
      flex-shrink: 0;
    }
    .vendor-sidebar.collapsed { width: 72px; }

    .sidebar-header {
      padding: 20px 16px;
      border-bottom: 1px solid var(--sb-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .shop-badge { display: flex; align-items: center; gap: 10px; }
    .shop-icon { font-size: 1.6rem; }
    .shop-info { display: flex; flex-direction: column; }
    .shop-name { font-weight: 700; font-size: 0.9rem; color: var(--sb-text); }
    .shop-role { font-size: 0.65rem; font-weight: 700; color: var(--sb-primary); text-transform: uppercase; }

    .collapse-btn {
      width: 28px; height: 28px;
      border-radius: 8px;
      border: 1px solid var(--sb-border);
      background: var(--sb-bg);
      color: var(--sb-text-muted);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.75rem;
      transition: 0.2s;
    }
    .collapse-btn:hover { border-color: var(--sb-primary); color: var(--sb-primary); }

    .sidebar-nav { padding: 12px 8px; display: flex; flex-direction: column; gap: 4px; flex: 1; }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: var(--sb-radius-md);
      color: var(--sb-text-secondary);
      text-decoration: none;
      font-size: 0.88rem;
      font-weight: 500;
      transition: 0.2s;
      cursor: pointer;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      font-family: inherit;
    }
    .nav-item:hover { background: var(--sb-surface); color: var(--sb-text); }
    .nav-item.active { background: var(--sb-primary-light); color: var(--sb-primary); font-weight: 700; }
    .nav-icon { font-size: 1.15rem; flex-shrink: 0; }
    .nav-divider { height: 1px; background: var(--sb-border); margin: 8px 4px; }
    .nav-item.logout { color: var(--sb-danger); margin-top: auto; }

    .vendor-main {
      flex: 1;
      padding: 32px;
      background: var(--sb-bg-alt);
      overflow-y: auto;
    }

    @media (max-width: 768px) {
      .vendor-sidebar { width: 72px; }
      .shop-info, .nav-item span:not(.nav-icon) { display: none; }
      .vendor-main { padding: 16px; }
    }
  `]
})
export class VendeurLayoutComponent {
    auth = inject(AuthService);
    private router = inject(Router);
    collapsed = false;

    logout() { this.auth.logout(); }
}
