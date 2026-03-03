import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';

export interface ProduitRecommande {
  id: number;
  name: string;
  description: string;
  categoryName: string;
  price: number;
  viewCount: number;
  premium: boolean;
  imageUrl: string;
}

@Injectable({ providedIn: 'root' })
export class RecommandationService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8081/api/recommendations';
  private readonly SESSION_KEY = 'viewed_product_ids';

  /**
   * Tracker une vue : appelle le backend + stocke dans le sessionStorage
   */
  trackView(productId: number): void {
    // 1. Appel Backend (Async)
    this.http.post(`${this.apiUrl}/track/${productId}`, {})
      .pipe(catchError(() => of(null)))
      .subscribe();

    // 2. Storage Local (Session)
    let ids = this.getViewedIds();
    ids = ids.filter(id => id !== productId); // Éviter les doublons proches
    ids.unshift(productId);
    if (ids.length > 10) ids.pop(); // Max 10 derniers
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(ids));
  }

  getViewedIds(): number[] {
    const stored = sessionStorage.getItem(this.SESSION_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  getSimilarProducts(productId: number): Observable<ProduitRecommande[]> {
    return this.http.get<ProduitRecommande[]>(`${this.apiUrl}/similar/${productId}`).pipe(
      catchError(() => of([]))
    );
  }

  getPopularProducts(limit: number = 8): Observable<ProduitRecommande[]> {
    return this.http.get<ProduitRecommande[]>(`${this.apiUrl}/popular?limit=${limit}`).pipe(
      catchError(() => of([]))
    );
  }

  getPersonalizedProducts(): Observable<ProduitRecommande[]> {
    const viewedIds = this.getViewedIds();
    return this.http.post<ProduitRecommande[]>(`${this.apiUrl}/personalized`, viewedIds).pipe(
      catchError(() => of([]))
    );
  }
}
