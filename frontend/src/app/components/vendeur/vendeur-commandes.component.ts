import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-vendeur-commandes',
    standalone: true,
    imports: [CommonModule],
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
            <div class="commande-row">
              <div class="cmd-id">
                <span class="code-id">#{{ c.id }}</span>
              </div>
              <div class="cmd-info">
                <span class="cmd-date">{{ c.datePassageCommande | date:'dd/MM/yyyy HH:mm' }}</span>
                <span class="cmd-buyer">{{ c.acheteur?.nomComplet || 'Client' }}</span>
              </div>
              <div class="cmd-total">{{ (c.montantTotalTTC || 0).toLocaleString() }} DH</div>
              <div class="cmd-status">
                <span class="status-pill" [class]="getStatusClass(c.statutCommande)">
                  {{ c.statutCommande }}
                </span>
              </div>
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
    .empty-icon { font-size: 3rem; display: block; margin-bottom: 16px; }
    .empty-state h3 { font-size: 1.2rem; color: var(--sb-text); margin-bottom: 8px; }
    .empty-state p { color: var(--sb-text-secondary); }

    .commande-row {
      display: flex; align-items: center; gap: 16px;
      padding: 16px;
      background: var(--sb-bg-elevated); border: 1px solid var(--sb-border);
      border-radius: var(--sb-radius-lg);
      margin-bottom: 8px;
      transition: var(--sb-transition);
    }
    .commande-row:hover { box-shadow: var(--sb-shadow-sm); }
    .cmd-id { min-width: 60px; }
    .cmd-info { flex: 1; display: flex; flex-direction: column; }
    .cmd-date { font-size: 0.82rem; color: var(--sb-text-muted); }
    .cmd-buyer { font-weight: 600; font-size: 0.9rem; color: var(--sb-text); }
    .cmd-total { font-weight: 800; color: var(--sb-primary); min-width: 100px; }
    .cmd-status { min-width: 120px; }
    .status-pill {
      padding: 4px 12px; border-radius: var(--sb-radius-full);
      font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
    }
    .status-pill.pending { background: rgba(245,158,11,0.1); color: var(--sb-warning); }
    .status-pill.processing { background: rgba(59,130,246,0.1); color: var(--sb-info); }
    .status-pill.delivered { background: rgba(16,185,129,0.1); color: var(--sb-success); }
    .status-pill.cancelled { background: rgba(239,68,68,0.1); color: var(--sb-danger); }

    @media (max-width: 768px) {
      .commande-row { flex-wrap: wrap; }
    }
  `]
})
export class VendeurCommandesComponent implements OnInit {
    private http = inject(HttpClient);
    commandes: any[] = [];
    loading = true;

    ngOnInit() {
        this.http.get<any>('http://localhost:8081/api/v1/boutiques/ma-boutique').subscribe({
            next: (boutique) => {
                if (boutique?.id) {
                    this.http.get<any[]>(`http://localhost:8081/api/v1/commandes/boutique/${boutique.id}`).subscribe({
                        next: (data) => { this.commandes = data; this.loading = false; },
                        error: () => { this.commandes = []; this.loading = false; }
                    });
                } else {
                    this.loading = false;
                }
            },
            error: () => { this.loading = false; }
        });
    }

    getStatusClass(statut: string): string {
        switch (statut) {
            case 'EN_ATTENTE_PAIEMENT': case 'EN_ATTENTE': return 'pending';
            case 'EN_PREPARATION': case 'EXPEDIEE': case 'EN_LIVRAISON': return 'processing';
            case 'LIVREE': return 'delivered';
            case 'ANNULEE': case 'RETOURNEE': return 'cancelled';
            default: return 'pending';
        }
    }
}
