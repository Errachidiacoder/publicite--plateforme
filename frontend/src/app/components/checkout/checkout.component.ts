import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PanierService, PanierDto } from '../../services/panier.service';
import { CommandeService, CommandeRequestDto } from '../../services/commande.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="checkout-page">
      <h1 class="co-title">Finaliser la commande</h1>

      @if (loading) {
        <div class="co-loading"><div class="spinner"></div><p>Chargement...</p></div>
      } @else if (!panier || panier.lignes.length === 0) {
        <div class="co-empty">
          <h2>Votre panier est vide</h2>
          <a routerLink="/marketplace" class="btn-back">Retourner au marketplace</a>
        </div>
      } @else {
        <div class="co-content">
          <!-- Delivery Form -->
          <div class="co-form-section">
            <div class="co-card">
              <h3 class="co-card-title">📦 Adresse de livraison</h3>
              <div class="form-group">
                <label>Adresse complète *</label>
                <textarea [(ngModel)]="adresse" placeholder="Numéro, rue, quartier, ville..." rows="3" class="form-input" required></textarea>
              </div>
              <div class="form-group">
                <label>Téléphone *</label>
                <input type="tel" [(ngModel)]="telephone" placeholder="06XXXXXXXX" class="form-input" required />
              </div>
              <div class="form-group">
                <label>Notes de livraison (optionnel)</label>
                <input type="text" [(ngModel)]="notes" placeholder="Sonnez 2 fois, étage 3..." class="form-input" />
              </div>
            </div>

            <div class="co-card">
              <h3 class="co-card-title">💰 Mode de paiement</h3>
              <div class="payment-option active">
                <div class="payment-radio"></div>
                <div>
                  <strong>Paiement à la livraison (COD)</strong>
                  <p>Payez en espèces à la réception de votre commande</p>
                </div>
              </div>
            </div>

            @if (errorMessage) {
              <div class="co-error">⚠️ {{ errorMessage }}</div>
            }

            <button class="btn-confirm" (click)="submitOrder()" [disabled]="submitting">
              @if (submitting) {
                <div class="btn-spinner"></div> Traitement en cours...
              } @else {
                Confirmer la commande — {{ totalWithShipping | number:'1.2-2' }} MAD
              }
            </button>
          </div>

          <!-- Summary -->
          <div class="co-summary">
            <div class="co-card">
              <h3 class="co-card-title">Résumé ({{ panier.totalItems }} articles)</h3>
              @for (item of panier.lignes; track item.id) {
                <div class="co-item">
                  <img [src]="item.produitImage || '/assets/placeholder.png'" class="co-item-img" />
                  <div class="co-item-info">
                    <p class="co-item-name">{{ item.produitNom }}</p>
                    <p class="co-item-qty">× {{ item.quantite }}</p>
                  </div>
                  <span class="co-item-price">{{ item.sousTotal | number:'1.2-2' }} MAD</span>
                </div>
              }
              <div class="co-divider"></div>
              <div class="co-row"><span>Sous-total</span><span>{{ panier.totalAmount | number:'1.2-2' }} MAD</span></div>
              <div class="co-row"><span>Livraison</span><span class="shipping">{{ shippingCost === 0 ? 'Gratuite ✓' : (shippingCost | number:'1.2-2') + ' MAD' }}</span></div>
              <div class="co-divider"></div>
              <div class="co-row co-total"><span>Total</span><span>{{ totalWithShipping | number:'1.2-2' }} MAD</span></div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .checkout-page { max-width: 1100px; margin: 0 auto; padding: 32px 24px; min-height: 80vh; }
    .co-title { font-size: 1.6rem; font-weight: 900; color: #1a1a1a; margin: 0 0 28px; }

    .co-loading, .co-empty { text-align: center; padding: 80px 0; color: #999; }
    .spinner {
      width: 40px; height: 40px; border: 3px solid #f0f0f0;
      border-top-color: #FF6B35; border-radius: 50%;
      animation: spin 0.8s linear infinite; margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .btn-back {
      background: #1aafa5; color: white; padding: 10px 24px; border-radius: 8px;
      text-decoration: none; font-weight: 600; font-size: 0.85rem;
    }

    .co-content { display: grid; grid-template-columns: 1fr 380px; gap: 28px; align-items: start; }
    .co-form-section { display: flex; flex-direction: column; gap: 20px; }

    .co-card {
      background: #fff; border: 1px solid #f0f0f0; border-radius: 14px; padding: 24px;
    }
    .co-card-title { font-size: 1rem; font-weight: 800; color: #1a1a1a; margin: 0 0 16px; }

    .form-group { margin-bottom: 16px; }
    .form-group label {
      display: block; font-size: 0.82rem; font-weight: 700;
      color: #555; margin-bottom: 6px;
    }
    .form-input {
      width: 100%; padding: 12px; border: 1.5px solid #e0e0e0;
      border-radius: 10px; font-size: 0.88rem; color: #333;
      outline: none; transition: border-color 0.15s; background: #fafafa;
      font-family: inherit; box-sizing: border-box;
    }
    .form-input:focus { border-color: #1aafa5; background: #fff; }

    .payment-option {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 16px; border-radius: 10px; border: 1.5px solid #e0e0e0;
    }
    .payment-option.active { border-color: #1aafa5; background: #f0fdf4; }
    .payment-radio {
      width: 18px; height: 18px; border-radius: 50%;
      border: 2px solid #1aafa5; position: relative; flex-shrink: 0; margin-top: 2px;
    }
    .payment-option.active .payment-radio::after {
      content: ''; position: absolute; inset: 3px;
      background: #1aafa5; border-radius: 50%;
    }
    .payment-option strong { font-size: 0.9rem; color: #333; }
    .payment-option p { font-size: 0.78rem; color: #999; margin: 4px 0 0; }

    .co-error {
      padding: 12px 16px; background: #fef2f2; border: 1px solid #fecaca;
      border-radius: 10px; color: #E8272C; font-size: 0.85rem; font-weight: 600;
    }

    .btn-confirm {
      width: 100%; padding: 16px; border: none; border-radius: 12px;
      background: linear-gradient(135deg, #FF6B35, #e55a2b);
      color: white; font-size: 1rem; font-weight: 800; cursor: pointer;
      transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .btn-confirm:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(255,107,53,0.35); }
    .btn-confirm:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-spinner {
      width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white; border-radius: 50; animation: spin 0.8s linear infinite;
    }

    .co-summary .co-card { position: sticky; top: 100px; }
    .co-item {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 0; border-bottom: 1px solid #f5f5f5;
    }
    .co-item:last-of-type { border-bottom: none; }
    .co-item-img { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; }
    .co-item-info { flex: 1; min-width: 0; }
    .co-item-name {
      font-size: 0.82rem; font-weight: 600; color: #333; margin: 0;
      display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;
    }
    .co-item-qty { font-size: 0.75rem; color: #999; margin: 2px 0 0; }
    .co-item-price { font-size: 0.85rem; font-weight: 700; color: #E8272C; white-space: nowrap; }

    .co-divider { border-top: 1px dashed #e0e0e0; margin: 12px 0; }
    .co-row {
      display: flex; justify-content: space-between;
      font-size: 0.85rem; color: #555; margin-bottom: 8px;
    }
    .shipping { color: #16a34a; font-weight: 600; }
    .co-total { font-size: 1.05rem; font-weight: 900; color: #1a1a1a; }

    @media (max-width: 900px) {
      .co-content { grid-template-columns: 1fr; }
      .co-summary .co-card { position: static; }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  panier: PanierDto | null = null;
  loading = true;
  submitting = false;
  errorMessage = '';

  adresse = '';
  telephone = '';
  notes = '';

  constructor(
    private panierService: PanierService,
    private commandeService: CommandeService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.panierService.panier$.subscribe(p => {
      this.panier = p;
      if (p !== null) this.loading = false;
      this.cdr.detectChanges();
    });
    this.panierService.loadPanier().subscribe(() => {
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  get shippingCost(): number {
    if (!this.panier) return 0;
    return this.panier.totalAmount >= 100 ? 0 : 30;
  }

  get totalWithShipping(): number {
    if (!this.panier) return 0;
    return this.panier.totalAmount + this.shippingCost;
  }

  submitOrder(): void {
    this.errorMessage = '';

    if (!this.adresse.trim()) {
      this.errorMessage = 'Veuillez saisir votre adresse de livraison';
      return;
    }
    if (!this.telephone.trim() || !/^0[5-7]\d{8}$/.test(this.telephone.trim())) {
      this.errorMessage = 'Veuillez saisir un numéro de téléphone valide (06XXXXXXXX)';
      return;
    }

    this.submitting = true;
    const dto: CommandeRequestDto = {
      adresseLivraison: this.adresse.trim(),
      telephoneContact: this.telephone.trim(),
      notesLivraison: this.notes.trim() || undefined,
      methodePaiement: 'PAIEMENT_A_LIVRAISON'
    };

    this.commandeService.passerCommande(dto).subscribe({
      next: () => {
        this.panierService.loadPanier().subscribe();
        this.router.navigate(['/mes-commandes']);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.message || err.error || 'Erreur lors de la commande. Veuillez réessayer.';
        this.cdr.detectChanges();
      }
    });
  }
}
