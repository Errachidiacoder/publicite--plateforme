import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../services/wishlist.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="wishlist-page">
      <div class="page-header">
        <div class="container">
          <h1>Mes <span>Favoris</span></h1>
          <p>Retrouvez ici toutes les annonces que vous avez sauvegardées.</p>
        </div>
      </div>

      <div class="container main-content">
        <div class="empty-state" *ngIf="favorites.length === 0 && !loading">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="80" height="80"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </div>
          <h2>Votre liste est vide</h2>
          <p>Vous n'avez pas encore ajouté d'annonces à vos favoris.</p>
          <a routerLink="/home" class="btn-discover">Découvrir les offres</a>
        </div>

        <div class="products-grid" *ngIf="favorites.length > 0">
          <div class="product-card" *ngFor="let product of favorites">
            <div class="card-img" [routerLink]="['/product', product.id]">
              <img [src]="getMainImage(product)" [alt]="product.titreProduit">
              <div class="premium-badge" *ngIf="product.annoncePremium">Premium</div>
              <button class="remove-btn" (click)="toggleFavorite($event, product.id)" title="Retirer des favoris">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div class="card-body">
              <div class="cat-tag">{{ product.categorie?.nomCategorie }}</div>
              <h3 class="p-title" [routerLink]="['/product', product.id]">{{ product.titreProduit }}</h3>
              <div class="p-location">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="12" height="12" style="margin-right: 4px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                {{ product.villeLocalisation }}
              </div>
              
              <div class="card-footer">
                <div class="p-price">{{ product.prixAfiche.toLocaleString() }} <span>DH</span></div>
                <button class="btn-view" [routerLink]="['/product', product.id]">Détails</button>
              </div>
            </div>
          </div>
        </div>

        <div class="loader" *ngIf="loading">
          <div class="spinner"></div>
          <p>Chargement de vos favoris...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .wishlist-page { background: #f8fafc; min-height: 100vh; padding-bottom: 80px; }
    .container { max-width: 1300px; margin: 0 auto; padding: 0 30px; }

    .page-header { background: white; padding: 60px 0; border-bottom: 1px solid #e2e8f0; margin-bottom: 50px; text-align: center; }
    .page-header h1 { font-size: 3rem; font-weight: 900; color: #1e293b; margin-bottom: 15px; }
    .page-header h1 span { color: #4db6ac; }
    .page-header p { color: #64748b; font-size: 1.2rem; }

    .empty-state { text-align: center; padding: 80px 0; background: white; border-radius: 32px; border: 2px dashed #e2e8f0; }
    .empty-icon { font-size: 5rem; margin-bottom: 20px; filter: grayscale(1); opacity: 0.3; }
    .empty-state h2 { font-size: 1.8rem; font-weight: 800; color: #1e293b; margin-bottom: 10px; }
    .empty-state p { color: #64748b; margin-bottom: 30px; }
    .btn-discover { background: #4db6ac; color: white; padding: 15px 35px; border-radius: 12px; font-weight: 700; text-decoration: none; transition: 0.3s; display: inline-block; }
    .btn-discover:hover { background: #00897b; transform: translateY(-3px); box-shadow: 0 10px 20px rgba(77, 182, 172, 0.2); }

    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px; }
    
    .product-card { background: white; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0; transition: 0.3s; position: relative; }
    .product-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,0.06); }
    
    .card-img { height: 220px; position: relative; cursor: pointer; background: #f8fafc; }
    .card-img img { width: 100%; height: 100%; object-fit: cover; }
    
    .premium-badge { position: absolute; top: 15px; left: 15px; background: #1e293b; color: white; padding: 5px 12px; border-radius: 6px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
    
    .remove-btn { position: absolute; top: 15px; right: 15px; width: 35px; height: 35px; background: rgba(255,255,255,0.9); border: none; border-radius: 50%; color: #dc2626; font-weight: bold; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; }
    .remove-btn:hover { background: #dc2626; color: white; transform: rotate(90deg); }

    .card-body { padding: 25px; }
    .cat-tag { color: #4db6ac; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    .p-title { font-size: 1.25rem; font-weight: 800; color: #1e293b; margin-bottom: 10px; cursor: pointer; transition: 0.2s; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .p-title:hover { color: #4db6ac; }
    .p-location { font-size: 0.85rem; color: #64748b; margin-bottom: 20px; font-weight: 600; }

    .card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 20px; border-top: 1px solid #f1f5f9; }
    .p-price { font-size: 1.5rem; font-weight: 900; color: #1e293b; }
    .p-price span { font-size: 0.9rem; font-weight: 800; }
    
    .btn-view { border: 1.5px solid #e2e8f0; background: transparent; padding: 8px 18px; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.3s; }
    .btn-view:hover { background: #f1f5f9; border-color: #4db6ac; color: #4db6ac; }

    .loader { text-align: center; padding: 100px 0; }
    .spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #4db6ac; border-radius: 50%; animation: spin 1s infinite linear; margin: 0 auto 20px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class WishlistComponent implements OnInit {
  private wishlistService = inject(WishlistService);

  favorites: any[] = [];
  loading = true;

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    this.loading = true;
    this.wishlistService.getFavorites().subscribe({
      next: (res) => {
        this.favorites = res;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  toggleFavorite(event: Event, productId: number) {
    event.stopPropagation();
    this.wishlistService.toggleFavorite(productId).subscribe(() => {
      this.favorites = this.favorites.filter(p => p.id !== productId);
    });
  }

  getMainImage(product: any): string {
    if (product.mediaProduits && product.mediaProduits.length > 0) {
      return product.mediaProduits[0].urlMedia;
    }
    return 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&fit=crop';
  }
}
