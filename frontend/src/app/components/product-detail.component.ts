import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProduitService } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="detail-page" *ngIf="product; else loadingTpl">
      <div class="container">
        <!-- HEADER / NAVIGATION -->
        <nav class="breadcrumb-modern">
          <a routerLink="/home">Accueil</a>
          <span class="sep">/</span>
          <a href="#">{{ product.categorie?.nomCategorie }}</a>
          <span class="sep">/</span>
          <span class="current">{{ product.titreProduit }}</span>
        </nav>

        <div class="product-layout">
          <!-- LEFT: GALLERY -->
          <div class="gallery-section">
            <div class="main-stage">
              <img [src]="selectedImg || defaultImg" [alt]="product.titreProduit" class="main-img">
              <div class="premium-tag" *ngIf="product.annoncePremium">Annonce Premium</div>
              <button class="favorite-btn" [class.active]="isFavorited" (click)="toggleFavorite()" title="Ajouter aux favoris">
                <svg viewBox="0 0 24 24" [attr.fill]="isFavorited ? '#e11d48' : 'none'" [attr.stroke]="isFavorited ? '#e11d48' : 'currentColor'" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            </div>
            
            <div class="thumbnails-bar" *ngIf="product.mediaProduits?.length > 1">
              <div class="thumb" *ngFor="let m of product.mediaProduits" 
                   [class.active]="selectedImg === m.urlMedia"
                   (click)="selectedImg = m.urlMedia">
                <img [src]="m.urlMedia" alt="Miniature">
              </div>
            </div>
          </div>

          <!-- RIGHT: INFO & ACTIONS -->
          <div class="actions-section">
            <div class="info-card-premium">
              <div class="status-badge" [class.active]="product.disponibilite === 'DISPONIBLE_IMMEDIATEMENT'">
                {{ formatDispo(product.disponibilite) }}
              </div>
              
              <h1 class="product-title">{{ product.titreProduit }}</h1>
              
              <div class="price-box">
                <span class="price-val">{{ (product.prixAfiche || 0).toLocaleString() }}</span>
                <span class="currency">DH</span>
                <span class="price-type" *ngIf="product.typePrix !== 'PRIX_FIXE'">{{ formatTypePrix(product.typePrix) }}</span>
              </div>

              <div class="stats-row">
                <div class="stat-item">
                  <span class="stat-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </span>
                  <span>{{ product.villeLocalisation }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </span>
                  <span>{{ formatDate(product.dateSoumission) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </span>
                  <span>{{ product.compteurVues }} vues</span>
                </div>
              </div>

              <div class="divider"></div>

              <div class="description-area">
                <h3>À propos de cette annonce</h3>
                <p>{{ product.descriptionDetaillee }}</p>
              </div>

              <div class="seller-card">
                <div class="seller-header">
                  <div class="seller-avatar">{{ product.annonceur?.nomComplet?.charAt(0) }}</div>
                  <div class="seller-meta">
                    <span class="seller-name">{{ product.annonceur?.nomComplet }}</span>
                    <span class="seller-verified">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="12" height="12"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      Vendeur vérifié
                    </span>
                  </div>
                </div>
                
                <div class="seller-actions">
                  <button class="btn-contact-primary" (click)="showPhone = !showPhone">
                    <span class="icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    </span>
                    {{ showPhone ? product.annonceur?.numeroDeTelephone : 'Voir le numéro' }}
                  </button>
                  <button class="btn-contact-secondary">
                    <span class="icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    </span>
                    Envoyer un message
                  </button>
                </div>
              </div>

              <div class="security-tips">
                <span class="tip-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                </span>
                <p>Ne payez jamais à l'avance et privilégiez la remise en main propre pour plus de sécurité.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- MOBILE ACTION BAR (FIXED) -->
      <div class="mobile-fixed-bar">
        <div class="mobile-price">{{ (product.prixAfiche || 0).toLocaleString() }} DH</div>
        <button class="btn-call-mobile" (click)="showPhone = !showPhone">Appeler</button>
      </div>
    </div>

    <ng-template #loadingTpl>
      <div class="loader-overlay">
        <div class="premium-spinner"></div>
        <p>Récupération de l'annonce d'exception...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    :host { --primary: #4db6ac; --primary-dark: #00897b; --accent: #e11d48; --bg: #f8fafc; }
    
    .detail-page { background: var(--bg); min-height: 100vh; padding: 40px 0 100px; color: #1e293b; }
    .container { max-width: 1300px; margin: 0 auto; padding: 0 30px; }

    /* BREADCRUMB */
    .breadcrumb-modern { display: flex; align-items: center; gap: 10px; margin-bottom: 40px; font-size: 0.9rem; font-weight: 600; }
    .breadcrumb-modern a { color: #64748b; text-decoration: none; transition: 0.3s; }
    .breadcrumb-modern a:hover { color: var(--primary); }
    .breadcrumb-modern .sep { color: #cbd5e1; }
    .breadcrumb-modern .current { color: #1e293b; }

    .product-layout { display: grid; grid-template-columns: 1.4fr 1fr; gap: 50px; align-items: start; }

    /* GALLERY */
    .gallery-section { position: sticky; top: 120px; }
    .main-stage { background: white; border-radius: 32px; height: 600px; overflow: hidden; position: relative; border: 1px solid #e2e8f0; box-shadow: 0 20px 50px rgba(0,0,0,0.04); }
    .main-img { width: 100%; height: 100%; object-fit: contain; padding: 30px; }
    
    .premium-tag { position: absolute; top: 25px; left: 25px; background: #1e293b; color: white; padding: 8px 20px; border-radius: 50px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
    
    .favorite-btn { position: absolute; top: 25px; right: 25px; width: 50px; height: 50px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; box-shadow: 0 10px 20px rgba(0,0,0,0.1); transition: 0.3s; color: #64748b; }
    .favorite-btn:hover { transform: scale(1.1); color: var(--accent); }
    .favorite-btn.active { color: var(--accent); }
    .favorite-btn svg { width: 24px; height: 24px; transition: 0.3s; }

    .thumbnails-bar { display: flex; gap: 15px; margin-top: 25px; }
    .thumb { width: 100px; height: 100px; border-radius: 16px; background: white; border: 2px solid transparent; cursor: pointer; overflow: hidden; transition: 0.3s; }
    .thumb img { width: 100%; height: 100%; object-fit: cover; }
    .thumb:hover { transform: translateY(-5px); }
    .thumb.active { border-color: var(--primary); transform: scale(1.05); }

    /* INFO & ACTIONS */
    .info-card-premium { background: white; border-radius: 32px; padding: 40px; border: 1px solid #e2e8f0; box-shadow: 0 20px 50px rgba(0,0,0,0.04); }
    
    .status-badge { display: inline-block; padding: 6px 15px; background: #fee2e2; color: #ef4444; border-radius: 50px; font-size: 0.75rem; font-weight: 800; margin-bottom: 20px; text-transform: uppercase; }
    .status-badge.active { background: #dcfce7; color: #22c55e; }

    .product-title { font-size: 2.8rem; font-weight: 900; line-height: 1.1; margin-bottom: 25px; letter-spacing: -1px; }

    .price-box { margin-bottom: 35px; display: flex; align-items: baseline; gap: 10px; }
    .price-val { font-size: 3.2rem; font-weight: 900; color: #1e293b; }
    .currency { font-size: 1.5rem; font-weight: 800; color: #1e293b; margin-right: 15px; }
    .price-type { font-size: 0.9rem; color: #64748b; font-weight: 700; background: #f1f5f9; padding: 5px 12px; border-radius: 6px; }

    .stats-row { display: flex; gap: 25px; margin-bottom: 40px; flex-wrap: wrap; }
    .stat-item { display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 0.95rem; color: #475569; }
    .stat-icon { font-size: 1.2rem; }

    .divider { height: 1px; background: #f1f5f9; margin-bottom: 40px; }

    .description-area { margin-bottom: 45px; }
    .description-area h3 { font-size: 1.2rem; font-weight: 800; margin-bottom: 15px; }
    .description-area p { line-height: 1.8; font-size: 1.1rem; color: #475569; white-space: pre-line; }

    /* SELLER CARD */
    .seller-card { background: #f8fafc; border-radius: 24px; padding: 25px; border: 1px solid #f1f5f9; }
    .seller-header { display: flex; align-items: center; gap: 15px; margin-bottom: 25px; }
    .seller-avatar { width: 60px; height: 60px; background: var(--primary); color: white; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 800; }
    .seller-meta { display: flex; flex-direction: column; }
    .seller-name { font-size: 1.1rem; font-weight: 800; }
    .seller-verified { font-size: 0.8rem; color: #22c55e; font-weight: 700; margin-top: 4px; }

    .seller-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .btn-contact-primary { background: #1e293b; color: white; border: none; padding: 15px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 10px; }
    .btn-contact-primary:hover { background: #000; transform: translateY(-2px); }
    .btn-contact-secondary { background: white; border: 1.5px solid #e2e8f0; color: #1e293b; padding: 15px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 10px; }
    .btn-contact-secondary:hover { border-color: var(--primary); transform: translateY(-2px); }

    .security-tips { margin-top: 25px; display: flex; gap: 12px; color: #64748b; font-size: 0.85rem; padding: 0 10px; line-height: 1.5; }
    .tip-icon { font-size: 1.1rem; }

    /* LOADER */
    .loader-overlay { height: 70vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; }
    .premium-spinner { width: 50px; height: 50px; border: 4px solid #f1f5f9; border-top-color: var(--primary); border-radius: 50%; animation: spin 1s infinite linear; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* MOBILE ACTIONS */
    .mobile-fixed-bar { display: none; }

    @media (max-width: 1024px) {
      .product-layout { grid-template-columns: 1fr; }
      .gallery-section { position: relative; top: 0; }
      .main-stage { height: 450px; }
      .product-title { font-size: 2.2rem; }
    }

    @media (max-width: 600px) {
      .mobile-fixed-bar { display: flex; position: fixed; bottom: 0; left: 0; right: 0; background: white; padding: 20px; border-top: 1px solid #e2e8f0; align-items: center; justify-content: space-between; z-index: 1000; box-shadow: 0 -10px 30px rgba(0,0,0,0.05); }
      .mobile-price { font-size: 1.4rem; font-weight: 900; }
      .btn-call-mobile { background: #1e293b; color: white; border: none; padding: 12px 30px; border-radius: 10px; font-weight: 800; }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private produitService = inject(ProduitService);
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  product: any;
  selectedImg = '';
  defaultImg = 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&fit=crop';
  showPhone = false;
  isFavorited = false;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.produitService.getById(+id).subscribe({
        next: (res) => {
          this.product = res;
          if (res.imageUrl) {
            this.selectedImg = res.imageUrl;
          } else if (res.mediaProduits && res.mediaProduits.length > 0) {
            this.selectedImg = res.mediaProduits[0].urlMedia;
          }
          this.checkIfFavorited();
        },
        error: (err) => console.error(err)
      });
    }
  }

  checkIfFavorited() {
    if (!this.authService.isLoggedIn()) return;
    const userId = this.authService.getUserId();
    this.http.get<boolean>(`http://localhost:8080/api/v1/favoris/check?userId=${userId}&productId=${this.product.id}`)
      .subscribe(res => this.isFavorited = res);
  }

  toggleFavorite() {
    if (!this.authService.isLoggedIn()) {
      alert("Veuillez vous connecter pour gérer vos favoris.");
      return;
    }
    const userId = this.authService.getUserId();
    this.http.post<boolean>(`http://localhost:8080/api/v1/favoris/toggle?userId=${userId}&productId=${this.product.id}`, {})
      .subscribe(res => {
        this.isFavorited = res;
        // Optionnel : déclencher une notification visuelle
      });
  }

  formatDate(dateStr: any): string {
    if (!dateStr) return 'N/A';
    const date = Array.isArray(dateStr) ? new Date(dateStr[0], dateStr[1] - 1, dateStr[2]) : new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  formatDispo(dispo: string): string {
    const map: any = {
      'DISPONIBLE_IMMEDIATEMENT': 'Disponible Immédiatement',
      'STOCK_LIMITE': 'Stock Limité',
      'SUR_COMMANDE': 'Sur Commande'
    };
    return map[dispo] || dispo;
  }

  formatTypePrix(type: string): string {
    const map: any = {
      'PRIX_NEGOCIABLE': 'Négociable',
      'GRATUIT': 'Gratuit',
      'SUR_DEVIS': 'Sur devis'
    };
    return map[type] || 'Fixe';
  }
}
