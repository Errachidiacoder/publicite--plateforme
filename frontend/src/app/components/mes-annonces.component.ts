import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AnonceService } from '../services/anonce.service';

@Component({
  selector: 'app-mes-annonces',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="user-ads-container">
      <div class="page-header">
        <h1>Mes Annonces</h1>
        <p>Gérez vos annonces publiées sur la plateforme</p>
      </div>

      <div class="ads-actions">
        <a routerLink="/submit-product" class="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Publier une nouvelle annonce
        </a>
      </div>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement de vos annonces...</p>
      </div>

      <div *ngIf="error" class="error-state">
        <p>{{ error }}</p>
        <button (click)="loadMyAds()" class="btn btn-outline">Réessayer</button>
      </div>

      <div *ngIf="!loading && !error && annonces.length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
        <h3>Aucune annonce trouvée</h3>
        <p>Vous n'avez pas encore publié d'annonce sur la plateforme.</p>
        <a routerLink="/submit-product" class="btn btn-primary mt-4">Commencer à vendre</a>
      </div>

      <div *ngIf="!loading && !error && annonces.length > 0" class="ads-grid">
        <div class="ad-card" *ngFor="let ad of annonces">
          <div class="ad-image-wrapper">
            <img [src]="ad.imageUrl || 'assets/images/placeholder.jpg'" [alt]="ad.titreAnonce" class="ad-image">
            <span class="status-badge" [ngClass]="getStatusClass(ad.statutValidation)">
              {{ getStatusLabel(ad.statutValidation) }}
            </span>
          </div>
          <div class="ad-content">
            <div class="ad-header">
              <span class="ad-type">{{ ad.typeAnnonce === 'OFFRE' ? 'Offre' : 'Demande' }}</span>
              <span class="ad-date">{{ ad.dateSoumission | date:'dd MMM yyyy' }}</span>
            </div>
            <h3 class="ad-title">{{ ad.titreAnonce }}</h3>
            <div class="ad-price">{{ ad.prixAfiche }} MAD</div>
            
            <div class="ad-stats">
              <div class="stat-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <span>{{ ad.compteurVues || 0 }} vues</span>
              </div>
            </div>

            <div class="ad-actions">
              <a [routerLink]="['/product', ad.id]" class="btn btn-outline btn-sm">Voir</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-ads-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      margin-top: 80px; /* Account for fixed navbar */
    }

    .page-header {
      margin-bottom: 30px;
    }

    .page-header h1 {
      font-size: 2rem;
      color: #1a1a2e;
      margin-bottom: 8px;
      font-weight: 700;
    }

    .page-header p {
      color: #64748b;
      font-size: 1.1rem;
    }

    .ads-actions {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 30px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
      border: none;
    }

    .btn-primary {
      background-color: #20b2aa;
      color: white;
    }

    .btn-primary:hover {
      background-color: #1a928c;
    }

    .btn-outline {
      border: 1px solid #e2e8f0;
      background-color: white;
      color: #1a1a2e;
    }

    .btn-outline:hover {
      border-color: #20b2aa;
      color: #20b2aa;
      background-color: #f0fdfa;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 0.9rem;
    }

    /* States */
    .loading-state, .error-state, .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #20b2aa;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .empty-state svg {
      color: #94a3b8;
      margin-bottom: 20px;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      color: #1a1a2e;
      margin-bottom: 10px;
    }

    .empty-state p {
      color: #64748b;
      max-width: 400px;
      margin: 0 auto;
    }

    .error-state {
      color: #ef4444;
    }

    /* Grid layout */
    .ads-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }

    .ad-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      display: flex;
      flex-direction: column;
    }

    .ad-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }

    .ad-image-wrapper {
      position: relative;
      height: 200px;
      background-color: #f1f5f9;
    }

    .ad-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .status-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      backdrop-filter: blur(4px);
    }

    .status-en-attente {
      background-color: rgba(245, 158, 11, 0.9);
      color: white;
    }

    .status-valide {
      background-color: rgba(34, 197, 94, 0.9);
      color: white;
    }

    .status-refuse {
      background-color: rgba(239, 68, 68, 0.9);
      color: white;
    }

    .status-archive {
      background-color: rgba(100, 116, 139, 0.9);
      color: white;
    }

    .ad-content {
      padding: 20px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }

    .ad-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 0.85rem;
    }

    .ad-type {
      color: #20b2aa;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .ad-date {
      color: #94a3b8;
    }

    .ad-title {
      font-size: 1.2rem;
      color: #1a1a2e;
      margin-bottom: 12px;
      font-weight: 600;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .ad-price {
      font-size: 1.25rem;
      font-weight: 700;
      color: #20b2aa;
      margin-bottom: 16px;
    }

    .ad-stats {
      margin-top: auto;
      padding-top: 16px;
      border-top: 1px solid #f1f5f9;
      margin-bottom: 16px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #64748b;
      font-size: 0.9rem;
    }

    .ad-actions {
      display: flex;
      gap: 10px;
    }
    
    .ad-actions .btn {
      flex: 1;
      justify-content: center;
    }
  `]
})
export class MesAnnoncesComponent implements OnInit {
  authService = inject(AuthService);
  anonceService = inject(AnonceService);

  annonces: any[] = [];
  loading = true;
  error = '';

  ngOnInit() {
    this.loadMyAds();
  }

  loadMyAds() {
    this.loading = true;
    this.error = '';

    // We assume the authService stores the logged-in user's details including ID
    // If we only have the token, we can get the username/email and fetch by email, 
    // or decode token. Let's see what authService exposes.
    const currentUser = this.authService.getCurrentUser();

    if (currentUser && currentUser.id) {
      this.anonceService.getByAnnonceur(currentUser.id).subscribe({
        next: (data) => {
          this.annonces = data.sort((a, b) => {
            return new Date(b.dateSoumission).getTime() - new Date(a.dateSoumission).getTime();
          });
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading ads:', err);
          this.error = 'Erreur lors du chargement de vos annonces. Veuillez réessayer plus tard.';
          this.loading = false;
        }
      });
    } else {
      // User is not fully loaded or ID is missing in token
      this.error = 'Impossible de récupérer votre identifiant. Veuillez vous reconnecter.';
      this.loading = false;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'status-en-attente';
      case 'VALIDE':
      case 'ACTIVEE': return 'status-valide';
      case 'REFUSEE': return 'status-refuse';
      case 'ARCHIVE': return 'status-archive';
      default: return 'status-en-attente';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'En attente';
      case 'VALIDE':
      case 'ACTIVEE': return 'Publiée';
      case 'REFUSEE': return 'Refusée';
      case 'ARCHIVE': return 'Archivée';
      default: return status;
    }
  }
}
