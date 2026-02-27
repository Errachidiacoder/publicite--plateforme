import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-page-container">
      <!-- Secondary Header -->
      <div class="sub-header-dashboard">
        <div class="search-bar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" placeholder="Rechercher des annonces, utilisateurs...">
        </div>
        <div class="action-buttons">
          <button class="icon-btn-modern"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg></button>
          <button class="icon-btn-modern"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></button>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button class="tab-btn active">Aperçu</button>
        <button class="tab-btn">Marketing</button>
        <button class="tab-btn">Ventes</button>
        <button class="tab-btn">Requêtes</button>
      </div>

      <!-- Main Widget Grid -->
      <div class="dashboard-grid">
        <!-- Widget 1: Top Advertisers -->
        <div class="card widget-card">
          <div class="widget-header">
            <h3>Top Annonceurs vs Objectif</h3>
            <button class="more-btn">...</button>
          </div>
          <div class="rep-list">
            <div *ngFor="let a of stats.topAdvertisers?.slice(0, 3)" class="rep-item">
              <div class="rep-avatar">{{ a.nomComplet?.charAt(0) }}</div>
              <div class="rep-info">
                <span class="rep-name">{{ a.nomComplet }}</span>
                <span class="rep-meta">{{ a.annonceCount }} annonces</span>
              </div>
              <div class="rep-val">{{ ((a.annonceCount / (stats.produitsTotal || 1)) * 100).toFixed(0) }}%</div>
            </div>
            <div *ngIf="!stats.topAdvertisers?.length" class="empty-state">Aucun annonceur</div>
          </div>
        </div>

        <!-- Widget 2: Bar Chart (Forecast by Owner -> Category Distribution) -->
        <div class="card widget-card">
          <div class="widget-header">
            <h3>Prévisions par Catégorie</h3>
            <button class="more-btn">...</button>
          </div>
          <div class="chart-container-bars">
             <div *ngFor="let cat of stats.repartitionCategories?.slice(0, 4)" class="chart-bar-group">
                <div class="bar-track">
                  <div class="bar-fill" [style.height.%]="(cat.count / (stats.produitsTotal || 1)) * 100 || 10"></div>
                </div>
                <div class="bar-label">
                  <span>{{ cat.nom?.charAt(0) }}</span>
                </div>
             </div>
          </div>
        </div>

        <!-- Widget 3: Gauge (Validation Performance) -->
        <div class="card widget-card">
          <div class="widget-header">
            <h3>Performance Validation</h3>
            <button class="more-btn">...</button>
          </div>
          <div class="gauge-wrapper">
            <svg class="gauge" viewBox="0 0 100 50">
              <path class="gauge-bg" d="M10,45 A40,40 0 0,1 90,45" fill="none" stroke-width="8"></path>
              <path class="gauge-fill" 
                    [attr.d]="'M10,45 A40,40 0 0,1 ' + (10 + 80 * (1 - (stats.produitsEnAttente / (stats.produitsTotal || 1)))) + ',45'" 
                    fill="none" stroke-width="8"></path>
              <line class="gauge-needle" x1="50" y1="45" x2="50" y2="15" [style.transform]="'rotate(' + (180 * (1 - (stats.produitsEnAttente / (stats.produitsTotal || 1))) - 90) + 'deg)'"></line>
            </svg>
            <div class="gauge-value-small">{{ ((1 - (stats.produitsEnAttente / (stats.produitsTotal || 1))) * 100).toFixed(0) }}%</div>
          </div>
        </div>

        <!-- Widget 4: Dark Stat Card (Sold this month -> Views) -->
        <div class="card summary-card-dark">
          <div class="widget-header inverse">
             <h3 style="font-size: 0.75rem; opacity: 0.7;">Vues cumulées ce mois</h3>
          </div>
          <div class="main-stat-centered">
            <div class="stat-val-big">{{ (stats.totalVues || 0) | number:'1.0-0' }}</div>
            <span class="stat-meta-small">Objectif (2M): {{ ((stats.totalVues / 2000000) * 100).toFixed(1) }}%</span>
          </div>
        </div>

        <!-- Widget 5: Open Requests (Recent Ads) -->
        <div class="card widget-card">
          <div class="widget-header">
            <h3>Requêtes ouvertes</h3>
            <button class="more-btn">...</button>
          </div>
          <div class="requests-list">
            <div *ngFor="let p of stats.topProducts?.slice(0, 4)" class="request-item">
              <div class="req-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#00897b" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></div>
              <div class="req-info">
                <span class="req-title">{{ p.titreProduit }}</span>
                <span class="req-date">19.10.2023 • {{ p.villeLocalisation }}</span>
              </div>
              <div class="req-val-eur">{{ (p.compteurVues / 100).toFixed(0) }}K <small>EUR</small></div>
            </div>
          </div>
        </div>

        <!-- Widget 6: Donut 1 (Reason -> Security Score) -->
        <div class="card widget-card">
          <div class="widget-header">
            <h3>Répartition par État</h3>
            <button class="more-btn">...</button>
          </div>
          <div class="donut-container">
            <svg viewBox="0 0 36 36" class="donut-chart">
              <circle class="ring" cx="18" cy="18" r="15.915" fill="transparent" stroke="#f1f5f9" stroke-width="3"></circle>
              <circle class="segment" cx="18" cy="18" r="15.915" fill="transparent" stroke="#00897b" stroke-width="3" stroke-dasharray="70 30" stroke-dashoffset="25"></circle>
              <circle class="segment second" cx="18" cy="18" r="15.915" fill="transparent" stroke="#4db6ac" stroke-width="3" stroke-dasharray="20 80" stroke-dashoffset="55"></circle>
              <circle class="segment third" cx="18" cy="18" r="15.915" fill="transparent" stroke="#ffa4a2" stroke-width="3" stroke-dasharray="10 90" stroke-dashoffset="75"></circle>
            </svg>
          </div>
        </div>

        <!-- Widget 7: Donut 2 (Source -> Active Users) -->
        <div class="card widget-card">
          <div class="widget-header">
            <h3>Sources d'Activité</h3>
            <button class="more-btn">...</button>
          </div>
          <div class="donut-container">
            <svg viewBox="0 0 36 36" class="donut-chart">
              <circle class="ring" cx="18" cy="18" r="15.915" fill="transparent" stroke="#f1f5f9" stroke-width="3"></circle>
              <circle class="segment" cx="18" cy="18" r="15.915" fill="transparent" stroke="#26a69a" stroke-width="3" stroke-dasharray="60 40" stroke-dashoffset="25"></circle>
              <circle class="segment second" cx="18" cy="18" r="15.915" fill="transparent" stroke="#80cbc4" stroke-width="3" stroke-dasharray="40 60" stroke-dashoffset="65"></circle>
            </svg>
          </div>
        </div>

        <!-- Widget 8: Bar Chart (Forecast this quarter -> Monthly trends) -->
        <div class="card widget-card">
          <div class="widget-header">
             <h3>Tendances Mensuelles</h3>
          </div>
          <div class="chart-container-bars-v">
             <div class="v-bar-group">
                <div class="v-bar-track"><div class="v-bar-fill" style="height: 60%;"></div></div>
                <span class="v-label">Jan</span>
             </div>
             <div class="v-bar-group">
                <div class="v-bar-track"><div class="v-bar-fill highlight" style="height: 85%;"></div></div>
                <span class="v-label">Fév</span>
             </div>
             <div class="v-bar-group">
                <div class="v-bar-track"><div class="v-bar-fill" style="height: 45%;"></div></div>
                <span class="v-label">Mar</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-page-container { padding: 30px; background: #fdfdfd; min-height: 100vh; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    
    /* Secondary Header */
    .sub-header-dashboard { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
    .search-bar { display: flex; align-items: center; background: white; padding: 8px 15px; border-radius: 12px; border: 1px solid #eee; width: 350px; gap: 10px; }
    .search-bar svg { width: 18px; color: #94a3b8; }
    .search-bar input { border: none; outline: none; width: 100%; font-size: 0.9rem; color: #1e293b; }
    .icon-btn-modern { background: white; border: 1px solid #eee; width: 40px; height: 40px; border-radius: 10px; cursor: pointer; color: #64748b; margin-left: 10px; transition: 0.2s; }
    .icon-btn-modern:hover { background: #f8fafc; color: var(--primary); }

    /* Tabs */
    .filter-tabs { display: flex; gap: 20px; margin-bottom: 30px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; }
    .tab-btn { background: transparent; border: none; padding: 5px 10px; font-size: 0.9rem; font-weight: 600; color: #94a3b8; cursor: pointer; position: relative; }
    .tab-btn.active { color: #00897b; }
    .tab-btn.active::after { content: ''; position: absolute; bottom: -11px; left: 0; width: 100%; height: 3px; background: #00897b; border-radius: 10px; }

    /* Grid Layout */
    .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }

    /* Card Styling */
    .card { background: white; border-radius: 20px; border: 1px solid #f1f5f9; box-shadow: 0 2px 10px rgba(0,0,0,0.01); padding: 20px; }
    .widget-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .widget-header h3 { margin: 0; font-size: 0.85rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .more-btn { background: transparent; border: none; font-size: 1.2rem; color: #cbd5e1; cursor: pointer; line-height: 1; }

    /* Rep List */
    .rep-item { display: flex; align-items: center; gap: 12px; margin-bottom: 15px; }
    .rep-avatar { width: 34px; height: 34px; background: #f1f5f9; color: #00897b; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; }
    .rep-info { flex: 1; display: flex; flex-direction: column; }
    .rep-name { font-weight: 600; font-size: 0.8rem; color: #1e293b; }
    .rep-meta { font-size: 0.7rem; color: #94a3b8; }
    .rep-val { font-weight: 700; color: #1e293b; font-size: 0.9rem; }

    /* Bar Chart Component */
    .chart-container-bars { display: flex; align-items: flex-end; justify-content: space-around; height: 120px; gap: 10px; }
    .chart-bar-group { display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; height: 100%; justify-content: flex-end; }
    .bar-track { width: 30px; height: 100%; background: #f8fafc; border-radius: 6px; position: relative; display: flex; align-items: flex-end; overflow: hidden; }
    .bar-fill { width: 100%; background: #00897b; transition: height 1s ease-out; }
    .bar-label { font-size: 0.65rem; font-weight: 700; color: #94a3b8; }

    /* Gauge Component */
    .gauge-wrapper { position: relative; padding: 10px 0; display: flex; flex-direction: column; align-items: center; }
    .gauge { width: 100%; max-width: 160px; }
    .gauge-bg { stroke: #f1f5f9; }
    .gauge-fill { stroke: #00897b; stroke-linecap: round; transition: all 1s ease; }
    .gauge-needle { stroke: #1e293b; stroke-width: 2; transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1); transform-origin: 50% 45px; }
    .gauge-value-small { font-size: 1.5rem; font-weight: 900; color: #1e293b; margin-top: -5px; }

    /* Dark Summary Card */
    .summary-card-dark { background: #004d40; color: white; display: flex; flex-direction: column; }
    .main-stat-centered { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px 0; }
    .stat-val-big { font-size: 2.2rem; font-weight: 900; margin-bottom: 5px; }
    .stat-meta-small { font-size: 0.7rem; opacity: 0.6; font-weight: 600; }

    /* Open Requests Items */
    .request-item { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .req-icon { width: 30px; height: 30px; background: rgba(0, 137, 123, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; padding: 6px; color: #00897b; }
    .req-info { flex: 1; display: flex; flex-direction: column; }
    .req-title { font-weight: 700; font-size: 0.8rem; color: #1e293b; }
    .req-date { font-size: 0.65rem; color: #94a3b8; font-weight: 600; }
    .req-val-eur { font-weight: 800; color: var(--primary); font-size: 0.95rem; text-align: right; }
    .req-val-eur small { font-size: 0.6rem; color: #94a3b8; text-transform: uppercase; }

    /* Donut Charts */
    .donut-container { display: flex; justify-content: center; align-items: center; padding: 10px 0; }
    .donut-chart { width: 120px; height: 120px; }
    .donut-chart .segment { stroke-linecap: round; transition: stroke-dashoffset 1s ease; }
    .segment.second { stroke: #4db6ac; }
    .segment.third { stroke: #ffa4a2; }

    /* Vertical Trends */
    .chart-container-bars-v { display: flex; align-items: flex-end; justify-content: space-around; height: 120px; gap: 10px; }
    .v-bar-group { display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; height: 100%; }
    .v-bar-track { width: 40px; height: 100%; background: #f8fafc; border-radius: 8px; position: relative; display: flex; align-items: flex-end; overflow: hidden; }
    .v-bar-fill { width: 100%; background: #00897b; opacity: 0.2; transition: height 1s ease-out; }
    .v-bar-fill.highlight { opacity: 1; }
    .v-label { font-size: 0.7rem; font-weight: 700; color: #94a3b8; }

    @media (max-width: 1200px) { .dashboard-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 768px) { .dashboard-grid { grid-template-columns: 1fr; .search-bar { width: 100%; } } }

  `]

})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
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

        // Map old keys to new keys if necessary for compatibility
        if (data.totalProduits && !data.produitsTotal) data.produitsTotal = data.totalProduits;
        if (data.totalUtilisateurs && !data.utilisateursTotal) data.utilisateursTotal = data.totalUtilisateurs;
        if (data.totalEnAttente && !data.produitsEnAttente) data.produitsEnAttente = data.totalEnAttente;

        this.stats = data;

        if (data.db_empty) {
          console.warn('Backend reporting empty database or only one user (yourself).');
        }
      },
      error: (err) => {
        console.error('Error fetching dashboard stats. Check if backend is running on port 8081 and if you have the ADMIN role.', err);
      }
    });
  }
}
