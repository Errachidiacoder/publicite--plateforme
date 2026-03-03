import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ServiceOffre, ServiceOffreService } from '../services/service-offre.service';

@Component({
  selector: 'app-mes-services',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="admin-page-container">
      <div class="admin-compact-wrapper">
        <div class="card table-card" style="padding: 30px;">
          <div class="table-header-row" style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 25px;">
            <div class="table-title-area">
              <h2 style="margin:0; font-size:1.4rem; font-weight:700; color:#1A202C;">Mes Services</h2>
            </div>
            <a routerLink="/publish-service" class="btn btn-primary">+ Publier un service</a>
          </div>
          <div class="table-responsive">
            <table class="premium-table">
              <thead>
                <tr>
                  <th class="text-center">Titre</th>
                  <th class="text-center">Date</th>
                  <th class="text-center">Ville</th>
                  <th class="text-center">Contrat</th>
                  <th class="text-center">Statut</th>
                  <th class="text-center">Prix</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of services">
                  <td class="text-center">
                    <div class="table-user-cell" style="justify-content:center;">
                      <span class="u-name">{{ s.titreService }}</span>
                    </div>
                  </td>
                  <td class="text-center">{{ s.dateSoumission | date:'dd MMM yyyy' }}</td>
                  <td class="text-center">{{ s.villeLocalisation }}</td>
                  <td class="text-center">{{ s.typeContrat }}</td>
                  <td class="text-center">
                    <span class="status-pill-bordered" [ngClass]="(s.statutService || '').toLowerCase()">
                      {{ getStatusLabel(s.statutService) }}
                    </span>
                  </td>
                  <td class="text-center">
                    <span class="code-id" *ngIf="s.prixAfiche">{{ s.prixAfiche | number:'1.0-0' }} DH</span>
                    <span class="code-id" *ngIf="!s.prixAfiche">{{ s.typePrix }}</span>
                  </td>
                </tr>
                <tr *ngIf="services.length === 0">
                  <td colspan="6" class="empty-row">Aucun service publié pour le moment.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MesServicesComponent {
  private api = inject(ServiceOffreService);
  services: ServiceOffre[] = [];

  ngOnInit() {
    this.api.myServices().subscribe(res => this.services = res);
  }

  getStatusLabel(s?: ServiceOffre['statutService']) {
    if (s === 'ACTIVEE') return 'Ouverte';
    if (s === 'VALIDE') return 'Validée';
    if (s === 'EN_ATTENTE') return 'En attente';
    if (s === 'REFUSE') return 'Refusée';
    return s || '—';
  }
}
