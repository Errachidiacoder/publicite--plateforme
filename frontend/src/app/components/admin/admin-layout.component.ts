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
        <div class="user-profile">
          <div class="avatar-container">
            <div class="avatar">{{ userInitial }}</div>
            <div class="status-dot"></div>
          </div>
          <div class="user-info">
            <span class="name">{{ userName }}</span>
            <span class="status-label">En ligne</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section">Général</div>
          <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-item">
            <span class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </span>
            <span class="label">Tableau de bord</span>
          </a>
          <a routerLink="/admin/products" routerLinkActive="active" class="nav-item">
            <span class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            </span>
            <span class="label">Annonces</span>
          </a>
          <a routerLink="/admin/users" routerLinkActive="active" class="nav-item">
            <span class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </span>
            <span class="label">Utilisateurs</span>
          </a>
          <a routerLink="/admin/categories" routerLinkActive="active" class="nav-item">
            <span class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            </span>
            <span class="label">Catégories</span>
          </a>
          <a routerLink="/admin/logs" routerLinkActive="active" class="nav-item">
            <span class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </span>
            <span class="label">Journal d'activité</span>
          </a>
          
          <div class="nav-section">Système</div>
          <a routerLink="/home" class="nav-item">
            <span class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </span>
            <span class="label">Retour au site</span>
          </a>
          <button (click)="logout()" class="nav-item logout-btn">
            <span class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </span>
            <span class="label">Déconnexion</span>
          </button>
        </nav>
      </aside>

      <!-- Main Container -->
      <div class="main-container">
        <!-- Top Bar -->
        <header class="top-bar">
          <div class="bar-left">
            <button class="toggle-btn" (click)="toggleSidebar()">
              <span class="burger-icon"></span>
            </button>
            <div class="logo">
                <span class="logo-accent">Publicity</span>Plateform
            </div>
          </div>
          <div class="bar-right">
            <div class="icon-actions">
                <div class="badge-icon" (click)="router.navigate(['/admin/products'])">
                    <span class="icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                    </span>
                    <span class="badge warning" *ngIf="(notifService.unreadCount$ | async) ?? 0 > 0">
                      {{ notifService.unreadCount$ | async }}
                    </span>
                </div>
                <div class="badge-icon">
                    <span class="icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    </span>
                </div>
                <div class="badge-icon">
                    <span class="icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    </span>
                    <span class="badge danger">3</span>
                </div>
            </div>
            <div class="header-user">
                <span class="header-name">{{ userName }}</span>
                <div class="mini-avatar">{{ userInitial }}</div>
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
      --sidebar-width: 250px;
      --sidebar-collapsed-width: 80px;
      --topbar-height: 64px;
      --primary: #00897b;
      --primary-dark: #004d40;
      --noir: #1e293b;
      --accent: #e0f2f1;
      --bg: #f8fafc;
      --text-white: #ffffff;
      --text-dark: #1e293b; 
      --text-grey: #94a3b8;
      --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .admin-wrapper {
      display: flex;
      min-height: 100vh;
      background: var(--bg);
    }

    /* SIDEBAR */
    .sidebar {
      width: var(--sidebar-width);
      background: #004d40 !important; /* Dark teal from new reference */
      color: rgba(255,255,255,0.7) !important;
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      z-index: 100;
      transition: var(--transition);
      overflow-x: hidden;
      border-right: none;
    }

    .user-profile {
      padding: 24px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
    }

    .avatar-container {
      position: relative;
    }

    .avatar {
      width: 44px;
      height: 44px;
      background: rgba(255,255,255,0.1);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      font-weight: 800;
      color: white;
      border: 1px solid rgba(255,255,255,0.2);
    }

    .status-dot {
      width: 12px;
      height: 12px;
      background: #4caf50;
      border: 2px solid #004d40;
      border-radius: 50%;
      position: absolute;
      bottom: -2px;
      right: -2px;
    }

    .user-info {
        display: flex;
        flex-direction: column;
    }

    .user-info .name { font-weight: 700; font-size: 0.95rem; color: white; }
    .user-info .status-label { font-size: 0.75rem; color: rgba(255,255,255,0.6); font-weight: 500; margin-top: 2px; display: flex; align-items: center; gap: 5px; }
    .user-info .status-label::before { content: ''; width: 6px; height: 6px; background: #4caf50; border-radius: 50%; display: inline-block; }

    .nav-section {
      padding: 15px 25px 10px;
      font-size: 0.7rem;
      font-weight: 800;
      color: rgba(255,255,255,0.4);
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 12px 25px;
      margin: 2px 0;
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.85rem;
      transition: all 0.2s;
      cursor: pointer;
      background: transparent;
      border: none;
      width: 100%;
    }

    .nav-item:hover {
      background: rgba(255,255,255,0.05);
      color: white;
    }
    
    .nav-item.active {
      background: rgba(255,255,255,0.1);
      color: white !important;
      font-weight: 700;
      border-left: 4px solid #4db6ac;
    }

    .nav-item .icon { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; opacity: 0.8; }
    .nav-item.active .icon { opacity: 1; color: #4db6ac; }

    .logout-btn {
        margin-top: auto;
        color: #ffa4a2;
        padding-bottom: 25px;
    }

    .logout-btn:hover { color: #ef5350; background: rgba(239, 83, 80, 0.05); }

    /* MAIN CONTENT AREA */
    .main-container {
      flex: 1;
      margin-left: var(--sidebar-width);
      transition: var(--transition);
      display: flex;
      flex-direction: column;
    }

    /* TOP BAR */
    .top-bar {
      height: var(--topbar-height);
      background: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 25px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
      position: sticky;
      top: 0;
      z-index: 90;
      border-bottom: 1px solid #f1f5f9;
    }

    .bar-left { display: flex; align-items: center; gap: 20px; }
    .toggle-btn {
      background: #f1f5f9;
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .burger-icon {
      width: 20px;
      height: 2px;
      background: var(--primary-dark);
      position: relative;
    }
    .burger-icon::before, .burger-icon::after {
      content: '';
      position: absolute;
      width: 20px;
      height: 2px;
      background: var(--primary-dark);
      left: 0;
    }
    .burger-icon::before { top: -6px; }
    .burger-icon::after { top: 6px; }

    .logo { font-size: 1.4rem; font-weight: 900; color: var(--primary-dark); }
    .logo-accent { color: var(--primary); }

    .bar-right { display: flex; align-items: center; gap: 30px; }
    .icon-actions { display: flex; gap: 15px; }
    .badge-icon {
      position: relative;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      color: var(--text-grey);
      cursor: pointer;
    }
    .badge-icon .icon { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; }
    .badge-icon .icon svg { width: 100%; height: 100%; }
    .badge {
      position: absolute;
      top: 5px;
      right: 5px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      font-size: 0.7rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      border: 2px solid white;
    }
    .badge.warning { background: #ff9800; }
    .badge.danger { background: #ef5350; }

    .header-user { display: flex; align-items: center; gap: 12px; cursor: pointer; }
    .header-name { font-weight: 700; color: var(--primary-dark); }
    .mini-avatar { width: 32px; height: 32px; background: var(--accent); color: var(--primary-dark); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; }

    .content-outlet {
      padding: 0;
      flex: 1;
    }

    /* COLLAPSED STATE */
    .sidebar-collapsed .sidebar { width: var(--sidebar-collapsed-width); }
    .sidebar-collapsed .sidebar .label,
    .sidebar-collapsed .sidebar .user-info,
    .sidebar-collapsed .sidebar .nav-section { display: none; }
    .sidebar-collapsed .sidebar .user-profile { justify-content: center; padding: 20px 0; }
    .sidebar-collapsed .sidebar .nav-item { justify-content: center; padding: 15px 0; }
    .sidebar-collapsed .main-container { margin-left: var(--sidebar-collapsed-width); }

    @media (max-width: 992px) {
        .sidebar { transform: translateX(-100%); }
        .main-container { margin-left: 0; }
        .admin-wrapper.sidebar-collapsed .sidebar { transform: translateX(0); width: var(--sidebar-width); }
        .admin-wrapper.sidebar-collapsed .sidebar .label,
        .admin-wrapper.sidebar-collapsed .sidebar .user-info,
        .admin-wrapper.sidebar-collapsed .sidebar .nav-section { display: block; }
    }
  `]
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
