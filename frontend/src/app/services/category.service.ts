import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CategorieService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8081/api/v1/categories';

    getAllActive(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    getRoots(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/roots`);
    }
}
