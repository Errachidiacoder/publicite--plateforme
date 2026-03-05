import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AnonceService } from '../../services/anonce.service';
import { CategorieService } from '../../services/category.service';
import { SkeletonCardComponent } from '../shared/skeleton-card/skeleton-card.component';

@Component({
  selector: 'app-annonces',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonCardComponent, RouterLink],
  template: `
    <div class="marketplace-page">
      <!-- Hero -->
      <div class="mp-hero">
        <div class="mp-hero-inner">
          <h1 class="mp-hero-title">Annonces <span class="mp-hero-accent">SouqBladi</span></h1>
          <p class="mp-hero-sub">Parcourez les meilleures annonces vérifiées partout au Maroc</p>
          <div class="mp-search-bar">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Rechercher une annonce..." [(ngModel)]="keyword" (keyup.enter)="applyFilters()" />
            <button class="mp-search-btn" (click)="applyFilters()">Rechercher</button>
          </div>
        </div>
      </div>

      <div class="mp-container">
        <!-- Sidebar filters -->
        <aside class="mp-sidebar">
          <div class="filter-section">
            <h3 class="filter-title">Catégories</h3>
            <label class="filter-radio" [class.active]="selectedCategoryId === null">
              <input type="radio" name="cat" [value]="null" [(ngModel)]="selectedCategoryId" (change)="applyFilters()" />
              Toutes les catégories
            </label>
            @for (cat of categories; track cat.id ?? $index) {
              <label class="filter-radio" [class.active]="selectedCategoryId === cat.id">
                <input type="radio" name="cat" [value]="cat.id" [(ngModel)]="selectedCategoryId" (change)="applyFilters()" />
                {{ cat.nomCategorie }}
              </label>
            }
          </div>

          <div class="filter-section">
            <h3 class="filter-title">Prix (DH)</h3>
            <div class="price-row">
              <div class="price-input-wrap">
                <span class="price-label">Min</span>
                <input type="number" placeholder="0" [(ngModel)]="minPrice" class="price-input" (change)="applyFilters()" />
              </div>
              <span class="price-sep">—</span>
              <div class="price-input-wrap">
                <span class="price-label">Max</span>
                <input type="number" placeholder="∞" [(ngModel)]="maxPrice" class="price-input" (change)="applyFilters()" />
              </div>
            </div>
            @if (minPrice || maxPrice) {
              <button class="filter-clear-btn" (click)="minPrice = null; maxPrice = null; applyFilters()">✕ Effacer</button>
            }
          </div>
        </aside>

        <!-- Main Content -->
        <main class="mp-main">
          <!-- Toolbar -->
          <div class="mp-toolbar">
            <span class="mp-result-count">
              @if (!loading) {
                {{ filtered.length }} annonce{{ filtered.length !== 1 ? 's' : '' }} trouvée{{ filtered.length !== 1 ? 's' : '' }}
              }
            </span>
            <div></div>
          </div>

          <!-- Ad Grid -->
          @if (loading) {
            <div class="mp-grid">
              @for (i of skeletons; track $index) {
                <app-skeleton-card />
              }
            </div>
          } @else if (filtered.length === 0) {
            <div class="mp-empty">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <h3>Aucune annonce trouvée</h3>
              <p>Essayez de modifier vos filtres ou votre recherche</p>
              <button class="mp-reset-btn" (click)="resetFilters()">Réinitialiser les filtres</button>
            </div>
          } @else {
            <div class="mp-grid">
              @for (a of filtered; track a.id) {
                <a class="ad-card" [routerLink]="['/product', a.id]">
                  <div class="ad-img">
                    @if (a.imageUrl) {
                       <img [src]="a.imageUrl" [alt]="a.titreAnonce">
                    } @else {
                       <div class="ad-noimg">📦</div>
                    }
                  </div>
                  <div class="ad-body">
                    <div class="ad-tag">{{ a.categorie?.nomCategorie || 'Divers' }}</div>
                    <h3 class="ad-title">{{ a.titreAnonce }}</h3>
                    <div class="ad-foot">
                      <span class="ad-price">{{ (a.prixAfiche || 0) | number:'1.0-0' }} DH</span>
                      <span class="ad-loc">📍 {{ a.villeLocalisation || 'Maroc' }}</span>
                    </div>
                  </div>
                </a>
              }
            </div>
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
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
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
    }
    .price-input:focus { border-color: var(--sb-primary, #1aafa5); }
    .price-sep { color: #94a3b8; font-size: 0.8rem; margin-top: 18px; }

    /* Main */
    .mp-main { flex: 1; min-width: 0; }

    /* Toolbar */
    .mp-toolbar {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 16px;
    }
    .mp-result-count { font-size: 0.85rem; color: var(--sb-text-secondary, #64748b); font-weight: 600; }

    /* Grid */
    .mp-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 20px;
    }

    /* Ad Card */
    .ad-card {
      background: white; border: 1px solid var(--sb-border-light, #f1f5f9);
      border-radius: 16px; overflow: hidden; text-decoration: none;
      color: inherit; transition: all 0.25s;
      display: flex; flex-direction: column;
      height: 100%;
    }
    .ad-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.08);
      border-color: var(--sb-primary, #1aafa5);
    }
    .ad-img {
      height: 190px; background: #f1f5f9; position: relative;
      display: flex; align-items: center; justify-content: center;
      overflow: hidden;
    }
    .ad-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
    .ad-card:hover .ad-img img { transform: scale(1.08); }
    .ad-noimg { font-size: 2.5rem; opacity: 0.3; }
    .ad-body { padding: 16px; flex: 1; display: flex; flex-direction: column; }
    .ad-tag {
      font-size: 0.7rem; font-weight: 800; color: var(--sb-primary, #1aafa5);
      text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;
    }
    .ad-title {
      font-size: 0.95rem; font-weight: 700; color: #1e293b;
      margin: 0 0 12px; line-height: 1.4;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
      overflow: hidden; min-height: 2.8em;
    }
    .ad-foot {
      margin-top: auto; display: flex; justify-content: space-between;
      align-items: center; padding-top: 12px; border-top: 1px solid #f1f5f9;
    }
    .ad-price { font-size: 1.1rem; font-weight: 900; color: var(--sb-primary, #1aafa5); }
    .ad-loc { font-size: 0.75rem; color: #64748b; font-weight: 500; }

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

    @media (max-width: 768px) {
      .mp-container { flex-direction: column; }
      .mp-sidebar { width: 100%; }
      .mp-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
    }
  `]
})
export class AnnoncesComponent implements OnInit {
  private annonceService = inject(AnonceService);
  private categoryService = inject(CategorieService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  all: any[] = [];
  filtered: any[] = [];
  categories: { id: number; nomCategorie: string }[] = [];
  loading = true;
  skeletons = Array(8).fill(0);

  // Filters
  keyword = '';
  selectedCategoryId: number | null = null;
  minPrice: number | null = null;
  maxPrice: number | null = null;

  ngOnInit(): void {
    this.categoryService.getAllActive().subscribe(c => this.categories = c || []);
    this.route.queryParams.subscribe(params => {
      this.keyword = params['q'] || '';
      this.selectedCategoryId = params['categorieId'] ? +params['categorieId'] : null;
      this.minPrice = params['min'] ? +params['min'] : null;
      this.maxPrice = params['max'] ? +params['max'] : null;
      this.load();
    });
  }

  load() {
    this.loading = true;
    this.annonceService.getActive().subscribe({
      next: (ads) => {
        this.all = ads || [];
        this.applyFilters(false);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.all = []; this.filtered = []; this.cdr.detectChanges(); }
    });
  }

  applyFilters(updateQuery: boolean = true) {
    const kw = (this.keyword || '').toLowerCase().trim();
    this.filtered = this.all.filter(a => {
      const byKw = !kw || (a.titreAnonce?.toLowerCase().includes(kw) || a.villeLocalisation?.toLowerCase().includes(kw));
      const byCat = !this.selectedCategoryId || a.categorie?.id === this.selectedCategoryId;
      const prix = a.prixAfiche || 0;
      const byMin = this.minPrice == null || prix >= this.minPrice;
      const byMax = this.maxPrice == null || prix <= this.maxPrice;
      return byKw && byCat && byMin && byMax;
    });
    if (updateQuery) {
      const query: any = {};
      if (this.keyword) query.q = this.keyword;
      if (this.selectedCategoryId) query.categorieId = this.selectedCategoryId;
      if (this.minPrice != null) query.min = this.minPrice;
      if (this.maxPrice != null) query.max = this.maxPrice;
      this.router.navigate([], { queryParams: query, queryParamsHandling: 'merge' });
    }
  }

  resetFilters() {
    this.keyword = '';
    this.selectedCategoryId = null;
    this.minPrice = null;
    this.maxPrice = null;
    this.applyFilters();
  }
}
