import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page-container">
      <div class="admin-compact-wrapper">
        <div class="admin-page-content">
          <div class="card table-card" style="padding: 30px;">
            <div class="table-header-row" style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 25px;">
              <div class="table-title-area">
                <h2 style="margin:0; font-size:1.4rem; font-weight:700; color:#1A202C;">Monitoring</h2>
                <p style="margin:5px 0 0; color:#64748b; font-size:0.9rem;">Suivez toutes les actions utilisateurs</p>
              </div>
              
              <div class="table-tools" style="display:flex; align-items:center; gap:20px;">
                <div class="search-input-wrapper">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7E7E7E" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <input type="text" placeholder="Rechercher par utilisateur, action, statut..." [(ngModel)]="searchQuery" (input)="applyFilter()">
                </div>
                
                <div class="header-actions">
                    <button class="icon-btn refresh-btn" (click)="loadLogs()" title="Rafraîchir">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                    </button>
                </div>
              </div>
            </div>

            <table class="premium-table">
              <thead>
                <tr>
                    <th>Utilisateur</th>
                    <th>Action</th>
                    <th>Statut</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
              </thead>
              <tbody class="table-body">
                @for (log of filteredLogs; track log.id) {
                  <tr>
                    <td>
                        <div class="user-cell">
                            <div class="user-avatar">{{ (log.adminResponsable?.nom || 'A')[0] }}</div>
                            <span class="user-name">{{ log.adminResponsable?.nom || 'Admin Système' }}</span>
                        </div>
                    </td>
                    <td>
                        <div class="action-desc">
                            <span class="action-type">{{ getActionType(log.actionEffectuee) }}</span>
                            <span class="action-detail">sur {{ log.produitConcerne?.titreProduit || 'un élément' }}</span>
                        </div>
                    </td>
                    <td>
                      <span class="status-pill-bordered" [ngClass]="(log.nouveauStatut || 'DEFAULT').toLowerCase()">
                        {{ log.nouveauStatut || '-' }}
                      </span>
                    </td>
                    <td>{{ log.dateValidation | date:'dd MMM yyyy HH:mm' }}</td>
                    <td class="actions-cell">
                      <button class="icon-btn info" (click)="openDetail(log)" title="Détails">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </button>
                    </td>
                  </tr>
                }
                <tr *ngIf="filteredLogs.length === 0">
                  <td colspan="5" class="empty-row">Aucun événement trouvé.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      @if (detailModal.open && selectedLog) {
        <div class="modal-overlay" (click)="closeDetail()">
          <div class="modal-premium" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Détails de l'événement</h3>
              <button class="btn-icon" (click)="closeDetail()">✕</button>
            </div>
            <div class="modal-body">
                <div class="detail-row">
                    <label>Admin responsable</label>
                    <div>{{ selectedLog.adminResponsable?.nom || 'Admin Système' }}</div>
                </div>
                <div class="detail-row">
                    <label>Action</label>
                    <div>{{ selectedLog.actionEffectuee }}</div>
                </div>
                <div class="detail-row">
                    <label>Produit concerné</label>
                    <div>{{ selectedLog.produitConcerne?.titreProduit || 'N/A' }}</div>
                </div>
                <div class="detail-row">
                    <label>Date</label>
                    <div>{{ selectedLog.dateValidation | date:'dd MMM yyyy à HH:mm' }}</div>
                </div>
                
                @if (selectedLog.ancienStatut || selectedLog.nouveauStatut) {
                    <div class="detail-row">
                        <label>Changement de statut</label>
                        <div class="status-change-badge">
                            {{ selectedLog.ancienStatut || '?' }} → {{ selectedLog.nouveauStatut || '?' }}
                        </div>
                    </div>
                }
                
                @if (selectedLog.commentaireAdmin) {
                    <div class="detail-row">
                        <label>Commentaire</label>
                        <div class="comment-box">
                            "{{ selectedLog.commentaireAdmin }}"
                        </div>
                    </div>
                }
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="closeDetail()">Fermer</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-page-container { padding: 30px 20px; background: #f8fafc; min-height: 100vh; }
    .admin-compact-wrapper { max-width: 1100px; margin: 0 auto; }
    
    .table-card { background: white; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0, 137, 123, 0.08); overflow: hidden; }
    
    .search-input-wrapper { display: flex; align-items: center; background: #F3F4F6; border-radius: 12px; padding: 8px 16px; width: 320px; transition: 0.2s; border: 1px solid transparent; }
    .search-input-wrapper:focus-within { background: #fff; border-color: #00ccff; box-shadow: 0 0 0 3px rgba(0, 204, 255, 0.1); }
    .search-input-wrapper input { border: none; background: transparent; margin-left: 10px; outline: none; width: 100%; color: #1A202C; font-weight: 500; }
    
    .premium-table { width: 100%; border-collapse: collapse; }
    .premium-table th { text-align: left; padding: 15px 20px; color: #64748b; font-size: 0.75rem; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; border-bottom: 1px solid #f1f5f9; }
    .premium-table td { padding: 16px 20px; border-bottom: 1px solid #f1f5f9; color: #1e293b; font-size: 0.9rem; font-weight: 600; vertical-align: middle; }
    .premium-table tr:last-child td { border-bottom: none; }
    .table-body tr:hover td { background: #F9FBFF; }
    
    .user-cell { display: flex; align-items: center; gap: 10px; }
    .user-avatar { width: 32px; height: 32px; border-radius: 50%; background: #00ccff; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; }
    .user-name { font-weight: 700; color: #0f172a; }
    
    .action-desc { display: flex; flex-direction: column; gap: 2px; }
    .action-type { font-weight: 800; font-size: 0.75rem; color: #0f172a; }
    .action-detail { font-size: 0.75rem; color: #64748b; }
    
    .status-pill-bordered { padding: 4px 10px; border-radius: 100px; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; border: 1.5px solid transparent; display: inline-block; }
    .status-pill-bordered.valide { border-color: #3b82f6; color: #1e40af; background: #e0f2fe; }
    .status-pill-bordered.activee { border-color: #1AAFA5; color: #159E95; background: #edf9f8; }
    .status-pill-bordered.refuse { border-color: #ef4444; color: #ef4444; background: #fee2e2; }
    .status-pill-bordered.en_attente { border-color: #f59e0b; color: #f59e0b; background: rgba(245, 158, 11, 0.07); }
    .status-pill-bordered.default { border-color: #94a3b8; color: #64748b; background: #f1f5f9; }
    
    .actions-cell { display: flex; align-items: center; gap: 8px; justify-content: center; }
    .icon-btn { background: transparent; border: none; padding: 6px; border-radius: 8px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; color: #64748b; }
    .icon-btn:hover { background: #f1f5f9; color: #00ccff; }
    
    .empty-row { text-align: center; padding: 40px; color: #94a3b8; }
    
    /* Modal Styles */
    .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 16px; }
    .modal-premium { background: #fff; width: 100%; max-width: 500px; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); overflow: hidden; animation: slideUp 0.3s ease-out; }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    
    .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #f1f5f9; }
    .modal-header h3 { margin: 0; font-size: 1.1rem; font-weight: 800; color: #0f172a; }
    .btn-icon { background: transparent; border: none; font-size: 1.1rem; color: #94a3b8; cursor: pointer; transition: 0.2s; }
    .btn-icon:hover { color: #ef4444; transform: rotate(90deg); }
    
    .modal-body { padding: 24px; }
    .detail-row { margin-bottom: 16px; }
    .detail-row:last-child { margin-bottom: 0; }
    .detail-row label { display: block; font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
    .detail-row div { font-size: 0.95rem; color: #0f172a; font-weight: 600; }
    
    .status-change-badge { display: inline-block; background: #f8fafc; padding: 6px 12px; border-radius: 8px; border: 1px dashed #cbd5e1; }
    .comment-box { background: #fff7ed; padding: 12px; border-radius: 8px; border-left: 3px solid #f97316; font-style: italic; color: #431407; }
    
    .modal-footer { padding: 20px 24px; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; }
    .btn { padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; border: none; font-size: 0.9rem; transition: 0.2s; }
    .btn-secondary { background: white; border: 1px solid #e2e8f0; color: #475569; }
    .btn-secondary:hover { background: #f1f5f9; border-color: #cbd5e1; }
  `]
})
export class AdminLogsComponent implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);

  logs: any[] = [];
  filteredLogs: any[] = [];
  searchQuery: string = '';

  selectedLog: any = null;
  detailModal = { open: false };

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.adminService.getActivityLogs().subscribe(data => {
      this.logs = data.sort((a: any, b: any) =>
        new Date(b.dateValidation).getTime() - new Date(a.dateValidation).getTime()
      );
      this.applyFilter();
      this.cdr.detectChanges();
    });
  }

  applyFilter() {
    const q = this.searchQuery.toLowerCase().trim();
    this.filteredLogs = this.logs.filter(log => {
      if (!q) return true;
      const user = (log.adminResponsable?.nom || '').toLowerCase();
      const action = (log.actionEffectuee || '').toLowerCase();
      const product = (log.produitConcerne?.titreProduit || '').toLowerCase();
      const status = (log.nouveauStatut || '').toLowerCase();

      return user.includes(q) || action.includes(q) || product.includes(q) || status.includes(q);
    });
  }

  openDetail(log: any) {
    this.selectedLog = log;
    this.detailModal.open = true;
  }

  closeDetail() {
    this.detailModal.open = false;
    this.selectedLog = null;
  }

  getActionType(action: string): string {
    if (!action) return 'ACTION INCONNUE';
    // Mappage si nécessaire, sinon retourne la valeur brute
    return action;
  }
}
