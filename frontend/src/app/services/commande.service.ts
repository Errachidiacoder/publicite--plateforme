import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LigneCommandeDto {
    id: number;
    produitId: number;
    produitNom: string;
    produitImage: string;
    quantite: number;
    prixUnitaire: number;
    sousTotal: number;
}

export interface CommandeResponseDto {
    id: number;
    referenceCommande: string;
    statutCommande: string;
    methodePaiement: string;
    montantTotal: number;
    lignes: LigneCommandeDto[];
    adresseLivraison: string;
    telephoneContact: string;
    notesLivraison: string;
    datePassageCommande: string;
    nombreArticles: number;
}

export interface CommandeRequestDto {
    adresseLivraison: string;
    telephoneContact: string;
    notesLivraison?: string;
    methodePaiement?: string;
}

@Injectable({ providedIn: 'root' })
export class CommandeService {
    private apiUrl = 'http://localhost:8081/api/v1/commandes';

    constructor(private http: HttpClient) { }

    passerCommande(dto: CommandeRequestDto): Observable<CommandeResponseDto> {
        return this.http.post<CommandeResponseDto>(this.apiUrl, dto);
    }

    getMesCommandes(): Observable<CommandeResponseDto[]> {
        return this.http.get<CommandeResponseDto[]>(`${this.apiUrl}/mes-commandes`);
    }

    getCommande(id: number): Observable<CommandeResponseDto> {
        return this.http.get<CommandeResponseDto>(`${this.apiUrl}/${id}`);
    }
}
