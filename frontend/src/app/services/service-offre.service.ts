import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ServiceOffre {
  id?: number;
  titreService: string;
  descriptionDetaillee: string;
  prixAfiche?: number;
  telephoneContact?: string;
  typePrix?: 'PRIX_FIXE' | 'PRIX_NEGOCIABLE' | 'GRATUIT' | 'SUR_DEVIS';
  modeTravail: 'REMOTE' | 'SUR_SITE' | 'HYBRIDE';
  typeContrat: 'CDI' | 'CDD' | 'ANAPEC' | 'STAGE' | 'FREELANCE' | 'AUTRE';
  statutService?: 'EN_ATTENTE' | 'VALIDE' | 'ACTIVEE' | 'REFUSE' | 'ARCHIVE';
  statutPaiement?: 'NON_INITIE' | 'EN_ATTENTE' | 'PAYE' | 'ECHEC' | 'REFUSE';
  annoncePremium?: boolean;
  compteurVues?: number;
  dateSoumission?: string;
  datePublication?: string;
  dateExpiration?: string;
  villeLocalisation: string;
  motifRefusAdmin?: string;
  imageUrl?: string;
  categorie?: any;
  demandeur?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceOffreService {
  private http = inject(HttpClient);
  private api = 'http://localhost:8081/api/v1';

  submit(data: ServiceOffre): Observable<ServiceOffre> {
    return this.http.post<ServiceOffre>(`${this.api}/services/submit`, data);
  }

  getById(id: number): Observable<ServiceOffre> {
    return this.http.get<ServiceOffre>(`${this.api}/services/${id}`);
  }

  search(params: { ville?: string; from?: string; to?: string }): Observable<ServiceOffre[]> {
    let p = new HttpParams();
    if (params.ville) p = p.set('ville', params.ville);
    if (params.from) p = p.set('from', params.from);
    if (params.to) p = p.set('to', params.to);
    return this.http.get<ServiceOffre[]>(`${this.api}/services/search`, { params: p });
  }

  myServices(): Observable<ServiceOffre[]> {
    return this.http.get<ServiceOffre[]>(`${this.api}/services/my`);
  }

  adminValidate(id: number, durationMonths = 1): Observable<ServiceOffre> {
    return this.http.post<ServiceOffre>(`${this.api}/admin/services/${id}/validate?durationMonths=${durationMonths}`, {});
  }

  adminProceedPayment(id: number): Observable<ServiceOffre> {
    return this.http.post<ServiceOffre>(`${this.api}/admin/services/${id}/payment/proceed`, {});
  }

  adminValidatePayment(id: number): Observable<ServiceOffre> {
    return this.http.post<ServiceOffre>(`${this.api}/admin/services/${id}/payment/validate`, {});
  }

  adminActivateWithoutPayment(id: number): Observable<ServiceOffre> {
    return this.http.post<ServiceOffre>(`${this.api}/admin/services/${id}/payment/skip`, {});
  }

  adminReject(id: number, reason: string): Observable<ServiceOffre> {
    return this.http.post<ServiceOffre>(`${this.api}/admin/services/${id}/reject`, { reason });
  }

  adminArchive(id: number): Observable<ServiceOffre> {
    return this.http.post<ServiceOffre>(`${this.api}/admin/services/${id}/archive`, {});
  }

  adminFeature(id: number, premium = true): Observable<ServiceOffre> {
    return this.http.post<ServiceOffre>(`${this.api}/admin/services/${id}/feature?premium=${premium}`, {});
  }

  adminPending(): Observable<ServiceOffre[]> {
    return this.http.get<ServiceOffre[]>(`${this.api}/admin/services/pending`);
  }
  adminAll(): Observable<ServiceOffre[]> {
    return this.http.get<ServiceOffre[]>(`${this.api}/admin/services`);
  }

  adminUpdate(id: number, payload: Partial<ServiceOffre>): Observable<ServiceOffre> {
    return this.http.put<ServiceOffre>(`${this.api}/admin/services/${id}`, payload);
  }

  adminDelete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/admin/services/${id}`);
  }
}
