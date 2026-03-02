import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page">
      <h1 class="page-title" style="display: flex; align-items: center; gap: 12px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--sb-primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="21"/><line x1="8" y1="12" x2="8" y2="21"/><line x1="16" y1="16" x2="16" y2="21"/></svg>
        Tableau de bord
      </h1>

      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon" style="background: rgba(26,175,165,0.1); color: #1AAFA5;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-value">{{ stats.utilisateursTotal || 0 }}</span>
            <span class="kpi-label">Utilisateurs</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background: rgba(59,130,246,0.1); color: #3b82f6;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-value">{{ stats.produitsTotal || 0 }}</span>
            <span class="kpi-label">Total Annonces</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background: rgba(245,158,11,0.1); color: #f59e0b;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-value">{{ stats.produitsEnAttente || 0 }}</span>
            <span class="kpi-label">En Attente</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background: rgba(16,185,129,0.1); color: #10b981;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-value">{{ stats.produitsValides || 0 }}</span>
            <span class="kpi-label">Validées</span>
          </div>
        </div>
      </div>

      <!-- Role Breakdown -->
      <div class="detail-grid">
        <div class="detail-card">
          <h3 style="display: flex; align-items: center; gap: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--sb-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Répartition Utilisateurs
          </h3>
          <div class="detail-row">
            <span class="detail-label">Annonceurs / Vendeurs</span>
            <span class="detail-value">{{ stats.utilisateursAnnonceurs || 0 }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Administrateurs</span>
            <span class="detail-value">{{ stats.utilisateursAdmins || 0 }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Catégories</span>
            <span class="detail-value">{{ stats.categoriesCount || 0 }}</span>
          </div>
        </div>

        <div class="detail-card">
          <h3 style="display: flex; align-items: center; gap: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--sb-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
            Stats Produits
          </h3>
          <div class="detail-row">
            <span class="detail-label">Actifs</span>
            <span class="detail-value success">{{ stats.produitsActifs || 0 }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Refusés</span>
            <span class="detail-value danger">{{ stats.produitsRefuses || 0 }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Total Vues</span>
            <span class="detail-value">{{ stats.totalVues || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- Category Chart + Quick Links -->
      <div class="bottom-grid">
        <div class="chart-card">
          <h3 style="display: flex; align-items: center; gap: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--sb-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            Répartition par Catégorie
          </h3>
          <div class="chart-bars">
            @for (cat of stats.repartitionCategories; track cat.nom) {
              <div class="bar-group">
                <div class="bar-fill" [style.height.%]="getBarHeight(cat.count)">
                  <span class="bar-count">{{ cat.count }}</span>
                </div>
                <span class="bar-name">{{ cat.nom }}</span>
              </div>
            }
          </div>
        </div>

        <div class="quick-card">
          <h3 style="display: flex; align-items: center; gap: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--sb-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            Raccourcis
          </h3>
          <a routerLink="/admin/products" class="quick-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px; vertical-align:text-bottom"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            Valider les annonces
          </a>
          <a routerLink="/admin/users" class="quick-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px; vertical-align:text-bottom"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Gérer les rôles
          </a>
          <a routerLink="/admin/categories" class="quick-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px; vertical-align:text-bottom"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            Créer catégorie
          </a>
          <a routerLink="/admin/logs" class="quick-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px; vertical-align:text-bottom"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            Voir historique
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; }
    .page-title { font-family: 'Outfit',sans-serif; font-size: 1.6rem; font-weight: 800; color: var(--sb-text); margin-bottom: 28px; }

    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
    .kpi-card {
      background: var(--sb-bg-elevated);
      border: 1px solid var(--sb-border);
      border-radius: var(--sb-radius-lg);
      padding: 20px;
      display: flex; align-items: center; gap: 16px;
      transition: var(--sb-transition);
    }
    .kpi-card:hover { box-shadow: var(--sb-shadow-md); transform: translateY(-2px); }
    .kpi-icon {
      width: 48px; height: 48px;
      border-radius: var(--sb-radius-md);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.3rem; flex-shrink: 0;
    }
    .kpi-info { display: flex; flex-direction: column; }
    .kpi-value { font-size: 1.5rem; font-weight: 800; color: var(--sb-text); }
    .kpi-label { font-size: 0.78rem; color: var(--sb-text-muted); font-weight: 500; }

    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
    .detail-card {
      background: var(--sb-bg-elevated);
      border: 1px solid var(--sb-border);
      border-radius: var(--sb-radius-lg);
      padding: 24px;
    }
    .detail-card h3 { font-size: 0.95rem; font-weight: 700; color: var(--sb-text); margin-bottom: 16px; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--sb-border-light); }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { font-size: 0.85rem; color: var(--sb-text-secondary); }
    .detail-value { font-weight: 800; font-size: 0.9rem; color: var(--sb-text); }
    .detail-value.success { color: var(--sb-success); }
    .detail-value.danger { color: var(--sb-danger); }

    .bottom-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
    .chart-card, .quick-card {
      background: var(--sb-bg-elevated);
      border: 1px solid var(--sb-border);
      border-radius: var(--sb-radius-lg);
      padding: 24px;
    }
    .chart-card h3, .quick-card h3 { font-size: 0.95rem; font-weight: 700; color: var(--sb-text); margin-bottom: 20px; }

    .chart-bars {
      height: 200px;
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      gap: 12px;
    }
    .bar-group { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; height: 100%; justify-content: flex-end; }
    .bar-fill {
      width: 100%; max-width: 48px;
      background: var(--sb-primary-gradient);
      border-radius: 6px 6px 0 0;
      position: relative;
      transition: height 0.5s ease;
      min-height: 10px;
    }
    .bar-count {
      position: absolute; top: -22px; left: 50%; transform: translateX(-50%);
      font-size: 0.7rem; font-weight: 700; color: var(--sb-text-secondary);
    }
    .bar-name { font-size: 0.68rem; color: var(--sb-text-muted); text-align: center; max-width: 60px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .quick-link {
      display: block;
      padding: 14px 16px;
      background: var(--sb-surface);
      border-radius: var(--sb-radius-md);
      text-decoration: none;
      color: var(--sb-text);
      font-weight: 600;
      font-size: 0.88rem;
      margin-bottom: 8px;
      transition: var(--sb-transition);
      border: 1px solid transparent;
    }
    .quick-link:hover {
      background: var(--sb-primary-light);
      color: var(--sb-primary);
      border-color: var(--sb-primary);
      transform: translateX(4px);
    }

    @media (max-width: 768px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .detail-grid, .bottom-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  stats: any = { repartitionCategories: [] };

  ngOnInit() { this.loadStats(); }

  loadStats() {
    this.adminService.getDashboardStats().subscribe(data => {
      this.stats = data;
    });
  }

  getBarHeight(count: number): number {
    if (!this.stats.produitsTotal || this.stats.produitsTotal === 0) return 10;
    return Math.max(10, (count / this.stats.produitsTotal) * 100);
  }
}
