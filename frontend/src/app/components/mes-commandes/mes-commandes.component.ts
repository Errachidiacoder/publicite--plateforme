import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CommandeService, CommandeResponseDto } from '../../services/commande.service';

@Component({
  selector: 'app-mes-commandes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="orders-page">
      <h1 class="orders-title">Mes Commandes</h1>

      @if (loading) {
        <div class="orders-loading"><div class="spinner"></div><p>Chargement...</p></div>
      } @else if (commandes.length === 0) {
        <div class="orders-empty">
          <svg width="64" height="64" fill="none" stroke="#ccc" stroke-width="1.5" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          <h2>Aucune commande</h2>
          <p>Vous n'avez pas encore passé de commande</p>
          <a routerLink="/marketplace" class="btn-shop">Découvrir les produits</a>
        </div>
      } @else {
        <div class="orders-list">
          @for (cmd of commandes; track cmd.id) {
            <div class="order-card" [class.expanded]="expandedId === cmd.id">
              <div class="order-header" (click)="toggleExpand(cmd.id)">
                <div class="order-ref">
                  <span class="ref-label">Commande</span>
                  <span class="ref-value">{{ cmd.referenceCommande }}</span>
                </div>
                <div class="order-date">{{ cmd.datePassageCommande | date:'dd/MM/yyyy HH:mm' }}</div>
                <span class="order-badge" [attr.data-status]="cmd.statutCommande">{{ formatStatus(cmd.statutCommande) }}</span>
                <div class="order-total">{{ cmd.montantTotal | number:'1.2-2' }} MAD</div>
                <div class="order-articles">{{ cmd.nombreArticles }} article{{ cmd.nombreArticles > 1 ? 's' : '' }}</div>
                <svg class="order-chevron" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
              </div>

              @if (expandedId === cmd.id) {
                <div class="order-details">
                  <div class="detail-section">
                    <h4>Articles</h4>
                    @for (ligne of cmd.lignes; track ligne.id) {
                      <div class="detail-item">
                        <img [src]="ligne.produitImage || '/assets/placeholder.png'" class="detail-img" />
                        <div class="detail-info">
                          <p class="detail-name">{{ ligne.produitNom }}</p>
                          <p class="detail-qty">× {{ ligne.quantite }} — {{ ligne.prixUnitaire | number:'1.2-2' }} MAD/unité</p>
                        </div>
                        <span class="detail-subtotal">{{ ligne.sousTotal | number:'1.2-2' }} MAD</span>
                      </div>
                    }
                  </div>
                  <div class="detail-section">
                    <h4>Livraison</h4>
                    <p class="detail-text">📍 {{ cmd.adresseLivraison || 'Non renseignée' }}</p>
                    <p class="detail-text">📞 {{ cmd.telephoneContact || 'Non renseigné' }}</p>
                    @if (cmd.notesLivraison) {
                      <p class="detail-text">📝 {{ cmd.notesLivraison }}</p>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .orders-page { max-width: 900px; margin: 0 auto; padding: 32px 24px; min-height: 80vh; }
    .orders-title { font-size: 1.6rem; font-weight: 900; color: #1a1a1a; margin: 0 0 28px; }

    .orders-loading, .orders-empty { text-align: center; padding: 80px 0; color: #999; }
    .spinner {
      width: 40px; height: 40px; border: 3px solid #f0f0f0;
      border-top-color: #1aafa5; border-radius: 50%;
      animation: spin 0.8s linear infinite; margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .orders-empty h2 { color: #333; margin: 12px 0 4px; }
    .orders-empty p { font-size: 0.88rem; }
    .btn-shop {
      display: inline-block; background: #1aafa5; color: white;
      padding: 10px 24px; border-radius: 8px; text-decoration: none;
      font-weight: 700; font-size: 0.85rem; margin-top: 12px;
    }

    .orders-list { display: flex; flex-direction: column; gap: 12px; }

    .order-card {
      background: #fff; border: 1px solid #f0f0f0; border-radius: 14px;
      overflow: hidden; transition: 0.15s;
    }
    .order-card:hover { border-color: #e0e0e0; }
    .order-card.expanded { border-color: #1aafa5; }

    .order-header {
      display: flex; align-items: center; gap: 16px;
      padding: 18px 20px; cursor: pointer; transition: 0.1s;
    }
    .order-header:hover { background: #fafafa; }
    .order-ref { flex: 1; }
    .ref-label { display: block; font-size: 0.7rem; color: #999; text-transform: uppercase; letter-spacing: 0.04em; }
    .ref-value { font-size: 0.9rem; font-weight: 700; color: #333; }
    .order-date { font-size: 0.8rem; color: #999; }
    .order-badge {
      padding: 4px 10px; border-radius: 20px; font-size: 0.72rem;
      font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em;
    }
    .order-badge[data-status="EN_PREPARATION"] { background: #fff7ed; color: #ea580c; }
    .order-badge[data-status="EN_ATTENTE_PAIEMENT"] { background: #fefce8; color: #ca8a04; }
    .order-badge[data-status="PAIEMENT_CONFIRME"] { background: #ecfdf5; color: #16a34a; }
    .order-badge[data-status="EXPEDIEE"] { background: #eff6ff; color: #2563eb; }
    .order-badge[data-status="EN_LIVRAISON"] { background: #f0f9ff; color: #0891b2; }
    .order-badge[data-status="LIVREE"], .order-badge[data-status="LIVRE"] { background: #ecfdf5; color: #16a34a; }
    .order-badge[data-status="ANNULE"] { background: #fef2f2; color: #dc2626; }
    .order-badge[data-status="RETOURNEE"] { background: #faf5ff; color: #7c3aed; }
    .order-total { font-size: 0.95rem; font-weight: 800; color: #E8272C; }
    .order-articles { font-size: 0.8rem; color: #999; }
    .order-chevron { color: #ccc; transition: transform 0.2s; flex-shrink: 0; }
    .order-card.expanded .order-chevron { transform: rotate(180deg); }

    .order-details {
      padding: 0 20px 20px; border-top: 1px solid #f0f0f0;
      display: flex; flex-direction: column; gap: 16px; padding-top: 16px;
    }
    .detail-section h4 {
      font-size: 0.8rem; font-weight: 800; color: #999;
      text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 10px;
    }
    .detail-item {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 0; border-bottom: 1px solid #f8f8f8;
    }
    .detail-img { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; }
    .detail-info { flex: 1; }
    .detail-name { font-size: 0.82rem; font-weight: 600; color: #333; margin: 0; }
    .detail-qty { font-size: 0.75rem; color: #999; margin: 2px 0 0; }
    .detail-subtotal { font-size: 0.85rem; font-weight: 700; color: #E8272C; }
    .detail-text { font-size: 0.82rem; color: #555; margin: 4px 0; }

    @media (max-width: 600px) {
      .order-header { flex-wrap: wrap; gap: 8px; }
      .order-ref { flex-basis: 100%; }
    }
  `]
})
export class MesCommandesComponent implements OnInit {
  commandes: CommandeResponseDto[] = [];
  loading = true;
  expandedId: number | null = null;

  constructor(private commandeService: CommandeService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.commandeService.getMesCommandes().subscribe({
      next: (data) => {
        this.commandes = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleExpand(id: number): void {
    this.expandedId = this.expandedId === id ? null : id;
  }

  formatStatus(status: string): string {
    const map: Record<string, string> = {
      'EN_ATTENTE_PAIEMENT': 'En attente',
      'PAIEMENT_CONFIRME': 'Confirmée',
      'EN_PREPARATION': 'En préparation',
      'EXPEDIEE': 'Expédiée',
      'EN_LIVRAISON': 'En livraison',
      'LIVREE': 'Livrée',
      'LIVRE': 'Livrée',
      'ANNULE': 'Annulée',
      'RETOURNEE': 'Retournée'
    };
    return map[status] || status;
  }
}
