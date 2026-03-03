import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-product-validation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-page-container">
      <div class="admin-compact-wrapper">
        <div class="admin-page-content">
      <div class="card table-card" style="padding: 30px;">
        <div class="table-header-row" style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 25px;">
          <div class="table-title-area">
            <h2 style="margin:0; font-size:1.4rem; font-weight:700; color:#1A202C;">Annonces</h2>
          </div>
          
          <div class="table-tools" style="display:flex; align-items:center; gap:20px;">
            <div class="search-input-wrapper">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7E7E7E" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="text" placeholder="Search">
            </div>
            
            <div class="sort-by">
                Filtre : 
                <select (change)="onFilterDropdownChange($event)" style="border:none; background:transparent; font-weight:700; color:#1A202C; cursor:pointer; outline:none; font-family:inherit; font-size:inherit; -webkit-appearance:none; padding-right:15px; background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iNiIgdmlld0JveD0iMCAwIDEwIDYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw1IDVMOSAxIiBzdHJva2U9IiMxQTIwMkMiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=') no-repeat right center;">
                    <option value="EN_ATTENTE" [selected]="currentFilter === 'EN_ATTENTE'">En attente</option>
                    <option value="ACTIVEE" [selected]="currentFilter === 'ACTIVEE'">Active</option>
                    <option value="VALIDE" [selected]="currentFilter === 'VALIDE'">Validée</option>
                    <option value="REFUSE" [selected]="currentFilter === 'REFUSE'">Refusée</option>
                    <option value="ALL" [selected]="currentFilter === 'ALL'">Toutes</option>
                </select>
            </div>
          </div>
        </div>

        <div class="table-responsive">
          <table class="premium-table">
            <thead>
              <tr>
                <th class="text-center">Titre du Produit</th>
                <th class="text-center">Annonceur</th>
                <th class="text-center">Date Publication</th>
                <th class="text-center">Statut</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let prod of filteredProducts">
                <td class="text-center">
                  <div class="table-user-cell" style="justify-content:center;">
                    <span class="u-name">{{ prod.titreProduit }}</span>
                  </div>
                </td>
                <td class="text-center">
                    <span class="u-name" style="color:#292D32;">{{ prod.annonceur?.nomComplet }}</span>
                </td>
                <td class="text-center">{{ prod.dateSoumission | date:'dd MMM yyyy' }}</td>
                <td class="text-center">
                   <span class="status-pill-bordered" [ngClass]="prod.statutValidation?.toLowerCase()">
                    {{ prod.statutValidation === 'EN_ATTENTE' ? 'En attente' : prod.statutValidation === 'VALIDE' ? 'Validée' : prod.statutValidation === 'ACTIVEE' ? 'Active' : prod.statutValidation === 'REFUSE' ? 'Refusée' : prod.statutValidation }}
                  </span>
                </td>
                <td class="text-center">
                  <div class="action-group" style="justify-content:center;">
                    <!-- DETAILS -->
                    <button class="icon-btn-reference info" (click)="viewDetail(prod)" title="Détails">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                    <!-- EDIT -->
                    <button class="icon-btn-reference success" (click)="onEdit(prod)" title="Modifier">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <!-- VALIDATION ACTIONS IF PENDING -->
                    <ng-container *ngIf="prod.statutValidation === 'EN_ATTENTE'">
                      <button class="icon-btn-reference success-check" (click)="onValidate(prod.id!)" title="Valider">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </button>
                      <button class="icon-btn-reference danger-x" (click)="onReject(prod.id!)" title="Refuser">
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </ng-container>
                    <!-- DELETE -->
                    <button class="icon-btn-reference danger" (click)="onDelete(prod.id!)" title="Supprimer">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredProducts.length === 0">
                <td colspan="5" class="empty-row" style="text-align:center; padding:40px; color:#B5B7C0;">Aucune annonce trouvée pour ce filtre.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <style>
      /* Styles are now handled via global classes or inline for specific dropdown logic */
    </style>
      <!-- MODAL DETAILS -->
      <div *ngIf="selectedProduct" class="modal-overlay" (click)="selectedProduct = null">
        <div class="modal-premium" (click)="$event.stopPropagation()">
            <header class="modal-header">
                <h2>Détails de l'Annonce</h2>
                <button class="close-modal" (click)="selectedProduct = null">&times;</button>
            </header>
            <div class="modal-body">
                <div class="product-image-preview-admin" *ngIf="selectedProduct.imageUrl">
                    <img [src]="selectedProduct.imageUrl" alt="Preview">
                </div>
                <div class="detail-section">
                    <label>Informations Générales</label>
                    <div class="detail-grid">
                        <div class="grid-item"><small>ID</small><span>#{{ selectedProduct.id }}</span></div>
                        <div class="grid-item"><small>Prix</small><span>{{ selectedProduct.prixAfiche }} {{ selectedProduct.typePrix }}</span></div>
                        <div class="grid-item"><small>Localisation</small><span>{{ selectedProduct.villeLocalisation }}</span></div>
                        <div class="grid-item"><small>Statut</small><span class="status-pill-bordered" [ngClass]="selectedProduct.statutValidation.toLowerCase()">{{ selectedProduct.statutValidation }}</span></div>
                    </div>
                </div>
                <div class="detail-section">
                    <label>Titre & Description</label>
                    <h4 class="detail-title">{{ selectedProduct.titreProduit }}</h4>
                    <p class="detail-desc">{{ selectedProduct.descriptionDetaillee }}</p>
                </div>
                <div class="detail-section" *ngIf="selectedProduct.motifRefusAdmin">
                    <label class="danger">Motif du Refus</label>
                    <div class="refusal-box">{{ selectedProduct.motifRefusAdmin }}</div>
                </div>
            </div>
            <footer class="modal-footer">
                <button class="btn-secondary" (click)="selectedProduct = null">Fermer</button>
                <button class="btn-primary" (click)="onEdit(selectedProduct); selectedProduct = null">Modifier</button>
            </footer>
        </div>
      </div>
      <!-- Floating Toasts -->
      <div class="toast-container">
        <div class="toast success" *ngIf="successMessage" (click)="successMessage = ''">
          <div class="toast-icon">✓</div>
          <div class="toast-content">
            <span class="toast-title">Succès</span>
            <span class="toast-text">{{ successMessage }}</span>
          </div>
        </div>
        <div class="toast error" *ngIf="errorMessage" (click)="errorMessage = ''">
          <div class="toast-icon">✕</div>
          <div class="toast-content">
            <span class="toast-title">Erreur</span>
            <span class="toast-text">{{ errorMessage }}</span>
          </div>
        </div>
      </div>

      <!-- Custom Confirmation Modal -->
      <div *ngIf="confirmDialog.visible" class="modal-overlay" (click)="confirmDialog.visible = false">
        <div class="modal-premium confirm-modal" (click)="$event.stopPropagation()">
          <div class="modal-body text-center">
            <div class="confirm-icon" [ngClass]="confirmDialog.type">
               {{ confirmDialog.type === 'danger' ? '⚠️' : 'ℹ️' }}
            </div>
            <h3>Confirmation</h3>
            <p>{{ confirmDialog.message }}</p>
            <div class="confirm-actions">
              <button class="btn-secondary" (click)="confirmDialog.visible = false">Annuler</button>
              <button [class]="confirmDialog.type === 'danger' ? 'btn-danger' : 'btn-primary'" (click)="onConfirm()">Confirmer</button>
            </div>
          </div>
        </div>
        </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #00ccff;
      --primary-dark: #0099cc;
      --noir: #111827;
      --accent: #e0f7ff;
      --bg: #f8fafc;
      --white: #ffffff;
      --text: #1e293b;
      --text-light: #64748b;
      --border: #e2e8f0;
      --shadow: 0 10px 25px rgba(0, 137, 123, 0.08);
      --danger: #ef4444;
      --success: #00ccff;
      --warning: #f59e0b;
      --info: #3b82f6;
    }

    /* Pro Toasts */
    .toast-container { position: fixed; top: 30px; right: 30px; z-index: 9999; display: flex; flex-direction: column; gap: 15px; }
    .toast { display: flex; align-items: center; gap: 15px; background: white; padding: 16px 25px; border-radius: 20px; box-shadow: 0 15px 40px rgba(0,0,0,0.12); border-left: 6px solid; animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1); cursor: pointer; min-width: 320px; text-align: left; }
    .toast.success { border-left-color: var(--success); }
    .toast.error { border-left-color: var(--danger); }
    .toast-icon { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; color: white; flex-shrink: 0; font-size: 1rem; }
    .toast.success .toast-icon { background: var(--success); }
    .toast.error .toast-icon { background: var(--danger); }
    .toast-content { display: flex; flex-direction: column; }
    .toast-title { font-weight: 800; font-size: 0.9rem; color: var(--text); }
    .toast-text { font-size: 0.8rem; color: var(--text-light); }
    @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

    /* Custom Confirm Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(38, 50, 56, 0.4); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
    .modal-premium { background: white; width: 100%; max-width: 450px; border-radius: 30px; box-shadow: 0 30px 60px rgba(0,0,0,0.2); overflow: hidden; animation: slideUp 0.4s ease-out; }
    @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .modal-body { padding: 25px; }
    .confirm-icon { font-size: 3rem; margin-bottom: 15px; }
    .confirm-actions { display: flex; gap: 12px; justify-content: center; margin-top: 25px; }
    .btn-secondary { background: #f1f5f9; color: #475569; border: none; padding: 10px 20px; border-radius: 50px; font-weight: 700; cursor: pointer; font-size: 0.75rem; }
    .btn-danger { background: #fee2e2; color: #ef4444; border: 1px solid #fecaca; padding: 10px 20px; border-radius: 50px; font-weight: 700; cursor: pointer; transition: 0.2s; font-size: 0.75rem; }
    .btn-danger:hover { background: #ef4444; color: white; }
    .text-center { text-align: center; }

    .spinner-mini { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: white; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .text-btn { display: flex; align-items: center; gap: 6px; }

    .admin-page-container { padding: 40px 50px; background: var(--bg); min-height: 100vh; }
    .admin-compact-wrapper { max-width: 1100px; margin: 0 auto; }
    
    .content-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
    .content-header h1 { font-size: 1.8rem; font-weight: 900; color: var(--noir); letter-spacing: -1px; }
    .content-header h1 span { color: var(--primary); }

    .card { background: white; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #EDF2F7; overflow: hidden; transition: 0.3s; }
    .table-card { border-radius: 24px !important; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02) !important; border: 1px solid #E2E8F0 !important; }

    .table-responsive { border-radius: 16px; overflow: hidden; border: 1px solid #EDF2F7; }
    .premium-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.70rem; }
    .premium-table th { background: #F8FAFC; padding: 14px 16px; text-align: center; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; color: #64748B; border-bottom: 1px solid #EDF2F7; }
    .premium-table td { padding: 12px 16px; border-bottom: 1px solid #F1F5F9; vertical-align: middle; text-align: center; background: white; transition: background 0.2s; }
    .premium-table tr:hover td { background: #F9FBFF; }
    .premium-table tr:last-child td { border-bottom: none; }
    .text-center { text-align: center !important; }
    
    .product-cell { display: flex; align-items: center; gap: 8px; }
    .p-thumb { width: 44px; height: 44px; background: var(--accent); color: var(--primary-dark); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1rem; overflow: hidden; }
    .p-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .p-meta { display: flex; flex-direction: column; }
    .p-name { font-weight: 800; font-size: 0.8rem; color: var(--text); }
    .p-loc { font-size: 0.65rem; color: var(--text-light); }
    
    .category-tag { background: #e0f7ff; color: var(--primary-dark); padding: 4px 10px; border-radius: 8px; font-weight: 700; font-size: 0.7rem; }
    .user-info { display: flex; flex-direction: column; }
    .user-info strong { font-size: 0.75rem; color: var(--text); }
    .email-sub { font-size: 0.65rem; color: var(--text-light); }

    .status-pill-bordered { padding: 4px 12px; border-radius: 50px; font-size: 0.55rem; font-weight: 1000; text-transform: uppercase; border: 1.5px solid transparent; }
    .status-pill-bordered.en_attente { border-color: #f59e0b; color: #f59e0b; background: rgba(245, 158, 11, 0.05); }
    .status-pill-bordered.valide { border-color: var(--info); color: var(--info); background: #f0f9ff; }
    .status-pill-bordered.activee { border-color: var(--primary); color: var(--primary-dark); background: #e0f7ff; }
    .status-pill-bordered.refuse { border-color: var(--danger); color: var(--danger); background: #fef2f2; }
    .status-pill-bordered.archive { border-color: var(--text-light); color: var(--text-light); background: #f9fafb; }

    .action-group { display: flex; align-items: center; gap: 6px; justify-content: center; }
    .icon-btn-reference { background: transparent; border: none; padding: 2px; border-radius: 4px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
    .icon-btn-reference:hover { transform: scale(1.1); filter: brightness(0.8); }
    .icon-btn-reference.info { color: #5c6c7b; }
    .icon-btn-reference.success { color: #0099cc; }
    .icon-btn-reference.success-check { color: #00ccff; }
    .icon-btn-reference.danger-x { color: #ef4444; }
    .icon-btn-reference.danger { color: #ef4444; }
    
    .text-btn { padding: 5px 10px; border-radius: 9px; font-weight: 800; font-size: 0.6rem; border: none; cursor: pointer; text-transform: uppercase; transition: 0.2s; }
    .text-btn.success { background: var(--success); color: white; }
    .text-btn.danger { background: var(--danger); color: white; }
    .text-btn.primary { background: var(--primary); color: white; }
    .text-btn:hover { filter: brightness(1.1); transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }

    .empty-row { text-align: center; padding: 60px !important; color: var(--text-light); font-style: italic; }

    /* Modal Premium */
    .modal-overlay { position: fixed; inset: 0; background: rgba(38, 50, 56, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
    .modal-premium { background: white; width: 100%; max-width: 650px; border-radius: 28px; box-shadow: 0 30px 60px rgba(0,0,0,0.2); overflow: hidden; animation: slideUp 0.4s ease-out; }
    @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    
    .modal-header { padding: 30px; border-bottom: 1px solid #f1f1f1; display: flex; justify-content: space-between; align-items: center; }
    .modal-header h2 { font-size: 1.4rem; font-weight: 900; margin: 0; }
    .close-modal { background: #f5f5f5; border: none; width: 36px; height: 36px; border-radius: 50%; font-size: 1.5rem; cursor: pointer; transition: 0.3s; }
    .close-modal:hover { background: #eee; transform: rotate(90deg); }

    .modal-body { padding: 30px; display: flex; flex-direction: column; gap: 25px; max-height: 60vh; overflow-y: auto; }
    .product-image-preview-admin { width: 100%; height: 250px; border-radius: 20px; overflow: hidden; margin-bottom: 20px; border: 1px solid var(--border); }
    .product-image-preview-admin img { width: 100%; height: 100%; object-fit: cover; }
    .detail-section label { display: block; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--text-light); margin-bottom: 10px; letter-spacing: 1px; }
    .detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; background: #f9fafb; padding: 20px; border-radius: 16px; }
    .grid-item { display: flex; flex-direction: column; gap: 4px; }
    .grid-item small { font-size: 0.7rem; color: var(--text-light); font-weight: 700; }
    .grid-item span { font-weight: 700; color: var(--text); }
    
    .detail-title { font-size: 1.25rem; font-weight: 800; margin: 0 0 10px; color: var(--text); }
    .detail-desc { font-size: 0.95rem; color: #546e7a; line-height: 1.6; white-space: pre-wrap; margin: 0; }
    
    .refusal-box { background: #fff1f2; color: #be123c; padding: 15px; border-radius: 12px; border-left: 4px solid #f43f5e; font-size: 0.9rem; font-weight: 600; }
    label.danger { color: #f43f5e !important; }

    .modal-footer { padding: 20px 30px; background: #fafafa; border-top: 1px solid #f1f1f1; display: flex; justify-content: flex-end; gap: 12px; }
    .btn-secondary { padding: 12px 24px; border-radius: 14px; border: 1.5px solid #eee; background: white; font-weight: 700; cursor: pointer; transition: 0.2s; }
    .btn-primary { padding: 12px 24px; border-radius: 14px; border: none; background: var(--primary); color: white; font-weight: 700; cursor: pointer; transition: 0.3s; }
    .btn-primary:hover { background: var(--primary-dark); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(77, 182, 172, 0.4); }
  `]
})
export class ProductValidationComponent implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);
  allProducts: any[] = [];
  filteredProducts: any[] = [];
  currentFilter: string = 'ALL';
  selectedProduct: any = null;
  loadingId: number | null = null;

  successMessage = '';
  errorMessage = '';

  confirmDialog = {
    visible: false,
    message: '',
    type: 'primary' as 'primary' | 'danger',
    callback: () => { }
  };

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.adminService.getAllProducts().subscribe(data => {
      setTimeout(() => {
        this.allProducts = data;
        this.applyFilter();
        this.cdr.detectChanges();
      }, 0);
    });
  }

  setFilter(filter: string) {
    this.currentFilter = filter;
    this.applyFilter();
  }

  onFilterDropdownChange(event: any) {
    const val = event.target.value;
    this.setFilter(val);
  }

  applyFilter() {
    if (this.currentFilter === 'ALL') {
      this.filteredProducts = this.allProducts.sort((a, b) => b.id - a.id);
    } else {
      this.filteredProducts = this.allProducts
        .filter(p => p.statutValidation === this.currentFilter)
        .sort((a, b) => b.id - a.id);
    }
  }

  viewDetail(product: any) {
    this.selectedProduct = product;
  }

  onEdit(product: any) {
    const newTitle = prompt('Nouveau titre:', product.titreProduit);
    const newDesc = prompt('Nouvelle description:', product.descriptionDetaillee);
    if (newTitle !== null && newDesc !== null) {
      this.adminService.updateProduct(product.id, { titreProduit: newTitle, descriptionDetaillee: newDesc })
        .subscribe(() => {
          this.loadProducts();
          if (this.selectedProduct && this.selectedProduct.id === product.id) {
            this.selectedProduct = null;
          }
        });
    }
  }

  onValidate(id: number) {
    this.confirmDialog = {
      visible: true,
      message: 'Valider cette annonce ? L\'annonceur sera notifié pour procéder au paiement.',
      type: 'primary',
      callback: () => {
        this.loadingId = id;
        this.adminService.validateProduct(id).subscribe({
          next: () => {
            this.loadingId = null;
            this.showSuccess("Annonce validée. En attente du paiement de l'annonceur.");
            this.loadProducts();
          },
          error: () => {
            this.loadingId = null;
            this.showError("Erreur lors de la validation.");
          }
        });
      }
    };
  }

  onReject(id: number) {
    const reason = prompt('Motif du refus :');
    if (reason) {
      this.adminService.rejectProduct(id, reason).subscribe({
        next: () => {
          this.showSuccess("L'annonce a été refusée.");
          this.loadProducts();
        },
        error: (err) => this.showError("Erreur lors du refus.")
      });
    }
  }

  onSimulatePayment(id: number) {
    this.confirmDialog = {
      visible: true,
      message: 'Simuler le paiement ? L\'annonce passera en statut ACTIVE.',
      type: 'primary',
      callback: () => {
        this.loadingId = id;
        this.adminService.activateProduct(id).subscribe({
          next: () => {
            this.loadingId = null;
            this.showSuccess("Paiement simulé. L'annonce est maintenant ACTIVE.");
            this.loadProducts();
          },
          error: () => {
            this.loadingId = null;
            this.showError("Erreur lors de la simulation.");
          }
        });
      }
    };
  }

  onArchive(id: number) {
    this.confirmDialog = {
      visible: true,
      message: 'Voulez-vous archiver cette annonce ?',
      type: 'primary',
      callback: () => {
        this.loadingId = id;
        this.adminService.archiveProduct(id).subscribe({
          next: () => {
            this.loadingId = null;
            this.showSuccess("Annonce archivée.");
            this.loadProducts();
          },
          error: () => {
            this.loadingId = null;
            this.showError("Erreur lors de l'archivage.");
          }
        });
      }
    };
  }

  onDelete(id: number) {
    this.confirmDialog = {
      visible: true,
      message: 'Supprimer DEFINITIVEMENT cette annonce ? Cette action est irréversible.',
      type: 'danger',
      callback: () => {
        this.loadingId = id;
        this.adminService.deleteProduct(id).subscribe({
          next: () => {
            this.loadingId = null;
            this.showSuccess("Annonce supprimée de la base de données.");
            this.loadProducts();
          },
          error: () => {
            this.loadingId = null;
            this.showError("Erreur lors de la suppression.");
          }
        });
      }
    };
  }

  onConfirm() {
    this.confirmDialog.callback();
    this.confirmDialog.visible = false;
  }

  private showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 4000);
  }

  private showError(msg: string) {
    this.errorMessage = msg;
    setTimeout(() => this.errorMessage = '', 4000);
  }
}
