import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Recommendation {
    id: number;
    titre: string;
    description: string;
    prix: number;
    imageUrl: string;
    ville: string;
    categorie: string;
    noteMoyenne: number;
    nombreVentes: number;
    reason: string;
}

export interface PersonalizedRequest {
    viewedIds: number[];
    location: string | null;
    searchQuery: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProductRecommendationService {
    private http = inject(HttpClient);
    private baseUrl = 'http://localhost:8081/api/v1/product-recommendations';

    /** Produits similaires à l'annonce consultée */
    getSimilar(produitId: number, limit = 6): Observable<Recommendation[]> {
        return this.http.get<Recommendation[]>(`${this.baseUrl}/similar/${produitId}?limit=${limit}`);
    }

    /** Recommandations personnalisées basées sur l'historique + contexte */
    getPersonalized(viewedIds: number[], location?: string | null, searchQuery?: string | null, limit = 6): Observable<Recommendation[]> {
        const body: PersonalizedRequest = {
            viewedIds: viewedIds || [],
            location: location || null,
            searchQuery: searchQuery || null
        };
        return this.http.post<Recommendation[]>(`${this.baseUrl}/personalized?limit=${limit}`, body);
    }

    /** Produits les plus populaires (fallback) */
    getPopular(limit = 6): Observable<Recommendation[]> {
        return this.http.get<Recommendation[]>(`${this.baseUrl}/popular?limit=${limit}`);
    }

    /** Statut du service IA */
    getAIStatus(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/test-ai`);
    }

    /** Lit l'historique depuis sessionStorage */
    getViewHistory(): number[] {
        try {
            return JSON.parse(sessionStorage.getItem('product_history') || '[]');
        } catch {
            return [];
        }
    }

    /** Ajoute un produit à l'historique de navigation (max 10) */
    trackView(produitId: number): void {
        let history = this.getViewHistory();
        history = history.filter(id => id !== produitId);
        history.unshift(produitId);
        if (history.length > 10) history.pop();
        sessionStorage.setItem('product_history', JSON.stringify(history));
    }
}
