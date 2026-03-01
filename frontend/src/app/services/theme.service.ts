import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly STORAGE_KEY = 'souqbladi_theme';
    private currentTheme: 'light' | 'dark' = 'light';

    constructor() {
        this.loadTheme();
    }

    private loadTheme() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved === 'dark' || saved === 'light') {
            this.currentTheme = saved;
        } else {
            // Détecter les préférences du système
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.currentTheme = prefersDark ? 'dark' : 'light';
        }
        this.applyTheme();
    }

    private applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
    }

    toggle() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem(this.STORAGE_KEY, this.currentTheme);
        this.applyTheme();
    }

    isDark(): boolean {
        return this.currentTheme === 'dark';
    }

    getTheme(): 'light' | 'dark' {
        return this.currentTheme;
    }
}
