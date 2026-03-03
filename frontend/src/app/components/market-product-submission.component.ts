import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MarketProductService } from '../services/market-product.service';
import { CategorieService } from '../services/category.service';
import { ProduitRequestDto, ProduitResponseDto, ProductImageDto } from '../models/produit.model';

@Component({
  selector: 'app-market-product-submission',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="mps-page">
      <div class="mps-container">
        <!-- Header -->
        <div class="mps-header">
          <a routerLink="/vendeur/produits" class="mps-back">← Retour à mes produits</a>
          <h1 class="mps-title">{{ isEditMode ? 'Modifier le produit' : 'Nouveau produit' }}</h1>
        </div>

        <form [formGroup]="form" class="mps-form">
          <!-- Section 1: Info -->
          <section class="mps-section">
            <h2 class="section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Informations de base
            </h2>

            <div class="form-group">
              <label for="nom">Nom du produit *</label>
              <input id="nom" formControlName="nom" placeholder="Ex: Tapis berbère fait main" />
              @if (form.get('nom')?.invalid && form.get('nom')?.touched) {
                <span class="field-error">Le nom est obligatoire (max 100 caractères)</span>
              }
            </div>

            <div class="form-group">
              <label for="descriptionCourte">Description courte</label>
              <input id="descriptionCourte" formControlName="descriptionCourte" placeholder="Résumé en une ligne (max 200 car.)" maxlength="200" />
            </div>

            <div class="form-group">
              <label for="descriptionDetaillee">Description détaillée *</label>
              <textarea id="descriptionDetaillee" formControlName="descriptionDetaillee" rows="6" placeholder="Décrivez votre produit en détail..."></textarea>
              @if (form.get('descriptionDetaillee')?.invalid && form.get('descriptionDetaillee')?.touched) {
                <span class="field-error">La description est obligatoire</span>
              }
            </div>

            <div class="form-group">
              <label for="categorieId">Catégorie *</label>
              <select id="categorieId" formControlName="categorieId">
                <option [ngValue]="null">— Sélectionner une catégorie —</option>
                @for (cat of categories; track cat.id) {
                  <option [ngValue]="cat.id">{{ cat.nomCategorie }}</option>
                  @if (cat.sousCategories?.length) {
                    @for (sub of cat.sousCategories; track sub.id) {
                      <option [ngValue]="sub.id">&nbsp;&nbsp;↳ {{ sub.nomCategorie }}</option>
                    }
                  }
                }
              </select>
              @if (form.get('categorieId')?.invalid && form.get('categorieId')?.touched) {
                <span class="field-error">La catégorie est obligatoire</span>
              }
            </div>

            <div class="form-group">
              <label for="tags">Tags (séparés par des virgules)</label>
              <input id="tags" formControlName="tags" placeholder="berbère, artisanat, marocain" />
            </div>
          </section>

          <!-- Section 2: Prix & Stock -->
          <section class="mps-section">
            <h2 class="section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Prix & Stock
            </h2>

            <div class="form-row">
              <div class="form-group">
                <label for="prix">Prix (MAD) *</label>
                <input id="prix" formControlName="prix" type="number" step="0.01" placeholder="0.00" />
                @if (form.get('prix')?.invalid && form.get('prix')?.touched) {
                  <span class="field-error">Le prix est obligatoire et doit être > 0</span>
                }
              </div>
              <div class="form-group">
                <label for="prixPromo">Prix promo (MAD)</label>
                <input id="prixPromo" formControlName="prixPromo" type="number" step="0.01" placeholder="Optionnel" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="quantiteStock">Quantité en stock *</label>
                <input id="quantiteStock" formControlName="quantiteStock" type="number" min="0" placeholder="0" />
              </div>
              <div class="form-group">
                <label for="sku">SKU / Référence</label>
                <input id="sku" formControlName="sku" placeholder="Auto-généré si vide" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="deliveryOption">Option de livraison</label>
                <select id="deliveryOption" formControlName="deliveryOption">
                  <option value="">— Sélectionner —</option>
                  <option value="OWN_DELIVERY">Livraison propre</option>
                  <option value="LOGISTICS_PARTNER">Partenaire logistique</option>
                  <option value="BOTH">Les deux</option>
                </select>
              </div>
              <div class="form-group">
                <label for="poidsProduit">Poids (kg)</label>
                <input id="poidsProduit" formControlName="poidsProduit" type="number" step="0.1" placeholder="Optionnel" />
              </div>
            </div>

            <div class="form-group">
              <label for="dimensions">Dimensions (L × l × H cm)</label>
              <input id="dimensions" formControlName="dimensions" placeholder="Ex: 30 × 20 × 10" />
            </div>
          </section>

          <!-- Section 3: Images (only in edit mode after creation) -->
          @if (isEditMode) {
            <section class="mps-section">
              <h2 class="section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                Images du produit
              </h2>

              <!-- Existing images -->
              @if (existingImages.length > 0) {
                <div class="images-grid">
                  @for (img of existingImages; track img.id) {
                    <div class="img-card" [class.img-primary]="img.isPrimary">
                      <img [src]="img.url" [alt]="img.altText" />
                      <div class="img-actions">
                        @if (!img.isPrimary) {
                          <button type="button" class="img-btn" title="Définir comme principale" (click)="setPrimary(img.id)">⭐</button>
                        }
                        <button type="button" class="img-btn img-btn-delete" title="Supprimer" (click)="deleteImage(img.id)">✕</button>
                      </div>
                      @if (img.isPrimary) {
                        <span class="img-primary-badge">Principale</span>
                      }
                    </div>
                  }
                </div>
              }

              <!-- Upload -->
              <div class="upload-area" (click)="fileInput.click()" (dragover)="$event.preventDefault()" (drop)="onDrop($event)">
                <input #fileInput type="file" accept="image/jpeg,image/png,image/webp" multiple (change)="onFileSelect($event)" hidden />
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <p>Cliquez ou glissez-déposez vos images ici</p>
                <span>JPG, PNG, WebP — max 5 Mo par image</span>
              </div>

              @if (uploading) {
                <div class="upload-progress">Téléchargement en cours...</div>
              }
            </section>
          }

          <!-- Actions -->
          <div class="mps-actions">
            @if (errorMessage) {
              <div class="mps-error">{{ errorMessage }}</div>
            }
            @if (successMessage) {
              <div class="mps-success">{{ successMessage }}</div>
            }
            <div class="mps-btns">
              <button type="button" class="btn-draft" [disabled]="saving" (click)="submitDraft()">
                @if (saving && !publishMode) { <span class="spinner"></span> }
                Sauvegarder brouillon
              </button>
              <button type="button" class="btn-publish" [disabled]="saving" (click)="submitPublish()">
                @if (saving && publishMode) { <span class="spinner"></span> }
                {{ isEditMode ? 'Mettre à jour' : 'Publier' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .mps-page { min-height: 100vh; background: var(--sb-bg, #f8fafc); padding: 24px; }
    .mps-container { max-width: 800px; margin: 0 auto; }
    .mps-header { margin-bottom: 24px; }
    .mps-back { color: var(--sb-primary, #1aafa5); font-weight: 600; font-size: 0.85rem; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; }
    .mps-title { font-size: 1.6rem; font-weight: 900; color: var(--sb-text, #1e293b); margin: 8px 0 0; }

    .mps-form { display: flex; flex-direction: column; gap: 24px; }

    .mps-section {
      background: var(--sb-bg-elevated, #fff);
      border: 1px solid var(--sb-border-light, #f1f5f9);
      border-radius: 16px; padding: 24px;
    }
    .section-title {
      display: flex; align-items: center; gap: 10px;
      font-size: 1rem; font-weight: 800; color: var(--sb-text, #1e293b);
      margin: 0 0 20px; padding-bottom: 12px;
      border-bottom: 1px solid var(--sb-border-light, #f1f5f9);
    }
    .section-title svg { width: 20px; height: 20px; color: var(--sb-primary, #1aafa5); }

    .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
    .form-group label { font-size: 0.82rem; font-weight: 700; color: var(--sb-text, #1e293b); }
    .form-group input, .form-group textarea, .form-group select {
      padding: 10px 14px; border-radius: 10px;
      border: 1.5px solid var(--sb-border, #e2e8f0);
      font-size: 0.88rem; background: var(--sb-bg, #f8fafc);
      color: var(--sb-text, #1e293b); outline: none;
      font-family: inherit; transition: 0.15s;
    }
    .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
      border-color: var(--sb-primary, #1aafa5);
      box-shadow: 0 0 0 3px rgba(26,175,165,0.08);
    }
    .form-group input.ng-invalid.ng-touched, .form-group textarea.ng-invalid.ng-touched, .form-group select.ng-invalid.ng-touched {
      border-color: #ef4444;
    }
    .form-group textarea { resize: vertical; min-height: 120px; }
    .field-error { font-size: 0.75rem; color: #ef4444; font-weight: 600; }

    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    /* Images */
    .images-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; margin-bottom: 16px; }
    .img-card {
      position: relative; border-radius: 10px; overflow: hidden;
      border: 2px solid var(--sb-border-light, #f1f5f9);
      aspect-ratio: 1;
    }
    .img-card img { width: 100%; height: 100%; object-fit: cover; }
    .img-card.img-primary { border-color: var(--sb-primary, #1aafa5); }
    .img-actions {
      position: absolute; top: 4px; right: 4px;
      display: flex; gap: 4px; opacity: 0; transition: 0.15s;
    }
    .img-card:hover .img-actions { opacity: 1; }
    .img-btn {
      width: 28px; height: 28px; border-radius: 6px;
      border: none; background: rgba(0,0,0,0.6); color: white;
      font-size: 0.7rem; cursor: pointer; display: flex;
      align-items: center; justify-content: center;
    }
    .img-btn-delete:hover { background: #ef4444; }
    .img-primary-badge {
      position: absolute; bottom: 4px; left: 4px;
      background: var(--sb-primary, #1aafa5); color: white;
      font-size: 0.6rem; font-weight: 800; padding: 2px 8px;
      border-radius: 100px;
    }

    .upload-area {
      border: 2px dashed var(--sb-border, #e2e8f0);
      border-radius: 12px; padding: 32px; text-align: center;
      cursor: pointer; transition: 0.2s;
    }
    .upload-area:hover { border-color: var(--sb-primary, #1aafa5); background: rgba(26,175,165,0.03); }
    .upload-area svg { width: 40px; height: 40px; color: #94a3b8; margin-bottom: 8px; }
    .upload-area p { font-size: 0.88rem; color: var(--sb-text, #1e293b); margin: 0 0 4px; font-weight: 600; }
    .upload-area span { font-size: 0.75rem; color: #94a3b8; }
    .upload-progress { text-align: center; font-size: 0.82rem; color: var(--sb-primary, #1aafa5); font-weight: 700; margin-top: 12px; }

    /* Actions */
    .mps-actions { display: flex; flex-direction: column; gap: 12px; }
    .mps-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 12px 16px; border-radius: 10px; font-size: 0.85rem; font-weight: 600; }
    .mps-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; padding: 12px 16px; border-radius: 10px; font-size: 0.85rem; font-weight: 600; }
    .mps-btns { display: flex; gap: 12px; justify-content: flex-end; }
    .btn-draft, .btn-publish {
      padding: 12px 28px; border-radius: 10px; font-weight: 800;
      font-size: 0.88rem; cursor: pointer; border: none;
      display: flex; align-items: center; gap: 8px; transition: 0.2s;
    }
    .btn-draft { background: var(--sb-bg-alt, #f1f5f9); color: var(--sb-text, #1e293b); }
    .btn-draft:hover { background: #e2e8f0; }
    .btn-publish { background: var(--sb-primary, #1aafa5); color: white; }
    .btn-publish:hover { background: #0f766e; }
    .btn-draft:disabled, .btn-publish:disabled { opacity: 0.5; cursor: default; }
    .spinner { width: 14px; height: 14px; border: 2px solid transparent; border-top: 2px solid currentColor; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 600px) {
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class MarketProductSubmissionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(MarketProductService);
  private categoryService = inject(CategorieService);
  private cdr = inject(ChangeDetectorRef);

  form!: FormGroup;
  isEditMode = false;
  productId: number | null = null;
  categories: any[] = [];
  existingImages: ProductImageDto[] = [];
  saving = false;
  uploading = false;
  publishMode = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit() {
    this.form = this.fb.group({
      nom: ['', [Validators.required, Validators.maxLength(100)]],
      descriptionCourte: ['', [Validators.maxLength(200)]],
      descriptionDetaillee: ['', [Validators.required]],
      categorieId: [null, [Validators.required]],
      tags: [''],
      prix: [null, [Validators.required, Validators.min(0.01)]],
      prixPromo: [null],
      quantiteStock: [0, [Validators.required, Validators.min(0)]],
      sku: [''],
      deliveryOption: [''],
      poidsProduit: [null],
      dimensions: ['']
    });

    this.categoryService.getAllActive().subscribe({
      next: (cats) => { this.categories = cats; this.cdr.detectChanges(); },
      error: () => { }
    });

    // Check edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.productId = +params['id'];
        this.loadProduct(this.productId);
      }
    });
  }

  loadProduct(id: number) {
    this.productService.getProductById(id).subscribe({
      next: (p: ProduitResponseDto) => {
        this.form.patchValue({
          nom: p.nom,
          descriptionCourte: p.descriptionCourte,
          descriptionDetaillee: p.descriptionDetaillee,
          categorieId: p.categorieId,
          tags: p.tags,
          prix: p.prix,
          prixPromo: p.prixPromo,
          quantiteStock: p.quantiteStock,
          deliveryOption: p.deliveryOption || ''
        });
        this.existingImages = p.images || [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement du produit';
        this.cdr.detectChanges();
      }
    });
  }

  submitDraft() {
    this.publishMode = false;
    this.doSubmit();
  }

  submitPublish() {
    this.publishMode = true;
    this.doSubmit();
  }

  private doSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();

      // Build a readable list of missing fields
      const missing: string[] = [];
      if (this.form.get('nom')?.invalid) missing.push('Nom du produit');
      if (this.form.get('descriptionDetaillee')?.invalid) missing.push('Description détaillée');
      if (this.form.get('categorieId')?.invalid) missing.push('Catégorie');
      if (this.form.get('prix')?.invalid) missing.push('Prix');
      if (this.form.get('quantiteStock')?.invalid) missing.push('Quantité en stock');

      this.errorMessage = 'Veuillez remplir les champs obligatoires : ' + missing.join(', ');
      return;
    }

    this.saving = true;

    const dto: ProduitRequestDto = {
      nom: this.form.value.nom,
      descriptionCourte: this.form.value.descriptionCourte || '',
      descriptionDetaillee: this.form.value.descriptionDetaillee,
      prix: this.form.value.prix,
      prixPromo: this.form.value.prixPromo || null,
      quantiteStock: this.form.value.quantiteStock,
      categorieId: this.form.value.categorieId,
      tags: this.form.value.tags || '',
      sku: this.form.value.sku || '',
      deliveryOption: this.form.value.deliveryOption || '',
      statutProduit: this.publishMode ? 'ACTIVE' : 'DRAFT',
      poidsProduit: this.form.value.poidsProduit || undefined,
      dimensions: this.form.value.dimensions || ''
    };

    const obs = this.isEditMode && this.productId
      ? this.productService.updateProduct(this.productId, dto)
      : this.productService.createProduct(dto);

    obs.subscribe({
      next: (result: ProduitResponseDto) => {
        this.saving = false;
        this.successMessage = this.isEditMode ? 'Produit mis à jour avec succès !' : 'Produit créé avec succès !';
        this.cdr.detectChanges();
        if (!this.isEditMode) {
          // Navigate to edit mode so images can be uploaded
          this.router.navigate(['/vendeur/produits', result.id, 'modifier']);
        }
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = err.error?.message || 'Erreur lors de la sauvegarde du produit';
        this.cdr.detectChanges();
      }
    });
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadFiles(Array.from(input.files));
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.uploadFiles(Array.from(event.dataTransfer.files));
    }
  }

  uploadFiles(files: File[]) {
    if (!this.productId) return;
    this.uploading = true;
    this.productService.uploadImages(this.productId, files).subscribe({
      next: (images: ProductImageDto[]) => {
        this.existingImages = [...this.existingImages, ...images];
        this.uploading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.uploading = false;
        this.errorMessage = 'Erreur lors du téléchargement des images';
        this.cdr.detectChanges();
      }
    });
  }

  setPrimary(imageId: number) {
    if (!this.productId) return;
    this.productService.setPrimaryImage(this.productId, imageId).subscribe({
      next: () => {
        this.existingImages = this.existingImages.map(img => ({
          ...img,
          isPrimary: img.id === imageId
        }));
        this.cdr.detectChanges();
      },
      error: () => { this.errorMessage = 'Erreur lors de la mise à jour'; this.cdr.detectChanges(); }
    });
  }

  deleteImage(imageId: number) {
    if (!this.productId) return;
    this.productService.deleteImage(this.productId, imageId).subscribe({
      next: () => {
        this.existingImages = this.existingImages.filter(img => img.id !== imageId);
        this.cdr.detectChanges();
      },
      error: () => { this.errorMessage = 'Erreur lors de la suppression'; this.cdr.detectChanges(); }
    });
  }
}
