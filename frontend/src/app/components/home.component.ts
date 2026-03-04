import { Component, OnInit, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../services/auth.service';
import { CategorieService } from '../services/category.service';
import { AnonceService } from '../services/anonce.service';
import { MarketProductService } from '../services/market-product.service';
import { SuperDealsComponent } from './super-deals.component';
import { ProductRecommendationService, Recommendation } from '../services/product-recommendation.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SuperDealsComponent],
  template: `
    <!-- HERO SECTION -->
    <section class="hero-pro">
      <div class="container">
        <div class="hero-pro-grid">
          <div class="hero-pro-text">
            <h1 class="hero-title">Un futur qui commence <span class="text-primary">aujourd'hui</span></h1>
            <p class="hero-desc">Parce que chaque talent mérite sa place !</p>
            <div class="hero-pro-actions">
              <button class="btn btn-primary btn-lg btn-pro">Commencer à chercher</button>
            </div>
          </div>
          <div class="hero-pro-image">
            <img src="assets/images/hero-talents.png" alt="Futur et Talents" class="img-pro">
          </div>
        </div>
      </div>
    </section>

    <!-- CATEGORIES BAR -->
    <section class="categories-bar">
      <div class="cat-bar-wrapper">
        <!-- Scroll Left -->
        <button class="cat-scroll-btn" (click)="scrollCats(-1)" aria-label="Précédent">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>

        <div class="cat-bar-scroll" #catScroll>
          <!-- Marketplace toujours en premier -->
          <div class="cat-item" [class.active]="selectedCategory === 'Marketplace'" (click)="filterByCategory('Marketplace')">
            <span class="cat-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </span>
            <span>Marketplace</span>
          </div>
          <!-- Catégories depuis l'API -->
          @for (cat of categories; track cat.id) {
            <div class="cat-item" [class.active]="selectedCategory === cat.nomCategorie" (click)="filterByCategory(cat.nomCategorie)">
              <span class="cat-icon-wrap" [innerHTML]="getCatIcon(cat.nomCategorie)"></span>
              <span>{{ cat.nomCategorie }}</span>
            </div>
          }
        </div>

        <!-- Scroll Right -->
        <button class="cat-scroll-btn" (click)="scrollCats(1)" aria-label="Suivant">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </section>

    <!-- SUPER DEALS -->
    <app-super-deals></app-super-deals>

    <!-- PERSONALIZED RECOMMENDATIONS -->
    <section class="section rec-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Recommandé pour vous ✨</h2>
          <p class="section-subtitle">Sélectionné par notre IA SouqBladi</p>
        </div>

        <!-- Loading skeleton -->
        <div class="skeleton-grid" *ngIf="recLoading">
          <div class="skeleton-card" *ngFor="let _ of [1,2,3,4,5,6]"></div>
        </div>

        <!-- Recommendation cards -->
        <div class="rec-grid" *ngIf="!recLoading && recommendations.length > 0">
          <div class="rec-card" *ngFor="let r of recommendations" (click)="goToProductDetail(r.id)">
            <div class="rec-img-wrap">
              <img [src]="r.imageUrl || defaultImg" [alt]="r.titre" class="rec-img" loading="lazy">
              <span class="rec-cat-badge">{{ r.categorie }}</span>
            </div>
            <div class="rec-body">
              <div class="rec-reason">
                <span class="reason-dot"></span>
                {{ r.reason }}
              </div>
              <h3 class="rec-title">{{ r.titre }}</h3>
              <div class="rec-meta">
                <span class="rec-price">{{ (r.prix || 0).toLocaleString() }} DH</span>
                <span class="rec-stars">{{ getStars(r.noteMoyenne) }} {{ r.noteMoyenne?.toFixed(1) }}</span>
              </div>
              <div class="rec-location" *ngIf="r.ville">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {{ r.ville }}
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state: popular fallback -->
        <div class="empty-recs" *ngIf="!recLoading && recommendations.length === 0">
          <p>🔍 Consultez des produits pour obtenir des recommandations personnalisées</p>
        </div>
      </div>
    </section>

    <!-- PRODUCTS -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">
            {{ selectedCategory ? 'Résultats : ' + selectedCategory : 'Dernières annonces' }}
          </h2>
          @if (selectedCategory || searchQuery) {
            <button class="btn btn-sm btn-secondary" (click)="clearFilters()">Réinitialiser ✕</button>
          }
        </div>

        <div class="products-grid">
          @for (p of filteredProducts; track p.id) {
            <div class="card-product" (click)="goToDetail(p.id)">
              <div class="card-img-wrapper">
                <img [src]="p.img" [alt]="p.name" class="card-img" loading="lazy">
                @if (p.badge) {
                  <span class="badge badge-danger card-badge">{{ p.badge }}</span>
                }
              </div>
              <div class="card-body">
                <h3 class="card-title">{{ p.name }}</h3>
                <div class="card-price-row">
                  <span class="card-price">{{ p.price }}</span>
                </div>
                <div class="card-location">
                  <span>📍</span> {{ p.location || 'Maroc' }}
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- VENDOR CTA: only show to non-vendors / visitors -->
    @if (!isVendeur()) {
    <section class="vendor-cta">
      <div class="container">
        <div class="cta-card">
          <div class="cta-content">
            <h2>Vous êtes commerçant ?</h2>
            <p>Rejoignez SouqBladi et vendez à des milliers de clients à travers le Maroc.
               Auto-entrepreneurs, magasins, coopératives — on vous accompagne !</p>
            <div class="cta-features">
              <span>✅ Inscription gratuite</span>
              <span>✅ Étude de marché offerte</span>
              <span>✅ Livraison intégrée</span>
            </div>
            <a routerLink="/register" class="btn btn-primary btn-lg">Ouvrir ma boutique</a>
          </div>
        </div>
      </div>
    </section>
    }
  `,
  styles: [`
    /* HERO PRO */
    .hero-pro {
      padding: 36px 0;
      background: var(--sb-bg);
    }
    .hero-pro-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 32px;
      align-items: center;
    }
    .hero-title {
      font-size: 2.6rem;
      font-weight: 800;
      line-height: 1.15;
      margin-bottom: 12px;
      color: var(--sb-text);
      letter-spacing: -0.03em;
    }
    .hero-desc {
      font-size: 1.1rem;
      font-weight: 500;
      color: var(--sb-text-secondary);
      margin-bottom: 24px;
    }
    .btn-pro {
      padding: 13px 28px;
      font-size: 0.95rem;
      border-radius: 12px;
      box-shadow: 0 6px 20px rgba(26, 175, 165, 0.3);
    }
    .img-pro {
      width: 100%;
      border-radius: 20px;
      box-shadow: var(--sb-shadow-xl);
      max-height: 280px;
      object-fit: cover;
    }

    /* CATEGORIES BAR */
    .categories-bar {
      background: var(--sb-primary);
      padding: 0;
      color: white;
      z-index: 100;
      box-shadow: 0 4px 15px rgba(26, 175, 165, 0.2);
    }
    [data-theme="dark"] .categories-bar { background: var(--sb-primary); }

    .cat-bar-wrapper {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 0;
      display: flex;
      align-items: stretch;
      position: relative;
      overflow: hidden;
    }
    .cat-scroll-btn {
      flex-shrink: 0;
      width: 36px;
      background: rgba(255,255,255,0.08);
      border: none;
      color: rgba(255,255,255,0.7);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: 0.2s;
      z-index: 2;
    }
    .cat-scroll-btn:hover { background: rgba(26,175,165,0.3); color: white; }

    .cat-bar-scroll {
      display: flex;
      flex: 1;
      overflow-x: auto;
      scroll-behavior: smooth;
      scrollbar-width: none;
      gap: 2px;
      padding: 0 4px;
    }
    .cat-bar-scroll::-webkit-scrollbar { display: none; }

    .cat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
      cursor: pointer;
      transition: all 0.2s;
      min-width: 82px;
      padding: 10px 8px;
      border-radius: 0;
      opacity: 0.72;
      flex-shrink: 0;
      border-bottom: 2px solid transparent;
    }
    .cat-item:hover {
      opacity: 1;
      background: rgba(26, 175, 165, 0.12);
      border-bottom-color: rgba(26,175,165,0.5);
    }
    .cat-item.active {
      opacity: 1;
      background: rgba(26, 175, 165, 0.18);
      border-bottom-color: #1aafa5;
    }
    .cat-icon-wrap {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255,255,255,0.9);
    }
    .cat-icon-wrap svg { width: 20px; height: 20px; stroke: currentColor; }
    .cat-item span:last-child {
      font-size: 0.72rem;
      font-weight: 700;
      white-space: nowrap;
      text-align: center;
      color: white;
      letter-spacing: 0.01em;
    }
    .cat-item.active span:last-child,
    .cat-item:hover span:last-child { color: white; }
    .cat-item.active .cat-icon-wrap,
    .cat-item:hover .cat-icon-wrap { color: white; }

    /* PRODUCTS */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 30px;
    }
    .card-product {
      background: var(--sb-bg-elevated);
      border-radius: 20px;
      border: 1px solid var(--sb-border);
      overflow: hidden;
      transition: var(--sb-transition);
      cursor: pointer;
    }
    .card-product:hover {
      transform: translateY(-8px);
      box-shadow: var(--sb-shadow-lg);
    }
    .card-img-wrapper { height: 200px; }
    .card-img { width: 100%; height: 100%; object-fit: cover; }
    .card-body { padding: 20px; }
    .rec-section { background: var(--sb-bg-subtle, #f1f5f9); border-radius: 40px; margin: 40px 0; padding: 60px 0; }
    .section-subtitle { font-size: 1rem; color: var(--sb-text-secondary); margin-top: -10px; margin-bottom: 30px; font-weight: 500; }
    .empty-recs { text-align: center; padding: 40px; color: var(--sb-text-muted); font-style: italic; }

    /* Skeleton loading */
    .skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 24px; }
    .skeleton-card { height: 300px; background: linear-gradient(90deg, #e2e8f0 25%, #f8fafc 50%, #e2e8f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 20px; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    /* Recommendation cards */
    .rec-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 24px; }
    .rec-card { background: var(--sb-bg-elevated, white); border-radius: 20px; border: 1px solid var(--sb-border, #e2e8f0); overflow: hidden; cursor: pointer; transition: all 0.3s ease; }
    .rec-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
    .rec-img-wrap { position: relative; height: 180px; overflow: hidden; }
    .rec-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
    .rec-card:hover .rec-img { transform: scale(1.05); }
    .rec-cat-badge { position: absolute; top: 12px; left: 12px; background: rgba(26,175,165,0.9); color: white; font-size: 0.7rem; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
    .rec-body { padding: 16px; }
    .rec-reason { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: var(--sb-primary, #1aafa5); font-weight: 600; margin-bottom: 8px; }
    .reason-dot { width: 6px; height: 6px; background: var(--sb-primary, #1aafa5); border-radius: 50%; flex-shrink: 0; }
    .rec-title { font-size: 0.95rem; font-weight: 700; color: var(--sb-text, #1e293b); margin-bottom: 10px; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .rec-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    .rec-price { font-size: 1.1rem; font-weight: 800; color: var(--sb-primary, #1aafa5); }
    .rec-stars { font-size: 0.8rem; color: #f59e0b; font-weight: 600; }
    .rec-location { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: var(--sb-text-muted, #94a3b8); }

    @media (max-width: 992px) {
      .hero-pro-grid { grid-template-columns: 1fr; text-align: center; }
      .hero-title { font-size: 2.5rem; }
      .hero-desc { font-size: 1.2rem; }
    }

    /* VENDOR CTA */
    .vendor-cta { padding: 60px 0; }
    .cta-card {
      background: var(--sb-primary-gradient);
      border-radius: var(--sb-radius-xl);
      padding: 60px;
      text-align: center;
    }
    .cta-content h2 { color: white; font-size: 2rem; font-weight: 800; margin-bottom: 16px; }
    .cta-content p { color: rgba(255,255,255,0.9); font-size: 1.05rem; max-width: 600px; margin: 0 auto 24px; line-height: 1.7; }
    .cta-features {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin-bottom: 32px;
      color: white;
      font-weight: 600;
      font-size: 0.9rem;
      flex-wrap: wrap;
    }
    .cta-card .btn-primary {
      background: white;
      color: var(--sb-primary);
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    }
    .cta-card .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.3); }

    @media (max-width: 1024px) {
      .hero-container { grid-template-columns: 1fr; gap: 40px; }
      .hero h1 { font-size: 2.5rem; }
      .usp-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
      .hero { padding: 40px 0; }
      .hero h1 { font-size: 2rem; }
      .hero-visual { grid-template-columns: 1fr; }
      .hero-stats { flex-wrap: wrap; }
      .hero-actions { flex-direction: column; }
      .usp-grid { grid-template-columns: 1fr; }
      .flash-banner { flex-direction: column; gap: 16px; }
      .flash-left { flex-wrap: wrap; }
      .cta-card { padding: 40px 24px; }
      .cta-features { flex-direction: column; gap: 8px; }
    }
  `]
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private catService = inject(CategorieService);
  private anonceService = inject(AnonceService);
  private marketService = inject(MarketProductService);
  private recService = inject(ProductRecommendationService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  @ViewChild('catScroll') catScrollEl?: ElementRef<HTMLDivElement>;

  searchQuery = '';
  selectedCategory = '';

  mockCategories = [
    { id: 'm1', nomCategorie: 'Électronique', iconeCategorie: '📱' },
    { id: 'm2', nomCategorie: 'Mode', iconeCategorie: '👗' },
    { id: 'm3', nomCategorie: 'Maison', iconeCategorie: '🏠' },
    { id: 'm4', nomCategorie: 'Beauté', iconeCategorie: '💄' },
    { id: 'm5', nomCategorie: 'Sport', iconeCategorie: '⚽' },
    { id: 'm6', nomCategorie: 'Auto', iconeCategorie: '🚗' },
    { id: 'm7', nomCategorie: 'Alimentation', iconeCategorie: '🥘' },
    { id: 'm8', nomCategorie: 'Artisanat', iconeCategorie: '🏺' }
  ];

  categories: any[] = [...this.mockCategories];
  allProducts: any[] = [];
  filteredProducts: any[] = [];
  recommendations: Recommendation[] = [];
  recLoading = true;
  loading = true;
  defaultImg = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&fit=crop';

  ngOnInit() {
    this.loadData();
    this.loadProductRecommendations();
  }

  loadData() {
    this.loading = true;
    this.catService.getAllActive().subscribe({
      next: (cats) => {
        if (cats && cats.length > 0) this.categories = cats;
      },
      error: () => this.categories = [...this.mockCategories]
    });

    // Load produits (ACTIVE) as main listing
    this.marketService.searchProducts({ page: 0, size: 24 }).subscribe({
      next: (page) => {
        const prods = page.content || [];
        this.allProducts = prods.map((p: any) => ({
          id: p.id,
          name: p.nom || p.titreProduit,
          price: ((p.prix || p.prixAfiche || 0)).toLocaleString() + ' DH',
          location: p.villeLocalisation || '',
          categorie: p.categorieNom || p.categorie?.nomCategorie || 'Divers',
          categorieSlug: p.categorieSlug || '',
          img: p.primaryImageUrl || p.imageUrl || this.defaultImg,
          badge: p.nombreVentes >= 50 ? 'TOP' : null,
          note: p.noteMoyenne
        }));
        this.filteredProducts = [...this.allProducts];
        this.loading = false;
      },
      error: () => {
        // Fallback: try anonces
        this.anonceService.getActive().subscribe({
          next: (anonces) => {
            this.allProducts = anonces.map((a: any) => ({
              id: a.id, name: a.titreAnonce,
              price: (a.prixAfiche || 0).toLocaleString() + ' DH',
              location: a.villeLocalisation, categorie: a.categorie?.nomCategorie || 'Divers',
              img: a.imageUrl || this.defaultImg, badge: a.annoncePremium ? 'TOP' : null
            }));
            this.filteredProducts = [...this.allProducts];
            this.loading = false;
          },
          error: () => this.loading = false
        });
      }
    });
  }

  loadProductRecommendations() {
    this.recLoading = true;
    const history = this.recService.getViewHistory();
    const location = this.getUserLocation();

    const handleRecs = (recs: Recommendation[]) => {
      this.recommendations = recs;
      this.recLoading = false;
    };
    const fallback = () => {
      this.recService.getPopular(6).subscribe({
        next: handleRecs,
        error: () => { this.recLoading = false; }
      });
    };

    if (history.length === 0) {
      fallback();
      return;
    }

    this.recService.getPersonalized(history, location, this.searchQuery || null, 6).subscribe({
      next: (recs) => { if (recs && recs.length > 0) handleRecs(recs); else fallback(); },
      error: fallback
    });
  }

  goToProductDetail(id: number) {
    this.recService.trackView(id);
    this.router.navigate(['/product', id]);
  }

  private getUserLocation(): string | null {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user?.ville || user?.villeLocalisation || null;
    } catch { return null; }
  }

  getStars(note: number): string {
    const n = Math.round(note || 0);
    return '⭐'.repeat(Math.min(n, 5));
  }

  filterByCategory(catName: string) {
    this.selectedCategory = (this.selectedCategory === catName) ? '' : catName;
    this.applyFilters();
  }

  onSearchChange() { this.applyFilters(); }

  applyFilters() {
    this.filteredProducts = this.allProducts.filter(p => {
      const matchCat = !this.selectedCategory ||
        p.categorie === this.selectedCategory ||
        p.categorieSlug === this.selectedCategory;
      const matchSearch = !this.searchQuery ||
        p.name?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.location?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.categorie?.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }

  clearFilters() {
    this.selectedCategory = '';
    this.searchQuery = '';
    this.filteredProducts = [...this.allProducts];
  }

  goToDetail(id: number) { this.router.navigate(['/product', id]); }

  scrollCats(dir: -1 | 1) {
    if (this.catScrollEl) {
      this.catScrollEl.nativeElement.scrollBy({ left: dir * 240, behavior: 'smooth' });
    }
  }

  getCatIcon(name: string): SafeHtml {
    const icons: Record<string, string> = {
      'Marketplace': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
      'Automobile': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>',
      'Véhicules': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>',
      'Immobilier': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3"/><path d="M19 21V11"/><path d="M5 21V11"/><path d="M14 21v-4a2 2 0 1 0-4 0v4"/></svg>',
      'Emploi': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M12 12v4"/><path d="M10 14h4"/></svg>',
      'Services': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22 12 12"/><path d="M11 7 8 4"/><path d="m18 5 3 3"/><path d="m5 11 3 3"/><path d="m11 13 3 3"/><circle cx="12" cy="12" r="10"/></svg>',
      'Informatique': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
      'Électronique': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/><path d="M15 13v4"/><path d="M11 15h4"/></svg>',
      'Mode': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 20 3-1.5 3 1.5M12 2v16.5"/></svg>',
      'Maison': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
      'Sport': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 14.14 14.14"/><path d="m14.14 4.93-9.21 9.21"/></svg>',
      'Alimentation': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>',
      'Artisanat': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>',
      'Animaux': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-2.73 9.29-1.32 1.32-3.08 2.05-4.8 2.3A12.78 12.78 0 0 1 12 15c-.3 0-.58-.02-.87-.05-1.72-.25-3.48-.98-4.8-2.3C4 10.36 2.18 3.94 3.58 3.36c1.39-.58 4.64.26 6.42 2.26.65-.17 1.33-.26 2-.26Z"/><path d="M12 15v5a2 2 0 0 1-2 2H9l3-3"/><path d="M12 15v5a2 2 0 0 0 2 2h1l-3-3"/><path d="M15.3 5.4c-1-1.1-2.9-2-4.1-1.1"/><path d="M8.7 5.4c1-1.1 2.9-2 4.1-1.1"/></svg>',
    };
    return this.sanitizer.bypassSecurityTrustHtml(
      icons[name] ?? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
    );
  }

  isVendeur(): boolean {
    const role = this.authService.getPrimaryRole();
    return ['AUTO_ENTREPRENEUR', 'MAGASIN', 'COOPERATIVE', 'SARL'].includes(role);
  }
}
