import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProduitService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8081/api/v1/produits';

    getActive(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }


    submit(produit: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/submit`, produit);
    }

    getById(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }
}
