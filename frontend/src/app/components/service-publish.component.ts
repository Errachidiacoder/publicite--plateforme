import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ServiceOffreService, ServiceOffre } from '../services/service-offre.service';
import { CategorieService } from '../services/category.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-service-publish',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <section class="section">
        <div class="submit-card">
          <div class="submit-header">
            <svg class="header-icon-svg" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            <h1>Publier un service</h1>
          </div>

          @if (errorMsg) {
            <div class="alert alert-error">⚠️ {{ errorMsg }}</div>
          }

          <form (ngSubmit)="onSubmit()" #f="ngForm">
            <div class="upload-section">
              <label class="section-label" style="display:flex; align-items:center; gap:6px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                Photos & Vidéos du service
              </label>
              <div class="dropzone" (dragover)="onDragOver($event)" (drop)="onDrop($event)">
                <div class="dz-content">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <p>Glissez vos photos/vidéos ici</p>
                  <small>ou cliquez pour parcourir • JPG, PNG, MP4 • 20 Mo max / fichier</small>
                  <input type="file" accept=".jpg,.jpeg,.png,.mp4" (change)="onFileSelected($event)" />
                </div>
                @if (model.imageUrl) {
                  <div class="dz-preview">
                    <img [src]="model.imageUrl" alt="preview">
                  </div>
                }
              </div>
            </div>

            <div class="form-grid">
              <div class="input-group span-2">
                <label>Titre du service <span class="required">*</span></label>
                <input type="text" class="form-input" [(ngModel)]="model.titreService" name="titreService" required placeholder="Ex: Déclaration SIMPL IR pour particuliers">
              </div>

              <div class="input-group">
                <label>Ville (Maroc) <span class="required">*</span></label>
                <select class="form-input" [(ngModel)]="model.villeLocalisation" name="villeLocalisation" required>
                  <option value="" disabled>Choisir une ville...</option>
                  @for (v of villes; track v) { <option [value]="v">{{ v }}</option> }
                </select>
              </div>

              <div class="input-group">
                <label>Téléphone de contact</label>
                <input type="tel" class="form-input" [(ngModel)]="model.telephoneContact" name="telephoneContact" placeholder="+212 6 12 34 56 78">
              </div>

              <div class="input-group">
                <label>Type de prix</label>
                <select class="form-input" [(ngModel)]="model.typePrix" name="typePrix">
                  <option value="PRIX_FIXE">Fixe</option>
                  <option value="PRIX_NEGOCIABLE">Négociable</option>
                  <option value="GRATUIT">Gratuit</option>
                  <option value="SUR_DEVIS">Sur devis</option>
                </select>
              </div>

              @if (model.typePrix && model.typePrix !== 'SUR_DEVIS' && model.typePrix !== 'GRATUIT') {
                <div class="input-group">
                  <label>Prix affiché (DH)</label>
                  <input type="number" class="form-input" [(ngModel)]="model.prixAfiche" name="prixAfiche" min="0" placeholder="0.00">
                </div>
              }

              <div class="input-group">
                <label>Mode de travail</label>
                <select class="form-input" [(ngModel)]="model.modeTravail" name="modeTravail" required>
                  <option value="" disabled>Choisir…</option>
                  <option value="REMOTE">À distance</option>
                  <option value="SUR_SITE">Sur site</option>
                  <option value="HYBRIDE">Hybride</option>
                </select>
              </div>

              <div class="input-group">
                <label>Type de contrat</label>
                <select class="form-input" [(ngModel)]="model.typeContrat" name="typeContrat" required>
                  <option value="" disabled>Choisir…</option>
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="ANAPEC">ANAPEC</option>
                  <option value="STAGE">Stage</option>
                  <option value="FREELANCE">Freelance</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>

              <div class="input-group">
                <label>Catégorie</label>
                <select class="form-input" [(ngModel)]="selectedCategorieId" name="categorieId" required>
                  <option [ngValue]="null" disabled>Choisir…</option>
                  @for (c of categories; track c.id) { <option [value]="c.id">{{ c.nomCategorie }}</option> }
                </select>
              </div>

              <div class="input-group span-2">
                <label>Description détaillée</label>
                <textarea class="form-input" [(ngModel)]="model.descriptionDetaillee" name="descriptionDetaillee" rows="6" required placeholder="Expliquez le besoin ou le service proposé"></textarea>
              </div>
            </div>

            <div class="submit-footer">
              <button class="btn btn-primary btn-lg" type="submit" [disabled]="loading || !f.form.valid">
                @if (!loading) {
                  Publier le service
                } @else { ⏳ Soumission... }
              </button>
              <div class="footer-info">
                <p class="footer-hint">Soumis à validation. Vous serez notifié(e) après décision de l’administration.</p>
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>

    @if (showModal) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-icon-wrap">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h3 class="modal-title">Service envoyé !</h3>
          <p class="modal-msg">Votre service a été soumis avec succès. Il sera examiné par l’équipe et vous serez notifié(e) de la décision.</p>
          <div class="modal-actions">
            <button class="btn btn-outline" (click)="closeModal()">Fermer</button>
          </div>
        </div>
      </div>
    }
  `
  ,
  styles: [`
    .submit-card { max-width: 900px; margin: 0 auto; background: white; border-radius: 24px; border: 1px solid #E2E8F0; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.04), 0 4px 6px -2px rgba(0,0,0,0.02); padding: 30px; }
    .submit-header { display:flex; flex-direction:column; align-items:center; text-align:center; gap:10px; margin-bottom: 20px; }
    .submit-header h1 { margin:0; font-size:1.4rem; font-weight:900; color:#1A202C; }
    .header-icon-svg { color:#0099cc; }
    .upload-section { margin-bottom: 16px; }
    .section-label { font-weight:800; font-size:0.82rem; color:#1A202C; margin-bottom:8px; }
    .dropzone { border: 2px dashed #00ccff; border-radius: 16px; background: #f0f9ff; padding: 24px; display:flex; align-items:center; justify-content:center; position: relative; min-height: 140px; }
    .dz-content { text-align:center; color:#64748B; }
    .dz-content input[type=file] { margin-top:10px; }
    .dz-preview { position:absolute; right:14px; bottom:14px; width:90px; height:90px; border-radius:12px; overflow:hidden; border:1px solid #E2E8F0; }
    .dz-preview img { width:100%; height:100%; object-fit:cover; }
    .form-grid { display:grid; grid-template-columns: repeat(2, 1fr); gap: 15px 30px; }
    .span-2 { grid-column: span 2; }
    .input-group { display:flex; flex-direction:column; gap:6px; }
    .input-group label { font-size:0.65rem; font-weight:1000; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:0px; padding-left:12px; }
    .form-input, .input-group select, .input-group textarea { padding: 0 20px; border-radius: 30px; border: 1.5px solid #E2E8F0; background: #fafdfd; font-size: 0.85rem; height: 42px; box-sizing: border-box; }
    .input-group textarea { padding: 12px 20px; height:auto; }
    .required { color:#ef4444; margin-left:4px; }
    .submit-footer { display:flex; flex-direction: column; align-items:center; justify-content:center; gap:10px; margin-top: 16px; }
    .footer-info { text-align: center; }
    .footer-info .footer-hint { font-size:0.8rem; color:#64748B; }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(15,23,42,0.45); backdrop-filter: blur(4px); display:flex; align-items:center; justify-content:center; z-index: 2000; padding:20px; }
    .modal-box { background: white; width: 100%; max-width: 520px; border-radius: 28px; box-shadow: 0 30px 60px rgba(0,0,0,0.2); overflow: hidden; animation: slideUp 0.4s ease-out; padding: 24px; text-align:center; }
    .modal-icon-wrap { width: 64px; height: 64px; border-radius: 50%; background: #00ccff; display:flex; align-items:center; justify-content:center; margin: 0 auto 12px; }
    .modal-title { font-size:1.3rem; font-weight:900; margin:8px 0; color:#1A202C; }
    .modal-msg { font-size:0.95rem; color:#64748B; margin:0 0 12px; }
    .modal-actions { display:flex; gap:12px; justify-content:center; }
    .btn-outline { background: #f1f5f9; color: #475569; border: none; padding: 10px 20px; border-radius: 50px; font-weight: 700; cursor: pointer; font-size: 0.85rem; }
  `]
})
export class ServicePublishComponent {
  private api = inject(ServiceOffreService);
  private router = inject(Router);
  private catApi = inject(CategorieService);
  private http = inject(HttpClient);
  loading = false;
  showModal = false;
  errorMsg = '';
  model: ServiceOffre = {
    titreService: '',
    descriptionDetaillee: '',
    villeLocalisation: '',
    modeTravail: '' as any,
    typeContrat: '' as any,
    telephoneContact: ''
  };
  villes = ['Casablanca','Rabat','Marrakech','Fès','Tanger','Agadir','Oujda','Tétouan','Mohammédia','Kenitra','Safi','Salé','Temara','Essaouira','Nador','El Jadida'];
  categories: any[] = [];
  selectedCategorieId: number | null = null;

  ngOnInit() {
    this.catApi.getAllActive().subscribe(res => this.categories = res);
  }

  onSubmit() {
    if (this.loading) return;
    this.loading = true;
    if (this.selectedCategorieId) {
      this.model.categorie = { id: this.selectedCategorieId };
    }
    this.api.submit(this.model).subscribe({
      next: () => {
        this.loading = false;
        this.reset();
        this.showModal = true;
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 401) this.errorMsg = 'Veuillez vous connecter pour publier un service.';
        else if (err.status === 400) this.errorMsg = 'Vérifiez les champs requis (titre, description, ville, catégorie).';
        else this.errorMsg = 'Une erreur est survenue lors de la soumission.';
      }
    });
  }

  reset() {
    this.model = {
      titreService: '',
      descriptionDetaillee: '',
      villeLocalisation: '',
      modeTravail: '' as any,
      typeContrat: '' as any,
      telephoneContact: ''
    };
    this.selectedCategorieId = null;
    this.errorMsg = '';
  }
  closeModal() { this.showModal = false; }
  addAnother() { this.showModal = false; }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }
  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) this.uploadFile(file);
  }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.uploadFile(file);
  }
  uploadFile(file: File) {
    const form = new FormData();
    form.append('file', file);
    this.http.post<{ url: string }>('http://localhost:8081/api/v1/media/upload', form).subscribe({
      next: (res) => this.model.imageUrl = res.url,
      error: (err) => {
        if (err.status === 401) this.errorMsg = 'Veuillez vous connecter pour téléverser des fichiers.';
        else this.errorMsg = 'Upload échoué.';
      }
    });
  }
}
