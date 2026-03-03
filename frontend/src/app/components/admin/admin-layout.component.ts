import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-wrapper" [class.sidebar-collapsed]="isCollapsed">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <div class="logo-box">P</div>
            <span class="logo-text">Publicity<span style="color:var(--admin-cyan)">Plateform</span></span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section">
            <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-item">
              <span class="icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              </span>
              <span class="label">Tableau de bord</span>
            </a>
            <a routerLink="/admin/products" routerLinkActive="active" class="nav-item">
              <span class="icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              </span>
              <span class="label">Annonces</span>
            </a>
            <a routerLink="/admin/users" routerLinkActive="active" class="nav-item">
              <span class="icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </span>
              <span class="label">Utilisateurs</span>
            </a>
            <a routerLink="/admin/categories" routerLinkActive="active" class="nav-item">
              <span class="icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 12 12 17 22 12"></polyline><polyline points="2 17 12 22 22 17"></polyline></svg>
              </span>
              <span class="label">Catégories</span>
            </a>
            <a routerLink="/admin/logs" routerLinkActive="active" class="nav-item">
              <span class="icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </span>
              <span class="label">Journal d'activité</span>
            </a>
          </div>

          <div class="nav-divider"></div>

          <div class="nav-section">
            <div class="nav-label-mini">SYSTÈME</div>
            <a routerLink="/" class="nav-item">
              <span class="icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </span>
              <span class="label">Retour au site</span>
            </a>
            <a (click)="logout()" class="nav-item logout-link">
              <span class="icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </span>
              <span class="label">Déconnexion</span>
            </a>
          </div>

          <div class="sidebar-bottom">
            <button class="btn-add-entry">
              <span class="plus">＋</span>
              <span class="label">Add new entry</span>
            </button>
          </div>
        </nav>
      </aside>

      <!-- Main Container -->
      <div class="main-container">
        <!-- Top Bar -->
        <header class="top-bar">
          <div class="bar-left">
            <button class="menu-toggle" (click)="toggleSidebar()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
          </div>
          <div class="bar-right">
             <div class="top-actions">
                <button class="icon-btn-top" [class.has-notif]="(notifService.unreadCount$ | async)! > 0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  <span class="notif-dot" *ngIf="(notifService.unreadCount$ | async)! > 0"></span>
                </button>
                <div class="user-pill-minimal">
                    <span class="user-name-full">{{ userName }}</span>
                    <div class="status-indicator active"></div>
                    <div class="mini-avatar">{{ userInitial }}</div>
                </div>
             </div>
          </div>
        </header>

        <!-- Content Area -->
        <main class="content-outlet">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --sidebar-width: 240px;
      --sidebar-collapsed-width: 70px;
      --topbar-height: 60px;
      --transition: all 0.25s ease;
    }

    .admin-wrapper {
      display: flex;
      min-height: 100vh;
      background: #F8F9FE;
    }

    /* SIDEBAR */
    .sidebar {
      width: var(--sidebar-width);
      background: #111122;
      color: white;
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      z-index: 100;
      transition: var(--transition);
    }

    .sidebar-header {
      padding: 25px 20px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-box {
      width: 32px;
      height: 32px;
      background: var(--admin-cyan);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      color: white;
      font-size: 1.1rem;
    }

    .logo-text {
      font-size: 1.1rem;
      font-weight: 700;
      letter-spacing: -0.5px;
      color: white;
    }

    .sidebar-nav {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 10px 15px;
    }

    .nav-section {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 9px 12px;
      color: rgba(255, 255, 255, 0.45);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.8rem;
      border-radius: 10px;
      transition: all 0.2s;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.05);
      color: rgba(255, 255, 255, 0.7);
    }

    .nav-item.active {
      background: rgba(255, 255, 255, 0.08);
      color: var(--admin-cyan);
    }

    .nav-item .icon {
      font-size: 1.1rem;
      width: 20px;
      display: flex;
      justify-content: center;
    }

    .nav-label-mini {
      font-size: 0.7rem;
      font-weight: 800;
      color: rgba(255, 255, 255, 0.2);
      padding: 0 12px 10px;
      letter-spacing: 1px;
    }

    .logout-link {
        color: rgba(255, 92, 142, 0.4);
    }

    .logout-link:hover {
        background: rgba(255, 92, 142, 0.05);
        color: #FF5C8E;
    }

    .nav-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.08);
      margin: 15px 12px;
    }

    .sidebar-bottom {
      margin-top: auto;
      padding: 20px 0;
    }

    .btn-add-entry {
      width: 100%;
      background: var(--admin-cyan);
      border: none;
      padding: 12px;
      border-radius: 12px;
      color: #111122;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      cursor: pointer;
      font-size: 0.85rem;
    }

    /* MAIN CONTAINER */
    .main-container {
      flex: 1;
      margin-left: var(--sidebar-width);
      transition: var(--transition);
    }

    /* TOP BAR */
    .top-bar {
      height: var(--topbar-height);
      background: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 25px;
      border-bottom: 1px solid #EDF2F7;
    }

    .menu-toggle {
      background: transparent;
      border: none;
      display: flex;
      align-items: center;
      gap: 12px;
      color: #2D3748;
      font-weight: 800;
      cursor: pointer;
      font-size: 1.1rem;
    }

    .top-actions {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .icon-btn-top {
      background: transparent;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      color: #64748b;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      border-radius: 50%;
      transition: 0.2s;
    }
    .icon-btn-top:hover {
      background: #f1f5f9;
      color: var(--admin-cyan);
    }
    .notif-dot {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 8px;
      height: 8px;
      background: #ef4444;
      border-radius: 50%;
      border: 2px solid white;
    }

    .user-pill-minimal {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 6px 16px;
      background: white;
      border: 1px solid #EDF2F7;
      border-radius: 50px;
      font-weight: 700;
      font-size: 0.85rem;
      color: #2D3748;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }

    .user-name-full {
      font-weight: 700;
      color: #1A202C;
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #CBD5E0;
    }

    .status-indicator.active {
      background: #00ccff;
      box-shadow: 0 0 0 2px rgba(0, 204, 255, 0.2);
    }

    .mini-avatar {
      width: 28px;
      height: 28px;
      background: #F8F9FE;
      color: #00ccff;
      border: 1px solid #E2E8F0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 800;
    }

    .content-outlet {
      padding: 0;
    }

    /* COLLAPSED */
    .sidebar-collapsed .sidebar { width: var(--sidebar-collapsed-width); }
    .sidebar-collapsed .sidebar .label,
    .sidebar-collapsed .sidebar .logo-text { display: none; }
    .sidebar-collapsed .main-container { margin-left: var(--sidebar-collapsed-width); }

    .content-outlet {
      padding: 0;
      flex: 1;
    }

    /* COLLAPSED STATE */
    .sidebar-collapsed .sidebar { width: var(--sidebar-collapsed-width); }
    .sidebar-collapsed .sidebar .label,
    .sidebar-collapsed .sidebar .logo-text,
    .sidebar-collapsed .sidebar .btn-add-entry .label { display: none; }
    .sidebar-collapsed .sidebar .sidebar-header { padding: 30px 0; display: flex; justify-content: center; }
    .sidebar-collapsed .sidebar .nav-item { justify-content: center; padding: 15px 0; }
    .sidebar-collapsed .sidebar .btn-add-entry { width: 50px; height: 50px; padding: 0; margin: 0 auto; border-radius: 12px; }
    .sidebar-collapsed .main-container { margin-left: var(--sidebar-collapsed-width); }

    @media (max-width: 992px) {
        .sidebar { transform: translateX(-100%); }
        .main-container { margin-left: 0; }
        .sidebar-collapsed .sidebar { transform: translateX(0); width: var(--sidebar-width); }
        .sidebar-collapsed .sidebar .label, .sidebar-collapsed .sidebar .logo-text { display: block; }
    }
  `,
  ]
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);
  public router = inject(Router);
  public notifService = inject(NotificationService);

  isCollapsed = false;
  userName = this.authService.getNomComplet() || 'Admin';
  userInitial = this.userName.charAt(0);

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
