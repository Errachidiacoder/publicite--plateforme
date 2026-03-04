import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';

export interface LignePanierDto {
    id: number;
    produitId: number;
    produitNom: string;
    produitImage: string;
    prix: number;
    prixPromo: number | null;
    quantite: number;
    sousTotal: number;
    stockDisponible: number;
}

export interface PanierDto {
    id: number;
    lignes: LignePanierDto[];
    totalItems: number;
    totalAmount: number;
}

@Injectable({ providedIn: 'root' })
export class PanierService {
    private apiUrl = 'http://localhost:8081/api/v1/panier';

    private panierSubject = new BehaviorSubject<PanierDto | null>(null);
    panier$ = this.panierSubject.asObservable();

    private cartCountSubject = new BehaviorSubject<number>(0);
    cartCount$ = this.cartCountSubject.asObservable();

    constructor(private http: HttpClient) { }

    /** Load cart on app init (if authenticated) */
    init(): void {
        this.loadPanier().subscribe();
    }

    loadPanier(): Observable<PanierDto> {
        return this.http.get<PanierDto>(this.apiUrl).pipe(
            tap(panier => {
                this.panierSubject.next(panier);
                this.cartCountSubject.next(panier.totalItems);
            }),
            catchError(() => {
                this.panierSubject.next(null);
                this.cartCountSubject.next(0);
                return of(null as any);
            })
        );
    }

    addItem(produitId: number, quantite = 1): Observable<PanierDto> {
        return this.http.post<PanierDto>(`${this.apiUrl}/ajouter`, { produitId, quantite }).pipe(
            tap(panier => {
                this.panierSubject.next(panier);
                this.cartCountSubject.next(panier.totalItems);
            })
        );
    }

    updateQuantite(produitId: number, quantite: number): Observable<PanierDto> {
        return this.http.put<PanierDto>(`${this.apiUrl}/modifier`, { produitId, quantite }).pipe(
            tap(panier => {
                this.panierSubject.next(panier);
                this.cartCountSubject.next(panier.totalItems);
            })
        );
    }

    removeItem(produitId: number): Observable<PanierDto> {
        return this.http.delete<PanierDto>(`${this.apiUrl}/supprimer/${produitId}`).pipe(
            tap(panier => {
                this.panierSubject.next(panier);
                this.cartCountSubject.next(panier.totalItems);
            })
        );
    }

    clearCart(): Observable<PanierDto> {
        return this.http.delete<PanierDto>(`${this.apiUrl}/vider`).pipe(
            tap(panier => {
                this.panierSubject.next(panier);
                this.cartCountSubject.next(0);
            })
        );
    }

    getCount(): Observable<{ count: number }> {
        return this.http.get<{ count: number }>(`${this.apiUrl}/count`).pipe(
            tap(res => this.cartCountSubject.next(res.count))
        );
    }
}
