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
            <span class="badge-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </span>
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
            <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="21"/><line x1="8" y1="12" x2="8" y2="21"/><line x1="16" y1="16" x2="16" y2="21"/></svg></span>
            @if (!collapsed) { <span>Tableau de bord</span> }
          </a>
          <a routerLink="/admin/products" routerLinkActive="active" class="nav-item">
            <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg></span>
            @if (!collapsed) { <span>Annonces</span> }
          </a>
          <a routerLink="/admin/users" routerLinkActive="active" class="nav-item">
            <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
            @if (!collapsed) { <span>Utilisateurs</span> }
          </a>
          <a routerLink="/admin/categories" routerLinkActive="active" class="nav-item">
            <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></span>
            @if (!collapsed) { <span>Catégories</span> }
          </a>
          <a routerLink="/admin/services" routerLinkActive="active" class="nav-item">
            <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22 12 12"/><path d="M11 7 8 4"/><path d="m18 5 3 3"/><path d="m5 11 3 3"/><path d="m11 13 3 3"/><circle cx="12" cy="12" r="10"/></svg></span>
            @if (!collapsed) { <span>Services</span> }
          </a>
          <a routerLink="/admin/logs" routerLinkActive="active" class="nav-item">
            <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></span>
            @if (!collapsed) { <span>Journal</span> }
          </a>

          <div class="nav-divider"></div>

          <a routerLink="/home" class="nav-item">
            <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span>
            @if (!collapsed) { <span>Retour au site</span> }
          </a>
          <button class="nav-item logout" (click)="logout()">
            <span class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></span>
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
