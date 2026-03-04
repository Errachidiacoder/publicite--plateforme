import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommandeService, CommandeResponseDto } from '../../services/commande.service';

@Component({
  selector: 'app-mes-commandes',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
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

                  <!-- Order Status Timeline -->
                  <div class="timeline-bar">
                    <div class="timeline-step" [class.active]="getTimelineIndex(cmd.statutCommande) >= 0" [class.current]="getTimelineIndex(cmd.statutCommande) === 0">
                      <div class="timeline-dot"></div>
                      <span>En attente</span>
                    </div>
                    <div class="timeline-line" [class.filled]="getTimelineIndex(cmd.statutCommande) >= 1"></div>
                    <div class="timeline-step" [class.active]="getTimelineIndex(cmd.statutCommande) >= 1" [class.current]="getTimelineIndex(cmd.statutCommande) === 1">
                      <div class="timeline-dot"></div>
                      <span>Confirmée</span>
                    </div>
                    <div class="timeline-line" [class.filled]="getTimelineIndex(cmd.statutCommande) >= 2"></div>
                    <div class="timeline-step" [class.active]="getTimelineIndex(cmd.statutCommande) >= 2" [class.current]="getTimelineIndex(cmd.statutCommande) === 2">
                      <div class="timeline-dot"></div>
                      <span>Préparation</span>
                    </div>
                    <div class="timeline-line" [class.filled]="getTimelineIndex(cmd.statutCommande) >= 3"></div>
                    <div class="timeline-step" [class.active]="getTimelineIndex(cmd.statutCommande) >= 3" [class.current]="getTimelineIndex(cmd.statutCommande) === 3">
                      <div class="timeline-dot"></div>
                      <span>Expédiée</span>
                    </div>
                    <div class="timeline-line" [class.filled]="getTimelineIndex(cmd.statutCommande) >= 4"></div>
                    <div class="timeline-step" [class.active]="getTimelineIndex(cmd.statutCommande) >= 4" [class.current]="getTimelineIndex(cmd.statutCommande) === 4">
                      <div class="timeline-dot"></div>
                      <span>Livrée</span>
                    </div>
                  </div>

                  @if (cmd.statutCommande === 'ANNULE') {
                    <div class="cancel-banner">
                      <span>❌ Commande annulée</span>
                      @if (cmd.annulationRaison) {
                        <p>Motif: {{ cmd.annulationRaison }}</p>
                      }
                    </div>
                  }

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
                    @if (cmd.numeroSuivi) {
                      <p class="detail-text">📦 Suivi: {{ cmd.numeroSuivi }}</p>
                    }
                    @if (cmd.societeLivraison) {
                      <p class="detail-text">🚚 {{ cmd.societeLivraison }}</p>
                    }
                  </div>

                  <!-- Client cancel button -->
                  @if (cmd.statutCommande === 'EN_PREPARATION' || cmd.statutCommande === 'EN_LIVRAISON') {
                    <div class="cmd-actions">
                      <button class="action-btn cancel" (click)="openCancelModal(cmd.id)">❌ Annuler ma commande</button>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Cancel Modal -->
      @if (cancelModal.open) {
        <div class="modal-overlay" (click)="cancelModal.open = false">
          <div class="modal-box" (click)="$event.stopPropagation()">
            <h3>❌ Annuler la commande</h3>
            <div class="modal-body">
              <label>Motif d'annulation <span class="required">*</span></label>
              <textarea class="modal-input" [(ngModel)]="cancelModal.raison" rows="4" placeholder="Expliquez le motif d'annulation..."></textarea>
            </div>
            <div class="modal-footer">
              <button class="action-btn cancel-outline" (click)="cancelModal.open = false">Retour</button>
              <button class="action-btn cancel" [disabled]="!cancelModal.raison?.trim()" (click)="confirmCancel()">Confirmer l'annulation</button>
            </div>
          </div>
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

    /* Timeline */
    .timeline-bar {
      display: flex; align-items: center; gap: 0;
      padding: 8px 0 12px; overflow-x: auto;
    }
    .timeline-step {
      display: flex; flex-direction: column; align-items: center;
      gap: 4px; min-width: 70px;
    }
    .timeline-dot {
      width: 16px; height: 16px; border-radius: 50%;
      border: 2.5px solid #ddd; background: #fff; transition: 0.3s;
    }
    .timeline-step.active .timeline-dot {
      border-color: #1aafa5; background: #1aafa5;
    }
    .timeline-step.current .timeline-dot {
      border-color: #f59e0b; background: #f59e0b;
      box-shadow: 0 0 0 4px rgba(245,158,11,0.2);
    }
    .timeline-step span {
      font-size: 0.62rem; font-weight: 700; color: #bbb;
      text-transform: uppercase;
    }
    .timeline-step.active span { color: #1aafa5; }
    .timeline-step.current span { color: #f59e0b; }
    .timeline-line {
      flex: 1; height: 3px; background: #eee;
      min-width: 20px; margin-bottom: 18px;
    }
    .timeline-line.filled { background: #1aafa5; }

    .cancel-banner {
      background: #fef2f2; border: 1px solid #fecaca;
      border-radius: 10px; padding: 12px 16px;
      color: #dc2626; font-weight: 700; font-size: 0.85rem;
    }
    .cancel-banner p { font-weight: 400; margin: 4px 0 0; font-size: 0.82rem; }

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

    /* Action buttons */
    .cmd-actions {
      display: flex; gap: 8px; padding-top: 12px;
      border-top: 1px solid #f0f0f0;
    }
    .action-btn {
      padding: 8px 18px; border: none; border-radius: 8px;
      font-size: 0.82rem; font-weight: 700; cursor: pointer;
      transition: all 0.2s; display: inline-flex; align-items: center; gap: 4px;
    }
    .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .action-btn.cancel { background: rgba(239,68,68,0.1); color: #dc2626; }
    .action-btn.cancel:hover { background: rgba(239,68,68,0.2); }
    .action-btn.cancel-outline { background: transparent; border: 1px solid #ddd; color: #666; }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.4);
      backdrop-filter: blur(4px); display: flex;
      align-items: center; justify-content: center; z-index: 2000;
    }
    .modal-box {
      background: #fff; border-radius: 18px; width: 100%; max-width: 420px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2); overflow: hidden;
    }
    .modal-box h3 { padding: 18px 22px; margin: 0; font-size: 1.1rem; border-bottom: 1px solid #eee; }
    .modal-body { padding: 18px 22px; }
    .modal-body label { display: block; font-size: 0.82rem; font-weight: 700; color: #333; margin-bottom: 6px; }
    .required { color: #ef4444; }
    .modal-input {
      width: 100%; padding: 10px 14px; border: 1.5px solid #e0e0e0;
      border-radius: 10px; font-size: 0.88rem; font-family: inherit;
      outline: none; transition: border-color 0.2s; box-sizing: border-box;
    }
    .modal-input:focus { border-color: #1aafa5; }
    .modal-footer {
      display: flex; gap: 10px; justify-content: flex-end;
      padding: 14px 22px; border-top: 1px solid #eee;
    }

    @media (max-width: 600px) {
      .order-header { flex-wrap: wrap; gap: 8px; }
      .order-ref { flex-basis: 100%; }
      .timeline-step { min-width: 55px; }
      .timeline-step span { font-size: 0.55rem; }
    }
  `]
})
export class MesCommandesComponent implements OnInit {
  commandes: CommandeResponseDto[] = [];
  loading = true;
  expandedId: number | null = null;
  cancelModal = { open: false, id: 0, raison: '' };

  constructor(private commandeService: CommandeService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadCommandes();
  }

  loadCommandes() {
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

  getTimelineIndex(statut: string): number {
    const order = ['EN_ATTENTE_PAIEMENT', 'PAIEMENT_CONFIRME', 'EN_PREPARATION', 'EXPEDIEE', 'LIVREE'];
    if (statut === 'ANNULE') return -1;
    if (statut === 'EN_LIVRAISON') return 3; // same visual step as EXPEDIEE
    if (statut === 'LIVRE') return 4;
    const idx = order.indexOf(statut);
    return idx >= 0 ? idx : 0;
  }

  openCancelModal(id: number) {
    this.cancelModal = { open: true, id, raison: '' };
  }

  confirmCancel() {
    if (!this.cancelModal.raison?.trim()) return;
    this.commandeService.updateStatut(this.cancelModal.id, 'ANNULE', {
      raison: this.cancelModal.raison,
      annulePar: 'CLIENT'
    }).subscribe({
      next: () => { this.cancelModal.open = false; this.loadCommandes(); },
      error: (err: any) => alert(err?.error?.message || 'Erreur lors de l\'annulation')
    });
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
