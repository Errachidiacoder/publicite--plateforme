import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProduitService } from '../services/product.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="detail-container" *ngIf="product; else loadingTpl">
      <!-- Breadcrumb -->
      <nav class="breadcrumb">
        <a routerLink="/home">Accueil</a> / 
        <a href="#">{{ product.categorie?.nomCategorie }}</a> / 
        <span>{{ product.titreProduit }}</span>
      </nav>

      <div class="main-layout">
        <!-- Gallery -->
        <div class="gallery-side">
          <div class="main-img-card">
            <img [src]="selectedImg || defaultImg" [alt]="product.titreProduit">
          </div>
          <div class="thumbnails" *ngIf="product.mediaProduits?.length > 1">
            <div class="thumb" *ngFor="let m of product.mediaProduits" (click)="selectedImg = m.urlMedia">
              <img [src]="m.urlMedia" alt="Thumbnail">
            </div>
          </div>
        </div>

        <!-- Info -->
        <div class="info-side">
          <div class="info-card">
            <span class="badge" *ngIf="product.annoncePremium">Premium</span>
            <h1 class="title">{{ product.titreProduit }}</h1>
            <p class="price">{{ product.prixProduit.toLocaleString() }} DH</p>
            
            <div class="meta-data">
              <div class="meta-item"><span>📍 Localisation :</span> {{ product.villeLocalisation }}</div>
              <div class="meta-item"><span>📅 Publiée le :</span> {{ formatDate(product.datePublication) }}</div>
              <div class="meta-item"><span>👁 Vues :</span> {{ product.compteurVues }}</div>
            </div>

            <div class="divider"></div>

            <div class="description">
              <h3>Description</h3>
              <p>{{ product.descriptionProduit }}</p>
            </div>

            <div class="contact-box">
              <div class="seller-info">
                <div class="avatar">{{ product.annonceur?.nomComplet?.charAt(0) }}</div>
                <div>
                  <p class="seller-name">{{ product.annonceur?.nomComplet }}</p>
                  <p class="seller-since">Membre depuis 2024</p>
                </div>
              </div>
              <button class="btn-phone" (click)="showPhone = !showPhone">
                {{ showPhone ? product.annonceur?.numeroDeTelephone || 'Non renseigné' : 'Afficher le numéro' }}
              </button>
              <button class="btn-msg">Envoyer un message</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ng-template #loadingTpl>
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Chargement des détails de l'annonce...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .detail-container { max-width: 1200px; margin: 0 auto; padding: 30px 20px; font-family: 'Inter', sans-serif; }
    .breadcrumb { margin-bottom: 25px; font-size: 0.9rem; color: var(--text-grey); }
    .breadcrumb a { text-decoration: none; color: inherit; }
    .breadcrumb a:hover { color: var(--primary); }

    .main-layout { display: grid; grid-template-columns: 1.5fr 1fr; gap: 40px; }
    
    .main-img-card { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.03); height: 500px; border: 1px solid var(--border); }
    .main-img-card img { width: 100%; height: 100%; object-fit: contain; background: #f1fcfd; }
    
    .thumbnails { display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap; }
    .thumb { width: 80px; height: 80px; border-radius: 12px; overflow: hidden; border: 2px solid transparent; cursor: pointer; transition: 0.2s; background: #f1fcfd; }
    .thumb:hover { transform: scale(1.05); border-color: var(--primary); }
    .thumb img { width: 100%; height: 100%; object-fit: cover; }

    .info-card { background: white; padding: 40px; border-radius: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid var(--border); position: sticky; top: 100px; }
    .badge { background: var(--accent); color: var(--primary-dark); padding: 5px 12px; border-radius: 6px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; margin-bottom: 15px; display: inline-block; }
    .title { font-size: 2.25rem; font-weight: 900; color: var(--text-dark); line-height: 1.2; margin-bottom: 10px; }
    .price { font-size: 2rem; font-weight: 900; color: var(--primary); margin-bottom: 30px; }
    
    .meta-data { display: flex; flex-direction: column; gap: 12px; margin-bottom: 30px; }
    .meta-item { font-size: 0.95rem; color: var(--text-dark); font-weight: 500; }
    .meta-item span { color: var(--text-grey); width: 120px; display: inline-block; }

    .divider { height: 1px; background: var(--border); margin-bottom: 30px; }
    
    .description h3 { font-size: 1.1rem; font-weight: 800; margin-bottom: 15px; color: var(--text-dark); }
    .description p { line-height: 1.7; color: var(--text-dark); font-size: 1.05rem; }

    .contact-box { margin-top: 40px; background: #f1fcfd; padding: 25px; border-radius: 20px; border: 1px solid var(--border); }
    .seller-info { display: flex; align-items: center; gap: 15px; margin-bottom: 25px; }
    .avatar { width: 50px; height: 50px; background: var(--accent); color: var(--primary-dark); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem; }
    .seller-name { font-weight: 800; color: var(--text-dark); margin: 0; }
    .seller-since { font-size: 0.8rem; color: var(--text-grey); margin: 0; }

    .btn-phone { width: 100%; background: var(--text-dark); color: white; border: none; padding: 16px; border-radius: 12px; font-weight: 700; cursor: pointer; margin-bottom: 12px; transition: 0.2s; }
    .btn-phone:hover { opacity: 0.9; }
    .btn-msg { width: 100%; border: 2px solid var(--border); background: white; color: var(--text-dark); padding: 14px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; }
    .btn-msg:hover { background: #f1fcfd; border-color: var(--primary); }

    .loading-state { text-align: center; padding: 100px 0; color: var(--text-grey); }
    .spinner { border: 4px solid var(--secondary); border-top: 4px solid var(--primary); border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 20px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    @media (max-width: 900px) {
      .main-layout { grid-template-columns: 1fr; }
      .info-card { position: static; }
      .main-img-card { height: 350px; }
    }


  `]
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private produitService = inject(ProduitService);

  product: any;
  selectedImg = '';
  defaultImg = 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&fit=crop';
  showPhone = false;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.produitService.getById(+id).subscribe({
        next: (res) => {
          this.product = res;
          if (res.mediaProduits && res.mediaProduits.length > 0) {
            this.selectedImg = res.mediaProduits[0].urlMedia;
          }
        },
        error: (err) => console.error(err)
      });
    }
  }

  formatDate(dateArr: any): string {
    if (!dateArr || !Array.isArray(dateArr)) return 'N/A';
    const date = new Date(dateArr[0], dateArr[1] - 1, dateArr[2]);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
