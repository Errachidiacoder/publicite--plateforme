import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <button class="theme-toggle" (click)="toggle()" [attr.aria-label]="themeService.isDark() ? 'Passer au mode clair' : 'Passer au mode sombre'">
      @if (themeService.isDark()) {
        <!-- Pro Sun SVG -->
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" fill="#FDB813" stroke="#FDB813" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="#FDB813" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      } @else {
        <!-- Pro Moon SVG (Yellow Crescent) -->
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 12.79C20.44 12.92 19.86 13 19.25 13C15.82 13 13.05 10.23 13.05 6.8C13.05 5.56 13.43 4.41 14.07 3.46C10.51 3.57 7.64 6.5 7.64 10.09C7.64 14.12 10.91 17.39 14.94 17.39C17.65 17.39 20.01 15.91 21.24 13.71C21.16 13.71 21.08 13.71 21 13.71C21 13.4 21 13.09 21 12.79Z" fill="#FDB813" stroke="#FDB813" stroke-width="1" stroke-linejoin="round"/>
          <circle cx="11" cy="8" r="1" fill="#E8A900" opacity="0.4"/>
          <circle cx="15" cy="14" r="1.5" fill="#E8A900" opacity="0.4"/>
          <circle cx="10" cy="15" r="0.8" fill="#E8A900" opacity="0.4"/>
        </svg>
      }
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
      padding: 0;
    }
    .theme-toggle:hover {
      transform: translateY(-2px);
      box-shadow: var(--sb-shadow-sm);
      border-color: var(--sb-primary);
    }
    [data-theme="dark"] .theme-toggle {
        background: #1e293b;
        border-color: rgba(255,255,255,0.1);
    }
  `]
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);

  toggle() {
    this.themeService.toggle();
  }
}
