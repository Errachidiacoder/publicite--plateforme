import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserDto {
    id: number;
    nomComplet: string;
    adresseEmail: string;
    numeroDeTelephone: string;
    dateInscription: string;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/api/v1/users';

    getProfile(id: number): Observable<UserDto> {
        return this.http.get<UserDto>(`${this.apiUrl}/${id}`);
    }

    updateProfile(id: number, profile: Partial<UserDto>): Observable<UserDto> {
        return this.http.put<UserDto>(`${this.apiUrl}/${id}`, profile);
    }

    changePassword(id: number, passwords: any): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${id}/change-password`, passwords);
    }
}
