import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { MerchantBadgeComponent } from '../merchant-badge/merchant-badge.component';
import { ProduitResponseDto } from '../../../models/produit.model';
import { PanierService } from '../../../services/panier.service';

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
        @if (product.statutProduit !== 'OUT_OF_STOCK') {
          <button class="card-add-cart" (click)="addToCart($event)" title="Ajouter au panier">
            @if (addedAnimation) {
              <span class="add-anim">+1</span>
            } @else {
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            }
          </button>
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
        <app-star-rating [rating]="product.noteMoyenne" [count]="product.nombreAvis" />
        <div class="card-price-row">
          @if (product.prixPromo && product.prixPromo < product.prix) {
            <span class="card-price-promo">{{ product.prixPromo | number:'1.2-2' }} MAD</span>
            <span class="card-price-original">{{ product.prix | number:'1.2-2' }} MAD</span>
          } @else {
            <span class="card-price">{{ product.prix | number:'1.2-2' }} MAD</span>
          }
        </div>
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
    .card-image-wrapper {
      position: relative; width: 100%; aspect-ratio: 1;
      overflow: hidden; background: #f8fafc;
    }
    .card-image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
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
    .card-add-cart {
      position: absolute; bottom: 8px; right: 8px;
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(255,255,255,0.95); border: 1.5px solid #e0e0e0;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      color: #333; opacity: 0; transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .product-card:hover .card-add-cart { opacity: 1; }
    .card-add-cart:hover { background: #1aafa5; color: white; border-color: #1aafa5; transform: scale(1.1); }
    .add-anim { font-size: 0.85rem; font-weight: 800; color: #1aafa5; animation: popUp 0.5s ease-out; }
    @keyframes popUp {
      0% { transform: scale(0.5); opacity: 0; }
      50% { transform: scale(1.3); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    .card-body { padding: 12px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
    .card-title {
      font-size: 0.85rem; font-weight: 600; color: var(--sb-text, #1e293b);
      margin: 0; line-height: 1.3;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .card-desc {
      font-size: 0.75rem; color: var(--sb-text-muted, #94a3b8);
      margin: 0; line-height: 1.4;
      display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;
    }
    .card-price-row { display: flex; align-items: baseline; gap: 6px; margin-top: auto; }
    .card-price { font-size: 1rem; font-weight: 800; color: var(--sb-primary, #1aafa5); }
    .card-price-promo { font-size: 1rem; font-weight: 800; color: #ef4444; }
    .card-price-original { font-size: 0.75rem; font-weight: 500; color: #94a3b8; text-decoration: line-through; }
    .card-footer {
      display: flex; justify-content: space-between; align-items: center;
      padding-top: 6px; border-top: 1px solid var(--sb-border-light, #f1f5f9);
    }
    .card-sales { font-size: 0.68rem; color: var(--sb-text-muted, #94a3b8); }
    .card-shop {
      font-size: 0.68rem; color: var(--sb-text-secondary, #64748b); font-weight: 600;
      max-width: 100px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
  `]
})
export class ProductCardComponent {
  @Input() product!: ProduitResponseDto;
  addedAnimation = false;

  constructor(private panierService: PanierService) { }

  get discountPercent(): number {
    if (!this.product.prixPromo || !this.product.prix || this.product.prixPromo >= this.product.prix) {
      return 0;
    }
    return Math.round((1 - this.product.prixPromo / this.product.prix) * 100);
  }

  addToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.panierService.addItem(this.product.id, 1).subscribe({
      next: () => {
        this.addedAnimation = true;
        setTimeout(() => this.addedAnimation = false, 600);
      },
      error: (err: any) => {
        alert(err.error?.message || err.error || 'Erreur lors de l\'ajout au panier');
      }
    });
  }
}
