import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ServiceOffreService, ServiceOffre } from '../services/service-offre.service';
import { CategorieService } from '../services/category.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-services-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="services-page">
      <div class="services-layout">
        <!-- Left Sidebar: Categories -->
        <aside class="side">
          <div class="side-title">Catégories</div>
          <div class="side-list">
            <button class="side-item" [class.active]="activeCat === 'ALL'" (click)="selectCat('ALL')">Toutes</button>
            @for (c of categories; track c.id) {
              <button class="side-item" [class.active]="activeCat === c.nomCategorie" (click)="selectCat(c.nomCategorie)">
                {{ c.nomCategorie }}
              </button>
            }
          </div>
        </aside>

        <!-- Main Column -->
        <main class="main">
          <header class="topbar">
            <div class="result">RÉSULTAT <span class="count">{{ services.length }}</span></div>
            <form class="search" (ngSubmit)="onSearch()">
              <input class="search-input" [(ngModel)]="filters.ville" name="ville" placeholder="Ville..." />
              <button class="search-btn" type="submit">Chercher</button>
            </form>
          </header>

          <!-- List -->
          <div class="list">
            @for (s of services; track s.id) {
              <div class="row" [routerLink]="['/service', s.id]" style="cursor:pointer;">
                <div class="thumb">
                  @if (s.imageUrl) {
                    <img [src]="s.imageUrl" alt="service">
                  } @else {
                    <div class="thumb-ph">
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="4" width="18" height="16" rx="2" ry="2"/>
                        <path d="M16 4v-1a3 3 0 0 0-6 0v1"/>
                        <circle cx="12" cy="13" r="3"/>
                      </svg>
                    </div>
                  }
                </div>
                <div class="row-left">
                  <div class="title">{{ s.titreService }}</div>
                  <div class="excerpt" *ngIf="s.descriptionDetaillee">{{ s.descriptionDetaillee }}</div>
                  <div class="meta">
                    <span>{{ s.dateSoumission | date:'dd-MM-yyyy' }}</span>
                    <span>• {{ s.modeTravail === 'REMOTE' ? 'À distance' : (s.modeTravail === 'SUR_SITE' ? 'Sur site' : 'Hybride') }}</span>
                    <span>• {{ s.villeLocalisation }}</span>
                    <span class="status">Ouverte</span>
                  </div>
                  <div class="chips">
                    <span class="chip" *ngIf="s.typeContrat">{{ s.typeContrat }}</span>
                  </div>
                </div>
                <div class="row-right">
                  <div class="price">
                    <ng-container [ngSwitch]="s.typePrix">
                      <span *ngSwitchCase="'PRIX_FIXE'">
                        {{ (s.prixAfiche || 0) | number:'1.0-0' }} DH
                      </span>
                      <span *ngSwitchCase="'PRIX_NEGOCIABLE'">Négociable</span>
                      <span *ngSwitchCase="'GRATUIT'">Gratuit</span>
                      <span *ngSwitchCase="'SUR_DEVIS'">Sur devis</span>
                      <span *ngSwitchDefault>
                        {{ s.prixAfiche ? (s.prixAfiche | number:'1.0-0') + ' DH' : '' }}
                      </span>
                    </ng-container>
                  </div>
                </div>
              </div>
            }
            @empty {
              <div class="empty">Aucun service actif trouvé.</div>
            }
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .services-page { padding: 12px; }
    .services-layout { display: grid; grid-template-columns: 260px 1fr; gap: 18px; max-width: 1100px; margin: 0 auto; }
    .side { background: white; border: 1px solid var(--sb-border, #e2e8f0); border-radius: 16px; padding: 12px; }
    .side-title { font-weight: 800; font-size: 0.9rem; color: var(--sb-text, #1e293b); margin-bottom: 10px; }
    .side-list { display: grid; gap: 6px; }
    .side-item { text-align: left; background: #f8fafc; border: 1px solid #e2e8f0; color: #334155; padding: 10px 12px; border-radius: 10px; cursor: pointer; font-weight: 700; }
    .side-item.active { background: #e0f7ff; border-color: #00ccff; color: #0e7490; }

    .main { display: flex; flex-direction: column; gap: 12px; }
    .topbar { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
    .result { color: #475569; font-weight: 800; letter-spacing: 0.02em; }
    .result .count { color: #00b8d9; }
    .search { display: flex; gap: 8px; }
    .search-input { border: 1px solid #e2e8f0; border-radius: 24px; padding: 8px 14px; min-width: 220px; }
    .search-btn { background: #1aafa5; color: white; border: none; padding: 8px 14px; border-radius: 24px; font-weight: 800; cursor: pointer; }

    .list { display: grid; gap: 12px; }
    .row { display: grid; grid-template-columns: 64px 1fr 140px; gap: 12px; background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; align-items: center; }
    .thumb { width: 56px; height: 56px; border-radius: 12px; overflow: hidden; background: #f1f5f9; display:flex; align-items:center; justify-content:center; border: 1px solid #e2e8f0; }
    .thumb img { width: 100%; height: 100%; object-fit: cover; }
    .thumb-ph { color: #94a3b8; }
    .title { font-weight: 800; color: #0f172a; margin-bottom: 6px; }
    .excerpt { color: #475569; font-size: 0.9rem; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .meta { color: #64748b; display: flex; flex-wrap: wrap; gap: 8px; font-size: 0.85rem; }
    .status { background: rgba(34,197,94,0.12); color: #16a34a; padding: 2px 10px; border-radius: 999px; font-weight: 800; font-size: 0.7rem; }
    .chips { margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap; }
    .chip { background: #f1f5f9; color: #334155; padding: 4px 10px; border-radius: 999px; font-weight: 700; font-size: 0.75rem; }
    .row-right { text-align: right; }
    .price { color: #10b981; font-weight: 900; font-size: 1.05rem; }

    @media (max-width: 960px) {
      .services-layout { grid-template-columns: 1fr; }
      .side { order: 2; }
      .main { order: 1; }
      .row { grid-template-columns: 56px 1fr; text-align: left; }
      .row-right { text-align: left; }
    }
  `]
})
export class ServicesListComponent {
  private api = inject(ServiceOffreService);
  private catApi = inject(CategorieService);
  private cdr = inject(ChangeDetectorRef);
  services: ServiceOffre[] = [];
  categories: any[] = [];
  activeCat: string = 'ALL';
  filters: { ville?: string; from?: string; to?: string } = {};

  ngOnInit() {
    this.catApi.getAllActive().subscribe(res => {
      this.categories = res || [];
      this.cdr.detectChanges();
    });
    // Charge immédiatement les services actifs
    this.onSearch();
  }

  onSearch() {
    this.api.search(this.filters).subscribe(res => {
      const list = (res || []).filter(s => s.statutService === 'ACTIVEE');
      this.services = this.activeCat === 'ALL' ? list : list.filter(s => s.categorie?.nomCategorie === this.activeCat);
      this.cdr.detectChanges();
    });
  }

  reset() {
    this.filters = {};
    this.onSearch();
  }

  selectCat(cat: string) {
    this.activeCat = cat;
    this.onSearch();
  }
}
