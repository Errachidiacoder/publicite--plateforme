import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
    selector: 'app-theme-toggle',
    standalone: true,
    template: `
    <button class="theme-toggle" (click)="toggle()" [attr.aria-label]="themeService.isDark() ? 'Passer au mode clair' : 'Passer au mode sombre'">
      <span class="toggle-icon">{{ themeService.isDark() ? '☀️' : '🌙' }}</span>
    </button>
  `,
    styles: [`
    .theme-toggle {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      border: 1.5px solid var(--sb-border);
      background: var(--sb-bg-elevated);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .theme-toggle:hover {
      transform: translateY(-2px);
      box-shadow: var(--sb-shadow-sm);
      border-color: var(--sb-primary);
    }
    .toggle-icon {
      font-size: 1.15rem;
      line-height: 1;
    }
  `]
})
export class ThemeToggleComponent {
    themeService = inject(ThemeService);

    toggle() {
        this.themeService.toggle();
    }
}
