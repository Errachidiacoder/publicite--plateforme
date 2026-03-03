import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MarketProductService } from '../../services/market-product.service';
import { ProductCardComponent } from '../shared/product-card/product-card.component';
import { SkeletonCardComponent } from '../shared/skeleton-card/skeleton-card.component';
import { ProduitResponseDto, PageResponse } from '../../models/produit.model';

@Component({
  selector: 'app-category-products',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, SkeletonCardComponent],
  template: `
    <div class="cat-page">
      <div class="cat-header">
        <div class="cat-header-inner">
          <nav class="cat-breadcrumb">
            <a routerLink="/marketplace">Marketplace</a>
            <span>›</span>
            <span>{{ categorySlug }}</span>
          </nav>
          <h1 class="cat-title">{{ categorySlug | titlecase }}</h1>
        </div>
      </div>

      <div class="cat-container">
        @if (loading) {
          <div class="cat-grid">
            @for (i of skeletons; track $index) {
              <app-skeleton-card />
            }
          </div>
        } @else if (products.length === 0) {
          <div class="cat-empty">
            <h3>Aucun produit dans cette catégorie</h3>
            <p>Revenez bientôt, de nouveaux produits sont ajoutés régulièrement</p>
            <a routerLink="/marketplace" class="cat-back-btn">← Retour au marketplace</a>
          </div>
        } @else {
          <div class="cat-grid">
            @for (p of products; track p.id) {
              <app-product-card [product]="p" />
            }
          </div>

          @if (totalPages > 1) {
            <div class="cat-pagination">
              <button [disabled]="currentPage === 0" (click)="goToPage(currentPage - 1)">← Précédent</button>
              <span>Page {{ currentPage + 1 }} / {{ totalPages }}</span>
              <button [disabled]="currentPage >= totalPages - 1" (click)="goToPage(currentPage + 1)">Suivant →</button>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .cat-page { min-height: 100vh; background: var(--sb-bg, #f8fafc); }
    .cat-header { background: var(--sb-bg-elevated, #fff); border-bottom: 1px solid var(--sb-border-light, #f1f5f9); padding: 24px; }
    .cat-header-inner { max-width: 1320px; margin: 0 auto; }
    .cat-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--sb-text-muted, #94a3b8); margin-bottom: 8px; }
    .cat-breadcrumb a { color: var(--sb-primary, #1aafa5); text-decoration: none; font-weight: 600; }
    .cat-title { font-size: 1.6rem; font-weight: 900; color: var(--sb-text, #1e293b); margin: 0; }
    .cat-container { max-width: 1320px; margin: 0 auto; padding: 24px; }
    .cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
    .cat-empty { text-align: center; padding: 64px 24px; }
    .cat-empty h3 { font-size: 1.1rem; color: var(--sb-text, #1e293b); margin: 0 0 8px; }
    .cat-empty p { color: var(--sb-text-muted, #94a3b8); margin: 0 0 20px; }
    .cat-back-btn { color: var(--sb-primary, #1aafa5); font-weight: 700; text-decoration: none; font-size: 0.88rem; }
    .cat-pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 32px; }
    .cat-pagination button {
      padding: 8px 16px; border-radius: 8px; border: 1px solid var(--sb-border, #e2e8f0);
      background: var(--sb-bg-elevated, #fff); color: var(--sb-text, #1e293b);
      font-weight: 600; font-size: 0.82rem; cursor: pointer;
    }
    .cat-pagination button:disabled { opacity: 0.4; cursor: default; }
    .cat-pagination span { font-size: 0.85rem; color: var(--sb-text-secondary, #64748b); font-weight: 600; }
  `]
})
export class CategoryProductsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(MarketProductService);
  private cdr = inject(ChangeDetectorRef);

  categorySlug = '';
  products: ProduitResponseDto[] = [];
  loading = true;
  currentPage = 0;
  totalPages = 0;
  skeletons = Array(8).fill(0);

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.categorySlug = params['slug'];
      this.currentPage = 0;
      this.loadProducts();
    });
  }

  loadProducts() {
    this.loading = true;
    this.productService.getProductsByCategory(this.categorySlug, this.currentPage).subscribe({
      next: (page: PageResponse<ProduitResponseDto>) => {
        this.products = page.content;
        this.totalPages = page.totalPages;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.products = [];
        this.cdr.detectChanges();
      }
    });
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
