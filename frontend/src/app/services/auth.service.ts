import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface AuthResponse {
    token: string;
    role: string;
    nomComplet: string;
    email: string;
    id: number;
}

const STORAGE_KEY = 'pub_auth';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private apiUrl = 'http://localhost:18081/api/v1/auth';

    register(request: any): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
            tap(res => this.saveSession(res))
        );
    }

    login(request: any): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
            tap(res => this.saveSession(res))
        );
    }

    logout() {
        localStorage.removeItem(STORAGE_KEY);
        this.router.navigate(['/home']);
    }

    private saveSession(res: AuthResponse) {
        const session = {
            token: res.token,
            role: res.role,
            nomComplet: res.nomComplet,
            email: res.email,
            userId: res.id,
            // decode roles array from JWT payload for multi-role support
            roles: this.decodeRolesFromToken(res.token)
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }

    private getSession(): any {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    }

    getToken(): string | null {
        return this.getSession()?.token ?? null;
    }

    getPrimaryRole(): string {
        return this.getSession()?.role ?? 'VISITEUR';
    }

    getRoles(): string[] {
        return this.getSession()?.roles ?? [];
    }

    getNomComplet(): string {
        return this.getSession()?.nomComplet ?? '';
    }

    getEmail(): string {
        return this.getSession()?.email ?? '';
    }

    getUserId(): number | null {
        return this.getSession()?.userId ?? null;
    }

    getCurrentUser(): { id: number; nomComplet: string; email: string; role: string; roles: string[] } | null {
        const s = this.getSession();
        if (!s?.userId) return null;
        return {
            id: s.userId,
            nomComplet: s.nomComplet ?? '',
            email: s.email ?? '',
            role: s.role ?? 'VISITEUR',
            roles: s.roles ?? []
        };
    }

    isLoggedIn(): boolean {
        const token = this.getToken();
        if (!token) return false;
        const payload = this.decodeJwtPayload(token);
        if (!payload?.exp) return false;
        return payload.exp * 1000 > Date.now();
    }

    isAdmin(): boolean {
        return this.hasRole('ROLE_SUPERADMIN') || this.hasRole('ROLE_ADJOINTADMIN');
    }

    isSuperAdmin(): boolean {
        return this.hasRole('ROLE_SUPERADMIN');
    }

    isAdjointAdmin(): boolean {
        return this.hasRole('ROLE_ADJOINTADMIN');
    }

    isAnnonceur(): boolean {
        return this.hasRole('ROLE_ANNONCEUR');
    }

    isClient(): boolean {
        return this.hasRole('ROLE_CLIENT');
    }

    hasRole(role: string): boolean {
        return this.getRoles().includes(role);
    }

    private decodeRolesFromToken(token: string): string[] {
        return this.decodeJwtPayload(token)?.roles ?? [];
    }

    private decodeJwtPayload(token: string): any | null {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
                + '='.repeat((4 - (base64Url.length % 4)) % 4);
            return JSON.parse(atob(base64));
        } catch {
            return null;
        }
    }
}
