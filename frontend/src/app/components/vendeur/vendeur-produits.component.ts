import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AnonceService } from '../../services/anonce.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-vendeur-produits',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>📦 Mes Produits</h1>
          <p class="page-desc">Gérez votre catalogue de produits</p>
        </div>
        <a routerLink="/submit-product" class="btn btn-primary">+ Nouveau produit</a>
      </div>

      @if (loading) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Chargement...</p>
        </div>
      } @else if (produits.length === 0) {
        <div class="empty-state">
          <span class="empty-icon">📦</span>
          <h3>Aucun produit</h3>
          <p>Commencez par ajouter votre premier produit à votre boutique.</p>
          <a routerLink="/submit-product" class="btn btn-primary btn-lg">Ajouter un produit</a>
        </div>
      } @else {
        <div class="products-list">
          @for (p of produits; track p.id) {
            <div class="product-row">
              <div class="prod-img">
                <img [src]="p.mediaAssets?.[0]?.urlMedia || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&fit=crop'" [alt]="p.titreAnonce">
              </div>
              <div class="prod-info">
                <h3>{{ p.titreAnonce }}</h3>
                <span class="prod-category">{{ p.categorie?.nomCategorie || 'Non classé' }}</span>
              </div>
              <div class="prod-price">{{ (p.prixAfiche || 0).toLocaleString() }} DH</div>
              <div class="prod-stock">
                <span class="stock-badge" [class.low]="(p.produit?.quantiteStock || 0) < 5">
                  {{ p.produit?.quantiteStock || 0 }} en stock
                </span>
              </div>
              <div class="prod-sales">
                <span>{{ p.compteurVues || 0 }} vues</span>
              </div>
              <div class="prod-status">
                <span class="status-dot" [class.active]="p.statutValidation === 'VALIDE' || p.statutValidation === 'ACTIVEE'"
                      [class.pending]="p.statutValidation === 'EN_ATTENTE'"></span>
                {{ p.statutValidation || 'EN_ATTENTE' }}
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
    styles: [`
    .page { max-width: 1000px; }
    .page-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px;
    }
    .page-header h1 { font-family: 'Outfit',sans-serif; font-size: 1.5rem; font-weight: 800; color: var(--sb-text); margin-bottom: 4px; }
    .page-desc { font-size: 0.88rem; color: var(--sb-text-secondary); }

    .loading-state, .empty-state { text-align: center; padding: 60px 20px; }
    .empty-icon { font-size: 3.5rem; display: block; margin-bottom: 16px; }
    .empty-state h3 { font-size: 1.2rem; color: var(--sb-text); margin-bottom: 8px; }
    .empty-state p { color: var(--sb-text-secondary); margin-bottom: 20px; }

    .product-row {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: var(--sb-bg-elevated);
      border: 1px solid var(--sb-border);
      border-radius: var(--sb-radius-lg);
      margin-bottom: 8px;
      transition: var(--sb-transition);
    }
    .product-row:hover { box-shadow: var(--sb-shadow-sm); }
    .prod-img { width: 56px; height: 56px; border-radius: var(--sb-radius-md); overflow: hidden; flex-shrink: 0; }
    .prod-img img { width: 100%; height: 100%; object-fit: cover; }
    .prod-info { flex: 1; }
    .prod-info h3 { font-size: 0.9rem; font-weight: 600; color: var(--sb-text); margin-bottom: 2px; }
    .prod-category { font-size: 0.75rem; color: var(--sb-text-muted); }
    .prod-price { font-weight: 800; color: var(--sb-primary); font-size: 0.95rem; min-width: 90px; }
    .prod-stock { min-width: 90px; }
    .stock-badge {
      font-size: 0.75rem; font-weight: 700;
      padding: 4px 10px; border-radius: var(--sb-radius-full);
      background: rgba(16,185,129,0.1); color: var(--sb-success);
    }
    .stock-badge.low { background: rgba(239,68,68,0.1); color: var(--sb-danger); }
    .prod-sales { font-size: 0.82rem; color: var(--sb-text-secondary); min-width: 70px; }
    .prod-status {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
      color: var(--sb-text-muted); min-width: 100px;
    }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--sb-text-muted); }
    .status-dot.active { background: var(--sb-success); }
    .status-dot.pending { background: var(--sb-warning); }

    @media (max-width: 768px) {
      .product-row { flex-wrap: wrap; }
      .prod-stock, .prod-sales, .prod-status { width: auto; }
      .page-header { flex-direction: column; gap: 12px; }
    }
  `]
})
export class VendeurProduitsComponent implements OnInit {
    private anonceService = inject(AnonceService);
    private authService = inject(AuthService);
    produits: any[] = [];
    loading = true;

    ngOnInit() {
        const userId = this.authService.getUserId();
        if (userId) {
            this.anonceService.getByAnnonceur(userId).subscribe({
                next: (data) => { this.produits = data; this.loading = false; },
                error: () => { this.produits = []; this.loading = false; }
            });
        } else {
            this.loading = false;
        }
    }
}
