import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceOffreService, ServiceOffre } from '../services/service-offre.service';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../services/message.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      @if (loading) {
        <div class="loading">Chargement...</div>
      } @else if (service) {
        <div class="detail-grid">
          <div class="left">
            <div class="media" (click)="openImage()" title="Voir la photo">
              @if (service.imageUrl) {
                <img [src]="service.imageUrl" alt="service">
              } @else {
                <div class="media-ph">Aperçu</div>
              }
            </div>
            <h1 class="title">{{ service.titreService }}</h1>
            <div class="meta">
              <span>{{ service.dateSoumission | date:'dd-MM-yyyy' }}</span>
              <span>• {{ service.modeTravail === 'REMOTE' ? 'À distance' : (service.modeTravail === 'SUR_SITE' ? 'Sur site' : 'Hybride') }}</span>
              <span>• {{ service.villeLocalisation }}</span>
            </div>
            <div class="accordion">
              <div class="acc-item">
                <button class="acc-header" (click)="infoOpen = !infoOpen">
                  <span class="acc-title">Informations additionnelles</span>
                  <span class="acc-icon" [class.open]="infoOpen">▾</span>
                </button>
                <div class="acc-body" [class.open]="infoOpen">
                  <div class="info-row">
                    <div class="info-label">Description</div>
                    <div class="info-desc">{{ service.descriptionDetaillee }}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Téléphone</div>
                    <div class="info-phone">
                      @if (getRawPhone()) {
                        <a class="tel-link" [href]="getTel(getRawPhone())!">
                          {{ formatPhone(getRawPhone()!) }}
                        </a>
                      } @else {
                        <span class="badge-muted">Numéro indisponible</span>
                      }
                    </div>
                  </div>
                </div>
              </div>

              <div class="acc-item">
                <button class="acc-header" (click)="detailsOpen = !detailsOpen">
                  <span class="acc-title">Détails de l’annonce</span>
                  <span class="acc-icon" [class.open]="detailsOpen">▾</span>
                </button>
                <div class="acc-body" [class.open]="detailsOpen">
                  <div class="kv">
                    <div class="kv-row">
                      <span class="kv-k">Tarification</span>
                      <span class="kv-v">
                        @if (service.typePrix === 'PRIX_FIXE') {
                          {{ (service.prixAfiche || 0) | number:'1.0-0' }} DH
                        } @else if (service.typePrix === 'PRIX_NEGOCIABLE') {
                          Négociable
                        } @else if (service.typePrix === 'GRATUIT') {
                          Gratuit
                        } @else {
                          Sur devis
                        }
                      </span>
                    </div>
                    <div class="kv-row">
                      <span class="kv-k">Contrat</span>
                      <span class="kv-v">{{ service.typeContrat }}</span>
                    </div>
                    <div class="kv-row">
                      <span class="kv-k">Mode</span>
                      <span class="kv-v">{{ service.modeTravail === 'REMOTE' ? 'À distance' : (service.modeTravail === 'SUR_SITE' ? 'Sur site' : 'Hybride') }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Emplacement retiré pour éviter la ville en double -->
            </div>
          </div>
          <div class="right">
            <div class="card">
              <div class="price" *ngIf="service.typePrix === 'PRIX_FIXE' && service.prixAfiche">{{ (service.prixAfiche || 0) | number:'1.0-0' }} DH</div>
              <div class="price" *ngIf="service.typePrix === 'PRIX_NEGOCIABLE'">Négociable</div>
              <div class="price" *ngIf="service.typePrix === 'GRATUIT'">Gratuit</div>
              <div class="price" *ngIf="service.typePrix === 'SUR_DEVIS'">Sur devis</div>

              <ng-container *ngIf="getWhatsappHref(); else fallbackMsg">
                <a class="btn-wa" [href]="getWhatsappHref()!" target="_blank" rel="noopener">
                  <span class="wa-svg">
                    <svg viewBox="0 0 32 32" width="18" height="18" aria-hidden="true">
                      <path fill="#ffffff" d="M19.1 17.7c-.3-.1-1-.5-1.1-.6-.1-.1-.2-.2-.3-.4-.1-.1-.1-.2.1-.4.1-.2.5-.6.6-.8.2-.3.3-.5.1-.8-.1-.3-.7-1.7-.9-1.9-.2-.3-.4-.3-.6-.3h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3 1 2.5c.1.1 1.6 2.5 4 3.4.6.3 1.1.4 1.5.6.6.2 1.1.2 1.5.1.5-.1 1.5-.7 1.7-1.3.2-.6.2-1.1.2-1.2 0-.1-.2-.2-.4-.3-.2-.1-1.3-.6-1.5-.7-.2-.1-.3-.1-.5.1-.1.2-.6.7-.7.9-.2.2-.3.2-.6.1z"/>
                      <path fill="#25D366" d="M27.1 4.9C24.2 2 20.3.5 16.2.5 8.2.5 1.9 6.8 1.9 14.8c0 2.6.7 5.1 2 7.3L1 30.9l8.9-2.8c2.1 1.2 4.5 1.9 7 1.9 8 0 14.3-6.3 14.3-14.3 0-4.1-1.6-8-4.5-10.8zM16.9 27c-2.3 0-4.6-.6-6.5-1.8l-.5-.3-5.3 1.7 1.7-5.2-.3-.5C4.9 19 4.3 16.9 4.3 14.8c0-6.5 5.3-11.8 11.8-11.8 3.1 0 6.1 1.2 8.3 3.4 2.2 2.2 3.4 5.2 3.4 8.3 0 6.6-5.3 11.9-11.9 11.9z"/>
                    </svg>
                  </span>
                  WhatsApp
                </a>
              </ng-container>
              <ng-template #fallbackMsg>
                <button class="btn-primary" [disabled]="isOwner()" (click)="openMessage()">Message</button>
              </ng-template>
              <a class="btn-call"
                 [attr.href]="getTel(service.telephoneContact || service.demandeur?.numeroDeTelephone)"
                 [class.disabled]="!hasPhone(service.telephoneContact || service.demandeur?.numeroDeTelephone)">
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  <path fill="currentColor" d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1v3.5a1 1 0 01-1 1C12.4 22 2 11.6 2 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58.12.35.03.74-.24 1.01l-2.2 2.2z"/>
                </svg>
                Appeler
              </a>
            </div>
          </div>
        </div>
      }
    </div>

    @if (messageModal) {
      <div class="modal-overlay" (click)="closeMessage()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Envoyer un message</h3>
            <button class="btn-icon" (click)="closeMessage()">✕</button>
          </div>
          <div class="modal-body">
            <textarea class="form-input" rows="4" placeholder="Écrivez votre message..." [(ngModel)]="messageText"></textarea>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="closeMessage()">Annuler</button>
            <button class="btn-primary" [disabled]="sending || !messageText.trim()" (click)="sendMessage()">Envoyer</button>
          </div>
        </div>
      </div>
    }

    @if (imageViewer && service?.imageUrl) {
      <div class="viewer-overlay" (click)="closeImage()">
        <div class="viewer" (click)="$event.stopPropagation()">
          <button class="viewer-close" (click)="closeImage()">✕</button>
          <img [src]="service?.imageUrl || ''" alt="Aperçu" class="viewer-img">
        </div>
      </div>
    }
  `,
  styles: [`
    .detail-grid { display: grid; grid-template-columns: 1fr 300px; gap: 16px; max-width: 1100px; margin: 0 auto; }
    .media { border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; background: #f8fafc; height: 200px; display:flex; align-items:center; justify-content:center; cursor: zoom-in; }
    .media img { width: 100%; height: 100%; object-fit: cover; }
    .media-ph { color: #94a3b8; }
    .title { margin: 6px 0 4px; font-size: 1.1rem; font-weight: 900; color: #0f172a; }
    .meta { color: #64748b; display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 6px; font-size: 0.85rem; }
    .accordion { display: grid; gap: 8px; }
    .acc-item { border: 1px solid #e2e8f0; border-radius: 10px; background: white; overflow: hidden; }
    .acc-header { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 9px 10px; background: var(--sb-surface, #f8fafc); border: none; cursor: pointer; font-weight: 900; color: var(--sb-text, #0f172a); }
    .acc-title { font-size: 0.85rem; }
    .acc-icon { transition: transform .2s ease; }
    .acc-icon.open { transform: rotate(180deg); }
    .acc-body { padding: 8px 10px; display: none; }
    .acc-body.open { display: block; }
    .info-row { display: grid; gap: 6px; margin-bottom: 6px; }
    .info-label { font-size: 0.72rem; font-weight: 900; color: #64748b; }
    .info-desc { color: #334155; white-space: pre-line; font-size: 0.92rem; }
    .info-phone { display: flex; align-items: center; gap: 8px; }
    .tel-link { font-weight: 700; color: #0f172a; text-decoration: none; font-size: 0.95rem; }
    .wa-btn { display:none; }
    .badge-muted { display:inline-block; background:#f1f5f9; color:#64748b; padding:4px 8px; border-radius:999px; font-weight:800; font-size:0.8rem; }
    .kv { display: grid; gap: 6px; }
    .kv-row { display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; }
    .kv-k { font-weight: 900; color: #64748b; font-size: 0.8rem; }
    .kv-v { font-weight: 900; color: #0f172a; font-size: 0.95rem; }
    .right .card { position: sticky; top: 18px; background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px; display: grid; gap: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
    .price { color: #10b981; font-weight: 900; font-size: 1.05rem; }
    .btn-primary { background: linear-gradient(90deg, #1aafa5, #00ccff); color: white; border: none; padding: 9px; border-radius: 9px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; justify-content: center; font-size: 0.95rem; }
    .btn-wa { background: #22c55e; color: white; border: none; padding: 9px; border-radius: 9px; font-weight: 900; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; justify-content: center; font-size: 0.95rem; }
    .btn-wa:hover { filter: brightness(0.95); }
    .wa-svg { display:inline-flex; }
    .wa-svg svg { width: 16px; height: 16px; }
    .btn-call { background: white; color: #159E95; border: 2px solid #1aafa5; padding: 8px; border-radius: 9px; font-weight: 900; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; justify-content: center; font-size: 0.95rem; }
    .btn-call:hover { background: #f0fdfa; }
    .btn-call.disabled { opacity: 0.6; pointer-events: none; }
    .btn-outline { background: #f1f5f9; border: none; padding: 12px; border-radius: 12px; font-weight: 800; color: #475569; }
    .contact-line { display:flex; align-items:center; justify-content:space-between; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:10px 12px; font-weight:700; color:#334155; }
    .contact-line .label { color:#64748b; font-weight:800; }
    .btn-icon { background: transparent; border: none; cursor: pointer; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(38,50,56,0.4); display:flex; align-items:center; justify-content:center; padding: 16px; z-index: 3000; }
    .modal { background: white; width: 100%; max-width: 520px; border-radius: 18px; border: 1px solid #e2e8f0; }
    .modal-header { padding: 12px 16px; border-bottom: 1px solid #e2e8f0; display:flex; justify-content: space-between; align-items:center; }
    .modal-body { padding: 12px 16px; }
    .modal-footer { display:flex; justify-content:flex-end; gap: 10px; padding: 12px 16px 16px; }
    .form-input { width: 100%; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px; resize: vertical; }
    .btn-secondary { background: #e2e8f0; border: none; padding: 10px 14px; border-radius: 10px; font-weight: 700; color: #334155; }
    @media (max-width: 960px) { .detail-grid { grid-template-columns: 1fr; } .right .card { position: static; } }

    .viewer-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.7); display:flex; align-items:center; justify-content:center; z-index: 4000; padding: 20px; }
    .viewer { position: relative; max-width: 90vw; max-height: 90vh; }
    .viewer-img { width: 100%; height: 100%; object-fit: contain; border-radius: 8px; box-shadow: 0 20px 60px rgba(0,0,0,0.4); }
    .viewer-close { position: absolute; top: -12px; right: -12px; background: white; border: none; border-radius: 999px; width: 36px; height: 36px; cursor: pointer; box-shadow: 0 6px 20px rgba(0,0,0,0.25); font-weight: 900; }
  `]
})
export class ServiceDetailComponent {
  private route = inject(ActivatedRoute);
  private api = inject(ServiceOffreService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private msg = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);

  service: ServiceOffre | null = null;
  loading = true;
  messageModal = false;
  messageText = '';
  sending = false;
  infoOpen = true;
  detailsOpen = true;
  locationOpen = true;
  imageViewer = false;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getById(id).subscribe({
      next: (s) => { this.service = s; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  isOwner() {
    const current = this.auth.getCurrentUser();
    return !!(current && this.service?.demandeur?.id && current.id === this.service?.demandeur?.id);
  }

  openMessage() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.messageModal = true;
  }
  closeMessage() { this.messageModal = false; this.messageText = ''; }
  sendMessage() {
    if (!this.service?.id || !this.messageText.trim()) return;
    this.sending = true;
    this.msg.send(this.service.id, this.messageText.trim()).subscribe({
      next: () => { this.sending = false; this.closeMessage(); this.router.navigate(['/messages']); },
      error: () => { this.sending = false; }
    });
  }

  getWhatsapp(phone?: string | null): string | null {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '');
    let normalized = digits;
    if (digits.startsWith('00')) normalized = digits.substring(2);
    else if (digits.startsWith('0')) normalized = '212' + digits.substring(1);
    else if (digits.startsWith('212')) normalized = digits;
    if (normalized.length < 9) return null;
    return `https://api.whatsapp.com/send?phone=${normalized}`;
  }

  getWhatsappHref(): string | null {
    const tel = this.service?.telephoneContact || this.service?.demandeur?.numeroDeTelephone || '';
    const base = this.getWhatsapp(tel);
    if (!base) return null;
    const msg = encodeURIComponent(`Bonjour, je suis intéressé par "${this.service?.titreService}" publié sur SouqBladi.`);
    return `${base}&text=${msg}`;
  }

  hasPhone(phone?: string | null): boolean {
    return !!(phone && phone.trim().length >= 6);
  }
  getTel(phone?: string | null): string | null {
    if (!this.hasPhone(phone || '')) return null;
    const digits = (phone || '').replace(/\s+/g, '');
    return `tel:${digits}`;
  }

  getRawPhone(): string | null {
    return this.service?.telephoneContact || this.service?.demandeur?.numeroDeTelephone || null;
    }

  formatPhone(phone: string): string {
    const digitsOnly = phone.replace(/\D/g, '');
    let normalized = digitsOnly;
    if (digitsOnly.startsWith('00')) normalized = digitsOnly.substring(2);
    else if (digitsOnly.startsWith('0')) normalized = '212' + digitsOnly.substring(1);
    else if (digitsOnly.startsWith('212')) normalized = digitsOnly;
    // Ajoute + et espaces: +212 6xx xx xx xx (approx)
    if (normalized.startsWith('212') && normalized.length >= 11) {
      const cc = '+212';
      const rest = normalized.substring(3);
      // Regrouper par 2 après le premier
      return `${cc} ${rest[0]}${rest[1]} ${rest.substring(2,4)} ${rest.substring(4,6)} ${rest.substring(6,8)}${rest.length>8? ' ' + rest.substring(8,10):''}`.trim();
    }
    return `+${normalized}`;
  }

  openImage() {
    if (!this.service?.imageUrl) return;
    this.imageViewer = true;
  }
  closeImage() {
    this.imageViewer = false;
  }
}
