import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
    <section class="hero">
      <div class="hero-container">
        <div class="hero-content">
          <span class="hero-badge">🇲🇦 100% Marocain</span>
          <h1>Votre <span class="text-gradient">Marketplace</span><br>Marocaine</h1>
          <p class="hero-subtitle">
            Achetez, vendez et développez votre activité sur la première
            plateforme e-commerce pensée pour le Maroc.
          </p>
          <div class="hero-actions">
            <a routerLink="/register" class="btn btn-primary btn-lg">Commencer maintenant</a>
            <a href="#categories" class="btn btn-secondary btn-lg">Explorer →</a>
          </div>
          <div class="hero-stats">
            <div class="stat">
              <span class="stat-number">10K+</span>
              <span class="stat-label">Produits</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-number">2K+</span>
              <span class="stat-label">Vendeurs</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-number">48</span>
              <span class="stat-label">Villes</span>
            </div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-card card-1">
            <span class="card-emoji">🛍️</span>
            <span>Boutiques vérifiées</span>
          </div>
          <div class="hero-card card-2">
            <span class="card-emoji">🚚</span>
            <span>Livraison partout au Maroc</span>
          </div>
          <div class="hero-card card-3">
            <span class="card-emoji">💰</span>
            <span>Paiement à la livraison</span>
          </div>
          <div class="hero-card card-4">
            <span class="card-emoji">📊</span>
            <span>Étude de marché gratuite</span>
          </div>
        </div>
      </div>
    </section>

    <!-- USP BAR -->
    <section class="usp-bar">
      <div class="container">
        <div class="usp-grid">
          <div class="usp-item">
            <span class="usp-icon">🚚</span>
            <div><strong>Livraison nationale</strong><span>Partout au Maroc</span></div>
          </div>
          <div class="usp-item">
            <span class="usp-icon">💳</span>
            <div><strong>Paiement à la livraison</strong><span>Ou carte bancaire</span></div>
          </div>
          <div class="usp-item">
            <span class="usp-icon">🔒</span>
            <div><strong>Achat sécurisé</strong><span>Protection acheteur</span></div>
          </div>
          <div class="usp-item">
            <span class="usp-icon">↩️</span>
            <div><strong>Retour gratuit</strong><span>Sous 7 jours</span></div>
          </div>
        </div>
      </div>
    </section>

    <!-- CATEGORIES -->
    <section class="section" id="categories">
      <div class="container">
        <div class="section-header">
          <div>
            <h2 class="section-title">Explorer par catégorie</h2>
            <p class="section-subtitle">Trouvez ce que vous cherchez</p>
          </div>
        </div>

        <div class="cat-grid">
          @for (cat of (categories.length > 0 ? categories : mockCategories); track cat.nomCategorie) {
            <div class="cat-card" [class.active]="selectedCategory === cat.nomCategorie" (click)="filterByCategory(cat.nomCategorie)">
              <span class="cat-icon">{{ cat.iconeCategorie || '📁' }}</span>
              <span class="cat-name">{{ cat.nomCategorie }}</span>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- SUPER DEALS (AliExpress Style) -->
    <app-super-deals></app-super-deals>

    <!-- PRODUCTS -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <div>
            <h2 class="section-title">
              {{ selectedCategory ? 'Résultats : ' + selectedCategory : 'Recommandé pour vous' }}
            </h2>
          </div>
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
                <div class="card-rating">
                  <span class="stars">★★★★★</span>
                  <span>(42)</span>
                </div>
                <div class="card-location">
                  <span>📍</span>
                  {{ p.location || 'Maroc' }}
                </div>
              </div>
            </div>
          }
        </div>

        @if (filteredProducts.length === 0 && !loading) {
          <div class="empty-state">
            <span class="empty-icon">🔍</span>
            <p>Aucun produit ne correspond à vos critères.</p>
            <button class="btn btn-primary" (click)="clearFilters()">Voir tous les produits</button>
          </div>
        }
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
    /* HERO */
    .hero {
      background: var(--sb-bg-alt);
      padding: 80px 0 60px;
      overflow: hidden;
    }
    .hero-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 24px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      align-items: center;
    }
    .hero-badge {
      display: inline-block;
      background: var(--sb-primary-light);
      color: var(--sb-primary);
      padding: 6px 16px;
      border-radius: var(--sb-radius-full);
      font-size: 0.85rem;
      font-weight: 700;
      margin-bottom: 20px;
    }
    .hero h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 3.5rem;
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 20px;
      letter-spacing: -0.03em;
    }
    .text-gradient {
      background: var(--sb-primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero-subtitle {
      font-size: 1.15rem;
      color: var(--sb-text-secondary);
      line-height: 1.7;
      margin-bottom: 32px;
      max-width: 480px;
    }
    .hero-actions {
      display: flex;
      gap: 12px;
      margin-bottom: 48px;
    }
    .hero-stats {
      display: flex;
      align-items: center;
      gap: 24px;
    }
    .stat { display: flex; flex-direction: column; }
    .stat-number {
      font-family: 'Outfit', sans-serif;
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--sb-text);
    }
    .stat-label { font-size: 0.85rem; color: var(--sb-text-muted); }
    .stat-divider { width: 1px; height: 40px; background: var(--sb-border); }

    .hero-visual {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      position: relative;
    }
    .hero-card {
      background: var(--sb-bg-elevated);
      border: 1px solid var(--sb-border);
      border-radius: var(--sb-radius-lg);
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: var(--sb-transition);
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--sb-text);
    }
    .hero-card:hover { transform: translateY(-4px); box-shadow: var(--sb-shadow-md); }
    .card-emoji { font-size: 2rem; }
    .card-1 { animation: fadeUp 0.6s ease; }
    .card-2 { animation: fadeUp 0.8s ease; }
    .card-3 { animation: fadeUp 1s ease; }
    .card-4 { animation: fadeUp 1.2s ease; }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* USP BAR */
    .usp-bar {
      border-bottom: 1px solid var(--sb-border);
      padding: 20px 0;
      background: var(--sb-bg);
    }
    .usp-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
    }
    .usp-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .usp-icon { font-size: 1.5rem; }
    .usp-item div { display: flex; flex-direction: column; }
    .usp-item strong { font-size: 0.85rem; color: var(--sb-text); }
    .usp-item span { font-size: 0.78rem; color: var(--sb-text-muted); }

    /* CATEGORIES */
    .cat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 16px;
    }
    .cat-card {
      background: var(--sb-bg-elevated);
      border: 1.5px solid var(--sb-border);
      border-radius: var(--sb-radius-lg);
      padding: 24px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      transition: var(--sb-transition);
    }
    .cat-card:hover {
      border-color: var(--sb-primary);
      transform: translateY(-4px);
      box-shadow: var(--sb-shadow-md);
    }
    .cat-card.active {
      border-color: var(--sb-primary);
      background: var(--sb-primary-light);
    }
    .cat-icon { font-size: 2rem; }
    .cat-name { font-weight: 600; font-size: 0.85rem; color: var(--sb-text); text-align: center; }

    /* PRODUCTS */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 20px;
    }
    .card-img-wrapper {
      position: relative;
      overflow: hidden;
    }
    .card-badge { position: absolute; top: 10px; left: 10px; z-index: 2; }
    .card-price-row { display: flex; align-items: center; gap: 8px; }
    .card-location {
      display: flex; align-items: center; gap: 4px;
      font-size: 0.78rem; color: var(--sb-text-muted); margin-top: 6px;
    }
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--sb-text-secondary);
    }
    .empty-icon { font-size: 3rem; display: block; margin-bottom: 16px; }
    .empty-state p { margin-bottom: 20px; }

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

  isVendeur(): boolean {
    const role = this.authService.getPrimaryRole();
    return ['AUTO_ENTREPRENEUR', 'MAGASIN', 'COOPERATIVE', 'SARL'].includes(role);
  }
}
