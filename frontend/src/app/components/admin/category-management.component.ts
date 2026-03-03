import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
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
        <div style="height: 20px;"></div>

      <!-- ... Toasts ... -->

      <!-- FORMS -->
      <div class="card form-card" *ngIf="showForm">
        <header class="card-header">
           <h3>{{ isEditing ? "Modifier la catégorie" : "Créer une catégorie" }}</h3>
        </header>
        <form (ngSubmit)="saveCategory()" class="premium-form">
          <div class="form-grid">
            <div class="field">
              <div class="label-row">
                <label>Nom de la catégorie</label>
                <span class="field-status ok" *ngIf="newCategory.nomCategorie">&#10003;</span>
                <span class="field-status err" *ngIf="attemptedSave && !newCategory.nomCategorie">Requis</span>
              </div>
              <input type="text" [(ngModel)]="newCategory.nomCategorie" name="nom" 
                     [class.invalid]="attemptedSave && !newCategory.nomCategorie" 
                     placeholder="Ex: Électronique" required>
            </div>
            
            <div class="field">
              <div class="label-row">
                <label>Icône (Emoji)</label>
                <span class="field-status ok" *ngIf="newCategory.iconeCategorie">&#10003;</span>
              </div>
              <input type="text" [(ngModel)]="newCategory.iconeCategorie" name="icone" placeholder="Ex: 📱">
            </div>

            <div class="field">
                <label>Catégorie Parente</label>
                <select [(ngModel)]="newCategory.categorieParenteId" name="parent">
                    <option [ngValue]="null">Aucune (Racine)</option>
                    <option *ngFor="let c of categories" [ngValue]="c.id" [hidden]="c.id === newCategory.id">{{ c.nomCategorie }}</option>
                </select>
            </div>

            <div class="field">
              <label>Statut</label>
              <div class="premium-switches">
                <div class="switch-item">
                  <span class="switch-label">Active</span>
                  <div class="status-toggle" [class.active]="newCategory.categorieActive" (click)="newCategory.categorieActive = !newCategory.categorieActive">
                    <div class="toggle-track"><div class="toggle-thumb"></div></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="field span-2">
              <div class="label-row">
                <label>Description</label>
                <span class="field-status ok" *ngIf="newCategory.descriptionCategorie">&#10003;</span>
              </div>
              <input type="text" [(ngModel)]="newCategory.descriptionCategorie" name="desc" placeholder="Brève description...">
            </div>
          </div>
          <div class="form-footer">
            <button type="submit" class="btn-primary" [disabled]="loading">
               <div class="spinner" *ngIf="loading"></div>
               <span>{{ loading ? 'Traitement...' : 'Enregistrer' }}</span>
            </button>
          </div>
        </form>
      </div>

    <div class="admin-page-content" *ngIf="!showForm">
      <div class="card table-card" style="padding: 30px;">
        <div class="table-header-row" style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 25px;">
            <div class="table-title-area" style="display:flex; align-items:center; gap:20px;">
                <div>
                  <h2 style="margin:0; font-size:1.4rem; font-weight:700; color:#1A202C;">Catégories</h2>
                </div>
            </div>
            <div class="table-tools" style="display:flex; align-items:center; gap:25px; margin-left: auto;">
                <div class="search-input-wrapper">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7E7E7E" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input type="text" placeholder="Search">
                </div>
                <button class="btn-seed" (click)='onSeed()' *ngIf="categories.length === 0" [disabled]="loading" style="margin:0; padding: 8px 16px; font-size: 0.75rem;">
                   🚀 Initialiser
                </button>
                <button class="btn-create-luxe" (click)="toggleForm()" style="padding: 10px 20px; font-size: 0.8rem; margin:0; border-radius:12px;">
                   {{ showForm ? 'Annuler' : '✚ Nouveau' }}
                </button>
            </div>
        </div>

        <div class="table-responsive">
          <table class="premium-table">
            <thead>
              <tr>
                <th class="text-center">Icône</th>
                <th class="text-center">Nom</th>
                <th class="text-center">Description</th>
                <th class="text-center">Hiérarchie</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let cat of categories">
                <td class="text-center">
                  <div class="table-avatar" style="width:28px; height:28px; font-size:1rem; margin:0 auto;">{{ cat.iconeCategorie || '📁' }}</div>
                </td>
                <td class="text-center"><span class="u-name" style="font-size:0.75rem;">{{ cat.nomCategorie }}</span></td>
                <td class="text-center"><span style="color:#718096; font-size:0.7rem;" *ngIf="cat.descriptionCategorie">{{ cat.descriptionCategorie | slice:0:30 }}...</span></td>
                <td class="text-center">
                  <span class="parent-name-tag" style="font-size:0.6rem; padding:2px 8px;" *ngIf="cat.parentCategorie?.nomCategorie">
                    {{ cat.parentCategorie.nomCategorie }}
                  </span>
                  <span class="root-tag" style="font-size:0.6rem;" *ngIf="!cat.parentCategorie?.nomCategorie">Racine</span>
                </td>
                <td class="text-center">
                  <div class="action-row" style="justify-content:center; gap:10px;">
                    <button class="icon-btn-reference success" (click)="editCategory(cat)" title="Modifier">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="icon-btn-reference danger" (click)="deleteCategory(cat.id!)" title="Supprimer">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
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
    }

    .btn-seed { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; padding: 10px 20px; border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.3s; margin-right: 15px; }
    .btn-seed:hover { background: #dcfce7; transform: scale(1.05); }

    .form-card { margin-bottom: 40px; animation: expand 0.4s ease; max-width: 850px; margin-left: auto; margin-right: auto; border: 1px solid rgba(77, 182, 172, 0.1); }
    @keyframes expand { from { transform: scale(0.98); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    
    .card-header { padding: 15px 25px; border-bottom: 1px solid var(--border); background: linear-gradient(to right, #fafdfd, white); }
    .card-header h3 { margin: 0; font-size: 1rem; font-weight: 1000; color: #1e293b; }

    .premium-form { padding: 20px 35px; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px 30px; }
    .span-2 { grid-column: span 2; }
    @media (max-width: 800px) { .span-2 { grid-column: span 1; } .form-grid { grid-template-columns: 1fr; } }
    
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label { font-size: 0.65rem; font-weight: 1000; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0px; padding-left: 12px; }
    .field input, .field select, .premium-switches { 
      padding: 0 20px; 
      border-radius: 30px; 
      border: 1.5px solid var(--border); 
      background: #fafdfd; 
      font-size: 0.75rem; 
      transition: 0.2s; 
      width: 100%; 
      height: 42px; 
      box-sizing: border-box;
    }
    .field input { border-right: 3px solid transparent; }
    .field input:focus, .field select:focus { border-color: var(--primary); outline: none; background: white; border-right-color: var(--primary); box-shadow: 0 4px 10px rgba(0, 204, 255, 0.05); }
    .field input.invalid { border-color: #ef4444; background: #fffafb; border-right-color: #ef4444; }

    .label-row { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
    .field-status { font-size: 0.6rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; text-transform: uppercase; }
    .field-status.ok { color: #0099cc; background: #e0f7ff; }
    .field-status.err { color: #ef4444; background: #fff1f2; }

    .form-footer { margin-top: 30px; padding: 20px 35px; background: #fafdfd; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; }
    .btn-primary { background: var(--primary); color: white; border: none; padding: 12px 35px; border-radius: 40px; font-weight: 900; font-size: 0.85rem; cursor: pointer; transition: 0.3s; box-shadow: 0 8px 20px rgba(0, 204, 255, 0.2); text-transform: uppercase; letter-spacing: 1.5px; }
    .btn-primary:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); box-shadow: 0 12px 25px rgba(0, 204, 255, 0.3); }
    
    .spinner { width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: white; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .premium-switches { display: flex; gap: 20px; align-items: center; padding: 0 25px; border: 1.5px solid var(--border) !important; }
    .switch-item { display: flex; align-items: center; gap: 12px; width: 100%; justify-content: space-between; }
    .switch-label { font-size: 0.65rem; font-weight: 1000; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }

    .status-toggle { display: flex; align-items: center; gap: 10px; cursor: pointer; }
    .toggle-track { width: 44px; height: 24px; background: #eaedf0; border-radius: 20px; position: relative; transition: 0.3s; border: 1px solid #ddd; }
    .toggle-thumb { width: 18px; height: 18px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 3px; transition: 0.3s; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    .active .toggle-track { background: var(--primary); border-color: var(--primary-dark); }
    .active .toggle-thumb { left: calc(100% - 21px); }

    .admin-page-container { padding: 30px 20px; background: var(--bg); min-height: 100vh; }
    .admin-compact-wrapper { max-width: 1100px; margin: 0 auto; }
    
    .content-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
    .content-header h1 { font-size: 1.8rem; font-weight: 900; color: var(--noir); letter-spacing: -1px; }

    .card { background: white; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #EDF2F7; overflow: hidden; transition: 0.3s; }
    .table-card { border-radius: 24px !important; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02) !important; border: 1px solid #E2E8F0 !important; }

    .table-responsive { border-radius: 16px; overflow: hidden; border: 1px solid #EDF2F7; }
    .premium-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.70rem; }
    .premium-table th { background: #F8FAFC; padding: 14px 16px; text-align: center; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; color: #64748B; border-bottom: 1px solid #EDF2F7; }
    .premium-table td { padding: 12px 16px; border-bottom: 1px solid #F1F5F9; vertical-align: middle; text-align: center; background: white; transition: background 0.2s; }
    .premium-table tr:hover td { background: #F9FBFF; }
    .premium-table tr:last-child td { border-bottom: none; }
    .text-center { text-align: center !important; }
    
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
    .status-pill-bordered.activee { border-color: var(--primary); color: var(--primary-dark); background: #e0f7ff; }
    .status-pill-bordered.archive { border-color: #e2e8f0; color: #64748b; background: #f8fafc; }
    .code-id { background: #f1f5f9; color: #475569; padding: 4px 8px; border-radius: 6px; font-weight: 700; font-size: 0.75rem; font-family: 'JetBrains Mono', monospace; }

    .action-row { display: flex; gap: 10px; justify-content: center; }
    .icon-btn-reference { background: transparent; border: none; padding: 2px; border-radius: 4px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
    .icon-btn-reference:hover { transform: scale(1.1); filter: brightness(0.8); }
    .icon-btn-reference.success { color: #0099cc; }
    .icon-btn-reference.danger { color: #ef4444; }
    .text-center { text-align: center; }

    .empty-state { padding: 80px 40px; text-align: center; color: var(--text-light); font-weight: 600; }

    .btn-create-luxe { background: var(--primary); color: white; border: none; padding: 10px 24px; border-radius: 12px; font-weight: 900; cursor: pointer; transition: 0.3s; box-shadow: 0 8px 20px rgba(0, 204, 255, 0.25); }
    .btn-create-luxe:hover { transform: translateY(-3px); background: var(--primary-dark); box-shadow: 0 12px 25px rgba(0, 204, 255, 0.35); }

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
  private cdr = inject(ChangeDetectorRef);
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
      this.cdr.detectChanges();
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
