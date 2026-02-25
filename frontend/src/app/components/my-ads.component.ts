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
            <span class="refresh-icon">🔄</span>
          </button>
          <button class="btn-create" (click)="router.navigate(['/submit-product'])">
            <span class="plus-icon">+</span> Nouvelle Annonce
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
              <span class="info-item"><i class="icon">📍</i> {{ ad.villeLocalisation || 'Maroc' }}</span>
              <span class="info-item"><i class="icon">📅</i> {{ ad.dateSoumission | date:'dd MMM yyyy' }}</span>
            </div>
          </div>

          <div class="card-footer">
            <div class="action-buttons">
              <button class="btn-action edit" (click)="editAd(ad)" title="Modifier">✏️</button>
              <button class="btn-action archive" *ngIf="ad.statutValidation !== 'ARCHIVE'" (click)="archiveAd(ad)" title="Archiver">📦</button>
              <button class="btn-action delete" (click)="deleteAd(ad)" title="Supprimer">🗑️</button>
            </div>
            <button class="btn-launch" *ngIf="ad.statutValidation === 'VALIDE'" (click)="payAd(ad.id)">
              Payer & Activer 🚀
            </button>
          </div>
        </div>
      </div>

      <div class="empty-state-premium" *ngIf="ads.length === 0">
        <div class="empty-visual">
          <div class="circle-ring"></div>
          <span class="empty-icon">📁</span>
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
