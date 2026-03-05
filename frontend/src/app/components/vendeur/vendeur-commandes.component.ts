import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommandeService } from '../../services/commande.service';

@Component({
  selector: 'app-vendeur-commandes',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>🧾 Commandes</h1>
        <p class="page-desc">Suivez et gérez les commandes de votre boutique</p>
      </div>

      @if (loading) {
        <div class="loading-state"><div class="spinner"></div></div>
      } @else if (commandes.length === 0) {
        <div class="empty-state">
          <span class="empty-icon">🧾</span>
          <h3>Aucune commande</h3>
          <p>Vous n'avez pas encore reçu de commandes.</p>
        </div>
      } @else {
        <div class="commandes-list">
          @for (c of commandes; track c.id) {
            <div class="commande-card" [class.expanded]="expandedId === c.id" (click)="toggleExpand(c.id)">
              <!-- Header row -->
              <div class="cmd-header">
                <div class="cmd-left">
                  <span class="code-id">{{ c.referenceCommande || '#' + c.id }}</span>
                  <span class="cmd-date">{{ c.datePassageCommande | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
                <div class="cmd-right">
                  <span class="cmd-total">{{ (c.montantTotal || 0).toLocaleString() }} DH</span>
                  <span class="status-pill" [class]="getStatusClass(c.statutCommande)">
                    {{ formatStatus(c.statutCommande) }}
                  </span>
                  <span class="expand-icon">{{ expandedId === c.id ? '▲' : '▼' }}</span>
                </div>
              </div>

              <!-- Product lines (always visible summary) -->
              <div class="cmd-products-summary">
                @for (l of c.lignes; track l.id) {
                  <div class="product-chip">
                    @if (l.produitImage) {
                      <img [src]="l.produitImage" [alt]="l.produitNom" class="chip-img" />
                    }
                    <span class="chip-name">{{ l.produitNom }}</span>
                    <span class="chip-qty">×{{ l.quantite }}</span>
                  </div>
                }
              </div>

              <!-- Expanded details -->
              @if (expandedId === c.id) {
                <div class="cmd-details" (click)="$event.stopPropagation()">
                  <table class="details-table">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Produit</th>
                        <th>Qté</th>
                        <th>Prix unit.</th>
                        <th>Sous-total</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (l of c.lignes; track l.id) {
                        <tr>
                          <td class="td-img">
                            @if (l.produitImage) {
                              <img [src]="l.produitImage" [alt]="l.produitNom" class="prod-img" />
                            } @else {
                              <div class="prod-img-placeholder">📦</div>
                            }
                          </td>
                          <td>
                            <a [routerLink]="['/market-products', l.produitId]" class="prod-link" (click)="$event.stopPropagation()">
                              {{ l.produitNom }}
                            </a>
                          </td>
                          <td class="td-center">{{ l.quantite }}</td>
                          <td class="td-right">{{ (l.prixUnitaire || 0).toLocaleString() }} DH</td>
                          <td class="td-right td-bold">{{ (l.sousTotal || 0).toLocaleString() }} DH</td>
                        </tr>
                      }
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="4" class="td-right"><strong>Total</strong></td>
                        <td class="td-right td-bold td-total">{{ (c.montantTotal || 0).toLocaleString() }} DH</td>
                      </tr>
                    </tfoot>
                  </table>

                  @if (c.adresseLivraison) {
                    <div class="delivery-info">
                      <span class="info-label">📍 Livraison :</span>
                      <span>{{ c.adresseLivraison }}</span>
                    </div>
                  }
                  @if (c.telephoneContact) {
                    <div class="delivery-info">
                      <span class="info-label">📞 Contact :</span>
                      <span>{{ c.telephoneContact }}</span>
                    </div>
                  }
                  @if (c.numeroSuivi) {
                    <div class="delivery-info">
                      <span class="info-label">📦 Suivi :</span>
                      <span>{{ c.numeroSuivi }}</span>
                    </div>
                  }
                  @if (c.annulationRaison) {
                    <div class="delivery-info cancel-reason">
                      <span class="info-label">❌ Motif :</span>
                      <span>{{ c.annulationRaison }}</span>
                    </div>
                  }

                  <!-- Action buttons -->
                  <div class="cmd-actions" (click)="$event.stopPropagation()">
                    @if (c.statutCommande === 'EN_ATTENTE_PAIEMENT') {
                      <button class="action-btn confirm" (click)="changeStatus(c.id, 'PAIEMENT_CONFIRME')">✅ Confirmer</button>
                    }
                    @if (c.statutCommande === 'PAIEMENT_CONFIRME') {
                      <button class="action-btn prepare" (click)="changeStatus(c.id, 'EN_PREPARATION')">📦 Préparer</button>
                    }
                    @if (c.statutCommande === 'EN_PREPARATION') {
                      <button class="action-btn ship" (click)="openShipModal(c.id)">🚚 Expédier</button>
                      <button class="action-btn cancel" (click)="openCancelModal(c.id)">❌ Annuler</button>
                    }
                    @if (c.statutCommande === 'EXPEDIEE') {
                      <button class="action-btn deliver" (click)="changeStatus(c.id, 'LIVREE')">🎉 Marquer livré</button>
                    }
                    @if (c.statutCommande === 'EN_LIVRAISON') {
                      <button class="action-btn cancel" (click)="openCancelModal(c.id)">❌ Annuler</button>
                    }
                    @if (c.statutCommande === 'LIVREE' && !c.paiementConfirme) {
                      <button class="action-btn payment" (click)="confirmPayment(c.id)">💰 Confirmer paiement</button>
                      <button class="action-btn cancel" (click)="openPaymentFailModal(c.id)">❌ Paiement non reçu</button>
                    }
                    @if (c.paiementConfirme) {
                      <span class="payment-badge">✅ Paiement reçu</span>
                    }
                    @if (c.statutCommande === 'PAIEMENT_ECHOUE') {
                      <span class="payment-fail-badge">❌ Paiement échoué</span>
                    }
                  </div>
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
              <button class="action-btn cancel" [disabled]="!(cancelModal.raison || '').trim()" (click)="confirmCancel()">Confirmer l'annulation</button>
            </div>
          </div>
        </div>
      }

      <!-- Ship Modal -->
      @if (shipModal.open) {
        <div class="modal-overlay" (click)="shipModal.open = false">
          <div class="modal-box" (click)="$event.stopPropagation()">
            <h3>🚚 Expédier la commande</h3>
            <div class="modal-body">
              <label>Numéro de suivi <span class="optional">(optionnel)</span></label>
              <input class="modal-input" [(ngModel)]="shipModal.numeroSuivi" placeholder="Ex: MA123456789" />
              <label style="margin-top:12px">Société de livraison <span class="optional">(optionnel)</span></label>
              <input class="modal-input" [(ngModel)]="shipModal.societeLivraison" placeholder="Ex: Amana, Chronopost..." />
            </div>
            <div class="modal-footer">
              <button class="action-btn cancel-outline" (click)="shipModal.open = false">Retour</button>
              <button class="action-btn ship" (click)="confirmShip()">Confirmer l'expédition</button>
            </div>
          </div>
        </div>
      }

      <!-- Payment Failure Modal -->
      @if (paymentFailModal.open) {
        <div class="modal-overlay" (click)="paymentFailModal.open = false">
          <div class="modal-box" (click)="$event.stopPropagation()">
            <h3>❌ Signaler un échec de paiement</h3>
            <div class="modal-body">
              <label>Motif <span class="required">*</span></label>
              <select class="modal-input" [(ngModel)]="paymentFailModal.raison">
                <option value="">Sélectionnez un motif...</option>
                <option value="Client a refusé de payer">Client a refusé de payer</option>
                <option value="Client absent lors de la livraison">Client absent lors de la livraison</option>
                <option value="Montant insuffisant">Montant insuffisant</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div class="modal-footer">
              <button class="action-btn cancel-outline" (click)="paymentFailModal.open = false">Retour</button>
              <button class="action-btn cancel" [disabled]="!paymentFailModal.raison" (click)="confirmPaymentFail()">Confirmer l'échec</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1000px; }
    .page-header { margin-bottom: 28px; }
    .page-header h1 { font-family: 'Outfit',sans-serif; font-size: 1.5rem; font-weight: 800; color: var(--sb-text); margin-bottom: 4px; }
    .page-desc { font-size: 0.88rem; color: var(--sb-text-secondary); }

    .loading-state, .empty-state { text-align: center; padding: 60px 20px; }
    .spinner {
      width: 40px; height: 40px; border: 3px solid #f0f0f0;
      border-top-color: #1aafa5; border-radius: 50%;
      animation: spin 0.8s linear infinite; margin: 0 auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-icon { font-size: 3rem; display: block; margin-bottom: 16px; }
    .empty-state h3 { font-size: 1.2rem; color: var(--sb-text); margin-bottom: 8px; }
    .empty-state p { color: var(--sb-text-secondary); }

    /* Commande card */
    .commande-card {
      background: var(--sb-bg-elevated);
      border: 1px solid var(--sb-border);
      border-radius: var(--sb-radius-lg);
      margin-bottom: 12px;
      padding: 16px 20px;
      cursor: pointer;
      transition: var(--sb-transition);
    }
    .commande-card:hover { box-shadow: var(--sb-shadow-sm); }
    .commande-card.expanded { border-color: var(--sb-primary); box-shadow: var(--sb-shadow-md); }

    .cmd-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    .cmd-left { display: flex; align-items: center; gap: 12px; }
    .code-id {
      font-weight: 700; font-size: 0.82rem;
      color: var(--sb-primary);
      background: rgba(26,175,165,0.08);
      padding: 3px 10px;
      border-radius: var(--sb-radius-full);
    }
    .cmd-date { font-size: 0.8rem; color: var(--sb-text-muted); }
    .cmd-right { display: flex; align-items: center; gap: 12px; }
    .cmd-total { font-weight: 800; color: var(--sb-text); font-size: 0.95rem; }
    .expand-icon { font-size: 0.65rem; color: var(--sb-text-muted); }

    .status-pill {
      padding: 3px 10px; border-radius: var(--sb-radius-full);
      font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
      white-space: nowrap;
    }
    .status-pill.pending { background: rgba(245,158,11,0.1); color: var(--sb-warning); }
    .status-pill.processing { background: rgba(59,130,246,0.1); color: var(--sb-info); }
    .status-pill.delivered { background: rgba(16,185,129,0.1); color: var(--sb-success); }
    .status-pill.cancelled { background: rgba(239,68,68,0.1); color: var(--sb-danger); }

    /* Product chips (summary row) */
    .cmd-products-summary {
      display: flex; flex-wrap: wrap; gap: 8px;
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px solid var(--sb-border-light);
    }
    .product-chip {
      display: flex; align-items: center; gap: 6px;
      background: var(--sb-surface);
      border: 1px solid var(--sb-border);
      border-radius: var(--sb-radius-md);
      padding: 4px 10px 4px 4px;
    }
    .chip-img {
      width: 28px; height: 28px; border-radius: 4px;
      object-fit: cover;
    }
    .chip-name { font-size: 0.78rem; font-weight: 600; color: var(--sb-text); max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .chip-qty { font-size: 0.72rem; font-weight: 700; color: var(--sb-primary); }

    /* Expanded details */
    .cmd-details {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px dashed var(--sb-border);
      animation: fadeIn 0.2s ease;
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

    .details-table {
      width: 100%; border-collapse: collapse;
      font-size: 0.85rem;
    }
    .details-table th {
      text-align: left; font-size: 0.72rem;
      text-transform: uppercase; color: var(--sb-text-muted);
      font-weight: 700; padding: 6px 8px;
      border-bottom: 1px solid var(--sb-border);
    }
    .details-table td {
      padding: 10px 8px;
      border-bottom: 1px solid var(--sb-border-light);
      color: var(--sb-text);
    }
    .td-img { width: 44px; }
    .prod-img {
      width: 40px; height: 40px; border-radius: 6px;
      object-fit: cover; display: block;
    }
    .prod-img-placeholder {
      width: 40px; height: 40px; border-radius: 6px;
      background: var(--sb-surface); display: flex;
      align-items: center; justify-content: center; font-size: 1.1rem;
    }
    .prod-link {
      color: var(--sb-primary); font-weight: 600;
      text-decoration: none;
      transition: var(--sb-transition);
    }
    .prod-link:hover { text-decoration: underline; }
    .td-center { text-align: center; }
    .td-right { text-align: right; }
    .td-bold { font-weight: 700; }
    .td-total { color: var(--sb-primary); font-size: 0.95rem; }

    .details-table tfoot td {
      border-bottom: none;
      padding-top: 12px;
    }

    .delivery-info {
      margin-top: 10px; font-size: 0.82rem; color: var(--sb-text-secondary);
      display: flex; gap: 6px;
    }
    .info-label { font-weight: 700; color: var(--sb-text); }

    .cancel-reason { color: var(--sb-danger, #ef4444); }

    /* Action buttons */
    .cmd-actions {
      display: flex; flex-wrap: wrap; gap: 8px;
      margin-top: 16px; padding-top: 14px;
      border-top: 1px solid var(--sb-border-light);
    }
    .action-btn {
      padding: 7px 16px; border: none; border-radius: 8px;
      font-size: 0.8rem; font-weight: 700; cursor: pointer;
      transition: all 0.2s; display: inline-flex; align-items: center; gap: 4px;
    }
    .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .action-btn.confirm { background: rgba(16,185,129,0.12); color: #059669; }
    .action-btn.confirm:hover { background: rgba(16,185,129,0.25); }
    .action-btn.prepare { background: rgba(59,130,246,0.12); color: #2563eb; }
    .action-btn.prepare:hover { background: rgba(59,130,246,0.25); }
    .action-btn.ship { background: rgba(124,58,237,0.12); color: #7c3aed; }
    .action-btn.ship:hover { background: rgba(124,58,237,0.25); }
    .action-btn.deliver { background: rgba(16,185,129,0.12); color: #059669; }
    .action-btn.deliver:hover { background: rgba(16,185,129,0.25); }
    .action-btn.cancel { background: rgba(239,68,68,0.12); color: #dc2626; }
    .action-btn.cancel:hover { background: rgba(239,68,68,0.25); }
    .action-btn.cancel-outline { background: transparent; border: 1px solid var(--sb-border); color: var(--sb-text-secondary); }
    .action-btn.payment { background: rgba(245,158,11,0.12); color: #d97706; }
    .action-btn.payment:hover { background: rgba(245,158,11,0.25); }
    .payment-badge {
      padding: 5px 12px; border-radius: 8px;
      font-size: 0.78rem; font-weight: 700;
      background: rgba(16,185,129,0.1); color: #059669;
    }

    /* Modals */
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
    .optional { color: #999; font-weight: 400; }
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

    @media (max-width: 768px) {
      .cmd-header { flex-direction: column; align-items: flex-start; gap: 8px; }
      .cmd-right { flex-wrap: wrap; }
      .details-table { font-size: 0.78rem; }
    }
  `]
})
export class VendeurCommandesComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private commandeService = inject(CommandeService);
  commandes: any[] = [];
  loading = true;
  expandedId: number | null = null;
  boutiqueId: number | null = null;

  cancelModal = { open: false, id: 0, raison: '' };
  shipModal = { open: false, id: 0, numeroSuivi: '', societeLivraison: '' };
  paymentFailModal = { open: false, id: 0, raison: '' };

  ngOnInit() {
    this.http.get<any>('http://localhost:8081/api/v1/boutiques/ma-boutique').subscribe({
      next: (boutique: any) => {
        if (boutique?.id) {
          this.boutiqueId = boutique.id;
          this.loadCommandes();
        } else {
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  loadCommandes() {
    if (!this.boutiqueId) return;
    this.http.get<any[]>(`http://localhost:8081/api/v1/commandes/boutique/${this.boutiqueId}`).subscribe({
      next: (data: any[]) => { this.commandes = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.commandes = []; this.loading = false; this.cdr.detectChanges(); }
    });
  }

  toggleExpand(id: number) {
    this.expandedId = this.expandedId === id ? null : id;
  }

  changeStatus(id: number, statut: string) {
    this.commandeService.updateStatut(id, statut).subscribe({
      next: () => this.loadCommandes(),
      error: (err: any) => alert(err?.error?.message || 'Erreur lors de la mise à jour')
    });
  }

  openCancelModal(id: number) {
    this.cancelModal = { open: true, id, raison: '' };
  }

  confirmCancel() {
    if (!this.cancelModal.raison?.trim()) return;
    this.commandeService.updateStatut(this.cancelModal.id, 'ANNULE', {
      raison: this.cancelModal.raison,
      annulePar: 'VENDEUR'
    }).subscribe({
      next: () => { this.cancelModal.open = false; this.loadCommandes(); },
      error: (err: any) => alert(err?.error?.message || 'Erreur lors de l\'annulation')
    });
  }

  openShipModal(id: number) {
    this.shipModal = { open: true, id, numeroSuivi: '', societeLivraison: '' };
  }

  confirmShip() {
    this.commandeService.updateStatut(this.shipModal.id, 'EXPEDIEE', {
      numeroSuivi: this.shipModal.numeroSuivi,
      societeLivraison: this.shipModal.societeLivraison
    }).subscribe({
      next: () => { this.shipModal.open = false; this.loadCommandes(); },
      error: (err: any) => alert(err?.error?.message || 'Erreur lors de l\'expédition')
    });
  }

  confirmPayment(id: number) {
    this.commandeService.confirmerPaiement(id).subscribe({
      next: () => this.loadCommandes(),
      error: (err: any) => alert(err?.error?.message || 'Erreur lors de la confirmation du paiement')
    });
  }

  openPaymentFailModal(id: number) {
    this.paymentFailModal = { open: true, id, raison: '' };
  }

  confirmPaymentFail() {
    if (!this.paymentFailModal.raison) return;
    this.commandeService.signalerPaiementEchoue(this.paymentFailModal.id, this.paymentFailModal.raison).subscribe({
      next: () => { this.paymentFailModal.open = false; this.loadCommandes(); },
      error: (err: any) => alert(err?.error?.message || 'Erreur lors du signalement')
    });
  }

  getStatusClass(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE_PAIEMENT': case 'EN_ATTENTE': return 'pending';
      case 'EN_PREPARATION': case 'EXPEDIEE': case 'EN_LIVRAISON': return 'processing';
      case 'LIVREE': case 'LIVRE': return 'delivered';
      case 'ANNULEE': case 'ANNULE': case 'RETOURNEE': case 'PAIEMENT_ECHOUE': return 'cancelled';
      default: return 'pending';
    }
  }

  formatStatus(statut: string): string {
    const map: Record<string, string> = {
      'EN_ATTENTE_PAIEMENT': 'En attente',
      'PAIEMENT_CONFIRME': 'Confirmée',
      'EN_PREPARATION': 'En préparation',
      'EXPEDIEE': 'Expédiée',
      'EN_LIVRAISON': 'En livraison',
      'LIVREE': 'Livrée',
      'LIVRE': 'Livrée',
      'ANNULE': 'Annulée',
      'ANNULEE': 'Annulée',
      'RETOURNEE': 'Retournée',
      'PAIEMENT_ECHOUE': 'Paiement échoué'
    };
    return map[statut] || statut;
  }
}
