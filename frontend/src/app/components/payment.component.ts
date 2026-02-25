import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-payment',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="payment-container">
      <div class="payment-card">
        <header class="payment-header">
          <h2>🌟 Finaliser votre Publication</h2>
          <p>Choisissez votre mode de paiement pour activer l'annonce #{{ productId }}</p>
        </header>

        <div class="payment-methods">
          <div class="method-card" [class.active]="method === 'card'" (click)="method = 'card'">
            <div class="m-icon">💳</div>
            <span>Carte Bancaire</span>
          </div>
          <div class="method-card" [class.active]="method === 'transfer'" (click)="method = 'transfer'">
            <div class="m-icon">🏛️</div>
            <span>Virement</span>
          </div>
          <div class="method-card" [class.active]="method === 'wafa'" (click)="method = 'wafa'">
            <div class="m-icon">📱</div>
            <span>Wafa Cash / Attijari</span>
          </div>
        </div>

        <div class="payment-details" *ngIf="method === 'card'">
          <div class="field">
            <label>Nom sur la carte</label>
            <input type="text" placeholder="M. Jean Dupont">
          </div>
          <div class="field">
            <label>Numéro de carte</label>
            <input type="text" placeholder="**** **** **** ****">
          </div>
          <div class="row">
            <div class="field">
              <label>Expiration</label>
              <input type="text" placeholder="MM/YY">
            </div>
            <div class="field">
              <label>CVC</label>
              <input type="password" placeholder="***">
            </div>
          </div>
        </div>

        <div class="payment-info" *ngIf="method !== 'card'">
          <p>Veuillez suivre les instructions envoyées par email pour finaliser votre {{ method === 'transfer' ? 'virement' : 'paiement en agence' }}.</p>
          <div class="info-box">
             L'annonce sera activée manuellement par l'admin après réception des fonds.
          </div>
        </div>

        <footer class="payment-footer">
          <button class="btn-cancel" (click)="cancel()">Plus tard</button>
          <button class="btn-pay" [disabled]="loading" (click)="processPayment()">
            <div class="spinner-mini" *ngIf="loading"></div>
            <span>{{ loading ? 'Traitement...' : 'Payer Maintenant' }}</span>
          </button>
        </footer>
      </div>
    </div>

    <!-- Toast Success -->
    <div class="p-toast" *ngIf="success">
      ✅ Paiement réussi ! Votre annonce est maintenant active.
    </div>
  `,
    styles: [`
    .payment-container {
      min-height: 100vh;
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .payment-card {
      background: white;
      width: 100%;
      max-width: 500px;
      border-radius: 32px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.08);
      padding: 40px;
    }
    .payment-header { text-align: center; margin-bottom: 30px; }
    .payment-header h2 { font-size: 1.6rem; font-weight: 900; margin-bottom: 10px; color: #111827; }
    .payment-header p { color: #64748b; font-size: 0.9rem; }

    .payment-methods { display: flex; gap: 12px; margin-bottom: 30px; }
    .method-card {
      flex: 1;
      border: 2px solid #f1f5f9;
      border-radius: 16px;
      padding: 15px 5px;
      text-align: center;
      cursor: pointer;
      transition: 0.3s;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .method-card span { font-size: 0.75rem; font-weight: 700; color: #64748b; }
    .method-card .m-icon { font-size: 1.5rem; }
    .method-card:hover { border-color: #4db6ac; background: #f0fdfa; }
    .method-card.active { border-color: #4db6ac; background: #f0fdfa; }
    .method-card.active span { color: #00897b; }

    .field { margin-bottom: 15px; display: flex; flex-direction: column; gap: 6px; }
    .field label { font-size: 0.75rem; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
    .field input {
      padding: 12px 16px;
      border-radius: 12px;
      border: 1.5px solid #e2e8f0;
      font-size: 0.9rem;
      transition: 0.2s;
    }
    .field input:focus { border-color: #4db6ac; outline: none; box-shadow: 0 0 0 4px rgba(77, 182, 172, 0.1); }
    .row { display: flex; gap: 15px; }
    .row .field { flex: 1; }

    .payment-info { background: #f8fafc; padding: 20px; border-radius: 16px; margin-bottom: 25px; }
    .payment-info p { font-size: 0.85rem; color: #475569; line-height: 1.5; margin: 0 0 10px; }
    .info-box { font-size: 0.75rem; font-weight: 700; color: #00897b; padding: 8px; border: 1px dashed #4db6ac; border-radius: 8px; }

    .payment-footer { display: flex; gap: 12px; margin-top: 20px; }
    .btn-cancel { flex: 1; padding: 14px; border-radius: 14px; border: none; background: #f1f5f9; color: #475569; font-weight: 700; cursor: pointer; }
    .btn-pay {
      flex: 2; padding: 14px; border-radius: 14px; border: none; 
      background: #111827; color: white; font-weight: 700; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 10px;
    }
    .btn-pay:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.15); }
    .btn-pay:disabled { opacity: 0.7; cursor: not-allowed; }

    .spinner-mini { width: 18px; height: 18px; border: 3px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: white; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .p-toast {
      position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
      background: #10b981; color: white; padding: 16px 30px; border-radius: 50px;
      font-weight: 800; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);
      animation: slideUp 0.4s ease-out;
    }
    @keyframes slideUp { from { transform: translate(-50%, 50px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
  `]
})
export class PaymentComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private adminService = inject(AdminService);

    productId: string | null = null;
    method: 'card' | 'transfer' | 'wafa' = 'card';
    loading = false;
    success = false;

    ngOnInit() {
        this.productId = this.route.snapshot.paramMap.get('id');
    }

    processPayment() {
        if (this.method !== 'card') {
            alert("Demande enregistrée. Veuillez suivre les instructions.");
            this.router.navigate(['/home']);
            return;
        }

        this.loading = true;
        const id = Number(this.productId);

        // Simulate API delay
        setTimeout(() => {
            this.adminService.activateProduct(id).subscribe({
                next: () => {
                    this.loading = false;
                    this.success = true;
                    setTimeout(() => this.router.navigate(['/home']), 3000);
                },
                error: (err) => {
                    this.loading = false;
                    alert("Erreur lors de l'activation. Veuillez contacter le support.");
                }
            });
        }, 2000);
    }

    cancel() {
        this.router.navigate(['/home']);
    }
}
