import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-panier',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <section class="section">
        <h1 class="page-title">🛒 Mon Panier</h1>

        @if (loading) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Chargement du panier...</p>
          </div>
        } @else if (!panier || panier.lignes?.length === 0) {
          <div class="empty-cart">
            <span class="empty-icon">🛒</span>
            <h3>Votre panier est vide</h3>
            <p>Explorez nos produits et ajoutez vos favoris au panier !</p>
            <a routerLink="/home" class="btn btn-primary btn-lg">Continuer mes achats</a>
          </div>
        } @else {
          <div class="cart-layout">
            <div class="cart-items">
              @for (ligne of panier.lignes; track ligne.produit?.id) {
                <div class="cart-item">
                  <div class="item-img">
                    <img [src]="ligne.produit?.mediaProduits?.[0]?.urlMedia || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&fit=crop'"
                         [alt]="ligne.produit?.titreProduit">
                  </div>
                  <div class="item-info">
                    <h3 class="item-name">{{ ligne.produit?.titreProduit }}</h3>
                    <p class="item-location">📍 {{ ligne.produit?.villeLocalisation || 'Maroc' }}</p>
                  </div>
                  <div class="item-qty">
                    <button class="qty-btn" (click)="updateQty(ligne.produit?.id, ligne.quantite - 1)">−</button>
                    <span class="qty-value">{{ ligne.quantite }}</span>
                    <button class="qty-btn" (click)="updateQty(ligne.produit?.id, ligne.quantite + 1)">+</button>
                  </div>
                  <div class="item-price">
                    {{ (ligne.sousTotal || 0).toLocaleString() }} DH
                  </div>
                  <button class="item-remove" (click)="removeItem(ligne.produit?.id)">🗑️</button>
                </div>
              }
            </div>

            <div class="cart-summary">
              <div class="summary-card">
                <h3>Récapitulatif</h3>
                <div class="summary-line">
                  <span>Sous-total</span>
                  <span>{{ getTotal().toLocaleString() }} DH</span>
                </div>
                <div class="summary-line">
                  <span>Livraison</span>
                  <span class="text-success">Gratuite</span>
                </div>
                <div class="summary-divider"></div>
                <div class="summary-line total">
                  <span>Total</span>
                  <span>{{ getTotal().toLocaleString() }} DH</span>
                </div>
                <button class="btn btn-primary btn-full btn-lg" (click)="passerCommande()">
                  Passer la commande
                </button>
                <a routerLink="/home" class="btn btn-secondary btn-full">Continuer mes achats</a>
              </div>
            </div>
          </div>
        }
      </section>
    </div>
  `,
  styles: [`
    .page-title { font-family: 'Outfit',sans-serif; font-size: 1.8rem; font-weight: 800; margin-bottom: 32px; color: var(--sb-text); }

    .loading-state, .empty-cart { text-align: center; padding: 80px 20px; }
    .empty-icon { font-size: 4rem; display: block; margin-bottom: 16px; }
    .empty-cart h3 { font-size: 1.4rem; color: var(--sb-text); margin-bottom: 8px; }
    .empty-cart p { color: var(--sb-text-secondary); margin-bottom: 24px; }

    .cart-layout { display: grid; grid-template-columns: 1fr 380px; gap: 32px; align-items: start; }

    .cart-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: var(--sb-bg-elevated);
      border: 1px solid var(--sb-border);
      border-radius: var(--sb-radius-lg);
      margin-bottom: 12px;
      transition: var(--sb-transition);
    }
    .cart-item:hover { box-shadow: var(--sb-shadow-sm); }
    .item-img { width: 80px; height: 80px; border-radius: var(--sb-radius-md); overflow: hidden; flex-shrink: 0; }
    .item-img img { width: 100%; height: 100%; object-fit: cover; }
    .item-info { flex: 1; }
    .item-name { font-size: 0.95rem; font-weight: 600; color: var(--sb-text); margin-bottom: 4px; }
    .item-location { font-size: 0.78rem; color: var(--sb-text-muted); }

    .item-qty { display: flex; align-items: center; gap: 8px; }
    .qty-btn {
      width: 32px; height: 32px;
      border-radius: 8px;
      border: 1px solid var(--sb-border);
      background: var(--sb-bg);
      color: var(--sb-text);
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: 0.2s;
    }
    .qty-btn:hover { border-color: var(--sb-primary); color: var(--sb-primary); }
    .qty-value { font-weight: 700; font-size: 0.95rem; min-width: 24px; text-align: center; color: var(--sb-text); }

    .item-price { font-weight: 800; font-size: 1rem; color: var(--sb-primary); min-width: 100px; text-align: right; }
    .item-remove {
      background: none; border: none; cursor: pointer; font-size: 1.1rem; padding: 8px;
      border-radius: 8px; transition: 0.2s;
    }
    .item-remove:hover { background: rgba(239,68,68,0.1); }

    .summary-card {
      background: var(--sb-bg-elevated);
      border: 1px solid var(--sb-border);
      border-radius: var(--sb-radius-xl);
      padding: 28px;
      position: sticky;
      top: calc(var(--sb-nav-height) + 20px);
    }
    .summary-card h3 { font-size: 1.1rem; font-weight: 800; margin-bottom: 20px; color: var(--sb-text); }
    .summary-line { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.9rem; color: var(--sb-text-secondary); }
    .summary-line.total { font-weight: 800; font-size: 1.15rem; color: var(--sb-text); }
    .text-success { color: var(--sb-success); font-weight: 600; }
    .summary-divider { height: 1px; background: var(--sb-border); margin: 16px 0; }
    .btn-full { width: 100%; margin-top: 12px; }

    @media (max-width: 768px) {
      .cart-layout { grid-template-columns: 1fr; }
      .cart-item { flex-wrap: wrap; }
      .item-price { width: 100%; text-align: left; margin-top: 8px; }
    }
  `]
})
export class PanierComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private router = inject(Router);
  private apiUrl = 'http://localhost:8081/api/v1/panier';

  panier: any = null;
  loading = true;

  ngOnInit() { this.loadPanier(); }

  loadPanier() {
    this.loading = true;
    this.http.get(this.apiUrl).subscribe({
      next: (data: any) => { this.panier = data; this.loading = false; },
      error: () => { this.panier = { lignes: [] }; this.loading = false; }
    });
  }

  updateQty(produitId: number, qty: number) {
    if (qty <= 0) { this.removeItem(produitId); return; }
    this.http.put(`${this.apiUrl}/modifier`, { produitId, quantite: qty }).subscribe({
      next: (data: any) => this.panier = data
    });
  }

  removeItem(produitId: number) {
    this.http.delete(`${this.apiUrl}/supprimer/${produitId}`).subscribe({
      next: (data: any) => this.panier = data
    });
  }

  getTotal(): number {
    if (!this.panier?.lignes) return 0;
    return this.panier.lignes.reduce((sum: number, l: any) => sum + (l.sousTotal || 0), 0);
  }

  passerCommande() {
    this.router.navigate(['/checkout']);
  }
}
