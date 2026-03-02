import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AnonceService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8081/api/v1/anonces';
    private mediaUrl = 'http://localhost:8081/api/v1/media';

    uploadImage(file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<any>(`${this.mediaUrl}/upload`, formData);
    }

    getActive(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    submit(anonce: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/submit`, anonce);
    }

    getById(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    getByAnnonceur(annonceurId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/annonceur/${annonceurId}`);
    }

    update(id: number, anonce: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, anonce);
    }

    archive(id: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${id}/archive-mock`, {});
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}