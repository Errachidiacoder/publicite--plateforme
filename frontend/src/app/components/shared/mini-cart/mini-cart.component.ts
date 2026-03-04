import { Component, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PanierService, PanierDto, LignePanierDto } from '../../../services/panier.service';

@Component({
  selector: 'app-mini-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (isOpen) {
      <div class="mc-overlay" (click)="close.emit()"></div>
      <div class="mc-sidebar" [class.mc-open]="isOpen">
        <!-- Header -->
        <div class="mc-header">
          <h3 class="mc-title">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Mon Panier
            @if (panier && panier.totalItems > 0) {
              <span class="mc-count">({{ panier.totalItems }})</span>
            }
          </h3>
          <button class="mc-close" (click)="close.emit()">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Items -->
        @if (panier && panier.lignes.length > 0) {
          <div class="mc-items">
            @for (item of panier.lignes; track item.id) {
              <div class="mc-item">
                <img [src]="item.produitImage || '/assets/placeholder.png'" [alt]="item.produitNom" class="mc-item-img" />
                <div class="mc-item-info">
                  <p class="mc-item-name">{{ item.produitNom }}</p>
                  <div class="mc-item-qty">
                    <button class="mc-qty-btn" (click)="decrementItem(item)" [disabled]="item.quantite <= 1">−</button>
                    <span class="mc-qty-val">{{ item.quantite }}</span>
                    <button class="mc-qty-btn" (click)="incrementItem(item)" [disabled]="item.quantite >= item.stockDisponible">+</button>
                  </div>
                  <p class="mc-item-price">{{ item.sousTotal | number:'1.2-2' }} MAD</p>
                </div>
                <button class="mc-item-remove" (click)="removeItem(item)">
                  <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            }
          </div>

          <!-- Summary -->
          <div class="mc-summary">
            <div class="mc-row"><span>Sous-total</span><span>{{ panier.totalAmount | number:'1.2-2' }} MAD</span></div>
            <div class="mc-row"><span>Livraison</span><span class="mc-shipping">{{ shippingCost === 0 ? 'Gratuite' : (shippingCost | number:'1.2-2') + ' MAD' }}</span></div>
            <div class="mc-divider"></div>
            <div class="mc-row mc-total"><span>Total</span><span>{{ totalWithShipping | number:'1.2-2' }} MAD</span></div>
          </div>

          <!-- Actions -->
          <div class="mc-actions">
            <a routerLink="/checkout" class="mc-btn mc-btn-primary" (click)="close.emit()">Passer la commande</a>
            <a routerLink="/panier" class="mc-btn mc-btn-outline" (click)="close.emit()">Voir le panier</a>
          </div>
        } @else {
          <!-- Empty state -->
          <div class="mc-empty">
            <svg width="64" height="64" fill="none" stroke="#ccc" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            <h4>Votre panier est vide</h4>
            <p>Découvrez nos produits et ajoutez-les à votre panier</p>
            <a routerLink="/marketplace" class="mc-btn mc-btn-primary" (click)="close.emit()">Découvrir les produits</a>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .mc-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.4);
      backdrop-filter: blur(2px); z-index: 9998;
    }
    .mc-sidebar {
      position: fixed; top: 0; right: -420px; width: 400px; max-width: 90vw;
      height: 100vh; background: #fff; z-index: 9999;
      display: flex; flex-direction: column;
      box-shadow: -8px 0 32px rgba(0,0,0,0.15);
      transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .mc-sidebar.mc-open { right: 0; }
    .mc-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 20px 24px; border-bottom: 1px solid #f0f0f0;
    }
    .mc-title {
      display: flex; align-items: center; gap: 8px;
      font-size: 1.1rem; font-weight: 800; color: #1a1a1a; margin: 0;
    }
    .mc-count { color: #666; font-weight: 600; }
    .mc-close {
      background: none; border: none; cursor: pointer; color: #999;
      padding: 4px; border-radius: 6px; transition: 0.15s;
    }
    .mc-close:hover { background: #f5f5f5; color: #333; }

    .mc-items {
      flex: 1; overflow-y: auto; padding: 16px 24px;
      display: flex; flex-direction: column; gap: 16px;
    }
    .mc-item {
      display: flex; align-items: center; gap: 12px;
      padding: 12px; border-radius: 12px; background: #fafafa;
      position: relative;
    }
    .mc-item-img {
      width: 64px; height: 64px; border-radius: 8px;
      object-fit: cover; flex-shrink: 0;
    }
    .mc-item-info { flex: 1; min-width: 0; }
    .mc-item-name {
      font-size: 0.85rem; font-weight: 600; color: #333;
      margin: 0 0 6px; line-height: 1.3;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .mc-item-qty { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .mc-qty-btn {
      width: 24px; height: 24px; border-radius: 6px;
      border: 1px solid #ddd; background: #fff; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.85rem; font-weight: 700; color: #333;
      transition: 0.15s;
    }
    .mc-qty-btn:hover:not(:disabled) { border-color: #1aafa5; color: #1aafa5; }
    .mc-qty-btn:disabled { opacity: 0.3; cursor: default; }
    .mc-qty-val { font-size: 0.85rem; font-weight: 700; color: #1a1a1a; min-width: 20px; text-align: center; }
    .mc-item-price { font-size: 0.9rem; font-weight: 800; color: #E8272C; margin: 0; }
    .mc-item-remove {
      position: absolute; top: 8px; right: 8px;
      background: none; border: none; cursor: pointer; color: #bbb;
      padding: 2px; transition: 0.15s;
    }
    .mc-item-remove:hover { color: #E8272C; }

    .mc-summary {
      padding: 16px 24px; border-top: 1px solid #f0f0f0;
      display: flex; flex-direction: column; gap: 8px;
    }
    .mc-row {
      display: flex; justify-content: space-between;
      font-size: 0.85rem; color: #666;
    }
    .mc-shipping { color: #16a34a; font-weight: 600; }
    .mc-divider { border-top: 1px dashed #e0e0e0; margin: 4px 0; }
    .mc-total { font-size: 1rem; font-weight: 800; color: #1a1a1a; }

    .mc-actions {
      padding: 16px 24px 24px;
      display: flex; flex-direction: column; gap: 10px;
    }
    .mc-btn {
      display: block; text-align: center; padding: 14px;
      border-radius: 10px; font-weight: 700; font-size: 0.9rem;
      text-decoration: none; cursor: pointer; transition: 0.2s;
    }
    .mc-btn-primary {
      background: linear-gradient(135deg, #FF69B4, #ff4da6);
      color: white; border: none;
    }
    .mc-btn-primary:hover { background: linear-gradient(135deg, #ff4da6, #e83e8c); transform: translateY(-1px); }
    .mc-btn-outline {
      background: transparent; color: #666;
      border: 1.5px solid #e0e0e0;
    }
    .mc-btn-outline:hover { border-color: #1aafa5; color: #1aafa5; }

    .mc-empty {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 48px 24px; text-align: center; gap: 12px;
    }
    .mc-empty h4 { font-size: 1.1rem; color: #333; margin: 8px 0 0; }
    .mc-empty p { font-size: 0.85rem; color: #999; margin: 0 0 16px; }
  `]
})
export class MiniCartComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  panier: PanierDto | null = null;

  constructor(private panierService: PanierService, private cdr: ChangeDetectorRef) {
    this.panierService.panier$.subscribe(p => { this.panier = p; this.cdr.detectChanges(); });
  }

  get shippingCost(): number {
    if (!this.panier) return 0;
    return this.panier.totalAmount >= 100 ? 0 : 30;
  }

  get totalWithShipping(): number {
    if (!this.panier) return 0;
    return this.panier.totalAmount + this.shippingCost;
  }

  incrementItem(item: LignePanierDto): void {
    this.panierService.updateQuantite(item.produitId, item.quantite + 1).subscribe();
  }

  decrementItem(item: LignePanierDto): void {
    if (item.quantite > 1) {
      this.panierService.updateQuantite(item.produitId, item.quantite - 1).subscribe();
    }
  }

  removeItem(item: LignePanierDto): void {
    this.panierService.removeItem(item.produitId).subscribe();
  }
}
