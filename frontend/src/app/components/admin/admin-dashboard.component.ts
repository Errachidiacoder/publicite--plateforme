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
      <h1 class="page-title">📊 Tableau de bord</h1>

      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon" style="background: rgba(26,175,165,0.1); color: #1AAFA5;">👤</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ stats.utilisateursTotal || 0 }}</span>
            <span class="kpi-label">Utilisateurs</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background: rgba(59,130,246,0.1); color: #3b82f6;">📦</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ stats.produitsTotal || 0 }}</span>
            <span class="kpi-label">Total Annonces</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background: rgba(245,158,11,0.1); color: #f59e0b;">⏱️</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ stats.produitsEnAttente || 0 }}</span>
            <span class="kpi-label">En Attente</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background: rgba(16,185,129,0.1); color: #10b981;">✅</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ stats.produitsValides || 0 }}</span>
            <span class="kpi-label">Validées</span>
          </div>
        </div>
      </div>

      <!-- Role Breakdown -->
      <div class="detail-grid">
        <div class="detail-card">
          <h3>👥 Répartition Utilisateurs</h3>
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
          <h3>📊 Stats Produits</h3>
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
          <h3>📁 Répartition par Catégorie</h3>
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
          <h3>⚡ Raccourcis</h3>
          <a routerLink="/admin/products" class="quick-link">🔔 Valider les annonces</a>
          <a routerLink="/admin/users" class="quick-link">👤 Gérer les rôles</a>
          <a routerLink="/admin/categories" class="quick-link">📁 Créer catégorie</a>
          <a routerLink="/admin/logs" class="quick-link">📜 Voir historique</a>
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
