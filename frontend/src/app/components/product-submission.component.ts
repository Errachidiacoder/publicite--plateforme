import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CategorieService } from '../services/category.service';
import { ProduitService } from '../services/product.service';

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
            <span class="header-icon">📦</span>
            <h1>Soumettre une annonce</h1>
            <p>Remplissez les informations ci-dessous pour soumettre votre annonce au catalogue SouqBladi.</p>
          </div>

          @if (successMsg) {
            <div class="alert alert-success">✅ {{ successMsg }}</div>
          }
          @if (errorMsg) {
            <div class="alert alert-error">⚠️ {{ errorMsg }}</div>
          }

          <form (ngSubmit)="onSubmit()" #productForm="ngForm">

            <!-- Media Upload Zone -->
            <div class="upload-section">
              <label class="section-label">📸 Photos & Vidéos du produit</label>

              <div class="drop-zone" [class.drag-over]="dragOver"
                   (dragover)="onDragOver($event)" (dragleave)="dragOver = false"
                   (drop)="onDrop($event)" (click)="fileInput.click()">
                <input #fileInput type="file" multiple accept="image/*,video/*"
                       (change)="onFilesSelected($event)" style="display:none">
                <div class="drop-content">
                  <span class="drop-icon">📁</span>
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
                <label>Titre du produit</label>
                <input type="text" class="form-input" [(ngModel)]="product.titreProduit" name="titre"
                       required placeholder="Ex: iPhone 15 Pro Max" [disabled]="loading">
              </div>

              <div class="input-group">
                <label>Catégorie</label>
                <select class="form-input" [(ngModel)]="product.categorieId" name="categorieId" required [disabled]="loading">
                  <option [ngValue]="null" disabled>Choisir une catégorie...</option>
                  @for (cat of categories; track cat.id) {
                    <option [value]="cat.id">{{ cat.nomCategorie }}</option>
                  }
                </select>
              </div>

              <div class="input-group">
                <label>Ville</label>
                <select class="form-input" [(ngModel)]="product.villeLocalisation" name="ville" required [disabled]="loading">
                  <option value="" disabled>Choisir une ville...</option>
                  @for (v of villes; track v) {
                    <option [value]="v">{{ v }}</option>
                  }
                </select>
              </div>

              <div class="input-group">
                <label>Type de prix</label>
                <select class="form-input" [(ngModel)]="product.typePrix" name="typePrix" required [disabled]="loading">
                  <option value="PRIX_FIXE">Prix Fixe</option>
                  <option value="PRIX_NEGOCIABLE">Négociable</option>
                  <option value="SUR_DEVIS">Sur Devis</option>
                  <option value="GRATUIT">Gratuit</option>
                </select>
              </div>

              @if (product.typePrix !== 'SUR_DEVIS' && product.typePrix !== 'GRATUIT') {
                <div class="input-group">
                  <label>Prix (DH)</label>
                  <input type="number" class="form-input" [(ngModel)]="product.prixAfiche" name="prix"
                         required placeholder="0.00" [disabled]="loading">
                </div>
              }

              <div class="input-group" [class.span-2]="product.typePrix === 'SUR_DEVIS' || product.typePrix === 'GRATUIT'">
                <label>Quantité en stock</label>
                <input type="number" class="form-input" [(ngModel)]="product.quantiteStock" name="stock"
                       placeholder="Ex: 10" [disabled]="loading">
              </div>

              <div class="input-group span-2">
                <label>Description détaillée</label>
                <textarea class="form-input" [(ngModel)]="product.descriptionDetaillee" name="description"
                          required rows="5" placeholder="Décrivez votre produit en détail pour attirer plus de clients..."
                          [disabled]="loading"></textarea>
              </div>
            </div>

            <div class="submit-footer">
              <button type="submit" class="btn btn-primary btn-lg" [disabled]="!productForm.form.valid || loading">
                @if (!loading) { 📤 Soumettre pour validation } @else { ⏳ {{ uploadProgress }} }
              </button>
              <p class="footer-hint">Votre produit sera vérifié par notre équipe avant d'être publié sur SouqBladi.</p>
            </div>
          </form>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .submit-card {
      max-width: 720px;
      margin: 0 auto;
      background: var(--sb-bg-elevated);
      border: 1px solid var(--sb-border);
      border-radius: var(--sb-radius-xl);
      padding: 40px;
    }
    .submit-header { text-align: center; margin-bottom: 32px; }
    .header-icon { font-size: 2.5rem; display: block; margin-bottom: 12px; }
    .submit-header h1 { font-family: 'Outfit',sans-serif; font-size: 1.6rem; font-weight: 800; color: var(--sb-text); margin-bottom: 8px; }
    .submit-header p { color: var(--sb-text-secondary); font-size: 0.92rem; }

    .alert { padding: 12px 16px; border-radius: var(--sb-radius-md); margin-bottom: 20px; font-size: 0.88rem; font-weight: 500; }
    .alert-error { background: rgba(239,68,68,0.1); color: var(--sb-danger); border: 1px solid rgba(239,68,68,0.2); }
    .alert-success { background: rgba(16,185,129,0.1); color: var(--sb-success); border: 1px solid rgba(16,185,129,0.2); }

    /* Upload Section */
    .upload-section { margin-bottom: 28px; }
    .section-label { display: block; font-weight: 700; font-size: 0.9rem; color: var(--sb-text); margin-bottom: 10px; }

    .drop-zone {
      border: 2px dashed var(--sb-border);
      border-radius: var(--sb-radius-lg);
      padding: 40px 20px;
      text-align: center;
      cursor: pointer;
      transition: var(--sb-transition);
      background: var(--sb-surface);
    }
    .drop-zone:hover, .drop-zone.drag-over {
      border-color: var(--sb-primary);
      background: var(--sb-primary-light);
    }
    .drop-icon { font-size: 2.2rem; display: block; margin-bottom: 8px; }
    .drop-text { font-weight: 700; font-size: 0.95rem; color: var(--sb-text); margin-bottom: 4px; }
    .drop-hint { font-size: 0.78rem; color: var(--sb-text-muted); }

    /* Preview Grid */
    .preview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 12px;
      margin-top: 16px;
    }
    .preview-card {
      position: relative;
      border-radius: var(--sb-radius-md);
      overflow: hidden;
      aspect-ratio: 1;
      border: 2px solid var(--sb-border);
      transition: var(--sb-transition);
    }
    .preview-card:hover { border-color: var(--sb-primary); }
    .preview-card img, .preview-card video {
      width: 100%; height: 100%; object-fit: cover;
    }
    .remove-btn {
      position: absolute; top: 4px; right: 4px;
      width: 24px; height: 24px;
      border-radius: 50%;
      background: rgba(0,0,0,0.6);
      color: white;
      border: none;
      font-size: 0.7rem;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: 0.2s;
    }
    .remove-btn:hover { background: var(--sb-danger); }
    .main-badge {
      position: absolute; bottom: 4px; left: 4px;
      background: var(--sb-primary);
      color: white;
      font-size: 0.6rem;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: var(--sb-radius-full);
    }
    .video-badge {
      position: absolute; bottom: 4px; right: 4px;
      background: rgba(0,0,0,0.7);
      color: white;
      font-size: 0.6rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: var(--sb-radius-full);
    }

    /* Form */
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    .span-2 { grid-column: span 2; }
    select.form-input {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 14px center;
      padding-right: 36px;
    }
    textarea.form-input { resize: vertical; min-height: 120px; }

    .submit-footer { text-align: center; margin-top: 28px; padding-top: 24px; border-top: 1px solid var(--sb-border); }
    .submit-footer .btn { min-width: 280px; }
    .footer-hint { margin-top: 14px; font-size: 0.82rem; color: var(--sb-text-muted); }

    @media (max-width: 600px) {
      .submit-card { padding: 24px 16px; }
      .form-grid { grid-template-columns: 1fr; }
      .span-2 { grid-column: span 1; }
      .preview-grid { grid-template-columns: repeat(3, 1fr); }
    }
  `]
})
export class ProductSubmissionComponent implements OnInit {
  private produitService = inject(ProduitService);
  private catService = inject(CategorieService);
  private http = inject(HttpClient);
  private router = inject(Router);

  categories: any[] = [];
  loading = false;
  successMsg = '';
  errorMsg = '';
  uploadProgress = 'Envoi en cours...';
  dragOver = false;

  previews: FilePreview[] = [];

  product: any = {
    titreProduit: '',
    descriptionDetaillee: '',
    categorieId: null,
    typePrix: 'PRIX_FIXE',
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
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
    if (event.dataTransfer?.files) {
      this.addFiles(event.dataTransfer.files);
    }
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(input.files);
    }
    input.value = ''; // Reset so same file can be re-selected
  }

  addFiles(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (this.previews.length >= 10) {
        this.errorMsg = 'Maximum 10 fichiers autorisés.';
        break;
      }
      if (file.size > 20 * 1024 * 1024) {
        this.errorMsg = `Le fichier "${file.name}" dépasse 20 Mo.`;
        continue;
      }

      const type: 'image' | 'video' = file.type.startsWith('video') ? 'video' : 'image';
      const url = URL.createObjectURL(file);
      this.previews.push({ file, url, type });
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
    this.successMsg = '';
    this.uploadProgress = 'Création du produit...';

    const payload = {
      ...this.product,
      categorie: { id: this.product.categorieId }
    };

    this.produitService.submit(payload).subscribe({
      next: (createdProduct: any) => {
        if (this.previews.length > 0) {
          this.uploadMedia(createdProduct.id);
        } else {
          this.onSuccess();
        }
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Erreur lors de la soumission. Veuillez réessayer.';
      }
    });
  }

  private uploadMedia(produitId: number) {
    this.uploadProgress = `Upload des médias (${this.previews.length} fichier${this.previews.length > 1 ? 's' : ''})...`;

    const formData = new FormData();
    for (const preview of this.previews) {
      formData.append('files', preview.file);
    }

    this.http.post(`http://localhost:18081/api/v1/media/upload/${produitId}`, formData).subscribe({
      next: () => this.onSuccess(),
      error: () => {
        // Product was created even if media upload fails
        this.successMsg = 'Produit créé, mais les médias n\'ont pas pu être uploadés.';
        this.loading = false;
      }
    });
  }

  private onSuccess() {
    this.successMsg = 'Votre produit a été soumis avec succès ! Il est en attente de validation.';
    this.loading = false;
    setTimeout(() => this.router.navigate(['/home']), 2000);
  }
}
