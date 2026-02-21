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
      <div class="admin-compact-wrapper">
        <header class="content-header">
          <h1>Dashboard</h1>
        </header>

      <!-- Top Row: Minimal Stat Cards -->
      <div class="stats-grid-top">
        <div class="stat-card-mini">
           <div class="mini-icon user">👤</div>
           <div class="mini-value">{{ stats.utilisateursTotal || 0 }}</div>
           <div class="mini-label">Utilisateurs</div>
        </div>
        <div class="stat-card-mini">
           <div class="mini-icon time">⏱️</div>
           <div class="mini-value">{{ stats.produitsTotal || 0 }}</div>
           <div class="mini-label">Total Annonces</div>
        </div>
        <div class="stat-card-mini">
           <div class="mini-icon collection">📜</div>
           <div class="mini-value">{{ stats.produitsEnAttente || 0 }}</div>
           <div class="mini-label">En Attente</div>
        </div>
        <div class="stat-card-mini">
           <div class="mini-icon comment">💬</div>
           <div class="mini-value">{{ stats.produitsValides || 0 }}</div>
           <div class="mini-label">Validées</div>
        </div>
      </div>

      <!-- Middle Row: Colorful Stats Cards (Social/Category style) -->
      <div class="stats-grid-middle">
        <div class="color-stat-card facebook">
           <div class="card-lead">
              <span class="lead-icon">🛠️</span>
           </div>
           <div class="card-details">
              <div class="detail-item">
                 <span class="d-val">{{ stats.utilisateursAnnonceurs || 0 }}</span>
                 <span class="d-lab">Annonceurs</span>
              </div>
              <div class="detail-item">
                 <span class="d-val">{{ stats.utilisateursAdmins || 0 }}</span>
                 <span class="d-lab">Admins</span>
              </div>
           </div>
        </div>
        <div class="color-stat-card twitter">
           <div class="card-lead">
              <span class="lead-icon">🌐</span>
           </div>
           <div class="card-details">
              <div class="detail-item">
                 <span class="d-val">{{ stats.categoriesCount || 0 }}</span>
                 <span class="d-lab">Catégories</span>
              </div>
              <div class="detail-item">
                 <span class="d-val">Hot</span>
                 <span class="d-lab">Tendance</span>
              </div>
           </div>
        </div>
        <div class="color-stat-card linkedin">
           <div class="card-lead">
              <span class="lead-icon">⚡</span>
           </div>
           <div class="card-details">
              <div class="detail-item">
                 <span class="d-val">{{ stats.produitsActifs || 0 }}</span>
                 <span class="d-lab">Actives</span>
              </div>
              <div class="detail-item">
                 <span class="d-val">{{ stats.totalVues || 0 }}</span>
                 <span class="d-lab">Vues Total</span>
              </div>
           </div>
        </div>
        <div class="color-stat-card google">
           <div class="card-lead">
              <span class="lead-icon">🛡️</span>
           </div>
           <div class="card-details">
              <div class="detail-item">
                 <span class="d-val">{{ stats.produitsRefuses || 0 }}</span>
                 <span class="d-lab">Refusées</span>
              </div>
              <div class="detail-item">
                 <span class="d-val">{{ stats.totalLogs || 0 }}</span>
                 <span class="d-lab">Logs</span>
              </div>
           </div>
        </div>
      </div>

      <!-- Bottom Section: Chart Representation -->
      <div class="dashboard-footer-row">
        <div class="card chart-card">
           <div class="card-header-premium">
              <h3>Répartition par Catégorie</h3>
           </div>
           <div class="chart-mockup">
              <div *ngFor="let cat of stats.repartitionCategories" class="chart-bar-container">
                 <div class="chart-bar" [style.height.%]="(cat.count / stats.produitsTotal * 100) || 5">
                    <span class="bar-tooltip">{{ cat.count }}</span>
                 </div>
                 <span class="bar-label">{{ cat.nom }}</span>
              </div>
           </div>
        </div>

        <div class="card actions-card">
           <div class="card-header-premium">
              <h3>Raccourcis</h3>
           </div>
           <div class="quick-links">
              <a routerLink="/admin/products" class="ql-item">🔔 Valider les annonces</a>
              <a routerLink="/admin/users" class="ql-item">👤 Gérer les rôles</a>
              <a routerLink="/admin/categories" class="ql-item">📁 Créer catégorie</a>
              <a routerLink="/admin/logs" class="ql-item">📜 Voir historique</a>
           </div>
        </div>
      </div>
    </div>
  `,
   styles: [`
    :host {
      --primary: #4db6ac;
      --primary-dark: #00897b;
      --noir: #111827;
      --accent: #e0f2f1;
      --bg: #f8fafc;
      --white: #ffffff;
      --text: #1e293b;
      --text-light: #64748b;
      --border: #e2e8f0;
      --shadow: 0 10px 25px rgba(0, 137, 123, 0.08);
    }

    .admin-page-container { padding: 30px 20px; background: var(--bg); min-height: 100vh; }
    .admin-compact-wrapper { max-width: 1100px; margin: 0 auto; }

    .content-header { margin-bottom: 30px; }
    .content-header h1 { font-size: 1.8rem; font-weight: 900; color: var(--noir); margin: 0; letter-spacing: -0.5px; }
    .content-header h1::after { content: '.'; color: var(--primary); }

    /* Top Stats Grid */
    .stats-grid-top {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 20px;
      margin-bottom: 25px;
    }

    .stat-card-mini {
      background: white;
      border-radius: 18px;
      padding: 20px 15px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      box-shadow: var(--shadow);
      border: 1px solid rgba(255,255,255,0.8);
      transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .stat-card-mini:hover { transform: translateY(-5px); box-shadow: 0 8px 25px rgba(0,0,0,0.08); }

    .mini-icon { font-size: 1.5rem; margin-bottom: 10px; }
    .mini-icon.user { color: #f59e0b; }
    .mini-icon.time { color: #3b82f6; }
    .mini-icon.collection { color: #10b981; }
    .mini-icon.comment { color: #ec4899; }

    .mini-value { font-size: 1.5rem; font-weight: 700; color: #333; margin-bottom: 2px; }
    .mini-label { font-size: 0.75rem; color: #999; font-weight: 600; }

    /* Colorful Middle Grid */
    .stats-grid-middle {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .color-stat-card {
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: var(--shadow);
      border: 1px solid rgba(255,255,255,0.8);
      transition: 0.3s;
    }
    .color-stat-card:hover { transform: translateY(-5px); }

    .card-lead {
      padding: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .lead-icon { font-size: 1.8rem; color: white; opacity: 0.9; }

    .facebook .card-lead { background: #3b5998; }
    .twitter .card-lead { background: #00aced; }
    .linkedin .card-lead { background: #007bb6; }
    .google .card-lead { background: #dd4b39; }

    .card-details {
      display: flex;
      padding: 15px 0;
    }
    .detail-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      border-right: 1px solid #eee;
    }
    .detail-item:last-child { border-right: none; }
    .d-val { font-size: 1.1rem; font-weight: 600; color: #555; }
    .d-lab { font-size: 0.75rem; color: #aaa; font-weight: 500; }

    /* Bottom Section */
    .dashboard-footer-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 25px;
    }

    .card { background: white; border-radius: 24px; border: 1px solid var(--border); box-shadow: var(--shadow); overflow: hidden; }
    .card-header-premium { padding: 25px 30px; border-bottom: 1px solid var(--border); background: #fcfdfe; }
    .card-header-premium h3 { margin: 0; font-size: 1rem; color: var(--noir); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }

    .chart-mockup {
      padding: 40px 30px;
      height: 300px;
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      gap: 20px;
    }
    .chart-bar-container { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 10px; }
    .chart-bar {
      width: 40px;
      background: var(--primary);
      border-radius: 4px 4px 0 0;
      position: relative;
      transition: 0.5s ease;
      background: linear-gradient(to top, var(--primary-dark), var(--primary));
    }
    .chart-bar:hover { filter: brightness(1.2); }
    .bar-tooltip {
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.7rem;
      opacity: 0;
      transition: 0.3s;
    }
    .chart-bar:hover .bar-tooltip { opacity: 1; }
    .bar-label { font-size: 0.75rem; color: #777; font-weight: 500; max-width: 60px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .quick-links { padding: 30px; display: flex; flex-direction: column; gap: 15px; }
    .ql-item {
      padding: 18px 20px;
      background: #f8fafc;
      border-radius: 16px;
      text-decoration: none;
      color: var(--text);
      font-weight: 700;
      font-size: 0.9rem;
      transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid transparent;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .ql-item:hover { 
      background: var(--accent); 
      color: var(--primary-dark); 
      border-color: var(--primary); 
      transform: translateX(10px); 
      box-shadow: 0 5px 15px rgba(0, 105, 92, 0.05);
    }

    @media (max-width: 992px) {
        .dashboard-footer-row { grid-template-columns: 1fr; }
    }
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
      this.adminService.getDashboardStats().subscribe(data => {
         this.stats = data;
      });
   }
}
