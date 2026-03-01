import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="admin-layout">
      <aside class="admin-sidebar" [class.collapsed]="collapsed">
        <div class="sidebar-header">
          <div class="admin-badge">
            <span class="badge-icon">⚙️</span>
            @if (!collapsed) {
              <div class="badge-info">
                <span class="badge-name">Administration</span>
                <span class="badge-role">SouqBladi</span>
              </div>
            }
          </div>
          <button class="collapse-btn" (click)="toggleSidebar()">
            {{ collapsed ? '→' : '←' }}
          </button>
        </div>

        <nav class="sidebar-nav">
          <span class="nav-section" [class.hidden]="collapsed">Général</span>
          <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📊</span>
            @if (!collapsed) { <span>Tableau de bord</span> }
          </a>
          <a routerLink="/admin/products" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📦</span>
            @if (!collapsed) { <span>Annonces</span> }
          </a>
          <a routerLink="/admin/users" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🛡️</span>
            @if (!collapsed) { <span>Utilisateurs</span> }
          </a>
          <a routerLink="/admin/categories" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📁</span>
            @if (!collapsed) { <span>Catégories</span> }
          </a>
          <a routerLink="/admin/logs" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📜</span>
            @if (!collapsed) { <span>Journal</span> }
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

      <main class="admin-main">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .admin-layout { display: flex; min-height: calc(100vh - var(--sb-nav-height)); }

    .admin-sidebar {
      width: 260px;
      background: var(--sb-bg-elevated);
      border-right: 1px solid var(--sb-border);
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease;
      flex-shrink: 0;
    }
    .admin-sidebar.collapsed { width: 72px; }

    .sidebar-header {
      padding: 20px 16px;
      border-bottom: 1px solid var(--sb-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .admin-badge { display: flex; align-items: center; gap: 10px; }
    .badge-icon { font-size: 1.6rem; }
    .badge-info { display: flex; flex-direction: column; }
    .badge-name { font-weight: 700; font-size: 0.9rem; color: var(--sb-text); }
    .badge-role { font-size: 0.65rem; font-weight: 700; color: var(--sb-primary); text-transform: uppercase; }

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
    .nav-section {
      padding: 12px 12px 6px;
      font-size: 0.65rem;
      font-weight: 800;
      color: var(--sb-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .nav-section.hidden { display: none; }
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

    .admin-main {
      flex: 1;
      padding: 32px;
      background: var(--sb-bg-alt);
      overflow-y: auto;
    }

    @media (max-width: 768px) {
      .admin-sidebar { width: 72px; }
      .badge-info, .nav-section, .nav-item span:not(.nav-icon) { display: none; }
      .admin-main { padding: 16px; }
    }
  `]
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  collapsed = false;
  userName = this.authService.getNomComplet() || 'Admin';

  toggleSidebar() { this.collapsed = !this.collapsed; }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
