import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page-container">
      <div class="admin-compact-wrapper">
        <header class="content-header">
          <h1>Gestion des Catégories</h1>
        <div class="header-actions">
           <button class="btn-seed" (click)="onSeed()" *ngIf="categories.length === 0" [disabled]="loading">
             <span>🚀 Initialiser les données</span>
           </button>
           <button class="btn-create" (click)="toggleForm()">
             {{ showForm ? 'Annuler' : '✚ Nouvelle Catégorie' }}
           </button>
        </div>
      </header>

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

      <!-- FORM -->
      <div class="card form-card" *ngIf="showForm">
        <header class="card-header">
           <h3>{{ isEditing ? 'Modifier la catégorie' : 'Créer une catégorie' }}</h3>
        </header>
        <form (ngSubmit)="saveCategory()" class="premium-form">
          <div class="form-grid">
            <div class="field">
              <label>Nom de la catégorie</label>
              <input type="text" [(ngModel)]="newCategory.nomCategorie" name="nom" required 
                     [class.invalid]="attemptedSave && !newCategory.nomCategorie"
                     placeholder="ex: Mode, Électronique...">
              <span class="err-hint" *ngIf="attemptedSave && !newCategory.nomCategorie">Le nom est obligatoire</span>
            </div>
            <div class="field">
              <label>Code Icône (Emoji ou SVG)</label>
              <input type="text" [(ngModel)]="newCategory.iconeCategorie" name="icone" placeholder="ex: 👗, 📱, 🚗">
            </div>
            <div class="field">
              <label>Image de Couverture (URL)</label>
              <input type="text" [(ngModel)]="newCategory.urlImageCouverture" name="urlImage" placeholder="https://...">
            </div>
            <div class="field">
              <label>Catégorie Parente</label>
              <select [(ngModel)]="newCategory.categorieParenteId" name="parenteId">
                <option [ngValue]="null">--- Aucune (Catégorie Racine) ---</option>
                <option *ngFor="let c of categories" [value]="c.id" [hidden]="c.id === newCategory.id">
                  {{ c.nomCategorie }}
                </option>
              </select>
            </div>
            <div class="field full-width">
              <label>Description</label>
              <textarea [(ngModel)]="newCategory.descriptionCategorie" name="desc" rows="3" placeholder="Description courte..."></textarea>
            </div>
            <div class="field">
               <label>Statut Activation</label>
               <div class="status-toggle" [class.active]="newCategory.categorieActive" (click)="newCategory.categorieActive = !newCategory.categorieActive">
                  <div class="toggle-track">
                    <div class="toggle-thumb"></div>
                  </div>
                  <span>{{ newCategory.categorieActive ? 'Active' : 'Inactive' }}</span>
               </div>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-submit" [disabled]="loading">
               <div class="spinner" *ngIf="loading"></div>
               <span>{{ loading ? 'Traitement...' : (isEditing ? 'Mettre à jour' : 'Enregistrer la catégorie') }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- User Confirmation Modal -->
      <div *ngIf="confirmDialog.visible" class="modal-overlay" (click)="confirmDialog.visible = false">
        <div class="modal-premium confirm-modal" (click)="$event.stopPropagation()">
          <div class="modal-body text-center">
            <div class="confirm-icon">📁</div>
            <h3>Confirmation</h3>
            <p>{{ confirmDialog.message }}</p>
            <div class="confirm-actions">
              <button class="btn-secondary" (click)="confirmDialog.visible = false">Annuler</button>
              <button class="btn-danger" (click)="onConfirm()">Confirmer l'opération</button>
            </div>
          </div>
        </div>
      </div>

      <!-- LIST -->
      <div class="card table-card">
        <div class="table-responsive">
          <table class="premium-table">
            <thead>
              <tr>
                <th width="70" class="text-center">ID</th>
                <th width="60">Icône</th>
                <th width="80">Couverture</th>
                <th>Détails de la Catégorie</th>
                <th width="150">Parent / Hiérarchie</th>
                <th width="100">Statut</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
               <tr *ngFor="let cat of categories">
                <td class="text-center"><code class="code-id">#{{ cat.id }}</code></td>
                <td>
                  <div class="cat-icon-mini">{{ cat.iconeCategorie || '📁' }}</div>
                </td>
                <td>
                  <div class="cat-cover-mini">
                    <img *ngIf="cat.urlImageCouverture" [src]="cat.urlImageCouverture" alt="Cover">
                    <div *ngIf="!cat.urlImageCouverture" class="no-img">∅</div>
                  </div>
                </td>
                <td>
                  <div class="cat-main-info">
                    <span class="cat-name">{{ cat.nomCategorie }}</span>
                    <p class="cat-desc-full" *ngIf="cat.descriptionCategorie">{{ cat.descriptionCategorie }}</p>
                  </div>
                </td>
                <td>
                  <span class="parent-name-tag" *ngIf="cat.categorieParenteId">
                     <i class="parent-arrow">↳</i> {{ getParentName(cat.categorieParenteId) }}
                  </span>
                  <span class="root-tag" *ngIf="!cat.categorieParenteId">Racine</span>
                </td>
                <td>
                   <span class="status-pill-bordered" [class.activee]="cat.categorieActive" [class.archive]="!cat.categorieActive">
                      {{ cat.categorieActive ? 'Active' : 'Inactive' }}
                   </span>
                </td>
                <td class="text-right">
                  <div class="action-row">
                    <button class="btn-icon edit" (click)="editCategory(cat)" title="Modifier">✏️</button>
                    <button class="btn-icon delete" (click)="deleteCategory(cat.id)" title="Supprimer">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="empty-state" *ngIf="categories.length === 0">
          <p>Aucune catégorie définie. Utilisez le bouton d'initialisation pour commencer.</p>
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
    }

    .btn-seed { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; padding: 10px 20px; border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.3s; margin-right: 15px; }
    .btn-seed:hover { background: #dcfce7; transform: scale(1.05); }

    .admin-page-container { padding: 30px 20px; background: var(--bg); min-height: 100vh; }
    .admin-compact-wrapper { max-width: 1100px; margin: 0 auto; }
    .content-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .content-header h1 { font-size: 1.8rem; font-weight: 900; color: var(--noir); letter-spacing: -0.5px; }
    
    .header-actions { display: flex; align-items: center; gap: 15px; justify-content: flex-end; }

    /* Pro Toasts */
    .toast-container { position: fixed; top: 30px; right: 30px; z-index: 9999; display: flex; flex-direction: column; gap: 15px; }
    .toast { display: flex; align-items: center; gap: 15px; background: white; padding: 16px 25px; border-radius: 20px; box-shadow: 0 15px 40px rgba(0,0,0,0.12); border-left: 6px solid; animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1); cursor: pointer; min-width: 320px; text-align: left; }
    .toast.success { border-left-color: #10b981; }
    .toast.error { border-left-color: var(--danger); }
    .toast-icon { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; color: white; flex-shrink: 0; font-size: 1rem; }
    .toast.success .toast-icon { background: #10b981; }
    .toast.error .toast-icon { background: var(--danger); }
    .toast-content { display: flex; flex-direction: column; }
    .toast-title { font-weight: 800; font-size: 0.9rem; color: var(--text); }
    .toast-text { font-size: 0.8rem; color: var(--text-light); }
    @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

    .card { background: white; border-radius: 30px; box-shadow: var(--shadow); border: 1px solid var(--white); overflow: hidden; transition: 0.3s; }
    .form-card { margin-bottom: 30px; animation: expand 0.4s ease; max-width: 850px; margin-left: auto; margin-right: auto; }
    @keyframes expand { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    
    .card-header { padding: 15px 25px; border-bottom: 1px solid var(--border); }
    .card-header h3 { margin: 0; font-size: 1rem; font-weight: 800; }

    .premium-form { padding: 20px 35px; }
    .form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px 30px; }
    .field { display: flex; flex-direction: column; gap: 2px; }
    .field label { font-size: 0.58rem; font-weight: 1000; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; padding-left: 10px; }
    .field input, .field textarea, .field select { padding: 6px 14px; border-radius: 30px; border: 1.5px solid var(--border); background: #fafdfd; font-size: 0.7rem; transition: 0.3s; width: 100%; height: 28px; }
    .field textarea { height: auto; border-radius: 15px; }
    .field input:focus, .field textarea:focus, .field select:focus { border-color: var(--primary); outline: none; background: white; }
    .field input.invalid { border-color: #ef4444; background: #fffafb; }
    .field .err-hint { font-size: 0.6rem; color: var(--danger); font-weight: 800; text-transform: none; margin-top: 1px; padding-left: 10px; }
    .full-width { grid-column: 1 / -1; }

    .status-toggle { display: flex; align-items: center; gap: 10px; cursor: pointer; }
    .toggle-track { width: 44px; height: 24px; background: #eaedf0; border-radius: 20px; position: relative; transition: 0.3s; border: 1px solid #ddd; }
    .toggle-thumb { width: 18px; height: 18px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 3px; transition: 0.3s; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    .active .toggle-track { background: var(--primary); border-color: var(--primary-dark); }
    .active .toggle-thumb { left: calc(100% - 21px); }
    .status-toggle span { font-size: 0.75rem; font-weight: 800; color: var(--text-light); }
    .active span { color: var(--primary-dark); }

    .form-actions { margin-top: 20px; display: flex; justify-content: flex-end; }
    .btn-submit { background: var(--primary); color: white; border: none; padding: 8px 25px; border-radius: 50px; font-weight: 800; font-size: 0.75rem; cursor: pointer; transition: 0.3s; box-shadow: 0 10px 20px rgba(0, 105, 92, 0.15); display: flex; align-items: center; gap: 8px; }
    .btn-submit:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(0, 105, 92, 0.35); filter: brightness(1.1); }
    .spinner { width: 22px; height: 22px; border: 3px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: white; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .table-card { border-radius: 20px; overflow: hidden; }
    .table-responsive { overflow-x: auto; }
    .premium-table { width: 100%; border-collapse: collapse; text-align: left; border: 1.5px solid var(--border); font-size: 0.8rem; }
    .premium-table th { background: #f8fafc; padding: 10px 18px; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 1px; border-bottom: 2px solid var(--border); border-right: 1px solid var(--border); }
    .premium-table th:last-child { border-right: none; }
    .premium-table td { padding: 10px 18px; border-bottom: 1px solid #f1f5f9; border-right: 1px solid var(--border); vertical-align: middle; }
    .premium-table td:last-child { border-right: none; }
    
    .cat-icon-mini { width: 34px; height: 34px; background: var(--accent); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
    .cat-cover-mini { width: 44px; height: 32px; border-radius: 6px; overflow: hidden; background: #eee; border: 1px solid var(--border); }
    .cat-cover-mini img { width: 100%; height: 100%; object-fit: cover; }
    .cat-cover-mini .no-img { font-size: 0.6rem; color: #ccc; display: flex; align-items: center; justify-content: center; height: 100%; font-weight: 800; }

    .cat-name { font-weight: 850; color: var(--noir); font-size: 0.85rem; display: block; }
    .cat-desc-full { font-size: 0.75rem; color: var(--text-light); margin: 3px 0 0; line-height: 1.3; font-weight: 500; }
    
    .parent-name-tag { display: inline-flex; align-items: center; gap: 5px; font-size: 0.7rem; font-weight: 700; color: var(--primary-dark); background: var(--accent); padding: 3px 10px; border-radius: 8px; }
    .parent-arrow { font-style: normal; color: var(--primary); font-weight: 900; }
    .root-tag { font-size: 0.7rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

    .status-pill-bordered { padding: 4px 10px; border-radius: 12px; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; border: 1.5px solid transparent; }
    .status-pill-bordered.activee { border-color: var(--primary); color: var(--primary-dark); background: #f0fdfa; }
    .status-pill-bordered.archive { border-color: #e2e8f0; color: #64748b; background: #f8fafc; }
    .code-id { background: #f1f5f9; color: #475569; padding: 4px 8px; border-radius: 6px; font-weight: 700; font-size: 0.75rem; font-family: 'JetBrains Mono', monospace; }

    .action-row { display: flex; gap: 8px; justify-content: flex-end; }
    .btn-icon { width: 32px; height: 32px; border-radius: 8px; border: 1px solid #eee; background: white; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; }
    .btn-icon:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.05); border-color: var(--primary); }
    .btn-icon.delete:hover { background: #fef2f2; border-color: var(--danger); color: var(--danger); }
    .text-right { text-align: right; }

    .empty-state { padding: 80px 40px; text-align: center; color: var(--text-light); font-weight: 600; }

    .btn-create { background: var(--noir); color: white; border: none; padding: 14px 28px; border-radius: 16px; font-weight: 900; cursor: pointer; transition: 0.3s; box-shadow: 0 10px 20px rgba(0,0,0,0.15); }
    .btn-create:hover { background: var(--primary); transform: translateY(-3px); }

    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
    .modal-premium { background: white; border-radius: 36px; width: 100%; max-width: 480px; box-shadow: 0 50px 100px rgba(0,0,0,0.3); overflow: hidden; animation: slideUp 0.4s ease; }
    .confirm-actions { display: flex; gap: 15px; justify-content: center; margin-top: 35px; }
    .btn-secondary { background: #f1f5f9; color: #475569; border: none; padding: 14px 30px; border-radius: 14px; font-weight: 800; cursor: pointer; }
    .btn-danger { background: #fee2e2; color: var(--danger); border: 1px solid #fecaca; padding: 14px 30px; border-radius: 14px; font-weight: 800; cursor: pointer; transition: 0.2s; }
    .btn-danger:hover { background: var(--danger); color: white; transform: translateY(-3px); }
    .text-center { text-align: center; }
    .confirm-icon { font-size: 4rem; margin-bottom: 15px; }
  `]
})
export class CategoryManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  categories: any[] = [];
  showForm = false;
  isEditing = false;
  loading = false;
  attemptedSave = false;

  successMessage = '';
  errorMessage = '';

  newCategory: any = { id: 0, nomCategorie: '', iconeCategorie: '', descriptionCategorie: '', categorieActive: true, urlImageCouverture: '', categorieParenteId: null };

  confirmDialog = {
    visible: false,
    message: '',
    callback: () => { }
  };

  ngOnInit() {
    this.loadCategories();
  }

  getParentName(id: number): string {
    const parent = this.categories.find(c => c.id === Number(id));
    return parent ? parent.nomCategorie : 'Inconnu';
  }

  onSeed() {
    this.loading = true;
    this.adminService.createCategorie({ seed: true }).subscribe({
      next: () => {
        this.successMessage = "Données initiales générées avec succès !";
        this.loadCategories();
        this.loading = false;
      },
      error: () => {
        this.errorMessage = "Impossible d'initialiser les données automatiquement.";
        this.loading = false;
      }
    });
  }

  loadCategories() {
    this.adminService.getCategories().subscribe(data => {
      this.categories = data;
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    this.isEditing = false;
    this.attemptedSave = false;
    this.newCategory = { id: 0, nomCategorie: '', iconeCategorie: '', descriptionCategorie: '', categorieActive: true, urlImageCouverture: '', categorieParenteId: null };
  }

  editCategory(cat: any) {
    this.newCategory = {
      id: cat.id,
      nomCategorie: cat.nomCategorie,
      iconeCategorie: cat.iconeCategorie,
      descriptionCategorie: cat.descriptionCategorie || '',
      categorieActive: cat.categorieActive ?? true,
      urlImageCouverture: cat.urlImageCouverture || '',
      categorieParenteId: cat.categorieParenteId || null
    };
    this.isEditing = true;
    this.showForm = true;
    this.attemptedSave = false;
  }

  saveCategory() {
    this.attemptedSave = true;
    if (!this.newCategory.nomCategorie) return;

    this.loading = true;
    const obs = this.isEditing ?
      this.adminService.updateCategorie(this.newCategory.id, this.newCategory) :
      this.adminService.createCategorie(this.newCategory);

    obs.subscribe({
      next: () => {
        this.loading = false;
        this.attemptedSave = false;
        this.successMessage = `La catégorie a été ${this.isEditing ? 'mise à jour' : 'enregistrée'} avec succès.`;
        this.loadCategories();
        this.toggleForm();
        setTimeout(() => this.successMessage = '', 4000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || err.error?.error || "Erreur lors de l'enregistrement.";
      }
    });
  }

  deleteCategory(id: number) {
    this.confirmDialog = {
      visible: true,
      message: "Voulez-vous vraiment supprimer cette catégorie ? Cela pourrait impacter les annonces liées.",
      callback: () => {
        this.adminService.deleteCategorie(id).subscribe(() => {
          this.successMessage = "Catégorie supprimée avec succès.";
          this.loadCategories();
        });
      }
    };
  }

  onConfirm() {
    this.confirmDialog.callback();
    this.confirmDialog.visible = false;
  }
}
