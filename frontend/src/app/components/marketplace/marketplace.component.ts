import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MarketProductService } from '../../services/market-product.service';
import { CategorieService } from '../../services/category.service';
import { ProductCardComponent } from '../shared/product-card/product-card.component';
import { SkeletonCardComponent } from '../shared/skeleton-card/skeleton-card.component';
import { ProduitResponseDto, ProductFilterRequest, PageResponse } from '../../models/produit.model';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent, SkeletonCardComponent],
  template: `
    <div class="marketplace-page">
      <!-- Hero -->
      <div class="mp-hero">
        <div class="mp-hero-inner">
          <h1 class="mp-hero-title">Marketplace <span class="mp-hero-accent">SouqBladi</span></h1>
          <p class="mp-hero-sub">Découvrez des milliers de produits authentiques de marchands marocains</p>
          <div class="mp-search-bar">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Rechercher un produit..." [(ngModel)]="keyword" (keyup.enter)="applyFilters()" />
            <button class="mp-search-btn" (click)="applyFilters()">Rechercher</button>
          </div>
        </div>
      </div>

      <div class="mp-container">
        <!-- Sidebar filters -->
        <aside class="mp-sidebar">
          <div class="filter-section">
            <h3 class="filter-title">Catégories</h3>
            @for (cat of categories; track cat.id ?? $index) {
              <label class="filter-radio" [class.active]="selectedCategoryId === cat.id">
                <input type="radio" name="category" [value]="cat.id" [(ngModel)]="selectedCategoryId" (change)="applyFilters()" />
                {{ cat.nomCategorie }}
              </label>
            }
            @if (selectedCategoryId) {
              <button class="filter-clear-btn" (click)="selectedCategoryId = null; applyFilters()">✕ Effacer</button>
            }
          </div>

          <div class="filter-section">
            <h3 class="filter-title">Prix (MAD)</h3>
            <div class="price-row">
              <div class="price-input-wrap">
                <span class="price-label">Min</span>
                <input type="number" placeholder="0" [(ngModel)]="minPrice" class="price-input" />
              </div>
              <span class="price-sep">—</span>
              <div class="price-input-wrap">
                <span class="price-label">Max</span>
                <input type="number" placeholder="∞" [(ngModel)]="maxPrice" class="price-input" />
              </div>
            </div>
            <button class="filter-apply-btn" (click)="applyFilters()">Appliquer le prix</button>
            @if (minPrice || maxPrice) {
              <button class="filter-clear-btn" (click)="minPrice = null; maxPrice = null; applyFilters()">✕ Effacer</button>
            }
          </div>

          <div class="filter-section">
            <h3 class="filter-title">Type de vendeur</h3>
            @for (mt of merchantTypes; track $index) {
              <label class="filter-radio" [class.active]="selectedMerchantType === mt.value">
                <input type="radio" name="merchantType" [value]="mt.value" [(ngModel)]="selectedMerchantType" (change)="applyFilters()" />
                {{ mt.label }}
              </label>
            }
            @if (selectedMerchantType) {
              <button class="filter-clear-btn" (click)="selectedMerchantType = ''; applyFilters()">✕ Effacer</button>
            }
          </div>
        </aside>

        <!-- Main Content -->
        <main class="mp-main">
          <!-- Toolbar -->
          <div class="mp-toolbar">
            <span class="mp-result-count">
              @if (!loading) {
                {{ totalElements }} produit{{ totalElements !== 1 ? 's' : '' }} trouvé{{ totalElements !== 1 ? 's' : '' }}
              }
            </span>
            <div class="mp-sort">
              <label>Trier par</label>
              <select [(ngModel)]="sortBy" (change)="applyFilters()">
                <option value="newest">Plus récents</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
                <option value="rating">Meilleure note</option>
                <option value="best_selling">Meilleures ventes</option>
              </select>
            </div>
          </div>

          <!-- Product Grid -->
          @if (loading) {
            <div class="mp-grid">
              @for (i of skeletons; track $index) {
                <app-skeleton-card />
              }
            </div>
          } @else if (products.length === 0) {
            <div class="mp-empty">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <h3>Aucun produit trouvé</h3>
              <p>Essayez de modifier vos filtres ou votre recherche</p>
              <button class="mp-reset-btn" (click)="resetFilters()">Réinitialiser les filtres</button>
            </div>
          } @else {
            <div class="mp-grid">
              @for (p of products; track p.id) {
                <app-product-card [product]="p" />
              }
            </div>

            <!-- Pagination -->
            @if (totalPages > 1) {
              <div class="mp-pagination">
                <button class="pg-btn" [disabled]="currentPage === 0" (click)="goToPage(currentPage - 1)">
                  ← Précédent
                </button>
                @for (pg of visiblePages; track pg) {
                  <button class="pg-btn" [class.pg-active]="pg === currentPage" (click)="goToPage(pg)">
                    {{ pg + 1 }}
                  </button>
                }
                <button class="pg-btn" [disabled]="currentPage >= totalPages - 1" (click)="goToPage(currentPage + 1)">
                  Suivant →
                </button>
              </div>
            }
          }
        </main>
      </div>
    </div>
  `,
  styles: [`
    .marketplace-page { min-height: 100vh; background: var(--sb-bg, #f8fafc); }

    /* Hero */
    .mp-hero {
      background: linear-gradient(135deg, #0f766e 0%, #1aafa5 50%, #14b8a6 100%);
      padding: 48px 24px 40px; text-align: center;
    }
    .mp-hero-inner { max-width: 680px; margin: 0 auto; }
    .mp-hero-title { font-size: 2.2rem; font-weight: 900; color: white; margin: 0 0 8px; }
    .mp-hero-accent { color: #a7f3d0; }
    .mp-hero-sub { color: rgba(255,255,255,0.85); font-size: 1rem; margin: 0 0 24px; }
    .mp-search-bar {
      display: flex; align-items: center;
      background: white; border-radius: 12px;
      padding: 4px 4px 4px 16px;
      max-width: 420px; margin: 0 auto;
    }
    .mp-search-bar svg { color: #94a3b8; flex-shrink: 0; }
    .mp-search-bar input {
      flex: 1; border: none; outline: none; padding: 6px 10px;
      font-size: 0.88rem; background: transparent; color: #1e293b;
    }
    .mp-search-btn {
      background: var(--sb-primary, #1aafa5); color: white;
      border: none; padding: 6px 16px; border-radius: 9px;
      font-weight: 700; font-size: 0.82rem; cursor: pointer;
      transition: background 0.2s;
    }
    .mp-search-btn:hover { background: #0f766e; }

    /* Container */
    .mp-container {
      max-width: 1320px; margin: 0 auto;
      padding: 24px; display: flex; gap: 24px;
    }

    /* Sidebar */
    .mp-sidebar {
      width: 260px; flex-shrink: 0;
      display: flex; flex-direction: column; gap: 20px;
    }
    .filter-section {
      background: var(--sb-bg-elevated, #fff);
      border: 1px solid var(--sb-border-light, #f1f5f9);
      border-radius: 12px; padding: 16px;
    }
    .filter-title {
      font-size: 0.85rem; font-weight: 800;
      color: var(--sb-text, #1e293b);
      margin: 0 0 12px; text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .filter-radio {
      display: flex; align-items: center; gap: 8px;
      padding: 6px 8px; border-radius: 8px;
      font-size: 0.83rem; color: var(--sb-text-secondary, #64748b);
      cursor: pointer; transition: 0.15s;
    }
    .filter-radio:hover, .filter-radio.active {
      background: var(--sb-bg-alt, #f1f5f9);
      color: var(--sb-primary, #1aafa5);
    }
    .filter-radio input { accent-color: var(--sb-primary, #1aafa5); }
    .filter-clear-btn {
      margin-top: 8px; background: none; border: none;
      color: var(--sb-primary, #1aafa5); font-size: 0.75rem;
      font-weight: 600; cursor: pointer;
    }
    .price-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
    .price-input-wrap {
      flex: 1; display: flex; flex-direction: column; gap: 4px;
    }
    .price-label {
      font-size: 0.7rem; font-weight: 700; color: var(--sb-text-muted, #94a3b8);
      text-transform: uppercase; letter-spacing: 0.04em;
    }
    .price-input {
      width: 100%; padding: 10px 8px; border-radius: 8px;
      border: 1.5px solid var(--sb-border, #e2e8f0);
      font-size: 0.85rem; font-weight: 600;
      background: var(--sb-bg, #f8fafc);
      color: var(--sb-text, #1e293b); outline: none;
      transition: border-color 0.15s;
      -moz-appearance: textfield;
    }
    .price-input::-webkit-outer-spin-button,
    .price-input::-webkit-inner-spin-button {
      -webkit-appearance: none; margin: 0;
    }
    .price-input:focus { border-color: var(--sb-primary, #1aafa5); }
    .price-sep { color: #94a3b8; font-size: 0.8rem; margin-top: 18px; }
    .filter-apply-btn {
      width: 100%; padding: 8px;
      background: var(--sb-primary, #1aafa5); color: white;
      border: none; border-radius: 8px;
      font-weight: 700; font-size: 0.8rem; cursor: pointer;
      transition: 0.2s;
    }
    .filter-apply-btn:hover { background: #0f766e; }

    /* Main */
    .mp-main { flex: 1; min-width: 0; }

    /* Toolbar */
    .mp-toolbar {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 16px;
    }
    .mp-result-count { font-size: 0.85rem; color: var(--sb-text-secondary, #64748b); font-weight: 600; }
    .mp-sort { display: flex; align-items: center; gap: 8px; }
    .mp-sort label { font-size: 0.8rem; color: var(--sb-text-muted, #94a3b8); font-weight: 600; }
    .mp-sort select {
      padding: 6px 12px; border-radius: 8px;
      border: 1px solid var(--sb-border, #e2e8f0);
      font-size: 0.82rem; background: var(--sb-bg-elevated, #fff);
      color: var(--sb-text, #1e293b); cursor: pointer; outline: none;
    }

    /* Grid */
    .mp-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 16px;
    }

    /* Empty */
    .mp-empty {
      text-align: center; padding: 64px 24px;
      color: var(--sb-text-muted, #94a3b8);
    }
    .mp-empty svg { margin-bottom: 16px; opacity: 0.4; }
    .mp-empty h3 { font-size: 1.1rem; color: var(--sb-text, #1e293b); margin: 0 0 8px; }
    .mp-empty p { font-size: 0.88rem; margin: 0 0 20px; }
    .mp-reset-btn {
      background: var(--sb-primary, #1aafa5); color: white;
      border: none; padding: 10px 24px; border-radius: 10px;
      font-weight: 700; font-size: 0.85rem; cursor: pointer;
    }

    /* Pagination */
    .mp-pagination {
      display: flex; justify-content: center; align-items: center;
      gap: 6px; margin-top: 32px;
    }
    .pg-btn {
      padding: 8px 14px; border-radius: 8px;
      border: 1px solid var(--sb-border, #e2e8f0);
      background: var(--sb-bg-elevated, #fff);
      color: var(--sb-text, #1e293b);
      font-size: 0.82rem; font-weight: 600;
      cursor: pointer; transition: 0.15s;
    }
    .pg-btn:hover:not(:disabled) {
      border-color: var(--sb-primary, #1aafa5);
      color: var(--sb-primary, #1aafa5);
    }
    .pg-btn:disabled { opacity: 0.4; cursor: default; }
    .pg-btn.pg-active {
      background: var(--sb-primary, #1aafa5);
      color: white; border-color: var(--sb-primary, #1aafa5);
    }

    @media (max-width: 768px) {
      .mp-container { flex-direction: column; }
      .mp-sidebar { width: 100%; flex-direction: row; flex-wrap: wrap; gap: 12px; }
      .filter-section { flex: 1; min-width: 200px; }
      .mp-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
      .mp-hero-title { font-size: 1.5rem; }
    }
  `]
})
export class MarketplaceComponent implements OnInit {
  private productService = inject(MarketProductService);
  private categoryService = inject(CategorieService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  products: ProduitResponseDto[] = [];
  categories: { id: number; nomCategorie: string }[] = [];
  loading = true;
  skeletons = Array(8).fill(0);

  // Filters
  keyword = '';
  selectedCategoryId: number | null = null;
  minPrice: number | null = null;
  maxPrice: number | null = null;
  selectedMerchantType = '';
  sortBy = 'newest';

  // Pagination
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 20;

  merchantTypes = [
    { value: 'AUTO_ENTREPRENEUR', label: 'Auto-Entrepreneur' },
    { value: 'MAGASIN', label: 'Magasin' },
    { value: 'COOPERATIVE', label: 'Coopérative' },
    { value: 'SARL', label: 'SARL' }
  ];

  ngOnInit() {
    // Load categories for sidebar
    this.categoryService.getAllActive().subscribe({
      next: (cats) => { this.categories = cats; this.cdr.detectChanges(); },
      error: () => { }
    });

    // queryParams subscription is the SINGLE trigger for loadProducts
    this.route.queryParams.subscribe(params => {
      this.keyword = params['keyword'] || '';
      this.selectedCategoryId = params['categorieId'] ? +params['categorieId'] : null;
      this.sortBy = params['sort'] || 'newest';
      this.currentPage = params['page'] ? +params['page'] : 0;
      this.selectedMerchantType = params['merchantType'] || '';
      this.minPrice = params['minPrice'] ? +params['minPrice'] : null;
      this.maxPrice = params['maxPrice'] ? +params['maxPrice'] : null;
      this.loadProducts();
    });
  }

  loadProducts() {
    this.loading = true;
    const filter: ProductFilterRequest = {
      keyword: this.keyword || undefined,
      categorieId: this.selectedCategoryId || undefined,
      minPrice: this.minPrice || undefined,
      maxPrice: this.maxPrice || undefined,
      merchantType: this.selectedMerchantType || undefined,
      sort: this.sortBy,
      page: this.currentPage,
      size: this.pageSize
    };

    this.productService.searchProducts(filter).subscribe({
      next: (page: PageResponse<ProduitResponseDto>) => {
        this.products = page.content;
        this.totalPages = page.totalPages;
        this.totalElements = page.totalElements;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.products = [];
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters() {
    this.currentPage = 0;
    this.updateQueryParams();
    // loadProducts will be triggered by queryParams subscription
  }

  goToPage(page: number) {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.updateQueryParams();
    // loadProducts will be triggered by queryParams subscription
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetFilters() {
    this.keyword = '';
    this.selectedCategoryId = null;
    this.minPrice = null;
    this.maxPrice = null;
    this.selectedMerchantType = '';
    this.sortBy = 'newest';
    this.applyFilters();
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages, start + 5);
    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  }

  private updateQueryParams() {
    const queryParams: Record<string, string | number | null> = {};
    if (this.keyword) queryParams['keyword'] = this.keyword;
    if (this.selectedCategoryId) queryParams['categorieId'] = this.selectedCategoryId;
    if (this.sortBy !== 'newest') queryParams['sort'] = this.sortBy;
    if (this.currentPage > 0) queryParams['page'] = this.currentPage;
    if (this.selectedMerchantType) queryParams['merchantType'] = this.selectedMerchantType;
    if (this.minPrice) queryParams['minPrice'] = this.minPrice;
    if (this.maxPrice) queryParams['maxPrice'] = this.maxPrice;

    this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'replace' });
  }
}
