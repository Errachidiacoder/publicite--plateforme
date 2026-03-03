import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-merchant-badge',
    standalone: true,
    imports: [CommonModule],
    template: `
    <span class="merchant-badge" [class]="'badge-' + normalizedType">
      {{ label }}
    </span>
  `,
    styles: [`
    .merchant-badge {
      display: inline-flex; align-items: center;
      font-size: 0.65rem; font-weight: 700;
      padding: 2px 8px; border-radius: 100px;
      text-transform: uppercase; letter-spacing: 0.03em;
      white-space: nowrap;
    }
    .badge-auto_entrepreneur { background: #dbeafe; color: #1d4ed8; }
    .badge-magasin { background: #d1fae5; color: #065f46; }
    .badge-cooperative { background: #fef3c7; color: #92400e; }
    .badge-sarl { background: #ede9fe; color: #5b21b6; }
    .badge-livreur { background: #fce7f3; color: #9d174d; }
    .badge-stockeur { background: #e0e7ff; color: #3730a3; }
  `]
})
export class MerchantBadgeComponent {
    @Input() type = '';

    get normalizedType(): string {
        return this.type?.toLowerCase() || '';
    }

    get label(): string {
        const labels: Record<string, string> = {
            'auto_entrepreneur': 'Auto-Entrepreneur',
            'magasin': 'Magasin',
            'cooperative': 'Coopérative',
            'sarl': 'SARL',
            'livreur': 'Livreur',
            'stockeur': 'Stockeur'
        };
        return labels[this.normalizedType] || this.type;
    }
}
