import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-logs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-page-container">
      <div class="admin-compact-wrapper">
        <header class="content-header">
          <h1>Journal d'Activité</h1>
          <div class="header-actions">
             <button class="btn-refresh" (click)="loadLogs()">🔄 Rafraîchir</button>
          </div>
        </header>

        <div class="timeline-card card">
          <div class="timeline-header">
              <h3>Flux Chronologique</h3>
              <span class="log-count">{{ logs.length }} événements</span>
          </div>
          
          <div class="timeline">
            <div *ngFor="let log of logs" class="timeline-item" [ngClass]="log.actionEffectuee.toLowerCase()">
              <div class="timeline-marker">
                  <div class="marker-dot"></div>
                  <div class="marker-line"></div>
              </div>
              
              <div class="timeline-content">
                <div class="log-main">
                   <span class="action-tag">{{ log.actionEffectuee }}</span>
                   <p class="log-desc">
                      <strong>{{ log.adminResponsable?.nom || 'Admin' }}</strong> 
                      {{ getActionDescription(log) }}
                      <strong>{{ log.produitConcerne?.titreProduit || 'un produit' }}</strong>
                   </p>
                </div>
                
                <div class="log-meta">
                  <span class="log-date">{{ log.dateValidation | date:'dd/MM/yyyy HH:mm' }}</span>
                  <span class="status-change" *ngIf="log.ancienStatut">
                    {{ log.ancienStatut }} → {{ log.nouveauStatut }}
                  </span>
                </div>

                <div class="log-comment" *ngIf="log.commentaireAdmin">
                  <span class="quote">"</span>{{ log.commentaireAdmin }}<span class="quote">"</span>
                </div>
              </div>
            </div>

            <div class="empty-state" *ngIf="logs.length === 0">
               <div class="empty-icon">📂</div>
               <p>Aucun événement enregistré pour le moment.</p>
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
      --bg: #f8fafc;
      --border: #e2e8f0;
      --shadow: 0 10px 25px rgba(0, 137, 123, 0.08);
    }

    .admin-page-container { padding: 30px 20px; background: var(--bg); min-height: 100vh; }
    .admin-compact-wrapper { max-width: 1100px; margin: 0 auto; }
    
    .content-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .content-header h1 { font-size: 1.8rem; font-weight: 900; color: #111827; margin: 0; letter-spacing: -0.5px; }
    .content-header h1::after { content: '.'; color: var(--primary); }

    .card { background: white; border-radius: 24px; border: 1px solid var(--border); box-shadow: var(--shadow); overflow: hidden; }
    
    .timeline-card { padding: 30px 40px; }
    .timeline-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 35px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; }
    .timeline-header h3 { margin: 0; font-size: 1rem; color: #111827; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
    .log-count { font-size: 0.7rem; color: var(--primary-dark); font-weight: 850; background: #e0f2f1; padding: 5px 14px; border-radius: 20px; text-transform: uppercase; }

    .timeline { position: relative; padding-left: 15px; }
    
    .timeline-item { display: flex; gap: 20px; margin-bottom: 30px; }
    .timeline-item:last-child { margin-bottom: 0; }
    .timeline-item:last-child .marker-line { display: none; }

    .timeline-marker { display: flex; flex-direction: column; align-items: center; }
    .marker-dot { width: 14px; height: 14px; border-radius: 50%; background: #cbd5e0; border: 3px solid white; box-shadow: 0 0 0 1px #cbd5e0; z-index: 2; transition: 0.3s; }
    .marker-line { flex: 1; width: 2px; background: #f1f5f9; margin: 6px 0; }

    .timeline-content { flex: 1; background: #fcfdfe; padding: 18px 25px; border-radius: 18px; border: 1px solid #f1f5f9; transition: 0.3s; }
    .timeline-item:hover .timeline-content { background: white; box-shadow: 0 10px 30px rgba(0, 137, 123, 0.08); border-color: var(--primary); transform: translateX(5px); }
    .timeline-item:hover .marker-dot { transform: scale(1.2); background: var(--primary); box-shadow: 0 0 0 1px var(--primary); }

    .log-main { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; flex-wrap: wrap; }
    .action-tag { font-size: 0.6rem; font-weight: 900; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    
    .validation .action-tag { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
    .refus .action-tag { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
    .archivage .action-tag { background: #f8fafc; color: #1e293b; border: 1px solid var(--border); }
    .modification .action-tag { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }

    .log-desc { margin: 0; font-size: 0.85rem; color: #475569; line-height: 1.5; font-weight: 500; }
    .log-desc strong { color: #1e293b; font-weight: 850; }

    .log-meta { display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: #94a3b8; margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e2e8f0; }
    .status-change { font-weight: 800; color: #64748b; background: white; padding: 2px 8px; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 0.7rem; }

    .log-comment { margin-top: 12px; padding: 12px 18px; background: #f8fafc; border-left: 3px solid var(--primary); font-style: italic; font-size: 0.8rem; color: #64748b; border-radius: 10px; }
    .quote { color: var(--primary); font-family: serif; font-size: 1.2rem; font-weight: bold; margin: 0 3px; opacity: 0.4; }

    .btn-refresh { padding: 10px 20px; background: white; border: 1px solid var(--border); border-radius: 12px; font-weight: 850; color: #111827; cursor: pointer; transition: 0.3s; font-size: 0.8rem; }
    .btn-refresh:hover { background: #f0fdfa; border-color: var(--primary); transform: translateY(-2px); color: var(--primary-dark); }

    .empty-state { text-align: center; padding: 60px 0; color: #94a3b8; }
    .empty-icon { font-size: 3rem; margin-bottom: 20px; opacity: 0.3; }
  `]
})
export class AdminLogsComponent implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);
  logs: any[] = [];

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.adminService.getActivityLogs().subscribe(data => {
      setTimeout(() => {
        this.logs = data.sort((a: any, b: any) =>
          new Date(b.dateValidation).getTime() - new Date(a.dateValidation).getTime()
        );
        this.cdr.detectChanges();
      }, 0);
    });
  }

  getActionDescription(log: any): string {
    switch (log.actionEffectuee) {
      case 'VALIDATION': return "a validé l'annonce";
      case 'REFUS': return "a refusé l'annonce";
      case 'ARCHIVAGE': return "a archivé l'annonce";
      case 'MODIFICATION': return "a modifié l'annonce";
      default: return "a effectué une action sur";
    }
  }
}
