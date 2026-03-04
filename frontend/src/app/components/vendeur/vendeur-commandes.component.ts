import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-vendeur-commandes',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
                </div>
              }
            </div>
          }
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
  commandes: any[] = [];
  loading = true;
  expandedId: number | null = null;

  ngOnInit() {
    this.http.get<any>('http://localhost:8081/api/v1/boutiques/ma-boutique').subscribe({
      next: (boutique: any) => {
        if (boutique?.id) {
          this.http.get<any[]>(`http://localhost:8081/api/v1/commandes/boutique/${boutique.id}`).subscribe({
            next: (data: any[]) => { this.commandes = data; this.loading = false; this.cdr.detectChanges(); },
            error: () => { this.commandes = []; this.loading = false; this.cdr.detectChanges(); }
          });
        } else {
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  toggleExpand(id: number) {
    this.expandedId = this.expandedId === id ? null : id;
  }

  getStatusClass(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE_PAIEMENT': case 'EN_ATTENTE': return 'pending';
      case 'EN_PREPARATION': case 'EXPEDIEE': case 'EN_LIVRAISON': return 'processing';
      case 'LIVREE': case 'LIVRE': return 'delivered';
      case 'ANNULEE': case 'ANNULE': case 'RETOURNEE': return 'cancelled';
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
      'RETOURNEE': 'Retournée'
    };
    return map[statut] || statut;
  }
}
