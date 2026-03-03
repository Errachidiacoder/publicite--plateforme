import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-star-rating',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="stars-container">
      @for (star of starsArray; track star) {
        <svg class="star-icon" [class.filled]="star <= rating" [class.half]="star - 0.5 <= rating && star > rating" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      }
      @if (showCount && count > 0) {
        <span class="review-count">({{ count }})</span>
      }
    </div>
  `,
    styles: [`
    .stars-container { display: inline-flex; align-items: center; gap: 1px; }
    .star-icon { width: 14px; height: 14px; fill: #d4d4d8; transition: fill 0.15s; }
    .star-icon.filled { fill: #f59e0b; }
    .star-icon.half { fill: #fbbf24; opacity: 0.7; }
    .review-count { font-size: 0.72rem; color: var(--sb-text-muted, #94a3b8); margin-left: 4px; }
  `]
})
export class StarRatingComponent {
    @Input() rating = 0;
    @Input() count = 0;
    @Input() showCount = true;
    starsArray = [1, 2, 3, 4, 5];
}
