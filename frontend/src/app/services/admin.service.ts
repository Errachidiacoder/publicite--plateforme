import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8081/api/v1/admin';

    getDashboardStats(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/dashboard/stats`);
    }

    getPendingProducts(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/pending-products`);
    }

    getAllProducts(statut?: string): Observable<any[]> {
        const url = statut ? `${this.apiUrl}/products?statut=${statut}` : `${this.apiUrl}/products`;
        return this.http.get<any[]>(url);
    }

    validateProduct(id: number, durationMonths: number = 12): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/products/${id}/validate`, { durationMonths });
    }

    rejectProduct(id: number, reason: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/products/${id}/reject`, { reason });
    }

    deleteProduct(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/products/${id}`);
    }

    archiveProduct(id: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/products/${id}/archive`, {});
    }

    // Utilisé pour la simulation de paiement dans cette phase
    activateProduct(id: number): Observable<any> {
        return this.http.post<any>(`${this.apiUrl.replace('/admin', '')}/produits/${id}/activate-mock`, {});
    }

    updateProduct(id: number, product: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/products/${id}`, product);
    }

    // Gestion des utilisateurs
    getUsers(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/users`);
    }

    toggleUserActive(id: number): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/users/${id}/toggle-active`, {});
    }

    deleteUser(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
    }

    getUserProducts(userId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/users/${userId}/products`);
    }

    createUser(user: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/users`, user);
    }

    updateUser(id: number, user: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/users/${id}`, user);
    }

    // Gestion des Rôles
    getRoles(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/roles`);
    }

    createRole(role: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/roles`, role);
    }

    updateRole(id: number, role: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/roles/${id}`, role);
    }

    deleteRole(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/roles/${id}`);
    }

    // Gestion des Catégories
    getCategories(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/categories`);
    }

    createCategorie(categorie: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/categories`, categorie);
    }

    updateCategorie(id: number, categorie: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/categories/${id}`, categorie);
    }

    deleteCategorie(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/categories/${id}`);
    }

    getActivityLogs(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/logs`);
    }
}




