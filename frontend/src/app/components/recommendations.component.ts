import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecommandationService, ProduitRecommande } from '../services/recommandation.service';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-recommendations',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <div class="recommendations-container" *ngIf="products.length > 0 || loading">
      <div class="header">
        <h2 class="title">
          {{ getTitle() }}
          <span class="ai-badge" *ngIf="mode !== 'popular'">🤖 IA</span>
        </h2>
        <p class="subtitle">{{ getSubtitle() }}</p>
      </div>

      <div *ngIf="loading" class="loader-container">
        <div class="loader"></div>
        <p>Analyse des meilleures opportunités...</p>
      </div>

      <div *ngIf="!loading" class="products-grid">
        <div class="product-card" *ngFor="let p of products" [routerLink]="['/product', p.id]">
          <div class="image-container">
            <img [src]="p.imageUrl || 'assets/default-product.png'" [alt]="p.name">
            <div class="premium-badge" *ngIf="p.premium">Premium</div>
            <div class="category-badge">{{ p.categoryName }}</div>
          </div>
          <div class="content">
            <h3 class="product-name">{{ p.name }}</h3>
            <p class="product-desc">{{ p.description | slice:0:60 }}...</p>
            <div class="footer">
              <span class="price">{{ p.price | currency:'EUR' }}</span>
              <span class="views">👁️ {{ p.viewCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .recommendations-container { padding: 40px 20px; max-width: 1200px; margin: 0 auto; }
    .header { margin-bottom: 30px; }
    .title { font-size: 24px; font-weight: 700; color: #1a1a1a; display: flex; align-items: center; gap: 10px; margin: 0; }
    .ai-badge { background: linear-gradient(135deg, #6366f1, #a855f7); color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
    .subtitle { color: #666; margin-top: 5px; }
    
    .loader-container { display: flex; flex-direction: column; align-items: center; padding: 40px; color: #6366f1; }
    .loader { border: 4px solid #f3f3f3; border-top: 4px solid #6366f1; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 15px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
    .product-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; border: 1px solid #f0f0f0; }
    .product-card:hover { transform: translateY(-5px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
    
    .image-container { position: relative; height: 180px; }
    .image-container img { width: 100%; height: 100%; object-fit: cover; }
    .premium-badge { position: absolute; top: 10px; right: 10px; background: #fbbf24; color: #000; font-weight: 600; padding: 4px 10px; border-radius: 8px; font-size: 11px; }
    .category-badge { position: absolute; bottom: 10px; left: 10px; background: rgba(0,0,0,0.6); color: white; padding: 2px 8px; border-radius: 6px; font-size: 11px; backdrop-filter: blur(4px); }
    
    .content { padding: 15px; }
    .product-name { font-size: 16px; font-weight: 600; margin: 0 0 5px 0; color: #1f2937; }
    .product-desc { font-size: 13px; color: #6b7280; margin-bottom: 15px; }
    .footer { display: flex; justify-content: space-between; align-items: center; }
    .price { font-weight: 700; color: #059669; font-size: 18px; }
    .views { font-size: 12px; color: #9ca3af; }
  `]
})
export class RecommendationsComponent implements OnInit {
    @Input() mode: 'similar' | 'popular' | 'personalized' = 'popular';
    @Input() productId?: number;

    private service = inject(RecommandationService);
    products: ProduitRecommande[] = [];
    loading = true;

    ngOnInit(): void {
        this.loadRecommendations();
    }

    loadRecommendations(): void {
        this.loading = true;
        let obs$;

        if (this.mode === 'similar' && this.productId) {
            obs$ = this.service.getSimilarProducts(this.productId);
        } else if (this.mode === 'personalized') {
            obs$ = this.service.getPersonalizedProducts();
        } else {
            obs$ = this.service.getPopularProducts(this.mode === 'popular' ? 8 : 4);
        }

        obs$.subscribe({
            next: (data) => {
                this.products = data;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    getTitle(): string {
        switch (this.mode) {
            case 'similar': return 'Produits similaires';
            case 'personalized': return 'Spécialement pour vous';
            default: return 'Produits populaires';
        }
    }

    getSubtitle(): string {
        switch (this.mode) {
            case 'similar': return 'D\'autres annonces qui pourraient vous intéresser';
            case 'personalized': return 'Basé sur votre navigation récente';
            default: return 'Les annonces les plus consultées en ce moment';
        }
    }
}
