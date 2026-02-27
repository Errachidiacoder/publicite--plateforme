import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-product-validation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-page-container">
      <div class="admin-compact-wrapper">
        <header class="content-header">
          <h1>Gestion des Annonces</h1>
      </header>

      <div class="filter-bar">
        <div class="tabs-premium">
          <button [class.active]="currentFilter === 'EN_ATTENTE'" (click)="setFilter('EN_ATTENTE')">
            <span class="dot warning"></span> En Attente
          </button>
          <button [class.active]="currentFilter === 'VALIDE'" (click)="setFilter('VALIDE')">
            <span class="dot info"></span> Validées
          </button>
          <button [class.active]="currentFilter === 'ACTIVEE'" (click)="setFilter('ACTIVEE')">
            <span class="dot success"></span> Actives
          </button>
          <button [class.active]="currentFilter === 'REFUSE'" (click)="setFilter('REFUSE')">
            <span class="dot danger"></span> Refusées
          </button>
          <button [class.active]="currentFilter === 'ALL'" (click)="setFilter('ALL')">
             Toutes
          </button>
        </div>
      </div>

      <div class="card table-card">
        <div class="table-responsive">
          <table class="premium-table">
            <thead>
              <tr>
                <th width="70" class="text-center">ID</th>
                <th>Produit</th>
                <th>Annonceur</th>
                <th width="110">Date</th>
                <th width="100">Statut</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let prod of filteredProducts">
                <td class="text-center"><code class="code-id">#{{ prod.id }}</code></td>
                <td>
                  <div class="product-cell">
                    <div class="p-thumb">
                      <img *ngIf="prod.imageUrl" [src]="prod.imageUrl" alt="Thumb">
                      <span *ngIf="!prod.imageUrl">{{ prod.titreProduit?.charAt(0) }}</span>
                    </div>
                    <div class="p-meta">
                      <span class="p-name">{{ prod.titreProduit }}</span>
                      <span class="p-loc">{{ prod.villeLocalisation }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="user-info">
                    <strong>{{ prod.annonceur?.nomComplet }}</strong>
                    <span class="email-sub">{{ prod.annonceur?.adresseEmail }}</span>
                  </div>
                </td>
                <td>{{ prod.dateSoumission | date:'dd/MM/yyyy' }}</td>
                <td>
                  <span class="status-pill-bordered" [ngClass]="prod.statutValidation.toLowerCase()">
                    {{ prod.statutValidation }}
                  </span>
                </td>
                <td class="actions-cell text-right">
                  <div class="action-group">
                    <button (click)="viewDetail(prod)" class="icon-btn info" title="Détails">👁️</button>
                    <button (click)="onEdit(prod)" class="icon-btn warning" title="Modifier">✏️</button>

                    <!-- Actions pour EN_ATTENTE -->
                    <ng-container *ngIf="prod.statutValidation === 'EN_ATTENTE'">
                      <button (click)="onValidate(prod.id)" class="text-btn success" [disabled]="loadingId === prod.id">
                        <span>Valider</span>
                      </button>
                      <button (click)="onReject(prod.id)" class="text-btn danger" [disabled]="loadingId === prod.id">
                        <span>Refuser</span>
                      </button>
                    </ng-container>
                    
                    <ng-container *ngIf="prod.statutValidation === 'VALIDE'">
                      <button (click)="onSimulatePayment(prod.id)" class="text-btn primary" [disabled]="loadingId === prod.id">
                        <div class="spinner-mini" *ngIf="loadingId === prod.id"></div>
                        <span>{{ loadingId === prod.id ? '...' : 'Activer' }}</span>
                      </button>
                    </ng-container>

                    <ng-container *ngIf="prod.statutValidation === 'ACTIVEE' || prod.statutValidation === 'VALIDE' || prod.statutValidation === 'REFUSE'">
                      <button (click)="onArchive(prod.id)" class="icon-btn archive" title="Archiver" [disabled]="loadingId === prod.id">📦</button>
                    </ng-container>

                    <button (click)="onDelete(prod.id)" class="icon-btn delete" title="Supprimer" [disabled]="loadingId === prod.id">🗑️</button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredProducts.length === 0">
                <td colspan="5" class="empty-row">Aucune annonce trouvée pour ce filtre.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

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
      --primary: #4db6ac;
      --primary-dark: #00897b;
      --noir: #111827;
      --accent: #e0f2f1;
      --bg: #f8fafc;
      --white: #ffffff;
      --text: #1e293b;
      --text-light: #64748b;
      --border: #e2e8f0;
      --shadow: 0 10px 25px rgba(0, 137, 123, 0.08);
      --danger: #ef4444;
      --success: #10b981;
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

    .filter-bar { margin-bottom: 20px; }
    .tabs-premium { display: flex; gap: 6px; background: white; padding: 4px; border-radius: 50px; width: fit-content; box-shadow: var(--shadow); border: 1px solid var(--white); }
    .tabs-premium button { padding: 6px 16px; border: none; background: transparent; border-radius: 50px; font-weight: 800; font-size: 0.65rem; color: var(--text-light); cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 5px; text-transform: uppercase; letter-spacing: 0.3px; }
    .tabs-premium button:hover { background: #f0fdf9; color: var(--primary); }
    .tabs-premium button.active { background: var(--noir); color: white; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
    
    .dot { width: 8px; height: 8px; border-radius: 50%; }
    .dot.warning { background: var(--warning); }
    .dot.info { background: var(--info); }
    .dot.success { background: var(--success); }
    .dot.danger { background: var(--danger); }
    .active .dot { background: white; }

    .table-card { background: white; border-radius: 30px; padding: 0; overflow: hidden; box-shadow: var(--shadow); border: 1px solid var(--white); }
    .premium-table { width: 100%; border-collapse: collapse; border: 1.5px solid var(--border); font-size: 0.75rem; }
    .premium-table th { background: #fafdfd; padding: 8px 15px; text-align: left; font-size: 0.6rem; font-weight: 900; text-transform: uppercase; color: var(--text-light); letter-spacing: 0.5px; border-bottom: 2px solid var(--border); border-right: 1px solid var(--border); }
    .premium-table th:last-child { border-right: none; }
    .premium-table td { padding: 8px 15px; border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); vertical-align: middle; }
    .premium-table td:last-child { border-right: none; }
    
    .product-cell { display: flex; align-items: center; gap: 12px; }
    .p-thumb { width: 44px; height: 44px; background: var(--accent); color: var(--primary-dark); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1rem; overflow: hidden; }
    .p-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .p-meta { display: flex; flex-direction: column; }
    .p-name { font-weight: 800; font-size: 0.85rem; color: var(--text); }
    .p-loc { font-size: 0.7rem; color: var(--text-light); }
    
    .category-tag { background: #f0fdf9; color: var(--primary-dark); padding: 4px 10px; border-radius: 8px; font-weight: 700; font-size: 0.7rem; }
    .user-info { display: flex; flex-direction: column; }
    .user-info strong { font-size: 0.8rem; color: var(--text); }
    .email-sub { font-size: 0.7rem; color: var(--text-light); }

    .status-pill-bordered { padding: 3px 10px; border-radius: 50px; font-size: 0.58rem; font-weight: 1000; text-transform: uppercase; border: 1.5px solid transparent; }
    .status-pill-bordered.en_attente { border-color: var(--warning); color: var(--warning); background: #fffdf7; }
    .status-pill-bordered.valide { border-color: var(--info); color: var(--info); background: #f0f9ff; }
    .status-pill-bordered.activee { border-color: var(--primary); color: var(--primary-dark); background: #f0fdfa; }
    .status-pill-bordered.refuse { border-color: var(--danger); color: var(--danger); background: #fef2f2; }
    .status-pill-bordered.archive { border-color: var(--text-light); color: var(--text-light); background: #f9fafb; }

    .action-group { display: flex; align-items: center; gap: 6px; justify-content: flex-end; }
    .icon-btn { width: 32px; height: 32px; border-radius: 8px; border: 1px solid #eee; background: white; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; }
    .icon-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.05); }
    .icon-btn.info:hover { border-color: var(--info); }
    .icon-btn.warning:hover { border-color: var(--warning); }
    .icon-btn.archive:hover { border-color: var(--primary); }
    .icon-btn.delete:hover { border-color: var(--danger); color: var(--danger); }
    
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
  allProducts: any[] = [];
  filteredProducts: any[] = [];
  currentFilter: string = 'EN_ATTENTE';
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
      this.allProducts = data;
      this.applyFilter();
    });
  }

  setFilter(filter: string) {
    this.currentFilter = filter;
    this.applyFilter();
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
