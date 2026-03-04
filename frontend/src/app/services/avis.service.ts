import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AvisResponseDto {
    id: number;
    note: number;
    commentaire: string;
    dateAvis: string;
    nomUtilisateur: string;
    produitId: number;
    commandeId: number;
}

export interface CanReviewResponse {
    canReview: boolean;
    commandeId?: number;
}

@Injectable({ providedIn: 'root' })
export class AvisService {
    private http = inject(HttpClient);
    private baseUrl = 'http://localhost:8081/api/v1/avis';

    getProductReviews(produitId: number): Observable<AvisResponseDto[]> {
        return this.http.get<AvisResponseDto[]>(`${this.baseUrl}/produit/${produitId}`);
    }

    canReview(produitId: number): Observable<CanReviewResponse> {
        return this.http.get<CanReviewResponse>(`${this.baseUrl}/can-review/${produitId}`);
    }

    submitReview(produitId: number, note: number, commentaire: string, commandeId: number): Observable<any> {
        return this.http.post(this.baseUrl, { produitId, note, commentaire, commandeId });
    }
}
