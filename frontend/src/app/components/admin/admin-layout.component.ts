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
            <span class="icon">📊</span>
            <span class="label">Tableau de bord</span>
          </a>
          <a routerLink="/admin/products" routerLinkActive="active" class="nav-item">
            <span class="icon">📦</span>
            <span class="label">Annonces</span>
          </a>
          <a routerLink="/admin/users" routerLinkActive="active" class="nav-item">
            <span class="icon">🛡️</span>
            <span class="label">Utilisateurs</span>
          </a>
          <a routerLink="/admin/categories" routerLinkActive="active" class="nav-item">
            <span class="icon">📁</span>
            <span class="label">Catégories</span>
          </a>
          <a routerLink="/admin/logs" routerLinkActive="active" class="nav-item">
            <span class="icon">📜</span>
            <span class="label">Journal d'activité</span>
          </a>
          
          <div class="nav-section">Système</div>
          <a routerLink="/home" class="nav-item">
            <span class="icon">🏠</span>
            <span class="label">Retour au site</span>
          </a>
          <button (click)="logout()" class="nav-item logout-btn">
            <span class="icon">🔓</span>
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
                    <span class="icon">🔔</span>
                    <span class="badge warning" *ngIf="(notifService.unreadCount$ | async) ?? 0 > 0">
                      {{ notifService.unreadCount$ | async }}
                    </span>
                </div>
                <div class="badge-icon">
                    <span class="icon">❓</span>
                </div>
                <div class="badge-icon">
                    <span class="icon">📧</span>
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
      --sidebar-width: 260px;
      --sidebar-collapsed-width: 80px;
      --topbar-height: 70px;
      --primary: #4db6ac;
      --primary-dark: #00897b;
      --noir: #111827;
      --accent: #e0f2f1;
      --bg: #f8fafc;
      --text-white: #ffffff;
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
      background: var(--primary-dark);
      color: var(--text-white);
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      z-index: 100;
      transition: var(--transition);
      overflow-x: hidden;
    }

    .user-profile {
      padding: 20px 15px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      margin-bottom: 15px;
    }

    .avatar-container {
      position: relative;
    }

    .avatar {
      width: 42px;
      height: 42px;
      background: rgba(255,255,255,0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      font-weight: 800;
      border: 2px solid var(--primary);
    }

    .status-dot {
      width: 12px;
      height: 12px;
      background: #4caf50;
      border: 2px solid var(--primary-dark);
      border-radius: 50%;
      position: absolute;
      bottom: 2px;
      right: 2px;
    }

    .user-info {
        display: flex;
        flex-direction: column;
    }

    .user-info .name { font-weight: 800; font-size: 0.9rem; color: #f8fafc; }
    .user-info .status-label { font-size: 0.7rem; color: #2dd4bf; font-weight: 700; margin-top: 2px; display: flex; align-items: center; gap: 5px; }
    .user-info .status-label::before { content: ''; width: 6px; height: 6px; background: #2dd4bf; border-radius: 50%; display: inline-block; }

    .nav-section {
      padding: 15px 20px 8px;
      font-size: 0.7rem;
      font-weight: 800;
      color: var(--text-grey);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 20px;
      color: var(--text-grey);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.85rem;
      transition: 0.2s;
      border-left: 4px solid transparent;
      cursor: pointer;
      background: transparent;
      width: 100%;
      text-align: left;
      border-top: none;
      border-right: none;
      border-bottom: none;
    }

    .nav-item:hover {
      background: rgba(255,255,255,0.05);
      color: var(--text-white);
    }

    .nav-item.active {
      background: rgba(77, 182, 172, 0.15);
      color: white;
      border-left-color: var(--primary);
      box-shadow: inset 5px 0 15px rgba(0,0,0,0.05);
    }

    .nav-item .icon { font-size: 1.1rem; }

    .logout-btn {
        margin-top: auto;
        color: #ef5350;
    }

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
      padding: 0 40px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
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
