import { Component } from '@angular/core';

@Component({
    selector: 'app-skeleton-card',
    standalone: true,
    template: `
    <div class="skeleton-card">
      <div class="sk-image shimmer"></div>
      <div class="sk-body">
        <div class="sk-line sk-line-short shimmer"></div>
        <div class="sk-line sk-line-long shimmer"></div>
        <div class="sk-line sk-line-price shimmer"></div>
        <div class="sk-stars shimmer"></div>
      </div>
    </div>
  `,
    styles: [`
    .skeleton-card {
      background: var(--sb-bg-elevated, #fff);
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--sb-border-light, #f1f5f9);
    }
    .sk-image { width: 100%; aspect-ratio: 1; background: #e2e8f0; }
    .sk-body { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
    .sk-line { border-radius: 6px; height: 12px; background: #e2e8f0; }
    .sk-line-short { width: 40%; }
    .sk-line-long { width: 80%; }
    .sk-line-price { width: 50%; height: 16px; }
    .sk-stars { width: 60%; height: 10px; border-radius: 6px; background: #e2e8f0; }

    .shimmer {
      background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class SkeletonCardComponent { }
