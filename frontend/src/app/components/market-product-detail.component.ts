import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MarketProductService } from '../services/market-product.service';
import { PanierService } from '../services/panier.service';
import { AvisService, AvisResponseDto } from '../services/avis.service';
import { StarRatingComponent } from './shared/star-rating/star-rating.component';
import { MerchantBadgeComponent } from './shared/merchant-badge/merchant-badge.component';
import { ProductCardComponent } from './shared/product-card/product-card.component';
import { ProduitResponseDto, ProductImageDto } from '../models/produit.model';

@Component({
  selector: 'app-market-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, StarRatingComponent, MerchantBadgeComponent, ProductCardComponent],
  template: `
    @if (loading) {
      <div class="mpd-loading">
        <div class="mpd-loader"></div>
        <p>Chargement du produit...</p>
      </div>
    } @else if (!product) {
      <div class="mpd-not-found">
        <h2>Produit non trouvé</h2>
        <a routerLink="/marketplace">← Retour au marketplace</a>
      </div>
    } @else {
      <div class="mpd-page">
        <!-- Breadcrumb -->
        <nav class="mpd-breadcrumb">
          <a routerLink="/marketplace">Marketplace</a>
          <span>›</span>
          @if (product.categorieSlug) {
            <a [routerLink]="['/categories', product.categorieSlug]">{{ product.categorieNom }}</a>
            <span>›</span>
          }
          <span class="current">{{ product.nom }}</span>
        </nav>

        <div class="mpd-main">
          <!-- Gallery -->
          <div class="mpd-gallery">
            <div class="mpd-main-image">
              @if (activeImage) {
                <img [src]="activeImage" [alt]="product.nom" />
              } @else {
                <div class="mpd-no-image">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                </div>
              }
              @if (discountPercent > 0) {
                <span class="mpd-discount-badge">-{{ discountPercent }}%</span>
              }
            </div>
            @if (product.images && product.images.length > 1) {
              <div class="mpd-thumbnails">
                @for (img of product.images; track img.id) {
                  <button class="mpd-thumb" [class.active]="activeImage === img.url" (click)="activeImage = img.url">
                    <img [src]="img.url" [alt]="img.altText" />
                  </button>
                }
              </div>
            }
          </div>

          <!-- Info -->
          <div class="mpd-info">
            @if (product.typeActivite) {
              <app-merchant-badge [type]="product.typeActivite" />
            }

            <h1 class="mpd-title">{{ product.nom }}</h1>

            <div class="mpd-stats">
              <app-star-rating [rating]="product.noteMoyenne" [count]="product.nombreAvis" />
              <span class="mpd-sep">·</span>
              <span class="mpd-views">{{ product.compteurVues }} vues</span>
              <span class="mpd-sep">·</span>
              <span class="mpd-sales">{{ product.nombreVentes }} ventes</span>
            </div>

            <!-- Price -->
            <div class="mpd-price-box">
              @if (product.prixPromo && product.prixPromo < product.prix) {
                <span class="mpd-price-promo">{{ product.prixPromo | number:'1.2-2' }} MAD</span>
                <span class="mpd-price-original">{{ product.prix | number:'1.2-2' }} MAD</span>
              } @else {
                <span class="mpd-price">{{ product.prix | number:'1.2-2' }} MAD</span>
              }
            </div>

            @if (product.descriptionCourte) {
              <p class="mpd-short-desc">{{ product.descriptionCourte }}</p>
            }

            <!-- Stock -->
            <div class="mpd-stock" [class.low-stock]="product.quantiteStock <= 5">
              @if (product.quantiteStock > 5) {
                <span class="stock-ok">✓ En stock</span>
              } @else if (product.quantiteStock > 0) {
                <span class="stock-low">⚠ Plus que {{ product.quantiteStock }} en stock</span>
              } @else {
                <span class="stock-out">✕ Rupture de stock</span>
              }
            </div>

            <!-- Quantity selector -->
            @if (product.quantiteStock > 0) {
              <div class="mpd-qty-row">
                <label>Quantité</label>
                <div class="mpd-qty-control">
                  <button (click)="quantity = Math.max(1, quantity - 1)">−</button>
                  <span>{{ quantity }}</span>
                  <button (click)="quantity = Math.min(product.quantiteStock, quantity + 1)">+</button>
                </div>
              </div>
              <button class="mpd-add-cart" (click)="addToCart()" [disabled]="addingToCart">
                @if (addingToCart) {
                  ⏳ Ajout en cours...
                } @else if (addedToCart) {
                  ✅ Ajouté au panier !
                } @else {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                Ajouter au panier
                }
              </button>
            }

            <!-- Delivery -->
            @if (product.deliveryOption) {
              <div class="mpd-delivery">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                <span>{{ deliveryLabel }}</span>
              </div>
            }

            <!-- Shop info -->
            @if (product.boutiqueNom) {
              <div class="mpd-shop-card">
                <div class="shop-avatar">{{ product.boutiqueNom.charAt(0) }}</div>
                <div class="shop-info">
                  <strong>{{ product.boutiqueNom }}</strong>
                  @if (product.typeActivite) {
                    <app-merchant-badge [type]="product.typeActivite" />
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Description -->
        <section class="mpd-description">
          <h2>Description du produit</h2>
          <div class="mpd-desc-content">{{ product.descriptionDetaillee }}</div>
        </section>

        <!-- Reviews section -->
        <section class="mpd-reviews">
          <h2>⭐ Avis clients ({{ reviews.length }})</h2>
          @if (reviewsLoading) {
            <div class="reviews-loading"><div class="mpd-loader"></div></div>
          } @else if (reviews.length === 0) {
            <p class="reviews-empty">Aucun avis pour ce produit pour le moment.</p>
          } @else {
            <div class="reviews-grid">
              @for (r of reviews; track r.id) {
                <div class="review-card">
                  <div class="review-header">
                    <span class="review-avatar">👤</span>
                    <div class="review-meta">
                      <span class="review-user">{{ r.nomUtilisateur }}</span>
                      <span class="review-date">{{ r.dateAvis | date:'dd/MM/yyyy' }}</span>
                    </div>
                    <div class="review-stars">
                      @for (s of [1,2,3,4,5]; track s) {
                        <span class="star" [class.filled]="s <= r.note">★</span>
                      }
                    </div>
                  </div>
                  @if (r.commentaire) {
                    <p class="review-comment">{{ r.commentaire }}</p>
                  }
                </div>
              }
            </div>
          }
        </section>

        <!-- Similar products -->
        @if (similarProducts.length > 0) {
          <section class="mpd-similar">
            <h2>Produits similaires</h2>
            <div class="mpd-similar-grid">
              @for (p of similarProducts; track p.id) {
                <app-product-card [product]="p" />
              }
            </div>
          </section>
        }
      </div>
    }
  `,
  styles: [`
    .mpd-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 16px; color: var(--sb-text-muted, #94a3b8); }
    .mpd-loader { width: 40px; height: 40px; border: 3px solid var(--sb-border, #e2e8f0); border-top: 3px solid var(--sb-primary, #1aafa5); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .mpd-not-found { text-align: center; padding: 64px; }
    .mpd-not-found a { color: var(--sb-primary, #1aafa5); font-weight: 700; text-decoration: none; }

    .mpd-page { max-width: 1320px; margin: 0 auto; padding: 24px; }

    /* Breadcrumb */
    .mpd-breadcrumb { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; font-size: 0.82rem; color: var(--sb-text-muted, #94a3b8); flex-wrap: wrap; }
    .mpd-breadcrumb a { color: var(--sb-primary, #1aafa5); text-decoration: none; font-weight: 600; }
    .mpd-breadcrumb .current { color: var(--sb-text, #1e293b); font-weight: 600; }

    /* Main layout */
    .mpd-main { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }

    /* Gallery */
    .mpd-gallery { display: flex; flex-direction: column; gap: 12px; }
    .mpd-main-image {
      position: relative; border-radius: 16px; overflow: hidden;
      background: var(--sb-bg-elevated, #fff);
      border: 1px solid var(--sb-border-light, #f1f5f9);
      aspect-ratio: 1;
    }
    .mpd-main-image img { width: 100%; height: 100%; object-fit: contain; }
    .mpd-no-image { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f1f5f9; }
    .mpd-no-image svg { width: 80px; height: 80px; color: #94a3b8; }
    .mpd-discount-badge {
      position: absolute; top: 12px; left: 12px;
      background: #ef4444; color: white;
      font-weight: 800; font-size: 0.85rem;
      padding: 4px 12px; border-radius: 8px;
    }

    .mpd-thumbnails { display: flex; gap: 8px; overflow-x: auto; padding: 4px 0; }
    .mpd-thumb {
      width: 64px; height: 64px; flex-shrink: 0;
      border: 2px solid var(--sb-border-light, #f1f5f9);
      border-radius: 10px; overflow: hidden; cursor: pointer;
      background: none; padding: 0; transition: 0.15s;
    }
    .mpd-thumb.active { border-color: var(--sb-primary, #1aafa5); }
    .mpd-thumb img { width: 100%; height: 100%; object-fit: cover; }

    /* Info */
    .mpd-info { display: flex; flex-direction: column; gap: 12px; }
    .mpd-title { font-size: 1.5rem; font-weight: 900; color: var(--sb-text, #1e293b); margin: 0; line-height: 1.3; }
    .mpd-stats { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .mpd-sep { color: #cbd5e1; }
    .mpd-views, .mpd-sales { font-size: 0.8rem; color: var(--sb-text-muted, #94a3b8); }

    .mpd-price-box { display: flex; align-items: baseline; gap: 10px; padding: 12px 0; }
    .mpd-price { font-size: 1.8rem; font-weight: 900; color: var(--sb-primary, #1aafa5); }
    .mpd-price-promo { font-size: 1.8rem; font-weight: 900; color: #ef4444; }
    .mpd-price-original { font-size: 1rem; color: #94a3b8; text-decoration: line-through; }

    .mpd-short-desc { font-size: 0.9rem; color: var(--sb-text-secondary, #64748b); line-height: 1.5; margin: 0; }

    .mpd-stock { font-size: 0.85rem; font-weight: 700; }
    .stock-ok { color: #16a34a; }
    .stock-low { color: #f59e0b; }
    .stock-out { color: #ef4444; }

    .mpd-qty-row { display: flex; align-items: center; gap: 12px; }
    .mpd-qty-row label { font-size: 0.85rem; font-weight: 700; color: var(--sb-text, #1e293b); }
    .mpd-qty-control { display: flex; align-items: center; border: 1.5px solid var(--sb-border, #e2e8f0); border-radius: 10px; overflow: hidden; }
    .mpd-qty-control button {
      width: 36px; height: 36px; border: none; background: var(--sb-bg-alt, #f1f5f9);
      font-size: 1rem; cursor: pointer; color: var(--sb-text, #1e293b); font-weight: 700;
    }
    .mpd-qty-control span { width: 48px; text-align: center; font-weight: 700; font-size: 0.95rem; }

    .mpd-add-cart {
      display: flex; align-items: center; justify-content: center; gap: 10px;
      width: 100%; padding: 14px; border-radius: 12px; border: none;
      background: var(--sb-primary, #1aafa5); color: white;
      font-size: 0.95rem; font-weight: 800; cursor: pointer;
      transition: 0.2s;
    }
    .mpd-add-cart:hover { background: #0f766e; transform: translateY(-1px); }
    .mpd-add-cart svg { width: 20px; height: 20px; }

    .mpd-delivery {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 16px; background: var(--sb-bg-alt, #f1f5f9);
      border-radius: 10px; font-size: 0.85rem; color: var(--sb-text-secondary, #64748b);
    }
    .mpd-delivery svg { width: 22px; height: 22px; flex-shrink: 0; }

    .mpd-shop-card {
      display: flex; align-items: center; gap: 12px;
      padding: 14px; border-radius: 12px;
      border: 1px solid var(--sb-border-light, #f1f5f9);
      background: var(--sb-bg-elevated, #fff);
    }
    .shop-avatar {
      width: 40px; height: 40px; border-radius: 10px;
      background: var(--sb-primary-gradient, linear-gradient(135deg, #1aafa5, #0f766e));
      color: white; font-weight: 800; font-size: 1.1rem;
      display: flex; align-items: center; justify-content: center;
    }
    .shop-info { display: flex; flex-direction: column; gap: 4px; }
    .shop-info strong { display: block; font-size: 0.95rem; color: var(--sb-text, #1e293b); }

    /* Reviews */
    .mpd-reviews { margin-top: 40px; padding-top: 40px; border-top: 1px solid var(--sb-border-light, #f1f5f9); }
    .mpd-reviews h2 { font-size: 1.3rem; font-weight: 800; color: var(--sb-text, #1e293b); margin-bottom: 24px; }
    .reviews-loading { display: flex; justify-content: center; padding: 40px 0; }
    .reviews-empty { color: var(--sb-text-muted, #94a3b8); font-size: 0.9rem; text-align: center; padding: 32px; background: var(--sb-bg-alt, #f1f5f9); border-radius: 12px; }
    .reviews-grid { display: flex; flex-direction: column; gap: 16px; }
    .review-card { padding: 20px; border: 1px solid var(--sb-border-light, #f1f5f9); border-radius: 16px; background: var(--sb-bg-elevated, #fff); transition: 0.2s; }
    .review-card:hover { border-color: var(--sb-primary, #1aafa5); box-shadow: var(--sb-shadow-sm, 0 4px 6px -1px rgb(0 0 0 / 0.1)); }
    .review-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
    .review-avatar { width: 32px; height: 32px; background: var(--sb-bg-alt, #f1f5f9); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; }
    .review-meta { flex: 1; display: flex; flex-direction: column; }
    .review-user { font-size: 0.9rem; font-weight: 700; color: var(--sb-text, #1e293b); }
    .review-date { font-size: 0.75rem; color: var(--sb-text-muted, #94a3b8); }
    .review-stars { display: flex; gap: 2px; }
    .star { color: #cbd5e1; font-size: 0.9rem; }
    .star.filled { color: #f59e0b; }
    .review-comment { font-size: 0.9rem; color: var(--sb-text-secondary, #64748b); line-height: 1.5; margin: 0; }

    /* Description */
    .mpd-description { margin-top: 40px; }    background: var(--sb-bg-elevated, #fff);
      border: 1px solid var(--sb-border-light, #f1f5f9);
      border-radius: 16px; padding: 24px; margin-bottom: 40px;
    }
    .mpd-description h2 { font-size: 1.1rem; font-weight: 800; margin: 0 0 16px; color: var(--sb-text, #1e293b); }
    .mpd-desc-content { font-size: 0.9rem; color: var(--sb-text-secondary, #64748b); line-height: 1.7; white-space: pre-line; }

    /* Similar */
    .mpd-similar { margin-bottom: 40px; }
    .mpd-similar h2 { font-size: 1.1rem; font-weight: 800; margin: 0 0 16px; color: var(--sb-text, #1e293b); }
    .mpd-similar-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }

    @media (max-width: 768px) {
      .mpd-main { grid-template-columns: 1fr; gap: 24px; }
      .mpd-title { font-size: 1.2rem; }
      .mpd-price, .mpd-price-promo { font-size: 1.4rem; }
    }
  `]
})
export class MarketProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(MarketProductService);
  private panierService = inject(PanierService);
  private avisService = inject(AvisService);
  private cdr = inject(ChangeDetectorRef);

  product: ProduitResponseDto | null = null;
  loading = true;
  activeImage = '';
  quantity = 1;
  similarProducts: ProduitResponseDto[] = [];
  addingToCart = false;
  addedToCart = false;
  Math = Math;
  reviews: AvisResponseDto[] = [];
  reviewsLoading = false;

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loadProduct(id);
    });
  }

  loadProduct(id: number) {
    this.loading = true;
    this.productService.getProductById(id).subscribe({
      next: (product: ProduitResponseDto) => {
        this.product = product;
        this.activeImage = product.primaryImageUrl || (product.images?.[0]?.url ?? '');
        this.loading = false;
        this.cdr.detectChanges();
        this.loadSimilar();
        this.loadReviews(id);
      },
      error: () => {
        this.loading = false;
        this.product = null;
        this.cdr.detectChanges();
      }
    });
  }

  loadSimilar() {
    if (!this.product?.categorieSlug) return;
    this.productService.getProductsByCategory(this.product.categorieSlug, 0, 4).subscribe({
      next: (page) => {
        this.similarProducts = page.content.filter(p => p.id !== this.product?.id).slice(0, 4);
        this.cdr.detectChanges();
      },
      error: () => { }
    });
  }

  loadReviews(productId: number) {
    this.reviewsLoading = true;
    this.avisService.getProductReviews(productId).subscribe({
      next: (data) => {
        this.reviews = data;
        this.reviewsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.reviews = [];
        this.reviewsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get discountPercent(): number {
    if (!this.product?.prixPromo || !this.product?.prix || this.product.prixPromo >= this.product.prix) {
      return 0;
    }
    return Math.round((1 - this.product.prixPromo / this.product.prix) * 100);
  }

  get deliveryLabel(): string {
    if (!this.product?.deliveryOption) return '';
    const labels: Record<string, string> = {
      'OWN_DELIVERY': '🚚 Livraison par le vendeur',
      'LOGISTICS_PARTNER': '📦 Livraison par partenaire logistique',
      'BOTH': '🚚📦 Plusieurs options de livraison'
    };
    return labels[this.product.deliveryOption] || this.product.deliveryOption;
  }

  addToCart() {
    if (!this.product || this.addingToCart) return;
    this.addingToCart = true;
    this.addedToCart = false;
    this.panierService.addItem(this.product.id, this.quantity).subscribe({
      next: () => {
        this.addingToCart = false;
        this.addedToCart = true;
        this.cdr.detectChanges();
        setTimeout(() => { this.addedToCart = false; this.cdr.detectChanges(); }, 2000);
      },
      error: () => {
        this.addingToCart = false;
        this.cdr.detectChanges();
      }
    });
  }
}
