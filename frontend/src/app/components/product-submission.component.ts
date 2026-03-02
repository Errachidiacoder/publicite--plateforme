import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CategorieService } from '../services/category.service';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

interface FilePreview {
  file: File;
  url: string;
  type: 'image' | 'video';
}

@Component({
  selector: 'app-anonce-submission',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <section class="section">
        <div class="submit-card">
          <div class="submit-header">
            <svg class="header-icon-svg" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            <h1>Déposer une annonce</h1>
            <p>Remplissez les informations ci-dessous. Votre annonce sera examinée avant publication.</p>
          </div>

          @if (errorMsg) {
            <div class="alert alert-error">⚠️ {{ errorMsg }}</div>
          }

          <form (ngSubmit)="onSubmit()" #anonceForm="ngForm">

            <!-- Media Upload Zone -->
            <div class="upload-section">
              <label class="section-label" style="display:flex; align-items:center; gap:6px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                Photos & Vidéos de l'annonce
              </label>

              <div class="drop-zone" [class.drag-over]="dragOver"
                   (dragover)="onDragOver($event)" (dragleave)="dragOver = false"
                   (drop)="onDrop($event)" (click)="fileInput.click()">
                <input #fileInput type="file" multiple accept="image/*,video/*"
                       (change)="onFilesSelected($event)" style="display:none">
                <div class="drop-content">
                  <svg class="drop-icon-svg" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <p class="drop-text">Glissez vos photos/vidéos ici</p>
                  <p class="drop-hint">ou cliquez pour parcourir • JPG, PNG, MP4 • 20 Mo max / fichier</p>
                </div>
              </div>

              @if (previews.length > 0) {
                <div class="preview-grid">
                  @for (preview of previews; track preview.url; let i = $index) {
                    <div class="preview-card">
                      @if (preview.type === 'image') {
                        <img [src]="preview.url" [alt]="'Photo ' + (i + 1)">
                      } @else {
                        <video [src]="preview.url" muted></video>
                        <span class="video-badge">🎬 Vidéo</span>
                      }
                      @if (i === 0) {
                        <span class="main-badge">★ Principale</span>
                      }
                      <button type="button" class="remove-btn" (click)="removeFile(i)">✕</button>
                    </div>
                  }
                </div>
              }
            </div>

            <div class="form-grid">
              <div class="input-group span-2">
                <label>Titre de l'annonce <span class="required">*</span></label>
                <input type="text" class="form-input" [(ngModel)]="anonce.titreAnonce" name="titre"
                       required #titre="ngModel"
                       placeholder="Ex: iPhone 15 Pro Max — 128 Go" [disabled]="loading"
                       [class.input-error]="titre.invalid && titre.touched">
                @if (titre.invalid && titre.touched) {
                  <span class="error-msg">Le titre est obligatoire.</span>
                }
              </div>

              <div class="input-group">
                <label>Catégorie <span class="required">*</span></label>
                <select class="form-input" [(ngModel)]="anonce.categorieId" name="categorieId" required
                        #catsel="ngModel" [disabled]="loading"
                        [class.input-error]="catsel.invalid && catsel.touched">
                  <option [ngValue]="null" disabled>Choisir une catégorie...</option>
                  @for (cat of categories; track cat.id) {
                    <option [value]="cat.id">{{ cat.nomCategorie }}</option>
                  }
                </select>
                @if (catsel.invalid && catsel.touched) {
                  <span class="error-msg">Veuillez choisir une catégorie.</span>
                }
              </div>

              <div class="input-group">
                <label>Ville <span class="required">*</span></label>
                <select class="form-input" [(ngModel)]="anonce.villeLocalisation" name="ville" required
                        #villesel="ngModel" [disabled]="loading"
                        [class.input-error]="villesel.invalid && villesel.touched">
                  <option value="" disabled>Choisir une ville...</option>
                  @for (v of villes; track v) {
                    <option [value]="v">{{ v }}</option>
                  }
                </select>
                @if (villesel.invalid && villesel.touched) {
                  <span class="error-msg">Veuillez choisir une ville.</span>
                }
              </div>

              <div class="input-group">
                <label>Type de prix <span class="required">*</span></label>
                <select class="form-input" [(ngModel)]="anonce.typePrix" name="typePrix" required
                        #typeprixsel="ngModel" [disabled]="loading"
                        [class.input-error]="typeprixsel.invalid && typeprixsel.touched">
                  <option value="" disabled>Choisir le type de prix...</option>
                  <option value="PRIX_FIXE">Prix Fixe</option>
                  <option value="PRIX_NEGOCIABLE">Négociable</option>
                  <option value="SUR_DEVIS">Sur Devis</option>
                  <option value="GRATUIT">Gratuit</option>
                </select>
                @if (typeprixsel.invalid && typeprixsel.touched) {
                  <span class="error-msg">Veuillez choisir le type de prix.</span>
                }
              </div>

              @if (anonce.typePrix && anonce.typePrix !== 'SUR_DEVIS' && anonce.typePrix !== 'GRATUIT') {
                <div class="input-group">
                  <label>Prix (DH) <span class="required">*</span></label>
                  <input type="number" class="form-input" [(ngModel)]="anonce.prixAfiche" name="prix"
                         required #prixinp="ngModel"
                         placeholder="0.00" [disabled]="loading"
                         [class.input-error]="prixinp.invalid && prixinp.touched">
                  @if (prixinp.invalid && prixinp.touched) {
                    <span class="error-msg">Le prix est obligatoire.</span>
                  }
                </div>
              }

              <div class="input-group" [class.span-2]="anonce.typePrix === 'SUR_DEVIS' || anonce.typePrix === 'GRATUIT'">
                <label>Quantité disponible</label>
                <input type="number" class="form-input" [(ngModel)]="anonce.quantiteStock" name="stock"
                       placeholder="Ex: 10" [disabled]="loading">
              </div>

              <div class="input-group span-2">
                <label>Description détaillée <span class="required">*</span></label>
                <textarea class="form-input" [(ngModel)]="anonce.descriptionDetaillee" name="description"
                          required rows="5" #descarea="ngModel"
                          placeholder="Décrivez votre annonce en détail..."
                          [disabled]="loading"
                          [class.input-error]="descarea.invalid && descarea.touched"></textarea>
                @if (descarea.invalid && descarea.touched) {
                  <span class="error-msg">La description est obligatoire.</span>
                }
              </div>
            </div>

            <div class="submit-footer">
              <button type="submit" class="btn btn-primary btn-lg" [disabled]="!anonceForm.form.valid || loading">
                @if (!loading) {
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  Envoyer ma demande d'annonce
                } @else {
                  ⏳ {{ uploadProgress }}
                }
              </button>
              <div class="footer-info">
                <p class="footer-hint">Soumise à validation, votre annonce sera publiée après examen par notre équipe.</p>
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>

    <!-- ── SUCCESS MODAL ───────────────────────── -->
    @if (showModal) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-icon-wrap">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h3 class="modal-title">Annonce envoyée !</h3>
          <p class="modal-msg">Votre demande d'ajout d'annonce a été envoyée avec succès. Un administrateur va l'examiner et vous recevrez une notification dès la décision prise.</p>
          <div class="modal-actions">
            <button class="btn btn-primary" (click)="addAnother()">+ Ajouter une autre annonce</button>
            <button class="btn btn-outline" (click)="goToMyAds()">Voir mes annonces</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .submit-card {
      max-width: 640px;
      margin: 0 auto;
      background: var(--sb-bg-elevated);
      border: 1px solid var(--sb-border);
      border-radius: var(--sb-radius-xl);
      padding: 32px;
    }
    .submit-header { text-align: center; margin-bottom: 24px; }
    .header-icon-svg { color: var(--sb-primary); margin-bottom: 12px; }
    .submit-header h1 { font-family: 'Outfit',sans-serif; font-size: 1.4rem; font-weight: 800; color: var(--sb-text); margin-bottom: 6px; }
    .submit-header p { color: var(--sb-text-secondary); font-size: 0.85rem; }

    .alert { padding: 14px 18px; border-radius: var(--sb-radius-md); margin-bottom: 20px; font-size: 0.88rem; font-weight: 500; }
    .alert-error { background: rgba(239,68,68,0.1); color: var(--sb-danger); border: 1px solid rgba(239,68,68,0.2); }

    /* Upload Section */
    .upload-section { margin-bottom: 28px; }
    .section-label { display: block; font-weight: 700; font-size: 0.9rem; color: var(--sb-text); margin-bottom: 10px; }

    .drop-zone {
      border: 2px dashed var(--sb-border);
      border-radius: var(--sb-radius-lg);
      padding: 24px 20px;
      text-align: center;
      cursor: pointer;
      transition: var(--sb-transition);
      background: var(--sb-surface);
    }
    .drop-zone:hover, .drop-zone.drag-over {
      border-color: var(--sb-primary);
      background: var(--sb-primary-light);
    }
    .drop-icon-svg { color: var(--sb-primary); margin-bottom: 12px; }
    .drop-text { font-weight: 700; font-size: 0.9rem; color: var(--sb-text); margin-bottom: 4px; }
    .drop-hint { font-size: 0.75rem; color: var(--sb-text-muted); }

    .preview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 12px; margin-top: 16px;
    }
    .preview-card {
      position: relative; border-radius: var(--sb-radius-md); overflow: hidden;
      aspect-ratio: 1; border: 2px solid var(--sb-border); transition: var(--sb-transition);
    }
    .preview-card:hover { border-color: var(--sb-primary); }
    .preview-card img, .preview-card video { width: 100%; height: 100%; object-fit: cover; }
    .remove-btn {
      position: absolute; top: 4px; right: 4px; width: 24px; height: 24px;
      border-radius: 50%; background: rgba(0,0,0,0.6); color: white;
      border: none; font-size: 0.7rem; cursor: pointer;
      display: flex; align-items: center; justify-content: center; transition: 0.2s;
    }
    .remove-btn:hover { background: var(--sb-danger); }
    .main-badge, .video-badge {
      position: absolute; bottom: 4px; font-size: 0.6rem; font-weight: 800;
      padding: 2px 8px; border-radius: var(--sb-radius-full);
    }
    .main-badge { left: 4px; background: var(--sb-primary); color: white; }
    .video-badge { right: 4px; background: rgba(0,0,0,0.7); color: white; }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .span-2 { grid-column: span 2; }
    select.form-input {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px;
    }
    textarea.form-input { resize: vertical; min-height: 120px; }

    .submit-footer { text-align: center; margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--sb-border); }
    .submit-footer .btn { min-width: 260px; gap: 8px; padding: 12px 24px; font-size: 0.95rem; }
    .footer-info { margin-top: 14px; }
    .footer-hint { font-size: 0.8rem; color: var(--sb-text-muted); margin: 0; font-style: italic; }

    /* FORM VALIDATION */
    .required { color: #ef4444; margin-left: 2px; font-weight: 700; }
    .error-msg { display: block; margin-top: 5px; font-size: 0.75rem; color: #ef4444; font-weight: 500; }
    .input-error { border-color: #ef4444 !important; background-color: rgba(239,68,68,0.03) !important; }
    .input-error:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.12) !important; }

    /* SUCCESS MODAL */
    .modal-backdrop {
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      animation: fadeIn 0.2s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .modal-box {
      background: var(--sb-bg-elevated);
      border-radius: var(--sb-radius-xl);
      padding: 40px 36px;
      max-width: 440px;
      width: 90%;
      text-align: center;
      box-shadow: 0 25px 80px rgba(0,0,0,0.3);
      animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .modal-icon-wrap {
      width: 72px; height: 72px;
      background: linear-gradient(135deg, var(--sb-primary), #14928a);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 20px;
      box-shadow: 0 8px 24px rgba(26,175,165,0.35);
    }
    .modal-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.4rem; font-weight: 800;
      color: var(--sb-text); margin-bottom: 12px;
    }
    .modal-msg {
      font-size: 0.88rem; color: var(--sb-text-secondary);
      line-height: 1.6; margin-bottom: 28px;
    }
    .modal-actions { display: flex; flex-direction: column; gap: 10px; }
    .btn-outline {
      background: transparent;
      border: 1.5px solid var(--sb-border);
      color: var(--sb-text-secondary);
      padding: 10px 20px; border-radius: var(--sb-radius-md);
      font-size: 0.88rem; font-weight: 600; cursor: pointer; transition: var(--sb-transition);
    }
    .btn-outline:hover { border-color: var(--sb-primary); color: var(--sb-primary); }

    @media (max-width: 600px) {
      .submit-card { padding: 24px 16px; }
      .form-grid { grid-template-columns: 1fr; }
      .span-2 { grid-column: span 1; }
    }
  `]
})
export class ProductSubmissionComponent implements OnInit {
  private http = inject(HttpClient);
  private catService = inject(CategorieService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private notifService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  private apiUrl = 'http://localhost:8081/api/v1';

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  categories: any[] = [];
  loading = false;
  errorMsg = '';
  uploadProgress = 'Envoi en cours...';
  dragOver = false;
  previews: FilePreview[] = [];
  showModal = false;

  anonce: any = {
    titreAnonce: '',
    descriptionDetaillee: '',
    categorieId: null,
    typePrix: '',
    prixAfiche: null,
    villeLocalisation: '',
    quantiteStock: null,
    typeAnnonce: 'PRODUIT_PHYSIQUE',
    disponibilite: 'DISPONIBLE_IMMEDIATEMENT'
  };

  villes = [
    'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Meknès',
    'Agadir', 'Oujda', 'Kénitra', 'Tétouan', 'Safi', 'El Jadida',
    'Nador', 'Béni Mellal', 'Mohammédia', 'Khouribga', 'Errachidia'
  ];

  ngOnInit() {
    this.catService.getAllActive().subscribe((cats: any[]) => {
      this.categories = cats;
    });
  }

  // ─── Drag & Drop ──────────────────────────────

  onDragOver(event: DragEvent) {
    event.preventDefault(); event.stopPropagation(); this.dragOver = true;
  }

  onDrop(event: DragEvent) {
    event.preventDefault(); event.stopPropagation(); this.dragOver = false;
    if (event.dataTransfer?.files) this.addFiles(event.dataTransfer.files);
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) this.addFiles(input.files);
    input.value = '';
  }

  addFiles(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (this.previews.length >= 10) { this.errorMsg = 'Maximum 10 fichiers autorisés.'; break; }
      if (file.size > 20 * 1024 * 1024) { this.errorMsg = `Le fichier "${file.name}" dépasse 20 Mo.`; continue; }
      const type: 'image' | 'video' = file.type.startsWith('video') ? 'video' : 'image';
      this.previews.push({ file, url: URL.createObjectURL(file), type });
    }
  }

  removeFile(index: number) {
    URL.revokeObjectURL(this.previews[index].url);
    this.previews.splice(index, 1);
  }

  // ─── Submit ───────────────────────────────────

  onSubmit() {
    this.loading = true;
    this.errorMsg = '';
    this.uploadProgress = 'Envoi de votre annonce...';

    const token = this.authService.getToken();
    if (!token) {
      this.loading = false;
      this.errorMsg = 'Vous devez être connecté pour soumettre une annonce.';
      this.router.navigate(['/login']);
      return;
    }

    const payload: any = {
      titreAnonce: this.anonce.titreAnonce,
      descriptionDetaillee: this.anonce.descriptionDetaillee,
      typePrix: this.anonce.typePrix,
      prixAfiche: this.anonce.prixAfiche,
      villeLocalisation: this.anonce.villeLocalisation,
      quantiteStock: this.anonce.quantiteStock,
      typeAnnonce: this.anonce.typeAnnonce,
      disponibilite: this.anonce.disponibilite,
      categorie: { id: this.anonce.categorieId }
    };

    console.log('[Submit] Token:', token.substring(0, 20) + '...');
    console.log('[Submit] Payload:', payload);

    this.http.post<any>(`${this.apiUrl}/anonces/submit`, payload, { headers: this.getAuthHeaders() }).subscribe({
      next: (createdAnonce: any) => {
        if (this.previews.length > 0) {
          this.uploadMedia(createdAnonce.id);
        } else {
          this.finalizeSubmission(createdAnonce.id);
        }
      },
      error: (err) => {
        console.error('Submission error:', err);
        this.loading = false;
        this.errorMsg = 'Erreur lors de la soumission. Veuillez réessayer.';
      }
    });
  }

  private uploadMedia(anonceId: number) {
    this.uploadProgress = `Upload des médias (${this.previews.length} fichier${this.previews.length > 1 ? 's' : ''})...`;
    const formData = new FormData();
    for (const preview of this.previews) formData.append('files', preview.file);

    // Note: DON'T set Content-Type here – the browser sets it automatically with boundary for FormData
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.post(`${this.apiUrl}/media/upload/${anonceId}`, formData, { headers, responseType: 'text' }).subscribe({
      next: () => this.finalizeSubmission(anonceId),
      error: () => this.finalizeSubmission(anonceId)
    });
  }

  private finalizeSubmission(anonceId: number) {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    this.http.post(`${this.apiUrl}/anonces/${anonceId}/notify-admins`, {}, { headers, responseType: 'text' }).subscribe({
      next: () => {
        this.notifService.refreshNotifications();
        this.onSuccess();
      },
      error: (e) => {
        console.error('Finalize notify error:', e);
        this.onSuccess();
      }
    });
  }

  private onSuccess() {
    this.loading = false;
    this.showModal = true;
    this.resetForm();
    this.cdr.detectChanges(); // Force angular change detection
  }

  private resetForm() {
    this.previews.forEach(p => URL.revokeObjectURL(p.url));
    this.previews = [];
    this.anonce = {
      titreAnonce: '',
      descriptionDetaillee: '',
      categorieId: null,
      typePrix: '',
      prixAfiche: null,
      villeLocalisation: '',
      quantiteStock: null,
      typeAnnonce: 'PRODUIT_PHYSIQUE',
      disponibilite: 'DISPONIBLE_IMMEDIATEMENT'
    };
    this.errorMsg = '';
  }

  closeModal() { this.showModal = false; }

  addAnother() { this.showModal = false; }

  goToMyAds() { this.router.navigate(['/my-ads']); }
}
