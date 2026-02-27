import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-overlay" *ngIf="latestNotification && show">
      <div class="notification-toast" [class.new]="isNew">
        <div class="notif-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        </div>
        <div class="notif-content">
          <h4 class="notif-subject">{{ latestNotification.sujetNotification }}</h4>
          <p class="notif-body">{{ latestNotification.corpsMessage }}</p>
          <div class="notif-actions">
            <button class="btn-read" (click)="close()">Fermer</button>
            <button class="btn-action" *ngIf="latestNotification.typeEvenement === 'VALIDATION_PAIEMENT'" (click)="goToPayment()">Payer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-overlay {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      pointer-events: none;
    }
    .notification-toast {
      pointer-events: auto;
      background: white;
      border-radius: 16px;
      padding: 16px;
      width: 320px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
      display: flex;
      gap: 15px;
      border-left: 5px solid #4db6ac;
      animation: slideIn 0.3s ease-out;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .notif-icon {
      font-size: 1.5rem;
      background: #e0f2f1;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .notif-content { flex: 1; }
    .notif-subject { margin: 0 0 5px; font-size: 0.95rem; font-weight: 700; color: #1e293b; }
    .notif-body { margin: 0 0 12px; font-size: 0.85rem; color: #64748b; line-height: 1.4; }
    .notif-actions { display: flex; gap: 8px; }
    .btn-read { background: #f1f5f9; border: none; padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 600; cursor: pointer; color: #475569; }
    .btn-action { background: #4db6ac; color: white; border: none; padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 600; cursor: pointer; }
    .btn-action:hover { background: #00897b; }
  `]
})
export class NotificationDisplayComponent implements OnInit {
  private notifService = inject(NotificationService);
  private router = inject(Router);

  latestNotification: Notification | null = null;
  show = false;
  isNew = false;

  ngOnInit() {
    this.notifService.notifications$.subscribe(notifs => {
      const unread = notifs.filter(n => !n.notificationLue);
      if (unread.length > 0) {
        const newest = unread[0];
        if (!this.latestNotification || this.latestNotification.id !== newest.id) {
          this.latestNotification = newest;
          this.show = true;
          this.isNew = true;
          setTimeout(() => this.isNew = false, 2000);
        }
      }
    });
  }

  close() {
    if (this.latestNotification) {
      this.notifService.markAsRead(this.latestNotification.id).subscribe();
    }
    this.show = false;
  }

  goToPayment() {
    // Navigate to a payment simulation page
    if (this.latestNotification?.produitSource?.id) {
      this.router.navigate(['/payment', this.latestNotification.produitSource.id]);
    } else {
      this.router.navigate(['/my-ads']); // Fallback
    }
    this.close();
  }
}
