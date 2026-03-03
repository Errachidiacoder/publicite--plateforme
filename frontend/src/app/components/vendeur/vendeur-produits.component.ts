import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AnonceService } from '../../services/anonce.service';
import { AuthService } from '../../services/auth.service';
import { MarketProductService } from '../../services/market-product.service';
import { ProduitMerchantDto, PageResponse } from '../../models/produit.model';

@Component({
  selector: 'app-vendeur-produits',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>📦 Mes Produits</h1>
          <p class="page-desc">Gérez votre catalogue de produits marketplace + annonces</p>
        </div>
        <div class="header-actions">
          <a routerLink="/vendeur/produits/nouveau" class="btn btn-primary">+ Nouveau produit</a>
          <a routerLink="/submit-product" class="btn btn-outline">+ Nouvelle annonce</a>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tab-bar">
        <button class="tab" [class.active]="activeTab === 'market'" (click)="activeTab = 'market'">
          🛒 Produits Marketplace
          @if (marketProducts.length > 0) {
            <span class="tab-count">{{ marketProducts.length }}</span>
          }
        </button>
        <button class="tab" [class.active]="activeTab === 'annonces'" (click)="activeTab = 'annonces'">
          📢 Annonces
          @if (produits.length > 0) {
            <span class="tab-count">{{ produits.length }}</span>
          }
        </button>
      </div>

      <!-- Market Products Tab -->
      @if (activeTab === 'market') {
        <!-- Status filter -->
        <div class="status-filters">
          <button class="sf-btn" [class.active]="statusFilter === 'ALL'" (click)="statusFilter = 'ALL'">Tous</button>
          <button class="sf-btn" [class.active]="statusFilter === 'ACTIVE'" (click)="statusFilter = 'ACTIVE'">Actifs</button>
          <button class="sf-btn" [class.active]="statusFilter === 'DRAFT'" (click)="statusFilter = 'DRAFT'">Brouillons</button>
          <button class="sf-btn" [class.active]="statusFilter === 'OUT_OF_STOCK'" (click)="statusFilter = 'OUT_OF_STOCK'">Rupture</button>
          <button class="sf-btn" [class.active]="statusFilter === 'ARCHIVED'" (click)="statusFilter = 'ARCHIVED'">Archivés</button>
        </div>

        @if (loadingMarket) {
          <div class="loading-state"><div class="spinner"></div><p>Chargement...</p></div>
        } @else if (filteredMarketProducts.length === 0) {
          <div class="empty-state">
            <span class="empty-icon">🛒</span>
            <h3>Aucun produit marketplace</h3>
            <p>Créez votre premier produit pour le marketplace SouqBladi.</p>
            <a routerLink="/vendeur/produits/nouveau" class="btn btn-primary btn-lg">Créer un produit</a>
          </div>
        } @else {
          <div class="products-list">
            @for (p of filteredMarketProducts; track p.id) {
              <div class="product-row">
                <div class="prod-img">
                  @if (p.primaryImageUrl) {
                    <img [src]="p.primaryImageUrl" [alt]="p.nom">
                  } @else {
                    <div class="prod-img-placeholder">📷</div>
                  }
                </div>
                <div class="prod-info">
                  <h3>{{ p.nom }}</h3>
                  <span class="prod-category">{{ p.categorieNom || 'Non classé' }}</span>
                  @if (p.sku) {
                    <span class="prod-sku">SKU: {{ p.sku }}</span>
                  }
                </div>
                <div class="prod-price">{{ p.prix | number:'1.2-2' }} MAD</div>
                <div class="prod-stock">
                  <span class="stock-badge" [class.low]="p.quantiteStock < 5" [class.out]="p.quantiteStock === 0">
                    {{ p.quantiteStock }} en stock
                  </span>
                </div>
                <div class="prod-views">{{ p.compteurVues || 0 }} vues</div>
                <div class="prod-status">
                  <span class="status-pill"
                    [class.status-active]="p.statutProduit === 'ACTIVE'"
                    [class.status-draft]="p.statutProduit === 'DRAFT'"
                    [class.status-out]="p.statutProduit === 'OUT_OF_STOCK'"
                    [class.status-archived]="p.statutProduit === 'ARCHIVED'">
                    {{ statusLabel(p.statutProduit) }}
                  </span>
                </div>
                <div class="prod-actions">
                  <a [routerLink]="['/vendeur/produits', p.id, 'modifier']" class="action-btn" title="Modifier">✏️</a>
                  @if (p.statutProduit === 'DRAFT') {
                    <button class="action-btn" title="Publier" (click)="changeStatus(p, 'ACTIVE')">🚀</button>
                  }
                  @if (p.statutProduit === 'ACTIVE') {
                    <button class="action-btn" title="Archiver" (click)="changeStatus(p, 'ARCHIVED')">📥</button>
                  }
                  @if (p.statutProduit === 'ARCHIVED' || p.statutProduit === 'OUT_OF_STOCK') {
                    <button class="action-btn" title="Réactiver" (click)="changeStatus(p, 'ACTIVE')">♻️</button>
                  }
                </div>
              </div>
            }
          </div>
        }
      }

      <!-- Annonces Tab (original behavior) -->
      @if (activeTab === 'annonces') {
        @if (loading) {
          <div class="loading-state"><div class="spinner"></div><p>Chargement...</p></div>
        } @else if (produits.length === 0) {
          <div class="empty-state">
            <span class="empty-icon">📢</span>
            <h3>Aucune annonce</h3>
            <p>Publiez votre première annonce.</p>
            <a routerLink="/submit-product" class="btn btn-primary btn-lg">Publier une annonce</a>
          </div>
        } @else {
          <div class="products-list">
            @for (p of produits; track p.id) {
              <div class="product-row">
                <div class="prod-img">
                  <img [src]="p.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&fit=crop'" [alt]="p.titreAnonce">
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
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1000px; }
    .page-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
    }
    .page-header h1 { font-family: 'Outfit',sans-serif; font-size: 1.5rem; font-weight: 800; color: var(--sb-text); margin-bottom: 4px; }
    .page-desc { font-size: 0.88rem; color: var(--sb-text-secondary); }
    .header-actions { display: flex; gap: 8px; }
    .btn-outline {
      padding: 8px 16px; border-radius: 8px; font-weight: 700; font-size: 0.82rem;
      border: 1.5px solid var(--sb-primary); color: var(--sb-primary);
      background: transparent; text-decoration: none; cursor: pointer; transition: 0.2s;
    }
    .btn-outline:hover { background: var(--sb-primary); color: white; }

    /* Tabs */
    .tab-bar { display: flex; gap: 4px; margin-bottom: 20px; border-bottom: 2px solid var(--sb-border-light); }
    .tab {
      padding: 10px 20px; border: none; background: none;
      font-weight: 700; font-size: 0.85rem; color: var(--sb-text-muted);
      cursor: pointer; border-bottom: 2px solid transparent;
      margin-bottom: -2px; transition: 0.2s;
      display: flex; align-items: center; gap: 8px;
    }
    .tab:hover { color: var(--sb-text); }
    .tab.active { color: var(--sb-primary); border-bottom-color: var(--sb-primary); }
    .tab-count {
      background: var(--sb-primary); color: white;
      font-size: 0.65rem; padding: 2px 7px; border-radius: 100px; font-weight: 800;
    }

    /* Status filters */
    .status-filters { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
    .sf-btn {
      padding: 6px 14px; border-radius: 100px;
      border: 1px solid var(--sb-border); background: var(--sb-bg-elevated);
      font-size: 0.78rem; font-weight: 700; color: var(--sb-text-secondary);
      cursor: pointer; transition: 0.15s;
    }
    .sf-btn:hover { border-color: var(--sb-primary); color: var(--sb-primary); }
    .sf-btn.active { background: var(--sb-primary); color: white; border-color: var(--sb-primary); }

    .loading-state, .empty-state { text-align: center; padding: 60px 20px; }
    .empty-icon { font-size: 3.5rem; display: block; margin-bottom: 16px; }
    .empty-state h3 { font-size: 1.2rem; color: var(--sb-text); margin-bottom: 8px; }
    .empty-state p { color: var(--sb-text-secondary); margin-bottom: 20px; }

    .product-row {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 16px;
      background: var(--sb-bg-elevated);
      border: 1px solid var(--sb-border);
      border-radius: var(--sb-radius-lg);
      margin-bottom: 8px;
      transition: var(--sb-transition);
    }
    .product-row:hover { box-shadow: var(--sb-shadow-sm); }
    .prod-img { width: 52px; height: 52px; border-radius: var(--sb-radius-md); overflow: hidden; flex-shrink: 0; }
    .prod-img img { width: 100%; height: 100%; object-fit: cover; }
    .prod-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--sb-bg-alt); font-size: 1.2rem; }
    .prod-info { flex: 1; min-width: 0; }
    .prod-info h3 { font-size: 0.88rem; font-weight: 600; color: var(--sb-text); margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .prod-category { font-size: 0.72rem; color: var(--sb-text-muted); }
    .prod-sku { font-size: 0.68rem; color: var(--sb-text-muted); display: block; font-family: monospace; }
    .prod-price { font-weight: 800; color: var(--sb-primary); font-size: 0.9rem; min-width: 90px; }
    .prod-stock { min-width: 85px; }
    .prod-views { font-size: 0.78rem; color: var(--sb-text-secondary); min-width: 60px; }
    .stock-badge {
      font-size: 0.72rem; font-weight: 700;
      padding: 3px 10px; border-radius: var(--sb-radius-full);
      background: rgba(16,185,129,0.1); color: var(--sb-success);
    }
    .stock-badge.low { background: rgba(245,158,11,0.1); color: #f59e0b; }
    .stock-badge.out { background: rgba(239,68,68,0.1); color: var(--sb-danger); }
    .prod-sales { font-size: 0.82rem; color: var(--sb-text-secondary); min-width: 70px; }
    .prod-status {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
      color: var(--sb-text-muted); min-width: 90px;
    }
    .status-pill {
      font-size: 0.68rem; font-weight: 800; padding: 3px 10px;
      border-radius: 100px; text-transform: uppercase;
    }
    .status-active { background: rgba(16,185,129,0.1); color: #10b981; }
    .status-draft { background: rgba(148,163,184,0.15); color: #64748b; }
    .status-out { background: rgba(239,68,68,0.1); color: #ef4444; }
    .status-archived { background: rgba(100,116,139,0.1); color: #475569; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--sb-text-muted); }
    .status-dot.active { background: var(--sb-success); }
    .status-dot.pending { background: var(--sb-warning); }

    .prod-actions { display: flex; gap: 4px; }
    .action-btn {
      width: 30px; height: 30px; border: none; border-radius: 8px;
      background: var(--sb-bg-alt); cursor: pointer; font-size: 0.8rem;
      display: flex; align-items: center; justify-content: center;
      text-decoration: none; transition: 0.15s;
    }
    .action-btn:hover { background: var(--sb-border); transform: translateY(-1px); }

    @media (max-width: 768px) {
      .product-row { flex-wrap: wrap; }
      .prod-stock, .prod-sales, .prod-status, .prod-views { width: auto; }
      .page-header { flex-direction: column; gap: 12px; }
      .header-actions { flex-direction: column; width: 100%; }
      .header-actions a { text-align: center; }
    }
  `]
})
export class VendeurProduitsComponent implements OnInit {
  private anonceService = inject(AnonceService);
  private authService = inject(AuthService);
  private marketProductService = inject(MarketProductService);
  private cdr = inject(ChangeDetectorRef);

  produits: any[] = [];
  marketProducts: ProduitMerchantDto[] = [];
  loading = true;
  loadingMarket = true;
  activeTab = 'market';
  statusFilter = 'ALL';

  ngOnInit() {
    const userId = this.authService.getUserId();
    if (userId) {
      // Load annonces
      this.anonceService.getByAnnonceur(userId).subscribe({
        next: (data: any[]) => { this.produits = data; this.loading = false; this.cdr.detectChanges(); },
        error: () => { this.produits = []; this.loading = false; this.cdr.detectChanges(); }
      });

      // Load marketplace products
      this.marketProductService.getMerchantProducts(0, 100).subscribe({
        next: (page: PageResponse<ProduitMerchantDto>) => {
          this.marketProducts = page.content;
          this.loadingMarket = false;
          this.cdr.detectChanges();
        },
        error: () => { this.marketProducts = []; this.loadingMarket = false; this.cdr.detectChanges(); }
      });
    } else {
      this.loading = false;
      this.loadingMarket = false;
    }
  }

  get filteredMarketProducts(): ProduitMerchantDto[] {
    if (this.statusFilter === 'ALL') return this.marketProducts;
    return this.marketProducts.filter(p => p.statutProduit === this.statusFilter);
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      'ACTIVE': 'Actif',
      'DRAFT': 'Brouillon',
      'OUT_OF_STOCK': 'Rupture',
      'ARCHIVED': 'Archivé'
    };
    return labels[status] || status;
  }

  changeStatus(product: ProduitMerchantDto, newStatus: string) {
    this.marketProductService.changeStatut(product.id, newStatus).subscribe({
      next: () => {
        product.statutProduit = newStatus;
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert(err.error?.message || 'Erreur lors du changement de statut');
      }
    });
  }
}
