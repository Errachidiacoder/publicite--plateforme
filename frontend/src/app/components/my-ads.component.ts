import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProduitService } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-ads',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="my-ads-container">
      <div class="glass-bg"></div>
      
      <header class="page-header">
        <div class="title-group">
          <h1>Mes Annonces<span>.</span></h1>
          <p class="subtitle">Gérez et suivez vos publications en temps réel</p>
        </div>
        <div class="actions-group">
          <button class="btn-refresh" (click)="loadMyAds()" [class.spinning]="isRefreshing" title="Actualiser">
            <span class="refresh-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
            </span>
          </button>
          <button class="btn-create" (click)="router.navigate(['/submit-product'])">
            <span class="plus-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </span> 
            Nouvelle Annonce
          </button>
        </div>
      </header>

      <div class="ads-grid" *ngIf="ads.length > 0">
        <div class="ad-card-premium" *ngFor="let ad of ads">
          <div class="card-image-wrapper">
             <img [src]="ad.imageUrl || 'assets/placeholder-ad.png'" [alt]="ad.titreProduit" class="card-img">
             <div class="status-overlay" [ngClass]="ad.statutValidation.toLowerCase()">
                {{ ad.statutValidation }}
             </div>
          </div>
          
          <div class="card-body">
            <div class="category-tag">{{ ad.categorieName || 'Général' }}</div>
            <h3>{{ ad.titreProduit }}</h3>
            <p class="price-tag">{{ ad.prixAfiche ? (ad.prixAfiche | number:'1.0-0') + ' DH' : 'Prix sur demande' }}</p>
            
            <div class="card-info">
              <span class="info-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="12" height="12"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                {{ ad.villeLocalisation || 'Maroc' }}
              </span>
              <span class="info-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                {{ ad.dateSoumission | date:'dd MMM yyyy' }}
              </span>
            </div>
          </div>

          <div class="card-footer">
            <div class="action-buttons">
              <button class="btn-action edit" (click)="editAd(ad)" title="Modifier">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button class="btn-action archive" *ngIf="ad.statutValidation !== 'ARCHIVE'" (click)="archiveAd(ad)" title="Archiver">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>
              </button>
              <button class="btn-action delete" (click)="deleteAd(ad)" title="Supprimer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </button>
            </div>
            <button class="btn-launch" *ngIf="ad.statutValidation === 'VALIDE'" (click)="payAd(ad.id)">
              Payer & Activer
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" style="margin-left: 8px;"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>
            </button>
          </div>
        </div>
      </div>

      <div class="empty-state-premium" *ngIf="ads.length === 0">
        <div class="empty-visual">
          <div class="circle-ring"></div>
          <span class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="60" height="60"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          </span>
        </div>
        <h3>Aucune annonce trouvée</h3>
        <p>Il est temps de donner de la visibilité à vos produits.</p>
        <button class="btn-primary-gradient" (click)="router.navigate(['/submit-product'])">
          Publier ma première annonce
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --teal: #4db6ac;
      --teal-dark: #00897b;
      --cyan-light: #b2ebf2;
      --white: #ffffff;
      --slate: #263238;
      --border: #e0f7fa;
      --bg-page: #f5fcfd;
      --shadow-premium: 0 20px 40px rgba(0, 0, 0, 0.05);
    }

    .my-ads-container { 
      padding: 60px 20px; 
      max-width: 1200px; 
      margin: 0 auto; 
      position: relative;
      min-height: 80vh;
      background: var(--bg-page);
    }

    .page-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-end; 
      margin-bottom: 50px; 
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 25px;
    }

    .title-group h1 { 
      font-size: 2.5rem; 
      font-weight: 900; 
      color: var(--slate); 
      margin: 0;
      letter-spacing: -1px;
    }

    .title-group h1 span { color: var(--teal); }
    .subtitle { color: #64748b; margin: 5px 0 0; font-weight: 500; }

    .actions-group { display: flex; gap: 15px; align-items: center; }

    .btn-refresh {
      background: white;
      border: 1px solid var(--border);
      width: 45px;
      height: 45px;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
      box-shadow: 0 4px 6px rgba(0,0,0,0.02);
    }
    .btn-refresh:hover { border-color: var(--teal); transform: translateY(-2px); box-shadow: 0 8px 15px rgba(0,0,0,0.05); }
    .btn-refresh.spinning .refresh-icon { animation: spin 0.8s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    .btn-create { 
      background: var(--slate); 
      color: white; 
      border: none; 
      padding: 0 25px; 
      height: 45px;
      border-radius: 12px; 
      font-weight: 700; 
      cursor: pointer; 
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.3s;
    }
    .btn-create:hover { background: #1e293b; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(15, 23, 42, 0.15); }

    .ads-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); 
      gap: 25px; 
    }

    .ad-card-premium { 
      background: white; 
      border-radius: 20px; 
      overflow: hidden; 
      box-shadow: var(--shadow-premium); 
      border: 1px solid #f1f5f9; 
      display: flex; 
      flex-direction: column;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .ad-card-premium:hover { 
      transform: translateY(-10px); 
      box-shadow: 0 30px 60px rgba(0,0,0,0.08);
      border-color: var(--teal);
    }

    .card-image-wrapper { height: 150px; position: relative; overflow: hidden; background: #f8fafc; }
    .card-img { width: 100%; height: 100%; object-fit: cover; transition: 0.5s; }
    .ad-card-premium:hover .card-img { transform: scale(1.1); }

    .status-overlay {
      position: absolute;
      top: 15px;
      right: 15px;
      padding: 6px 14px;
      border-radius: 30px;
      font-size: 0.65rem;
      font-weight: 800;
      text-transform: uppercase;
      backdrop-filter: blur(8px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .status-overlay.en_attente { background: rgba(255, 255, 255, 0.9); color: #92400e; border: 1px solid #fef3c7; }
    .status-overlay.valide { background: var(--cyan-light); color: #006064; border: 1px solid var(--teal); }
    .status-overlay.activee { background: var(--teal); color: white; box-shadow: 0 4px 10px rgba(0, 137, 123, 0.3); }
    .status-overlay.refuse { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }

    .card-body { padding: 20px; flex: 1; }
    .category-tag { font-size: 0.65rem; font-weight: 700; color: var(--teal); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
    .card-body h3 { font-size: 1.1rem; font-weight: 800; margin: 0 0 8px; color: var(--slate); line-height: 1.2; }
    .price-tag { font-size: 1.25rem; font-weight: 900; color: var(--slate); margin-bottom: 12px; }
    
    .card-info { display: flex; gap: 12px; border-top: 1px solid #f1f5f9; padding-top: 12px; }
    .info-item { font-size: 0.75rem; color: #64748b; font-weight: 600; display: flex; align-items: center; gap: 4px; }

    .card-footer { 
      padding: 15px 20px; 
      background: #fcfdfe; 
      display: flex; 
      flex-direction: column;
      gap: 12px;
      border-top: 1px solid #f1f5f9;
    }
    
    .action-buttons { display: flex; gap: 10px; }
    .btn-action { 
      flex: 1;
      height: 40px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      background: white;
      cursor: pointer;
      font-size: 1.1rem;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-action:hover { border-color: var(--teal); background: #e0f2f1; transform: translateY(-2px); }
    .btn-action.delete:hover { border-color: #fca5a5; background: #fef2f2; }

    .btn-launch {
      width: 100%;
      height: 45px;
      background: linear-gradient(135deg, var(--teal-dark) 0%, var(--teal) 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 800;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 10px 20px rgba(0, 137, 123, 0.2);
    }
    .btn-launch:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(0, 137, 123, 0.3); }

    .empty-state-premium { 
      text-align: center; 
      padding: 100px 40px; 
      background: white; 
      border-radius: 40px; 
      box-shadow: var(--shadow-premium);
      max-width: 600px;
      margin: 40px auto;
    }
    .empty-visual { position: relative; width: 100px; height: 100px; margin: 0 auto 30px; display: flex; align-items: center; justify-content: center; }
    .circle-ring { position: absolute; width: 100%; height: 100%; border: 4px dashed #e2e8f0; border-radius: 50%; animation: rotate 20s linear infinite; }
    @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .empty-icon { font-size: 3.5rem; z-index: 1; }
    
    .empty-state-premium h3 { font-size: 1.6rem; font-weight: 900; color: var(--slate); margin: 0 0 12px; }
    .empty-state-premium p { color: #64748b; margin-bottom: 30px; font-size: 1.05rem; }
    
    .btn-primary-gradient { 
      background: linear-gradient(135deg, var(--teal-dark) 0%, var(--teal) 100%); 
      color: white; 
      border: none; 
      padding: 16px 35px; 
      border-radius: 16px; 
      font-weight: 800; 
      cursor: pointer; 
      transition: all 0.3s;
      box-shadow: 0 10px 25px rgba(0, 137, 123, 0.2);
    }
    .btn-primary-gradient:hover { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(0, 137, 123, 0.3); }

    @media (max-width: 640px) {
      .page-header { flex-direction: column; align-items: flex-start; gap: 20px; }
      .actions-group { width: 100%; }
      .btn-create { flex: 1; justify-content: center; }
    }
  `]
})
export class MyAdsComponent implements OnInit {
  private produitService = inject(ProduitService);
  private authService = inject(AuthService);
  router = inject(Router);

  ads: any[] = [];
  isRefreshing = false;

  ngOnInit() {
    this.loadMyAds();
  }

  loadMyAds() {
    this.isRefreshing = true;
    const userId = this.authService.getUserId();
    if (userId) {
      this.produitService.getByAnnonceur(userId).subscribe({
        next: (data) => {
          this.ads = data;
          setTimeout(() => this.isRefreshing = false, 600);
        },
        error: () => {
          this.isRefreshing = false;
        }
      });
    } else {
      this.isRefreshing = false;
    }
  }

  editAd(ad: any) {
    this.router.navigate(['/edit-product', ad.id]);
  }

  payAd(id: number) {
    this.router.navigate(['/payment', id]);
  }

  archiveAd(ad: any) {
    if (confirm("Voulez-vous vraiment archiver cette annonce ?")) {
      this.produitService.archive(ad.id).subscribe(() => this.loadMyAds());
    }
  }

  deleteAd(ad: any) {
    if (confirm("Action irréversible. Supprimer cette annonce ?")) {
      this.produitService.delete(ad.id).subscribe(() => this.loadMyAds());
    }
  }
}
