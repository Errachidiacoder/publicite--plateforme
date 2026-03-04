import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceOffre, ServiceOffreService } from '../../services/service-offre.service';

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page-container">
      <div class="admin-compact-wrapper">
        <div class="admin-page-content">
      <div class="card table-card" style="padding: 30px;">
        <div class="table-header-row" style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 25px;">
          <div class="table-title-area">
            <h2 style="margin:0; font-size:1.4rem; font-weight:700; color:#1A202C;">Services</h2>
          </div>
          <div class="table-tools" style="display:flex; align-items:center; gap:20px;">
            <div class="search-input-wrapper">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7E7E7E" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="text" placeholder="Search" [(ngModel)]="searchQuery" (input)="applyFilter()">
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
        <table class="premium-table">
          <thead>
            <tr>
                <th>Titre</th>
                <th>Annonceur</th>
                <th>Date</th>
              <th>Ville</th>
              <th>Contrat</th>
              <th>Statut</th>
              <th>Paiement</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody class="table-body">
            @for (s of filtered; track s.id) {
              <tr>
                <td>{{ s.titreService }}</td>
                <td>{{ s.demandeur?.nomComplet || '—' }}</td>
                <td>{{ s.dateSoumission | date:'dd MMM yyyy' }}</td>
                <td>{{ s.villeLocalisation }}</td>
                <td>{{ s.typeContrat }}</td>
                <td>
                  <span class="status-pill-bordered" [ngClass]="(s.statutService || '').toLowerCase()">{{ s.statutService === 'EN_ATTENTE' ? 'EN ATTENTE' : s.statutService === 'VALIDE' ? 'VALIDÉE' : s.statutService === 'ACTIVEE' ? 'ACTIVE' : s.statutService === 'REFUSE' ? 'REFUSÉE' : s.statutService }}</span>
                </td>
                <td><span class="code-id">{{ s.statutPaiement }}</span></td>
                <td class="actions-cell">
                  <button class="icon-btn info" (click)="viewDetail(s)" title="Détails">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </button>
                  <button class="icon-btn success" (click)="openEdit(s)" title="Modifier">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  @if (s.statutService === 'EN_ATTENTE') {
                    <button class="icon-btn success-check" (click)="validate(s.id)" title="Valider">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </button>
                    <button class="icon-btn danger-x" (click)="openReject(s.id)" title="Refuser">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  }
                  <button class="icon-btn danger" (click)="delete(s.id)" title="Supprimer">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </td>
              </tr>
            }
            <tr *ngIf="filtered.length === 0">
              <td colspan="8" class="empty-row">Aucun service pour ce filtre.</td>
            </tr>
          </tbody>
        </table>
      </div>
      </div>
      </div>
      @if (validateModal.open) {
        <div class="modal-overlay" (click)="closeValidate()">
          <div class="modal-premium" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Valider le service</h3>
              <button class="btn-icon" (click)="closeValidate()">✕</button>
            </div>
            <div class="modal-body">
              <p style="color: var(--sb-text); font-size: 0.95rem;">
                Choisissez une option de validation pour ce service.
              </p>
            </div>
            <div class="modal-footer">
              <button class="btn btn-primary" (click)="confirmValidateWithPayment()">Valider avec paiement</button>
              <button class="btn btn-primary" (click)="confirmValidateWithoutPayment()">Valider sans paiement</button>
            </div>
          </div>
        </div>
      }

      @if (deleteConfirm.open) {
        <div class="modal-overlay" (click)="closeDeleteConfirm()">
          <div class="modal-premium" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Confirmation de suppression</h3>
              <button class="btn-icon" (click)="closeDeleteConfirm()">✕</button>
            </div>
            <div class="modal-body">
              <p style="color: var(--sb-text); font-size: 0.95rem;">
                Êtes-vous sûr de vouloir supprimer ce service ? Cette action est irréversible.
              </p>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="closeDeleteConfirm()">Annuler</button>
              <button class="btn btn-primary" (click)="confirmDelete()">Supprimer</button>
            </div>
          </div>
        </div>
      }

      @if (rejectModal.open) {
        <div class="modal-overlay" (click)="closeReject()">
          <div class="modal-premium" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Motif de refus</h3>
              <button class="btn-icon" (click)="closeReject()">✕</button>
            </div>
            <div class="modal-body">
              <div class="input-group">
                <label>Motif</label>
                <textarea class="form-input" rows="5" [(ngModel)]="rejectModal.reason"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="closeReject()">Annuler</button>
              <button class="btn btn-primary" (click)="confirmReject()">Confirmer</button>
            </div>
          </div>
        </div>
      }

      @if (editModal.open) {
        <div class="modal-overlay" (click)="closeEdit()">
          <div class="modal-premium" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Modifier le service</h3>
              <button class="btn-icon" (click)="closeEdit()">✕</button>
            </div>
            <div class="modal-body">
              <div class="grid grid-2">
                <div class="input-group">
                  <label>Titre</label>
                  <input class="form-input" [(ngModel)]="editModal.payload.titreService">
                </div>
                <div class="input-group">
                  <label>Ville</label>
                  <input class="form-input" [(ngModel)]="editModal.payload.villeLocalisation">
                </div>
              </div>
              <div class="input-group">
                <label>Description</label>
                <textarea class="form-input" rows="5" [(ngModel)]="editModal.payload.descriptionDetaillee"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="closeEdit()">Annuler</button>
              <button class="btn btn-primary" (click)="confirmEdit()">Enregistrer</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .table-card { border-radius: 24px; }
    .table-body tr:hover td { background: #F9FBFF; }
    .actions-cell { display: flex; align-items: center; gap: 8px; justify-content: center; }
    .icon-btn { background: transparent; border: none; padding: 2px; border-radius: 6px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
    .icon-btn:hover { transform: scale(1.08); filter: brightness(0.9); }
    .icon-btn.info { color: #5c6c7b; }
    .icon-btn.success { color: #0284c7; }
    .icon-btn.success-check { color: #00ccff; }
    .icon-btn.danger-x { color: #ef4444; }
    .icon-btn.danger { color: #ef4444; }
    .status-pill-bordered { padding: 6px 12px; border-radius: 100px; font-size: 0.62rem; font-weight: 900; text-transform: uppercase; border: 1.5px solid transparent; }
    .status-pill-bordered.en_attente { border-color: #f59e0b; color: #f59e0b; background: rgba(245, 158, 11, 0.07); }
    .status-pill-bordered.valide { border-color: #3b82f6; color: #1e40af; background: #e0f2fe; }
    .status-pill-bordered.activee { border-color: #1AAFA5; color: #159E95; background: #edf9f8; }
    .status-pill-bordered.refuse { border-color: #ef4444; color: #ef4444; background: #fee2e2; }
    .status-pill-bordered.archive { border-color: #94a3b8; color: #64748b; background: #f1f5f9; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(38,50,56,0.4); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 16px; }
    .modal-premium { background: #fff; width: 100%; max-width: 420px; border-radius: 22px; box-shadow: 0 30px 60px rgba(0,0,0,0.2); overflow: hidden; }
    .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #e5e7eb; }
    .modal-body { padding: 16px 20px; }
    .modal-footer { display: flex; gap: 10px; justify-content: flex-end; padding: 12px 20px 20px; }
  `]
})
export class AdminServicesComponent {
  private api = inject(ServiceOffreService);
  private cdr = inject(ChangeDetectorRef);
  services: ServiceOffre[] = [];
  filtered: ServiceOffre[] = [];
  rejectModal = { open: false, id: 0, reason: '' };
  editModal = { open: false, id: 0, payload: { titreService: '', descriptionDetaillee: '', villeLocalisation: '' } as Partial<ServiceOffre> };
  currentFilter: string = 'EN_ATTENTE';
  searchQuery: string = '';
  selected: ServiceOffre | null = null;
  validateModal = { open: false, id: 0, durationMonths: 1 };
  deleteConfirm = { open: false, id: 0 };

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.adminAll().subscribe(res => {
      this.services = res;
      this.applyFilter();
      this.cdr.detectChanges();
    });
  }
  applyFilter() {
    const list = this.currentFilter === 'ALL' ? this.services : this.services.filter(s => s.statutService === this.currentFilter);
    const q = this.searchQuery.toLowerCase().trim();
    this.filtered = list
      .filter(s => !q || (s.titreService?.toLowerCase().includes(q) || s.villeLocalisation?.toLowerCase().includes(q)))
      .sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
  }
  onFilterDropdownChange(event: any) {
    const val = event.target.value;
    this.currentFilter = val;
    this.applyFilter();
  }

  validate(id?: number) {
    if (!id) return;
    this.validateModal = { open: true, id, durationMonths: 1 };
  }
  proceedPayment(id?: number) {
    if (!id) return;
    this.api.adminProceedPayment(id).subscribe(() => this.load());
  }
  validatePayment(id?: number) {
    if (!id) return;
    this.api.adminValidatePayment(id).subscribe(() => this.load());
  }
  activateWithoutPayment(id?: number) {
    if (!id) return;
    this.api.adminActivateWithoutPayment(id).subscribe(() => this.load());
  }
  archive(id?: number) {
    if (!id) return;
    this.api.adminArchive(id).subscribe(() => this.load());
  }
  feature(id?: number) {
    if (!id) return;
    this.api.adminFeature(id, true).subscribe(() => this.load());
  }
  openReject(id?: number) {
    if (!id) return;
    this.rejectModal = { open: true, id, reason: '' };
  }
  closeReject() {
    this.rejectModal.open = false;
  }
  confirmReject() {
    if (!this.rejectModal.id) return;
    this.api.adminReject(this.rejectModal.id, this.rejectModal.reason || 'Motif non précisé').subscribe(() => {
      this.closeReject();
      this.load();
    });
  }
  openEdit(s: ServiceOffre) {
    this.editModal = { open: true, id: s.id!, payload: { titreService: s.titreService, descriptionDetaillee: s.descriptionDetaillee, villeLocalisation: s.villeLocalisation } };
  }
  closeEdit() { this.editModal.open = false; }
  confirmEdit() {
    if (!this.editModal.id) return;
    this.api.adminUpdate(this.editModal.id, this.editModal.payload).subscribe(() => {
      this.closeEdit();
      this.load();
    });
  }
  viewDetail(s: ServiceOffre) { this.selected = s; }
  delete(id?: number) {
    if (!id) return;
    this.deleteConfirm = { open: true, id };
  }
  closeDeleteConfirm() { this.deleteConfirm.open = false; }
  confirmDelete() {
    if (!this.deleteConfirm.id) return;
    this.api.adminDelete(this.deleteConfirm.id).subscribe(() => {
      this.closeDeleteConfirm();
      this.load();
    });
  }
  closeValidate() { this.validateModal.open = false; }
  confirmValidateWithPayment() {
    if (!this.validateModal.id) return;
    this.api.adminValidatePayment(this.validateModal.id).subscribe(() => {
      this.closeValidate();
      this.load();
    });
  }
  confirmValidateWithoutPayment() {
    if (!this.validateModal.id) return;
    this.api.adminActivateWithoutPayment(this.validateModal.id).subscribe(() => {
      this.closeValidate();
      this.load();
    });
  }
}
