import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface RecommendedProduct {
    id: number;
    nom: string;
    descriptionCourte?: string;
    prix?: number;
    prixPromo?: number;
    primaryImageUrl?: string;
    noteMoyenne?: number;
    nombreAvis?: number;
    categorieNom?: string;
    categorieSlug?: string;
    nombreVentes?: number;
}

@Injectable({ providedIn: 'root' })
export class RecommendationService {

    private readonly base = 'http://localhost:8081/api/v1/recommendations';

    // ── Timer state ─────────────────────────────────────
    private timerStart: number | null = null;
    private timerProduitId: number | null = null;

    constructor(private http: HttpClient, private auth: AuthService) { }

    // ── API calls ────────────────────────────────────────

    getPersonalized(limit = 8): Observable<RecommendedProduct[]> {
        return this.http
            .get<RecommendedProduct[]>(`${this.base}/for-me?limit=${limit}`)
            .pipe(catchError(() => of([])));
    }

    getPopular(limit = 8): Observable<RecommendedProduct[]> {
        return this.http
            .get<RecommendedProduct[]>(`${this.base}/popular?limit=${limit}`)
            .pipe(catchError(() => of([])));
    }

    /**
     * Returns personalized recommendations if logged in, popular otherwise.
     */
    getSmart(limit = 8): Observable<RecommendedProduct[]> {
        return this.auth.isLoggedIn() ? this.getPersonalized(limit) : this.getPopular(limit);
    }

    trackEvent(produitId: number, eventType: 'VIEW' | 'FAVORITE' | 'CART', durationSec?: number): void {
        if (!this.auth.isLoggedIn()) return;
        this.http.post(`${this.base}/track`, { produitId, eventType, durationSec })
            .pipe(catchError(() => of(null)))
            .subscribe();
    }

    // ── Timer helpers ────────────────────────────────────

    startTimer(produitId: number): void {
        this.timerStart = Date.now();
        this.timerProduitId = produitId;
    }

    stopAndSend(): void {
        if (this.timerStart !== null && this.timerProduitId !== null) {
            const durationSec = Math.round((Date.now() - this.timerStart) / 1000);
            if (durationSec >= 2) {  // Only track meaningful views (≥ 2 seconds)
                this.trackEvent(this.timerProduitId, 'VIEW', durationSec);
            }
            this.timerStart = null;
            this.timerProduitId = null;
        }
    }
}
