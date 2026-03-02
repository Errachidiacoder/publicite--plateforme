import { Component, OnInit, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../services/auth.service';
import { CategorieService } from '../services/category.service';
import { AnonceService } from '../services/anonce.service';
import { SuperDealsComponent } from './super-deals.component';

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
      background: #1e293b;
      padding: 0;
      color: white;
    }
    [data-theme="dark"] .categories-bar { background: #0f172a; }

    .cat-bar-wrapper {
      max-width: 1280px;
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
      font-size: 0.7rem;
      font-weight: 600;
      white-space: nowrap;
      text-align: center;
      color: rgba(255,255,255,0.85);
    }
    .cat-item.active span:last-child,
    .cat-item:hover span:last-child { color: white; }
    .cat-item.active .cat-icon-wrap,
    .cat-item:hover .cat-icon-wrap { color: #1aafa5; }

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
    .card-title { font-size: 1rem; font-weight: 700; margin-bottom: 8px; }
    .card-price { color: var(--sb-primary); font-size: 1.2rem; font-weight: 800; }
    .card-location { font-size: 0.8rem; color: var(--sb-text-muted); margin-top: 10px; }

    @media (max-width: 992px) {
      .hero-pro-grid { grid-template-columns: 1fr; text-align: center; }
      .hero-title { font-size: 2.5rem; }
      .hero-desc { font-size: 1.2rem; }
      .hero-pro-image { order: -1; }
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
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  @ViewChild('catScroll') catScrollEl?: ElementRef<HTMLDivElement>;

  searchQuery = '';
  selectedCategory = '';
  categories: any[] = [];
  allProducts: any[] = [];
  filteredProducts: any[] = [];
  loading = true;

  mockCategories = [
    { nomCategorie: 'Électronique', iconeCategorie: '📱' },
    { nomCategorie: 'Mode', iconeCategorie: '👗' },
    { nomCategorie: 'Maison', iconeCategorie: '🏠' },
    { nomCategorie: 'Beauté', iconeCategorie: '💄' },
    { nomCategorie: 'Sport', iconeCategorie: '⚽' },
    { nomCategorie: 'Auto', iconeCategorie: '🚗' },
    { nomCategorie: 'Alimentation', iconeCategorie: '🥘' },
    { nomCategorie: 'Artisanat', iconeCategorie: '🏺' }
  ];

  ngOnInit() { this.loadData(); }

  loadData() {
    this.loading = true;
    this.catService.getAllActive().subscribe({
      next: (cats) => this.categories = cats,
      error: () => this.categories = []
    });

    this.anonceService.getActive().subscribe({
      next: (anonces) => {
        this.allProducts = anonces.map((a: any) => ({
          id: a.id,
          name: a.titreAnonce,
          price: (a.prixAfiche || 0).toLocaleString() + ' DH',
          location: a.villeLocalisation,
          categorie: a.categorie?.nomCategorie || 'Divers',
          img: a.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&fit=crop',
          badge: a.annoncePremium ? 'TOP' : null
        }));
        this.filteredProducts = [...this.allProducts];
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  filterByCategory(catName: string) {
    this.selectedCategory = (this.selectedCategory === catName) ? '' : catName;
    this.applyFilters();
  }

  onSearchChange() { this.applyFilters(); }

  applyFilters() {
    this.filteredProducts = this.allProducts.filter(p => {
      const matchCat = !this.selectedCategory || p.categorie === this.selectedCategory;
      const matchSearch = !this.searchQuery || p.name.toLowerCase().includes(this.searchQuery.toLowerCase());
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
      'Automobile': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
      'Véhicules': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
      'Immobilier': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
      'Emploi': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>',
      'Services': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
      'Informatique': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
      'Électronique': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
      'Mode': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
      'Maison': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
      'Sport': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93 19.07 19.07"/><path d="M7.76 2.24a10 10 0 0 0-5.52 5.52"/><path d="M21.76 16.24a10 10 0 0 0-5.52 5.52"/></svg>',
      'Beauté': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
      'Alimentation': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>',
      'Artisanat': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
      'Animaux': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.1 2.344-1.828"/><path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.96-1.1-2.344-1.828"/><path d="M8 14v.5"/><path d="M16 14v.5"/><path d="M11.25 16.25h1.5L12 17l-.75-.75z"/><path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309m-9.243-6.082A8.801 8.801 0 0 1 12 5c.78 0 1.5.108 2.161.306"/></svg>',
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
