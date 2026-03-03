import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-page">
      <!-- Secondary Header -->
      <div class="dashboard-header-modern">
        <div class="header-left">
          <h1>Tableau de Bord</h1>
          <p>Bienvenue! Voici un aperçu de l'activité aujourd'hui.</p>
        </div>
        <div class="header-right">
          <div class="admin-tabs">
            <button class="active">Quotidien</button>
            <button>Hebdo</button>
            <button>Mensuel</button>
          </div>
          <button class="btn-premium">
            <span>Rapport PDF</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          </button>
        </div>
      </div>

      <!-- KPI Grid -->
      <div class="kpi-grid">
        <div class="admin-card kpi-card">
          <div class="card-content">
            <span class="label">Utilisateurs</span>
            <h3 class="value">{{ stats.totalUsers || 0 }}</h3>
            <span class="trend positive">+12% ce mois</span>
          </div>
          <div class="card-icon cyan">👤</div>
        </div>
        <div class="admin-card kpi-card">
          <div class="card-content">
            <span class="label">Annonces Totales</span>
            <h3 class="value">{{ stats.totalAds || 0 }}</h3>
            <span class="trend positive">+5% ce mois</span>
          </div>
          <div class="card-icon purple">📁</div>
        </div>
        <div class="admin-card kpi-card">
          <div class="card-content">
            <span class="label">En Attente</span>
            <h3 class="value">{{ stats.pendingAds || 0 }}</h3>
            <span class="trend negative">-2% ce mois</span>
          </div>
          <div class="card-icon orange">⏳</div>
        </div>
        <div class="admin-card kpi-card">
          <div class="card-content">
            <span class="label">Catégories</span>
            <h3 class="value">{{ stats.totalCategories || 0 }}</h3>
            <span class="trend neutral">Stable</span>
          </div>
          <div class="card-icon pink">📑</div>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="dashboard-grid-modern">
        <!-- Chart Section -->
        <div class="admin-card chart-large">
          <div class="card-header">
            <h3>Croissance des Annonces</h3>
            <div class="card-menu">•••</div>
          </div>
          <div class="chart-box">
            <div class="bar-chart-sim">
                <div class="bar" style="height: 40%"></div>
                <div class="bar" style="height: 60%"></div>
                <div class="bar" style="height: 80%"></div>
                <div class="bar" style="height: 50%"></div>
                <div class="bar" style="height: 90%"></div>
                <div class="bar" style="height: 70%"></div>
                <div class="bar" style="height: 85%"></div>
            </div>
          </div>
        </div>

        <!-- Activity Feed -->
        <div class="admin-card chart-small">
          <div class="card-header">
            <h3>Activité Récente</h3>
          </div>
          <div class="activity-feed">
             <div *ngFor="let prod of stats.recentAds || []" class="feed-item">
                <div class="feed-dot" [ngClass]="prod.statutValidation?.toLowerCase()"></div>
                <div class="feed-info">
                   <span class="feed-text">{{ prod.titreProduit }}</span>
                   <span class="feed-time">{{ prod.dateSoumission | date:'short' }}</span>
                </div>
             </div>
             <div class="empty-state" *ngIf="!stats.recentAds?.length" style="font-size: 0.8rem; color: #94a3b8; padding: 20px 0;">
                Aucune activité récente.
             </div>
          </div>
        </div>

        <!-- Recent Table -->
        <div class="admin-card activity-card">
          <div class="card-header">
            <div class="header-info">
              <h3>Dernières Demandes</h3>
              <p>Liste des dernières interactions utilisateurs.</p>
            </div>
            <button class="view-all">Tout voir</button>
          </div>
          <div class="table-responsive">
            <table class="premium-table">
              <thead>
                <tr>
                  <th width="40"><input type="checkbox" class="table-checkbox"></th>
                  <th>Utilisateur</th>
                  <th>Type / Rôle</th>
                  <th>Date</th>
                  <th width="120">Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let prod of stats.lastFiveAds || []">
                  <td><input type="checkbox" class="table-checkbox"></td>
                  <td>
                    <div class="table-user-cell">
                      <div class="table-avatar">{{ (prod.annonceur?.nomComplet || 'A')[0].toUpperCase() }}</div>
                      <span class="u-name">{{ prod.annonceur?.nomComplet || 'Utilisateur' }}</span>
                    </div>
                  </td>
                  <td><span class="tag-role">{{ prod.titreProduit }}</span></td>
                  <td>{{ prod.dateSoumission | date:'dd MMM, yyyy' }}</td>
                  <td>
                    <div class="status-toggle" [class.active]="prod.statutValidation === 'ACTIVEE'">
                      <div class="toggle-track"><div class="toggle-thumb"></div></div>
                      <span>{{ prod.statutValidation }}</span>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="!stats.lastFiveAds?.length">
                   <td colspan="5" style="text-align: center; padding: 40px; color: #94a3b8;">Aucune demande récente.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page { padding: 35px; }
    .dashboard-header-modern { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 35px; }
    .header-left h1 { margin: 0; color: var(--admin-navy); font-size: 1.8rem; font-weight: 800; }
    .header-left p { margin: 5px 0 0; color: var(--admin-text-grey); font-size: 0.95rem; }
    .header-right { display: flex; align-items: center; gap: 20px; }

    /* KPI GRID */
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 25px; margin-bottom: 35px; }
    .kpi-card { display: flex; justify-content: space-between; align-items: center; padding: 25px; border: none; box-shadow: 0 10px 30px rgba(0,0,0,0.03); transition: transform 0.3s; }
    .kpi-card:hover { transform: translateY(-5px); }
    .kpi-card .label { font-size: 0.85rem; font-weight: 700; color: var(--admin-text-grey); text-transform: uppercase; letter-spacing: 0.5px; }
    .kpi-card .value { margin: 8px 0; font-size: 1.8rem; font-weight: 800; color: var(--admin-navy); }
    .trend { font-size: 0.75rem; font-weight: 700; }
    .trend.positive { color: #00ccff; }
    .trend.negative { color: #FF5C8E; }
    .trend.neutral { color: var(--admin-text-grey); }
    .card-icon { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
    .card-icon.cyan { background: rgba(0, 210, 255, 0.1); color: var(--admin-cyan); }
    .card-icon.purple { background: rgba(108, 99, 255, 0.1); color: var(--admin-purple); }
    .card-icon.orange { background: rgba(255, 152, 0, 0.1); color: #FF9800; }
    .card-icon.pink { background: rgba(255, 92, 142, 0.1); color: #FF5C8E; }

    /* DASHBOARD GRID */
    .dashboard-grid-modern { display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px; }
    .chart-large { grid-column: span 2; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
    .card-header h3 { margin: 0; font-size: 1.1rem; font-weight: 800; color: var(--admin-navy); }
    .card-menu { color: var(--admin-text-grey); cursor: pointer; }
    .view-all { background: transparent; border: none; color: var(--admin-cyan); font-weight: 700; cursor: pointer; font-size: 0.85rem; }

    .chart-box { height: 250px; display: flex; align-items: flex-end; }
    .bar-chart-sim { width: 100%; height: 100%; display: flex; align-items: flex-end; justify-content: space-between; padding-top: 20px; }
    .bar { width: 10%; background: var(--admin-gradient); border-radius: 6px 6px 0 0; }

    .activity-feed { display: flex; flex-direction: column; gap: 20px; }
    .feed-item { display: flex; gap: 15px; align-items: flex-start; }
    .feed-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
    .feed-dot.active { background: #00ccff; box-shadow: 0 0 10px #00ccff; }
    .feed-dot.pending { background: #FF9800; }
    .feed-dot.blocked { background: #FF5C8E; }
    .feed-info { display: flex; flex-direction: column; }
    .feed-text { font-size: 0.9rem; font-weight: 600; color: var(--admin-navy); }
    .feed-time { font-size: 0.75rem; color: var(--admin-text-grey); }

    .activity-card { grid-column: span 3; }

    @media (max-width: 1200px) {
        .dashboard-grid-modern { grid-template-columns: 1fr; }
        .chart-large, .activity-card { grid-column: span 1; }
    }
  `]

})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);
  stats: any = {
    repartitionCategories: []
  };

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    console.log('Fetching dashboard stats...');
    this.adminService.getDashboardStats().subscribe({
      next: (data) => {
        console.log('Dashboard stats received:', data);

        setTimeout(() => {
          this.stats = {
            ...data,
            totalUsers: data.utilisateursTotal || data.totalUtilisateurs || 0,
            totalAds: data.produitsTotal || data.totalProduits || 0,
            pendingAds: data.produitsEnAttente || data.totalEnAttente || 0,
            totalCategories: data.categoriesTotal || data.totalCategories || (data.repartitionCategories ? data.repartitionCategories.length : 0),
            recentAds: data.recentAds || [],
            lastFiveAds: data.lastFiveAds || data.recentAds?.slice(0, 5) || []
          };

          if (data.db_empty) {
            console.warn('Backend reporting empty database or only one user (yourself).');
          }

          // Fallback if recentAds is not in the stats response
          if (!this.stats.recentAds || this.stats.recentAds.length === 0) {
            this.adminService.getAllProducts().subscribe(prods => {
              if (prods && prods.length > 0) {
                this.stats.recentAds = prods.slice(0, 5);
                this.stats.lastFiveAds = prods.slice(0, 5);
              }
              this.cdr.detectChanges();
            });
          }
          this.cdr.detectChanges();
        }, 0);
      },
      error: (err) => {
        console.error('Error fetching dashboard stats. Check if backend is running on port 8081 and if you have the ADMIN role.', err);
      }
    });
  }
}
