import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-vendeur-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="dashboard">
      <div class="dash-header">
        <div>
          <h1>Bienvenue, {{ auth.getNomComplet() }} 👋</h1>
          <p class="dash-subtitle">Gérez votre boutique et suivez vos performances</p>
        </div>
        <a routerLink="/vendeur/produits" class="btn btn-primary">+ Ajouter un produit</a>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon" style="background: rgba(26,175,165,0.1); color: #1AAFA5;">📦</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ stats.totalProduits }}</span>
            <span class="kpi-label">Produits</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background: rgba(16,185,129,0.1); color: #10b981;">🧾</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ stats.totalCommandes }}</span>
            <span class="kpi-label">Commandes</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background: rgba(59,130,246,0.1); color: #3b82f6;">💰</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ stats.chiffreAffaires.toLocaleString() }} DH</span>
            <span class="kpi-label">Chiffre d'affaires</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background: rgba(245,158,11,0.1); color: #f59e0b;">⭐</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ stats.noteMoyenne }}/5</span>
            <span class="kpi-label">Note moyenne</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-section">
        <h2 class="section-title">Actions rapides</h2>
        <div class="actions-grid">
          <a routerLink="/vendeur/produits" class="action-card">
            <span class="action-icon">📦</span>
            <span class="action-label">Gérer mes produits</span>
          </a>
          <a routerLink="/vendeur/commandes" class="action-card">
            <span class="action-icon">🧾</span>
            <span class="action-label">Voir les commandes</span>
          </a>
          <a routerLink="/vendeur/etude" class="action-card">
            <span class="action-icon">📈</span>
            <span class="action-label">Étude de marché</span>
          </a>
          <a routerLink="/submit-product" class="action-card">
            <span class="action-icon">➕</span>
            <span class="action-label">Soumettre un produit</span>
          </a>
        </div>
      </div>

      <!-- Tips -->
      <div class="tips-card">
        <h3>💡 Conseils pour augmenter vos ventes</h3>
        <ul>
          <li>Ajoutez des photos de qualité à vos produits</li>
          <li>Utilisez l'étude de marché pour identifier les produits tendance</li>
          <li>Répondez rapidement aux commandes pour améliorer votre note</li>
          <li>Proposez le paiement à la livraison pour plus de confiance</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1000px; }

    .dash-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }
    .dash-header h1 { font-family: 'Outfit',sans-serif; font-size: 1.6rem; font-weight: 800; color: var(--sb-text); margin-bottom: 4px; }
    .dash-subtitle { color: var(--sb-text-secondary); font-size: 0.9rem; }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 40px;
    }
    .kpi-card {
      background: var(--sb-bg-elevated);
      border: 1px solid var(--sb-border);
      border-radius: var(--sb-radius-lg);
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: var(--sb-transition);
    }
    .kpi-card:hover { box-shadow: var(--sb-shadow-md); transform: translateY(-2px); }
    .kpi-icon {
      width: 48px; height: 48px;
      border-radius: var(--sb-radius-md);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.3rem;
      flex-shrink: 0;
    }
    .kpi-info { display: flex; flex-direction: column; }
    .kpi-value { font-size: 1.5rem; font-weight: 800; color: var(--sb-text); }
    .kpi-label { font-size: 0.78rem; color: var(--sb-text-muted); font-weight: 500; }

    .quick-section { margin-bottom: 32px; }
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-top: 16px;
    }
    .action-card {
      background: var(--sb-bg-elevated);
      border: 1px solid var(--sb-border);
      border-radius: var(--sb-radius-lg);
      padding: 20px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      transition: var(--sb-transition);
      cursor: pointer;
    }
    .action-card:hover { border-color: var(--sb-primary); transform: translateY(-2px); box-shadow: var(--sb-shadow-sm); }
    .action-icon { font-size: 1.8rem; }
    .action-label { font-size: 0.82rem; font-weight: 600; color: var(--sb-text); }

    .tips-card {
      background: var(--sb-primary-light);
      border: 1px solid var(--sb-border);
      border-radius: var(--sb-radius-lg);
      padding: 24px;
    }
    .tips-card h3 { font-size: 1rem; font-weight: 700; color: var(--sb-text); margin-bottom: 12px; }
    .tips-card ul { list-style: none; padding: 0; }
    .tips-card li { padding: 6px 0; font-size: 0.88rem; color: var(--sb-text-secondary); }
    .tips-card li::before { content: '→ '; color: var(--sb-primary); font-weight: 700; }

    @media (max-width: 768px) {
      .kpi-grid, .actions-grid { grid-template-columns: repeat(2, 1fr); }
      .dash-header { flex-direction: column; gap: 16px; text-align: center; }
    }
  `]
})
export class VendeurDashboardComponent implements OnInit {
  auth = inject(AuthService);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  stats = {
    totalProduits: 0,
    totalCommandes: 0,
    chiffreAffaires: 0,
    noteMoyenne: 0
  };

  ngOnInit() {
    // Fetch boutique info, then use boutiqueId to get merchant-specific stats
    this.http.get<any>('http://localhost:8081/api/v1/boutiques/ma-boutique').subscribe({
      next: (boutique) => {
        if (boutique) {
          this.stats.noteMoyenne = boutique.noteMoyenne || 0;
          this.cdr.detectChanges();

          if (boutique.id) {
            // Get all stats (commandes, chiffre d'affaires, produits count)
            this.http.get<any>(`http://localhost:8081/api/v1/commandes/boutique/${boutique.id}/stats`).subscribe({
              next: (s: any) => {
                this.stats.totalCommandes = s.totalCommandes || 0;
                this.stats.chiffreAffaires = s.chiffreAffaires || 0;
                this.stats.totalProduits = s.totalProduits || 0;
                this.cdr.detectChanges();
              },
              error: () => { }
            });
          }
        }
      },
      error: () => { }
    });
  }
}
