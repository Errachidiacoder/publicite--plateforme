import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { MerchantBadgeComponent } from '../merchant-badge/merchant-badge.component';
import { ProduitResponseDto } from '../../../models/produit.model';

@Component({
    selector: 'app-product-card',
    standalone: true,
    imports: [CommonModule, RouterLink, StarRatingComponent, MerchantBadgeComponent],
    template: `
    <a [routerLink]="['/market-products', product.id]" class="product-card">
      <!-- Image -->
      <div class="card-image-wrapper">
        @if (product.primaryImageUrl) {
          <img [src]="product.primaryImageUrl" [alt]="product.nom" class="card-image" loading="lazy" />
        } @else {
          <div class="card-image-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
          </div>
        }
        @if (discountPercent > 0) {
          <span class="card-discount">-{{ discountPercent }}%</span>
        }
        @if (product.statutProduit === 'OUT_OF_STOCK') {
          <span class="card-out-of-stock">Rupture</span>
        }
      </div>

      <!-- Body -->
      <div class="card-body">
        @if (product.typeActivite) {
          <app-merchant-badge [type]="product.typeActivite" />
        }
        <h3 class="card-title">{{ product.nom }}</h3>
        @if (product.descriptionCourte) {
          <p class="card-desc">{{ product.descriptionCourte }}</p>
        }

        <!-- Rating -->
        <app-star-rating [rating]="product.noteMoyenne" [count]="product.nombreAvis" />

        <!-- Price -->
        <div class="card-price-row">
          @if (product.prixPromo && product.prixPromo < product.prix) {
            <span class="card-price-promo">{{ product.prixPromo | number:'1.2-2' }} MAD</span>
            <span class="card-price-original">{{ product.prix | number:'1.2-2' }} MAD</span>
          } @else {
            <span class="card-price">{{ product.prix | number:'1.2-2' }} MAD</span>
          }
        </div>

        <!-- Footer -->
        <div class="card-footer">
          <span class="card-sales">{{ product.nombreVentes }} ventes</span>
          @if (product.boutiqueNom) {
            <span class="card-shop">{{ product.boutiqueNom }}</span>
          }
        </div>
      </div>
    </a>
  `,
    styles: [`
    .product-card {
      display: flex; flex-direction: column;
      background: var(--sb-bg-elevated, #fff);
      border-radius: 12px;
      border: 1px solid var(--sb-border-light, #f1f5f9);
      overflow: hidden;
      text-decoration: none; color: inherit;
      transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
      height: 100%;
    }
    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0,0,0,0.1);
      border-color: var(--sb-primary, #1aafa5);
    }

    /* Image */
    .card-image-wrapper {
      position: relative;
      width: 100%; aspect-ratio: 1;
      overflow: hidden;
      background: #f8fafc;
    }
    .card-image {
      width: 100%; height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }
    .product-card:hover .card-image { transform: scale(1.05); }
    .card-image-placeholder {
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
    }
    .card-image-placeholder svg { width: 48px; height: 48px; color: #94a3b8; }

    .card-discount {
      position: absolute; top: 8px; left: 8px;
      background: #ef4444; color: white;
      font-size: 0.7rem; font-weight: 800;
      padding: 3px 8px; border-radius: 6px;
    }
    .card-out-of-stock {
      position: absolute; top: 8px; right: 8px;
      background: #64748b; color: white;
      font-size: 0.65rem; font-weight: 700;
      padding: 3px 8px; border-radius: 6px;
    }

    /* Body */
    .card-body {
      padding: 12px; display: flex; flex-direction: column; gap: 6px; flex: 1;
    }
    .card-title {
      font-size: 0.85rem; font-weight: 600;
      color: var(--sb-text, #1e293b);
      margin: 0; line-height: 1.3;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .card-desc {
      font-size: 0.75rem;
      color: var(--sb-text-muted, #94a3b8);
      margin: 0; line-height: 1.4;
      display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;
    }

    /* Price */
    .card-price-row { display: flex; align-items: baseline; gap: 6px; margin-top: auto; }
    .card-price {
      font-size: 1rem; font-weight: 800;
      color: var(--sb-primary, #1aafa5);
    }
    .card-price-promo {
      font-size: 1rem; font-weight: 800;
      color: #ef4444;
    }
    .card-price-original {
      font-size: 0.75rem; font-weight: 500;
      color: #94a3b8; text-decoration: line-through;
    }

    /* Footer */
    .card-footer {
      display: flex; justify-content: space-between; align-items: center;
      padding-top: 6px; border-top: 1px solid var(--sb-border-light, #f1f5f9);
    }
    .card-sales {
      font-size: 0.68rem; color: var(--sb-text-muted, #94a3b8);
    }
    .card-shop {
      font-size: 0.68rem; color: var(--sb-text-secondary, #64748b);
      font-weight: 600;
      max-width: 100px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
  `]
})
export class ProductCardComponent {
    @Input() product!: ProduitResponseDto;

    get discountPercent(): number {
        if (!this.product.prixPromo || !this.product.prix || this.product.prixPromo >= this.product.prix) {
            return 0;
        }
        return Math.round((1 - this.product.prixPromo / this.product.prix) * 100);
    }
}
