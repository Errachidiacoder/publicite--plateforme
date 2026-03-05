import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService, Notification } from '../services/notification.service';
import { AuthService } from '../services/auth.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="container">
      <section class="section">
        <div class="notif-page">

          <div class="page-header">
            <div class="header-left">
              <h1 class="page-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                Mes Notifications
              </h1>
              @if (unreadCount > 0) {
                <span class="unread-badge">{{ unreadCount }} non lue{{ unreadCount > 1 ? 's' : '' }}</span>
              }
            </div>
            @if (unreadCount > 0) {
              <button class="btn-mark-all" (click)="markAllRead()">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Tout marquer comme lu
              </button>
            }
          </div>

          @if (loading) {
            <div class="loading-state">
              <div class="spinner-teal"></div>
              <p>Chargement des notifications...</p>
            </div>
          } @else if (notifications.length === 0) {
            <div class="empty-state">
              <div class="empty-icon"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--sb-primary, #1aafa5)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>
              <h3>Aucune notification</h3>
              <p>Vous n'avez pas encore reçu de notifications. Elles apparaîtront ici après qu'un administrateur ait examiné vos annonces.</p>
            </div>
          } @else {
            <div class="notif-list">
              @for (notif of notifications; track notif.id) {
                <div class="notif-card" [class.unread]="!notif.notificationLue" (click)="markRead(notif)">
                  <div class="notif-icon-wrap" [ngClass]="getTypeClass(notif.typeEvenement)">
                    <span class="notif-svg" [innerHTML]="getTypeSvg(notif.typeEvenement)"></span>
                  </div>
                  <div class="notif-body">
                    <div class="notif-top">
                      <h4 class="notif-subject">{{ notif.sujetNotification }}</h4>
                      <span class="notif-badge" [ngClass]="getTypeClass(notif.typeEvenement)">{{ getTypeLabel(notif.typeEvenement) }}</span>
                    </div>
                    <p class="notif-message">{{ notif.corpsMessage }}</p>
                    <div class="notif-footer">
                      <span class="notif-date">{{ notif.dateEnvoi | date:'dd/MM/yyyy à HH:mm' }}</span>
                      @if (!notif.notificationLue) {
                        <span class="notif-new-dot"></span>
                      }
                    </div>
                  </div>

                  @if (notif.typeEvenement === 'VALIDATION_PAIEMENT') {
                    <button class="btn-pay" (click)="goToPayment($event)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                      Payer
                    </button>
                  }
                </div>
              }
            </div>
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    .notif-page {
      max-width: 780px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .page-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: 'Outfit', sans-serif;
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--sb-text);
      margin: 0;
    }

    .unread-badge {
      background: var(--sb-primary);
      color: white;
      padding: 3px 12px;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .btn-mark-all {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--sb-surface);
      border: 1px solid var(--sb-border);
      color: var(--sb-text-secondary);
      padding: 8px 14px;
      border-radius: var(--sb-radius-md);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: var(--sb-transition);
    }
    .btn-mark-all:hover { background: var(--sb-primary); color: white; border-color: var(--sb-primary); }

    /* States */
    .loading-state, .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--sb-text-muted);
    }

    .spinner-teal {
      width: 36px;
      height: 36px;
      border: 3px solid var(--sb-primary-light);
      border-top-color: var(--sb-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-icon { margin-bottom: 16px; display: flex; justify-content: center; align-items: center; }
    .notif-svg { display: flex; align-items: center; justify-content: center; }
    .notif-svg ::ng-deep svg { width: 22px; height: 22px; }
    .empty-state h3 { font-size: 1.1rem; font-weight: 700; color: var(--sb-text); margin-bottom: 8px; }
    .empty-state p { font-size: 0.88rem; max-width: 400px; margin: 0 auto; line-height: 1.5; }

    /* Notification List */
    .notif-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .notif-card {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      background: var(--sb-bg-elevated);
      border: 1px solid var(--sb-border);
      border-radius: var(--sb-radius-lg);
      padding: 18px 20px;
      cursor: pointer;
      transition: var(--sb-transition);
      position: relative;
    }
    .notif-card:hover { box-shadow: var(--sb-shadow-md); transform: translateY(-2px); border-color: var(--sb-primary); }
    .notif-card.unread { border-left: 4px solid var(--sb-primary); background: rgba(26,175,165,0.03); }

    .notif-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: var(--sb-radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 1.3rem;
    }
    .notif-icon-wrap.type-success { background: rgba(16,185,129,0.12); }
    .notif-icon-wrap.type-danger { background: rgba(239,68,68,0.12); }
    .notif-icon-wrap.type-primary { background: rgba(26,175,165,0.12); }
    .notif-icon-wrap.type-info { background: rgba(59,130,246,0.12); }

    .notif-body { flex: 1; min-width: 0; }
    .notif-top { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 6px; }
    .notif-subject { font-weight: 700; font-size: 0.95rem; color: var(--sb-text); margin: 0; }

    .notif-badge {
      font-size: 0.65rem;
      font-weight: 800;
      padding: 2px 10px;
      border-radius: 100px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      flex-shrink: 0;
    }
    .notif-badge.type-success { background: rgba(16,185,129,0.1); color: var(--sb-success); }
    .notif-badge.type-danger { background: rgba(239,68,68,0.1); color: var(--sb-danger); }
    .notif-badge.type-primary { background: rgba(26,175,165,0.1); color: var(--sb-primary); }
    .notif-badge.type-info { background: rgba(59,130,246,0.1); color: var(--sb-info); }

    .notif-message { font-size: 0.86rem; color: var(--sb-text-secondary); line-height: 1.5; margin: 0 0 10px; }

    .notif-footer { display: flex; align-items: center; gap: 10px; }
    .notif-date { font-size: 0.75rem; color: var(--sb-text-muted); }
    .notif-new-dot {
      width: 8px; height: 8px;
      background: var(--sb-primary);
      border-radius: 50%;
      display: inline-block;
    }

    .btn-pay {
      background: var(--sb-primary);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: var(--sb-radius-md);
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;
      transition: var(--sb-transition);
    }
    .btn-pay:hover { background: #14928a; }
  `]
})
export class NotificationsComponent implements OnInit {
  private notifService = inject(NotificationService);
  private router = inject(Router);
  private auth = inject(AuthService);
  private sanitizer = inject(DomSanitizer);

  notifications: Notification[] = [];
  loading = true;
  unreadCount = 0;

  ngOnInit() {
    this.notifService.notifications$.subscribe(notifs => {
      this.notifications = notifs;
      this.unreadCount = notifs.filter(n => !n.notificationLue).length;
      this.loading = false;
    });
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'VALIDATION':
      case 'ACTIVATION':
      case 'VALIDATION_PAIEMENT': return 'type-success';
      case 'REFUS': return 'type-danger';
      case 'NOUVELLE_ANNONCE': return 'type-info';
      default: return 'type-primary';
    }
  }

  getTypeSvg(type: string): SafeHtml {
    const svgs: Record<string, string> = {
      'VALIDATION': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
      'VALIDATION_PAIEMENT': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
      'ACTIVATION': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#1aafa5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`,
      'REFUS': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
      'NOUVELLE_ANNONCE': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>`,
    };
    const fallback = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#1aafa5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(svgs[type] ?? fallback);
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'VALIDATION': return 'Validée';
      case 'VALIDATION_PAIEMENT': return 'Validée';
      case 'ACTIVATION': return 'Activée';
      case 'REFUS': return 'Refusée';
      case 'NOUVELLE_ANNONCE': return 'Nouvelle Annonce';
      default: return type;
    }
  }

  markRead(notif: Notification) {
    if (!notif.notificationLue) {
      this.notifService.markAsRead(notif.id).subscribe();
    }
    this.handleRedirection(notif);
  }

  private handleRedirection(notif: any) {
    // If there's a specific link, use it
    if (notif.lienAction) {
      this.router.navigate([notif.lienAction]);
      return;
    }

    // Otherwise, deduce based on notification content or type
    const sujet = notif.sujetNotification?.toLowerCase() || '';
    const msg = notif.corpsMessage?.toLowerCase() || '';

    if (sujet.includes('service') || msg.includes('service')) {
      this.router.navigate(['/vendeur/produits'], { queryParams: { tab: 'services' } });
    } else if (sujet.includes('produit') || msg.includes('produit')) {
      this.router.navigate(['/vendeur/produits'], { queryParams: { tab: 'market' } });
    } else if (sujet.includes('annonce') || msg.includes('annonce')) {
      this.router.navigate(['/vendeur/produits'], { queryParams: { tab: 'annonces' } });
    } else {
      // Default fallback
      this.router.navigate(['/notifications']);
    }
  }

  markAllRead() {
    const unread = this.notifications.filter(n => !n.notificationLue);
    unread.forEach(n => this.notifService.markAsRead(n.id).subscribe());
  }

  goToPayment(event: Event) {
    event.stopPropagation();
    this.router.navigate(['/my-ads']);
  }
}
