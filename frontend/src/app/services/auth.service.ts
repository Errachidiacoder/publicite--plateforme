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
    private apiUrl = 'http://localhost:8081/api/v1/auth';

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

    isLoggedIn(): boolean {
        const token = this.getToken();
        if (!token) return false;
        // Check token expiry
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 > Date.now();
        } catch {
            return false;
        }
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

    /** Decode the JWT payload to extract the roles array */
    private decodeRolesFromToken(token: string): string[] {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.roles ?? [];
        } catch {
            return [];
        }
    }
}
