import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ServiceOffreService, ServiceOffre } from '../services/service-offre.service';
import { CategorieService } from '../services/category.service';

@Component({
  selector: 'app-services-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="marketplace-page">
      <!-- Hero -->
      <div class="mp-hero">
        <div class="mp-hero-inner">
          <h1 class="mp-hero-title">Services <span class="mp-hero-accent">SouqBladi</span></h1>
          <p class="mp-hero-sub">Trouvez les meilleurs prestataires et freelances pour vos projets</p>
          <div class="mp-search-bar">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Rechercher par services..." [(ngModel)]="searchKeyword" (keyup.enter)="onSearch()" />
            <button class="mp-search-btn" (click)="onSearch()">Rechercher</button>
          </div>
        </div>
      </div>

      <div class="mp-container">
        <!-- Sidebar filters -->
        <aside class="mp-sidebar">
          <!-- Categories -->
          <div class="filter-section">
            <h3 class="filter-title">Catégories</h3>
            <label class="filter-radio" [class.active]="activeCat === 'ALL'">
              <input type="radio" name="category" value="ALL" [(ngModel)]="activeCat" (change)="applyFilters()" />
              Toutes les catégories
            </label>
            @for (c of categories; track c.id) {
              <label class="filter-radio" [class.active]="activeCat === c.nomCategorie">
                <input type="radio" name="category" [value]="c.nomCategorie" [(ngModel)]="activeCat" (change)="applyFilters()" />
                {{ c.nomCategorie }}
              </label>
            }
          </div>

          <!-- Type de Contrat -->
          <div class="filter-section">
            <h3 class="filter-title">Type de contrat</h3>
            <label class="filter-radio" [class.active]="selectedContract === ''">
              <input type="radio" name="contract" value="" [(ngModel)]="selectedContract" (change)="applyFilters()" />
              Tous les contrats
            </label>
            @for (type of contractTypes; track type.value) {
              <label class="filter-radio" [class.active]="selectedContract === type.value">
                <input type="radio" name="contract" [value]="type.value" [(ngModel)]="selectedContract" (change)="applyFilters()" />
                {{ type.label }}
              </label>
            }
          </div>

          <!-- Mode de travail -->
          <div class="filter-section">
            <h3 class="filter-title">Mode de travail</h3>
            <label class="filter-radio" [class.active]="selectedWorkMode === ''">
              <input type="radio" name="workMode" value="" [(ngModel)]="selectedWorkMode" (change)="applyFilters()" />
              Tous les modes
            </label>
            @for (mode of workModes; track mode.value) {
              <label class="filter-radio" [class.active]="selectedWorkMode === mode.value">
                <input type="radio" name="workMode" [value]="mode.value" [(ngModel)]="selectedWorkMode" (change)="applyFilters()" />
                {{ mode.label }}
              </label>
            }
          </div>
          
          <button class="filter-clear-btn" (click)="resetFilters()" *ngIf="activeCat !== 'ALL' || selectedContract !== '' || selectedWorkMode !== '' || searchKeyword !== ''">
            ✕ Réinitialiser tout
          </button>
        </aside>

        <!-- Main Content -->
        <main class="mp-main">
          <!-- Toolbar -->
          <div class="mp-toolbar">
            <span class="mp-result-count">
              {{ filteredServices.length }} service{{ filteredServices.length !== 1 ? 's' : '' }} trouvé{{ filteredServices.length !== 1 ? 's' : '' }}
            </span>
            <div class="mp-sort">
              <label>Trier par</label>
              <select [(ngModel)]="sortBy" (change)="sortServices()">
                <option value="newest">Plus récents</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
              </select>
            </div>
          </div>

          <!-- List View (Rows) -->
          <div class="mp-list">
            @for (s of filteredServices; track s.id) {
              <div class="service-row" [routerLink]="['/service', s.id]">
                
                <!-- Thumbnail -->
                <div class="row-thumb">
                  @if (s.imageUrl) {
                    <img [src]="s.imageUrl" alt="{{ s.titreService }}">
                  } @else {
                    <div class="thumb-ph">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" ry="2"/><path d="M16 4v-1a3 3 0 0 0-6 0v1"/><circle cx="12" cy="13" r="3"/></svg>
                    </div>
                  }
                </div>

                <!-- Content -->
                <div class="row-content">
                  <h3 class="row-title">{{ s.titreService }}</h3>
                  
                  <div class="row-meta">
                    <span class="meta-item">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      {{ s.dateSoumission | date:'dd-MM-yyyy' }}
                    </span>
                    <span class="meta-item">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {{ s.modeTravail === 'REMOTE' ? 'À distance' : s.villeLocalisation }}
                    </span>
                    <span class="status-badge">Ouverte</span>
                    <span class="meta-item" *ngIf="s.demandeur">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      {{ s.demandeur.nomComplet || 'Utilisateur' }}
                    </span>
                  </div>

                  <p class="row-desc" *ngIf="s.descriptionDetaillee">
                    {{ s.descriptionDetaillee }}
                  </p>

                  <div class="row-tags">
                    <span class="tag" *ngIf="s.categorie">{{ s.categorie.nomCategorie }}</span>
                    <span class="tag" *ngIf="s.typeContrat">{{ getContractLabel(s.typeContrat) }}</span>
                  </div>
                </div>

                <!-- Right Side (Price) -->
                <div class="row-right">
                  <div class="row-price">
                    <ng-container [ngSwitch]="s.typePrix">
                      <span *ngSwitchCase="'PRIX_FIXE'">{{ (s.prixAfiche || 0) | number:'1.0-0' }} DH</span>
                      <span *ngSwitchCase="'PRIX_NEGOCIABLE'">Négociable</span>
                      <span *ngSwitchCase="'GRATUIT'">Gratuit</span>
                      <span *ngSwitchCase="'SUR_DEVIS'">Sur devis</span>
                      <span *ngSwitchDefault>{{ s.prixAfiche ? (s.prixAfiche | number:'1.0-0') + ' DH' : '' }}</span>
                    </ng-container>
                  </div>
                  <div class="row-stats">
                    Vues: {{ s.compteurVues || 0 }}
                  </div>
                </div>

              </div>
            }
            @empty {
              <div class="mp-empty">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <h3>Aucun service trouvé</h3>
                <p>Essayez de modifier vos filtres ou votre recherche</p>
                <button class="mp-reset-btn" (click)="resetFilters()">Réinitialiser les filtres</button>
              </div>
            }
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .marketplace-page { min-height: 100vh; background: var(--sb-bg, #f8fafc); padding-bottom: 40px; }

    /* Hero */
    .mp-hero {
      background: linear-gradient(135deg, #0f766e 0%, #1aafa5 50%, #14b8a6 100%);
      padding: 48px 24px 40px; text-align: center;
      margin-bottom: 32px;
    }
    .mp-hero-inner { max-width: 680px; margin: 0 auto; }
    .mp-hero-title { font-size: 2.2rem; font-weight: 900; color: white; margin: 0 0 8px; }
    .mp-hero-accent { color: #a7f3d0; }
    .mp-hero-sub { color: rgba(255,255,255,0.85); font-size: 1rem; margin: 0 0 24px; }
    .mp-search-bar {
      display: flex; align-items: center;
      background: white; border-radius: 12px;
      padding: 4px 4px 4px 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      max-width: 420px;
      margin: 0 auto;
    }
    .mp-search-bar svg { color: #94a3b8; flex-shrink: 0; }
    .mp-search-bar input {
      flex: 1; border: none; outline: none; padding: 6px 10px;
      font-size: 0.88rem; background: transparent; color: #1e293b;
    }
    .mp-search-btn {
      background: var(--sb-primary, #1aafa5); color: white;
      border: none; padding: 6px 16px; border-radius: 9px;
      font-weight: 700; font-size: 0.82rem; cursor: pointer;
      transition: background 0.2s;
    }
    .mp-search-btn:hover { background: #0f766e; }

    /* Container */
    .mp-container {
      max-width: 1320px; margin: 0 auto;
      padding: 0 24px; display: flex; gap: 24px;
    }

    /* Sidebar */
    .mp-sidebar {
      width: 260px; flex-shrink: 0;
      display: flex; flex-direction: column; gap: 20px;
    }
    .filter-section {
      background: var(--sb-bg-elevated, #fff);
      border: 1px solid var(--sb-border-light, #f1f5f9);
      border-radius: 12px; padding: 16px;
    }
    .filter-title {
      font-size: 0.85rem; font-weight: 800;
      color: var(--sb-text, #1e293b);
      margin: 0 0 12px; text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .filter-radio {
      display: flex; align-items: center; gap: 8px;
      padding: 6px 8px; border-radius: 8px;
      font-size: 0.83rem; color: var(--sb-text-secondary, #64748b);
      cursor: pointer; transition: 0.15s;
    }
    .filter-radio:hover, .filter-radio.active {
      background: var(--sb-bg-alt, #f1f5f9);
      color: var(--sb-primary, #1aafa5);
    }
    .filter-radio input { accent-color: var(--sb-primary, #1aafa5); }
    .filter-clear-btn {
      margin-top: 8px; background: none; border: none;
      color: var(--sb-primary, #1aafa5); font-size: 0.75rem;
      font-weight: 600; cursor: pointer; text-align: left; padding: 0;
    }

    /* Main */
    .mp-main { flex: 1; min-width: 0; }

    /* Toolbar */
    .mp-toolbar {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 16px;
    }
    .mp-result-count { font-size: 0.85rem; color: var(--sb-text-secondary, #64748b); font-weight: 600; }
    .mp-sort { display: flex; align-items: center; gap: 8px; }
    .mp-sort label { font-size: 0.8rem; color: var(--sb-text-muted, #94a3b8); font-weight: 600; }
    .mp-sort select {
      padding: 6px 12px; border-radius: 8px;
      border: 1px solid var(--sb-border, #e2e8f0);
      font-size: 0.82rem; background: var(--sb-bg-elevated, #fff);
      color: var(--sb-text, #1e293b); cursor: pointer; outline: none;
    }

    /* List View (Rows) */
    .mp-list {
      display: flex; flex-direction: column; gap: 16px;
    }

    .service-row {
      display: flex; gap: 20px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      transition: box-shadow 0.2s, border-color 0.2s;
      cursor: pointer;
      align-items: flex-start;
    }

    .service-row:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      border-color: #cbd5e1;
    }

    .row-thumb {
      width: 80px; height: 80px; flex-shrink: 0;
      border-radius: 8px; overflow: hidden;
      background: #f8fafc; border: 1px solid #e2e8f0;
      display: flex; align-items: center; justify-content: center;
    }
    .row-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .thumb-ph { color: #94a3b8; }

    .row-content { flex: 1; min-width: 0; }

    .row-title {
      font-size: 1.1rem; font-weight: 700; color: #2563eb; /* Blue title */
      margin: 0 0 8px; line-height: 1.3;
    }
    .row-title:hover { text-decoration: underline; }

    .row-meta {
      display: flex; flex-wrap: wrap; align-items: center; gap: 12px;
      font-size: 0.85rem; color: #64748b; margin-bottom: 10px;
    }
    .meta-item { display: flex; align-items: center; gap: 4px; }
    .meta-item .icon { opacity: 0.7; }

    .status-badge {
      background: #10b981; color: white;
      padding: 2px 10px; border-radius: 99px;
      font-size: 0.75rem; font-weight: 700;
    }

    .row-desc {
      font-size: 0.9rem; color: #334155;
      margin: 0 0 12px; line-height: 1.5;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }

    .row-tags { display: flex; flex-wrap: wrap; gap: 8px; }
    .tag {
      background: #eff6ff; color: #1e40af; /* Light blue bg */
      padding: 4px 12px; border-radius: 99px;
      font-size: 0.75rem; font-weight: 600;
    }

    .row-right {
      text-align: right; min-width: 100px;
      display: flex; flex-direction: column; justify-content: space-between;
      height: 100%;
    }

    .row-price {
      font-size: 1.4rem; font-weight: 700; color: #10b981; /* Green price */
      margin-bottom: 8px;
    }
    
    .row-stats {
      font-size: 0.8rem; color: #94a3b8;
    }

    /* Empty State */
    .mp-empty {
      text-align: center; padding: 64px 24px;
      color: var(--sb-text-muted, #94a3b8);
      background: white; border-radius: 12px; border: 1px solid #e2e8f0;
    }
    .mp-empty svg { margin-bottom: 16px; opacity: 0.4; }
    .mp-empty h3 { font-size: 1.1rem; color: var(--sb-text, #1e293b); margin: 0 0 8px; }
    .mp-empty p { font-size: 0.88rem; margin: 0 0 20px; }
    .mp-reset-btn {
      background: var(--sb-primary, #1aafa5); color: white;
      border: none; padding: 10px 24px; border-radius: 10px;
      font-weight: 700; font-size: 0.85rem; cursor: pointer;
    }

    @media (max-width: 768px) {
      .mp-container { flex-direction: column; }
      .mp-sidebar { width: 100%; flex-direction: row; flex-wrap: wrap; gap: 12px; }
      .filter-section { flex: 1; min-width: 200px; }
      .service-row { flex-direction: column; gap: 12px; }
      .row-right { text-align: left; flex-direction: row; align-items: center; justify-content: space-between; width: 100%; }
      .row-thumb { width: 60px; height: 60px; }
    }
  `]
})
export class ServicesListComponent implements OnInit {
  private api = inject(ServiceOffreService);
  private catApi = inject(CategorieService);
  private cdr = inject(ChangeDetectorRef);

  allServices: ServiceOffre[] = [];
  filteredServices: ServiceOffre[] = [];
  categories: any[] = [];

  // Filters
  activeCat: string = 'ALL';
  searchKeyword: string = '';
  selectedContract: string = '';
  selectedWorkMode: string = '';
  sortBy: string = 'newest';

  contractTypes = [
    { value: 'CDI', label: 'CDI' },
    { value: 'CDD', label: 'CDD' },
    { value: 'ANAPEC', label: 'ANAPEC' },
    { value: 'STAGE', label: 'Stage' },
    { value: 'FREELANCE', label: 'Freelance' },
    { value: 'AUTRE', label: 'Autre' }
  ];

  workModes = [
    { value: 'REMOTE', label: 'À distance' },
    { value: 'SUR_SITE', label: 'Sur site' },
    { value: 'HYBRIDE', label: 'Hybride' }
  ];

  ngOnInit() {
    this.loadCategories();
    this.onSearch();
  }

  loadCategories() {
    this.catApi.getAllActive().subscribe(res => {
      this.categories = res || [];
      this.cdr.detectChanges();
    });
  }

  onSearch() {
    // Fetch all for now as the backend /search only supports vile/dates
    this.api.search({}).subscribe({
      next: (res) => {
        // Filter only active services
        this.allServices = (res || []).filter(s => s.statutService === 'ACTIVEE');
        this.applyFilters();
      },
      error: () => {
        this.allServices = [];
        this.filteredServices = [];
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters() {
    let temp = [...this.allServices];

    // Keyword Filter
    if (this.searchKeyword) {
      const kw = this.searchKeyword.toLowerCase().trim();
      temp = temp.filter(s =>
        s.titreService?.toLowerCase().includes(kw) ||
        s.descriptionDetaillee?.toLowerCase().includes(kw) ||
        s.villeLocalisation?.toLowerCase().includes(kw)
      );
    }

    // Category Filter
    if (this.activeCat !== 'ALL') {
      temp = temp.filter(s => s.categorie?.nomCategorie === this.activeCat);
    }

    // Contract Filter
    if (this.selectedContract) {
      temp = temp.filter(s => s.typeContrat === this.selectedContract);
    }

    // Work Mode Filter
    if (this.selectedWorkMode) {
      temp = temp.filter(s => s.modeTravail === this.selectedWorkMode);
    }

    this.filteredServices = temp;
    this.sortServices();
    this.cdr.detectChanges();
  }

  sortServices() {
    if (this.sortBy === 'newest') {
      this.filteredServices.sort((a, b) => new Date(b.dateSoumission || 0).getTime() - new Date(a.dateSoumission || 0).getTime());
    } else if (this.sortBy === 'price_asc') {
      this.filteredServices.sort((a, b) => (a.prixAfiche || 0) - (b.prixAfiche || 0));
    } else if (this.sortBy === 'price_desc') {
      this.filteredServices.sort((a, b) => (b.prixAfiche || 0) - (a.prixAfiche || 0));
    }
  }

  resetFilters() {
    this.activeCat = 'ALL';
    this.searchKeyword = '';
    this.selectedContract = '';
    this.selectedWorkMode = '';
    this.sortBy = 'newest';
    this.onSearch();
  }

  getWorkModeLabel(mode: string): string {
    const found = this.workModes.find(m => m.value === mode);
    return found ? found.label : mode;
  }

  getContractLabel(type: string): string {
    const found = this.contractTypes.find(t => t.value === type);
    return found ? found.label : type;
  }
}
