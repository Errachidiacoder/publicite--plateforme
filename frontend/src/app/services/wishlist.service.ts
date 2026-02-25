import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class WishlistService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private apiUrl = 'http://localhost:8081/api/v1/favoris';

    private favoritesCountSubject = new BehaviorSubject<number>(0);
    favoritesCount$ = this.favoritesCountSubject.asObservable();

    updateCount() {
        const userId = this.authService.getUserId();
        if (userId) {
            this.http.get<number>(`${this.apiUrl}/count/${userId}`).subscribe(count => {
                this.favoritesCountSubject.next(count);
            });
        } else {
            this.favoritesCountSubject.next(0);
        }
    }

    getFavorites(): Observable<any[]> {
        const userId = this.authService.getUserId();
        if (!userId) return new Observable(obs => obs.next([]));
        return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
    }

    toggleFavorite(productId: number): Observable<boolean> {
        const userId = this.authService.getUserId();
        if (!userId) return new Observable(obs => obs.next(false));
        return this.http.post<boolean>(`${this.apiUrl}/toggle?userId=${userId}&productId=${productId}`, {})
            .pipe(tap(() => this.updateCount()));
    }

    checkFavorite(productId: number): Observable<boolean> {
        const userId = this.authService.getUserId();
        if (!userId) return new Observable(obs => obs.next(false));
        return this.http.get<boolean>(`${this.apiUrl}/check?userId=${userId}&productId=${productId}`);
    }
}
