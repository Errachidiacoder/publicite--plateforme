import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-vendeur-etude',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>📈 Étude de Marché</h1>
          <p class="page-desc">Identifiez les opportunités et les produits tendance</p>
        </div>
      </div>

      <!-- Winning Products -->
      <div class="etude-section">
        <h2 class="section-title">🏆 Winning Products</h2>
        <p class="section-desc">Produits avec le meilleur score de performance</p>

        @if (loadingWinning) {
          <div class="loading-state"><div class="spinner"></div></div>
        } @else if (winningProducts.length === 0) {
          <div class="empty-mini">Pas encore de données disponibles</div>
        } @else {
          <div class="winning-grid">
            @for (p of winningProducts; track p.id) {
              <div class="winning-card">
                <div class="winning-rank">#{{ $index + 1 }}</div>
                <h3>{{ p.titre }}</h3>
                <div class="winning-stats">
                  <div class="w-stat">
                    <span class="w-value">{{ p.nombreVentes }}</span>
                    <span class="w-label">Ventes</span>
                  </div>
                  <div class="w-stat">
                    <span class="w-value">{{ p.vues }}</span>
                    <span class="w-label">Vues</span>
                  </div>
                  <div class="w-stat">
                    <span class="w-value">{{ p.noteMoyenne | number:'1.1-1' }}⭐</span>
                    <span class="w-label">Note</span>
                  </div>
                </div>
                <div class="winning-score">
                  <div class="score-bar">
                    <div class="score-fill" [style.width.%]="p.scoreWinning"></div>
                  </div>
                  <span class="score-text">{{ p.scoreWinning | number:'1.0-0' }}/100</span>
                </div>
                <div class="winning-meta">
                  <span class="badge badge-primary">{{ p.categorie }}</span>
                  <span class="winning-price">{{ (p.prix || 0).toLocaleString() }} DH</span>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Category Trends -->
      <div class="etude-section">
        <h2 class="section-title">📊 Tendances par catégorie</h2>
        <p class="section-desc">Volume de produits et ventes par secteur</p>

        @if (loadingTendances) {
          <div class="loading-state"><div class="spinner"></div></div>
        } @else {
          <div class="trend-table">
            <table class="premium-table">
              <thead>
                <tr>
                  <th>Catégorie</th>
                  <th>Produits</th>
                  <th>Total ventes</th>
                  <th>Total vues</th>
                  <th>Panier moyen</th>
                </tr>
              </thead>
              <tbody>
                @for (t of tendances; track t.categorie) {
                  <tr>
                    <td><strong>{{ t.categorie }}</strong></td>
                    <td>{{ t.nombreProduits }}</td>
                    <td>{{ t.totalVentes }}</td>
                    <td>{{ t.totalVues }}</td>
                    <td>{{ (t.panierMoyen || 0).toLocaleString() }} DH</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Client Needs -->
      <div class="etude-section">
        <h2 class="section-title">🎯 Besoins des clients</h2>
        <p class="section-desc">Villes les plus actives et produits les plus recherchés</p>

        @if (loadingBesoins) {
          <div class="loading-state"><div class="spinner"></div></div>
        } @else {
          <div class="besoins-grid">
            <div class="besoins-card">
              <h3>🏙️ Top Villes</h3>
              <div class="besoins-list">
                @for (v of besoins?.topVilles || []; track v.ville) {
                  <div class="besoin-item">
                    <span class="besoin-name">{{ v.ville }}</span>
                    <span class="besoin-value">{{ v.nombreProduits }} produits</span>
                  </div>
                }
              </div>
            </div>
            <div class="besoins-card">
              <h3>🔥 Produits les plus recherchés</h3>
              <div class="besoins-list">
                @for (p of besoins?.produitsLesPlusRecherches || []; track p.titre) {
                  <div class="besoin-item">
                    <span class="besoin-name">{{ p.titre }}</span>
                    <span class="besoin-value">{{ p.vues }} vues · {{ p.ventes }} ventes</span>
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
    styles: [`
    .page { max-width: 1000px; }
    .page-header {
      margin-bottom: 32px;
    }
    .page-header h1 { font-family: 'Outfit',sans-serif; font-size: 1.5rem; font-weight: 800; color: var(--sb-text); margin-bottom: 4px; }
    .page-desc { font-size: 0.88rem; color: var(--sb-text-secondary); }

    .etude-section { margin-bottom: 40px; }
    .section-desc { font-size: 0.85rem; color: var(--sb-text-muted); margin-bottom: 20px; }

    .loading-state { text-align: center; padding: 40px; }
    .empty-mini { text-align: center; padding: 30px; color: var(--sb-text-muted); font-size: 0.9rem; background: var(--sb-bg-elevated); border-radius: var(--sb-radius-lg); border: 1px solid var(--sb-border); }

    /* Winning products */
    .winning-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .winning-card {
      background: var(--sb-bg-elevated);
      border: 1px solid var(--sb-border);
      border-radius: var(--sb-radius-lg);
      padding: 20px;
      transition: var(--sb-transition);
      position: relative;
    }
    .winning-card:hover { box-shadow: var(--sb-shadow-md); transform: translateY(-2px); }
    .winning-rank {
      position: absolute;
      top: 12px; right: 12px;
      background: var(--sb-primary-gradient);
      color: white;
      font-weight: 800;
      font-size: 0.75rem;
      padding: 4px 10px;
      border-radius: var(--sb-radius-full);
    }
    .winning-card h3 { font-size: 0.95rem; font-weight: 700; color: var(--sb-text); margin-bottom: 12px; padding-right: 40px; }
    .winning-stats { display: flex; gap: 16px; margin-bottom: 12px; }
    .w-stat { display: flex; flex-direction: column; }
    .w-value { font-weight: 800; font-size: 1.05rem; color: var(--sb-text); }
    .w-label { font-size: 0.7rem; color: var(--sb-text-muted); text-transform: uppercase; }
    .winning-score { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .score-bar { flex: 1; height: 6px; background: var(--sb-surface); border-radius: 3px; overflow: hidden; }
    .score-fill { height: 100%; background: var(--sb-primary-gradient); border-radius: 3px; transition: width 0.5s ease; }
    .score-text { font-size: 0.75rem; font-weight: 700; color: var(--sb-text-secondary); }
    .winning-meta { display: flex; justify-content: space-between; align-items: center; }
    .winning-price { font-weight: 800; color: var(--sb-primary); font-size: 0.95rem; }

    /* Trend table */
    .trend-table { overflow-x: auto; border-radius: var(--sb-radius-lg); border: 1px solid var(--sb-border); }

    /* Client needs */
    .besoins-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .besoins-card {
      background: var(--sb-bg-elevated);
      border: 1px solid var(--sb-border);
      border-radius: var(--sb-radius-lg);
      padding: 24px;
    }
    .besoins-card h3 { font-size: 0.95rem; font-weight: 700; margin-bottom: 16px; color: var(--sb-text); }
    .besoin-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--sb-border-light); }
    .besoin-item:last-child { border-bottom: none; }
    .besoin-name { font-weight: 600; font-size: 0.85rem; color: var(--sb-text); }
    .besoin-value { font-size: 0.78rem; color: var(--sb-text-muted); }

    @media (max-width: 768px) {
      .besoins-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class VendeurEtudeComponent implements OnInit {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8081/api/v1/etude';

    winningProducts: any[] = [];
    tendances: any[] = [];
    besoins: any = null;
    loadingWinning = true;
    loadingTendances = true;
    loadingBesoins = true;

    ngOnInit() {
        this.http.get<any[]>(`${this.apiUrl}/winning-products`).subscribe({
            next: (data: any[]) => { this.winningProducts = data; this.loadingWinning = false; },
            error: () => this.loadingWinning = false
        });

        this.http.get<any[]>(`${this.apiUrl}/tendances`).subscribe({
            next: (data: any[]) => { this.tendances = data; this.loadingTendances = false; },
            error: () => this.loadingTendances = false
        });

        this.http.get<any>(`${this.apiUrl}/besoins-clients`).subscribe({
            next: (data: any) => { this.besoins = data; this.loadingBesoins = false; },
            error: () => this.loadingBesoins = false
        });
    }
}
