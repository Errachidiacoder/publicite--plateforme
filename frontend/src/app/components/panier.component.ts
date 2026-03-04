import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PanierService, PanierDto, LignePanierDto } from '../services/panier.service';

@Component({
  selector: 'app-panier',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="cart-page">
      <div class="cart-header">
        <h1 class="cart-title">Mon Panier</h1>
        @if (panier && panier.lignes.length > 0) {
          <span class="cart-count">{{ panier.totalItems }} article{{ panier.totalItems > 1 ? 's' : '' }}</span>
        }
      </div>

      @if (loading) {
        <div class="cart-loading">
          <div class="spinner"></div>
          <p>Chargement du panier...</p>
        </div>
      } @else if (!panier || panier.lignes.length === 0) {
        <div class="cart-empty">
          <svg width="80" height="80" fill="none" stroke="#ccc" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <h2>Votre panier est vide</h2>
          <p>Parcourez notre marketplace et ajoutez des produits</p>
          <a routerLink="/marketplace" class="btn-discover">Découvrir les produits</a>
        </div>
      } @else {
        <div class="cart-content">
          <!-- Items -->
          <div class="cart-items">
            @for (item of panier.lignes; track item.id) {
              <div class="cart-item">
                <img [src]="item.produitImage || '/assets/placeholder.png'" [alt]="item.produitNom" class="item-img" />
                <div class="item-details">
                  <h3 class="item-name">{{ item.produitNom }}</h3>
                  <p class="item-price-unit">
                    @if (item.prixPromo) {
                      <span class="price-promo">{{ item.prixPromo | number:'1.2-2' }} MAD</span>
                      <span class="price-original">{{ item.prix | number:'1.2-2' }} MAD</span>
                    } @else {
                      <span class="price-promo">{{ item.prix | number:'1.2-2' }} MAD</span>
                    }
                  </p>
                  <p class="item-stock" [class.low-stock]="item.stockDisponible <= 3">
                    {{ item.stockDisponible }} en stock
                  </p>
                </div>
                <div class="item-qty">
                  <button class="qty-btn" (click)="decrement(item)" [disabled]="item.quantite <= 1">−</button>
                  <span class="qty-val">{{ item.quantite }}</span>
                  <button class="qty-btn" (click)="increment(item)" [disabled]="item.quantite >= item.stockDisponible">+</button>
                </div>
                <div class="item-subtotal">
                  <span class="subtotal-label">Sous-total</span>
                  <span class="subtotal-value">{{ item.sousTotal | number:'1.2-2' }} MAD</span>
                </div>
                <button class="item-remove" (click)="removeItem(item)">
                  <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            }
            <div class="cart-item-actions">
              <a routerLink="/marketplace" class="link-continue">← Continuer les achats</a>
              <button class="btn-clear" (click)="clearCart()">Vider le panier</button>
            </div>
          </div>

          <!-- Summary -->
          <div class="cart-summary">
            <div class="summary-card">
              <h3 class="summary-title">Résumé de la commande</h3>
              <div class="summary-row"><span>Sous-total</span><span>{{ panier.totalAmount | number:'1.2-2' }} MAD</span></div>
              <div class="summary-row">
                <span>Livraison</span>
                <span class="shipping-value">{{ shippingCost === 0 ? 'Gratuite ✓' : (shippingCost | number:'1.2-2') + ' MAD' }}</span>
              </div>
              @if (shippingCost > 0) {
                <p class="shipping-hint">Livraison gratuite à partir de 100 MAD</p>
              }
              <div class="summary-divider"></div>
              <div class="summary-row summary-total"><span>Total</span><span>{{ totalWithShipping | number:'1.2-2' }} MAD</span></div>
              <a routerLink="/checkout" class="btn-checkout">Passer la commande</a>
              <p class="payment-hint">💰 Paiement à la livraison</p>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .cart-page { max-width: 1200px; margin: 0 auto; padding: 32px 24px; min-height: 80vh; }
    .cart-header { display: flex; align-items: baseline; gap: 12px; margin-bottom: 28px; }
    .cart-title { font-size: 1.8rem; font-weight: 900; color: #1a1a1a; margin: 0; }
    .cart-count { font-size: 0.95rem; color: #666; font-weight: 600; }

    .cart-loading { text-align: center; padding: 80px 0; color: #999; }
    .spinner {
      width: 40px; height: 40px; border: 3px solid #f0f0f0;
      border-top-color: #1aafa5; border-radius: 50%;
      animation: spin 0.8s linear infinite; margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .cart-empty {
      text-align: center; padding: 80px 24px; color: #999;
      display: flex; flex-direction: column; align-items: center; gap: 8px;
    }
    .cart-empty h2 { color: #333; font-size: 1.3rem; margin: 12px 0 0; }
    .cart-empty p { font-size: 0.9rem; margin: 0 0 20px; }
    .btn-discover {
      background: linear-gradient(135deg, #1aafa5, #0f766e); color: white;
      padding: 12px 32px; border-radius: 10px; text-decoration: none;
      font-weight: 700; font-size: 0.9rem; transition: 0.2s;
    }
    .btn-discover:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(26,175,165,0.3); }

    .cart-content { display: grid; grid-template-columns: 1fr 360px; gap: 28px; align-items: start; }

    .cart-items { display: flex; flex-direction: column; gap: 12px; }
    .cart-item {
      display: flex; align-items: center; gap: 16px;
      padding: 16px 20px; background: #fff; border-radius: 14px;
      border: 1px solid #f0f0f0; transition: 0.15s;
    }
    .cart-item:hover { border-color: #e0e0e0; box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
    .item-img { width: 80px; height: 80px; border-radius: 10px; object-fit: cover; flex-shrink: 0; }
    .item-details { flex: 1; min-width: 0; }
    .item-name {
      font-size: 0.9rem; font-weight: 700; color: #1a1a1a; margin: 0 0 4px;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .item-price-unit { margin: 0 0 2px; font-size: 0.82rem; }
    .price-promo { color: #E8272C; font-weight: 700; }
    .price-original { text-decoration: line-through; color: #999; margin-left: 6px; font-size: 0.78rem; }
    .item-stock { font-size: 0.75rem; color: #999; margin: 0; }
    .item-stock.low-stock { color: #E8272C; }

    .item-qty {
      display: flex; align-items: center; gap: 8px;
      background: #f8f8f8; border-radius: 8px; padding: 4px;
    }
    .qty-btn {
      width: 32px; height: 32px; border-radius: 6px;
      border: 1px solid #e0e0e0; background: #fff; cursor: pointer;
      font-size: 1rem; font-weight: 700; color: #333; transition: 0.15s;
      display: flex; align-items: center; justify-content: center;
    }
    .qty-btn:hover:not(:disabled) { border-color: #1aafa5; color: #1aafa5; }
    .qty-btn:disabled { opacity: 0.3; cursor: default; }
    .qty-val { font-size: 0.9rem; font-weight: 800; min-width: 28px; text-align: center; }

    .item-subtotal { text-align: right; min-width: 100px; }
    .subtotal-label { display: block; font-size: 0.7rem; color: #999; text-transform: uppercase; letter-spacing: 0.03em; }
    .subtotal-value { font-size: 1rem; font-weight: 800; color: #E8272C; }

    .item-remove {
      background: none; border: none; cursor: pointer; color: #ccc;
      padding: 6px; border-radius: 6px; transition: 0.15s;
    }
    .item-remove:hover { color: #E8272C; background: #fff5f5; }

    .cart-item-actions {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 0;
    }
    .link-continue { color: #1aafa5; font-weight: 600; font-size: 0.85rem; text-decoration: none; }
    .link-continue:hover { text-decoration: underline; }
    .btn-clear {
      background: none; border: 1px solid #fecaca; color: #E8272C;
      padding: 8px 16px; border-radius: 8px; font-size: 0.8rem;
      font-weight: 600; cursor: pointer; transition: 0.15s;
    }
    .btn-clear:hover { background: #fef2f2; }

    .summary-card {
      background: #fff; border: 1px solid #f0f0f0; border-radius: 16px;
      padding: 24px; position: sticky; top: 100px;
    }
    .summary-title { font-size: 1rem; font-weight: 800; color: #1a1a1a; margin: 0 0 20px; }
    .summary-row {
      display: flex; justify-content: space-between;
      font-size: 0.88rem; color: #555; margin-bottom: 10px;
    }
    .shipping-value { color: #16a34a; font-weight: 600; }
    .shipping-hint { font-size: 0.75rem; color: #999; margin: 0 0 8px; font-style: italic; }
    .summary-divider { border-top: 1px dashed #e0e0e0; margin: 8px 0 12px; }
    .summary-total { font-size: 1.1rem; font-weight: 900; color: #1a1a1a; margin-bottom: 20px; }
    .btn-checkout {
      display: block; width: 100%; text-align: center;
      padding: 14px; border-radius: 10px;
      background: linear-gradient(135deg, #FF6B35, #e55a2b);
      color: white; font-weight: 800; font-size: 0.95rem;
      text-decoration: none; transition: 0.2s; border: none;
    }
    .btn-checkout:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(255,107,53,0.35); }
    .payment-hint { text-align: center; font-size: 0.78rem; color: #999; margin: 12px 0 0; }

    @media (max-width: 900px) {
      .cart-content { grid-template-columns: 1fr; }
      .summary-card { position: static; }
    }
    @media (max-width: 600px) {
      .cart-item { flex-wrap: wrap; }
      .item-subtotal { min-width: auto; }
    }
  `]
})
export class PanierComponent implements OnInit {
  panier: PanierDto | null = null;
  loading = true;

  constructor(private panierService: PanierService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.panierService.panier$.subscribe(p => {
      this.panier = p;
      if (p !== null) this.loading = false;
      this.cdr.detectChanges();
    });
    this.panierService.loadPanier().subscribe(() => {
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  get shippingCost(): number {
    if (!this.panier) return 0;
    return this.panier.totalAmount >= 100 ? 0 : 30;
  }

  get totalWithShipping(): number {
    if (!this.panier) return 0;
    return this.panier.totalAmount + this.shippingCost;
  }

  increment(item: LignePanierDto): void {
    this.panierService.updateQuantite(item.produitId, item.quantite + 1).subscribe();
  }

  decrement(item: LignePanierDto): void {
    if (item.quantite > 1) {
      this.panierService.updateQuantite(item.produitId, item.quantite - 1).subscribe();
    }
  }

  removeItem(item: LignePanierDto): void {
    this.panierService.removeItem(item.produitId).subscribe();
  }

  clearCart(): void {
    if (confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
      this.panierService.clearCart().subscribe();
    }
  }
}
