import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProduitService } from '../services/product.service';
import { CategorieService } from '../services/category.service';

@Component({
  selector: 'app-product-submission',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="submission-page">
      <div class="hero-section">
        <div class="hero-content">
          <h1>{{ isEditing ? 'Modifier votre Annonce' : 'Publier une Annonce' }}</h1>
          <p>{{ isEditing ? 'Mettez à jour les détails de votre offre en quelques clics.' : 'Mettez en avant vos produits ou services auprès de milliers de clients.' }}</p>
        </div>
      </div>

      <div class="main-container">
        <!-- Success/Error Messages -->
        <div class="toast-container" *ngIf="message">
          <div class="toast" [class.success]="isSuccess" [class.error]="!isSuccess">
            <div class="toast-icon">{{ isSuccess ? '✓' : '✕' }}</div>
            <div class="toast-content">{{ message }}</div>
          </div>
        </div>

        <form (ngSubmit)="onSubmit()" #productForm="ngForm" class="premium-card submission-card">
          <div class="card-header">
            <h3>Détails du Produit</h3>
            <div class="header-divider"></div>
          </div>

          <div class="form-body">
            <!-- TYPE D'ANNONCE -->
            <div class="form-section">
              <label class="section-label">Quel type d'annonce souhaitez-vous publier ?</label>
              <div class="type-selector">
                <div class="type-card" [class.active]="product.typeAnnonce === 'PRODUIT_PHYSIQUE'" (click)="product.typeAnnonce = 'PRODUIT_PHYSIQUE'">
                  <div class="type-icon">📦</div>
                  <div class="type-info">
                    <strong>Produit Physique</strong>
                    <span>Articles, Équipements, Mode...</span>
                  </div>
                  <div class="check-mark">✓</div>
                </div>
                <div class="type-card" [class.active]="product.typeAnnonce === 'SERVICE_PROFESSIONNEL'" (click)="product.typeAnnonce = 'SERVICE_PROFESSIONNEL'">
                  <div class="type-icon">🛠️</div>
                  <div class="type-info">
                    <strong>Service Professionnel</strong>
                    <span>Expertise, Maintenance, Conseil...</span>
                  </div>
                  <div class="check-mark">✓</div>
                </div>
              </div>
            </div>

            <div class="form-grid">
              <!-- TITRE -->
              <div class="field full-width">
                <div class="label-row">
                  <label>Titre de l'Annonce</label>
                  <span class="status ok" *ngIf="product.titreProduit && product.titreProduit.length >= 5">&#10003;</span>
                  <span class="status err" *ngIf="attemptedSubmit && !product.titreProduit">Requis</span>
                  <span class="status err" *ngIf="product.titreProduit && product.titreProduit.length < 5">Trop court (5 min)</span>
                </div>
                <input type="text" [(ngModel)]="product.titreProduit" name="titre" required 
                       [class.invalid]="attemptedSubmit && !product.titreProduit"
                       placeholder="Ex: iPhone 15 Pro Max - Noir Sidéral">
              </div>

              <!-- CATEGORIE -->
              <div class="field">
                <div class="label-row">
                  <label>Catégorie</label>
                  <span class="status ok" *ngIf="product.categorieId">&#10003;</span>
                  <span class="status err" *ngIf="attemptedSubmit && !product.categorieId">Requis</span>
                </div>
                <select [(ngModel)]="product.categorieId" name="categorieId" required
                        [class.invalid]="attemptedSubmit && !product.categorieId">
                  <option [ngValue]="null" disabled selected>Choisir une catégorie...</option>
                  <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.nomCategorie }}</option>
                </select>
              </div>

              <!-- VILLE -->
              <div class="field">
                <div class="label-row">
                  <label>Ville / Localisation</label>
                  <span class="status ok" *ngIf="product.villeLocalisation">&#10003;</span>
                  <span class="status err" *ngIf="attemptedSubmit && !product.villeLocalisation">Requis</span>
                </div>
                <input type="text" [(ngModel)]="product.villeLocalisation" name="ville" required 
                       [class.invalid]="attemptedSubmit && !product.villeLocalisation"
                       placeholder="Ex: Casablanca, Maarif">
              </div>

              <!-- DISPONIBILITE -->
              <div class="field">
                <div class="label-row">
                  <label>Disponibilité</label>
                  <span class="status ok" *ngIf="product.disponibilite">&#10003;</span>
                </div>
                <select [(ngModel)]="product.disponibilite" name="disponibilite" required>
                  <option value="DISPONIBLE_IMMEDIATEMENT">Disponible immédiatement</option>
                  <option value="STOCK_LIMITE">En stock limité</option>
                  <option value="SUR_COMMANDE">Sur commande</option>
                </select>
              </div>

              <!-- TYPE PRIX -->
              <div class="field">
                <div class="label-row">
                  <label>Type de Prix</label>
                  <span class="status ok" *ngIf="product.typePrix">&#10003;</span>
                </div>
                <select [(ngModel)]="product.typePrix" name="typePrix" required>
                  <option value="PRIX_FIXE">Prix Fixe</option>
                  <option value="PRIX_NEGOCIABLE">Prix Négociable</option>
                  <option value="GRATUIT">Gratuit</option>
                  <option value="SUR_DEVIS">Sur Devis</option>
                </select>
              </div>

              <!-- PRIX -->
              <div class="field" *ngIf="product.typePrix !== 'GRATUIT' && product.typePrix !== 'SUR_DEVIS'">
                <div class="label-row">
                  <label>Prix (DH)</label>
                  <span class="status ok" *ngIf="product.prixAfiche > 0">&#10003;</span>
                  <span class="status err" *ngIf="attemptedSubmit && !product.prixAfiche">Requis</span>
                </div>
                <div class="price-input-wrapper">
                  <input type="number" [(ngModel)]="product.prixAfiche" name="prix" 
                         [required]="product.typePrix !== 'GRATUIT' && product.typePrix !== 'SUR_DEVIS'"
                         [class.invalid]="attemptedSubmit && !product.prixAfiche"
                         placeholder="0.00">
                  <span class="currency">DH</span>
                </div>
              </div>

                <!-- DESCRIPTION -->
                <div class="field full-width">
                  <div class="label-row">
                    <label>Description Détaillée</label>
                    <span class="status ok" *ngIf="product.descriptionDetaillee && product.descriptionDetaillee.length >= 20">&#10003;</span>
                    <span class="status err" *ngIf="attemptedSubmit && !product.descriptionDetaillee">Requis</span>
                    <span class="status err" *ngIf="product.descriptionDetaillee && product.descriptionDetaillee.length < 20">Plus de détails (20 min)</span>
                  </div>
                  <textarea [(ngModel)]="product.descriptionDetaillee" name="description" required rows="5" 
                            [class.invalid]="attemptedSubmit && !product.descriptionDetaillee"
                            placeholder="Décrivez les caractéristiques principales, l'état, et les avantages..."></textarea>
                </div>

                <!-- IMAGE UPLOAD -->
                <div class="field full-width">
                  <div class="label-row">
                    <label>Photos du Produit</label>
                    <span class="status ok" *ngIf="imagePreview">&#10003; Sélectionnée</span>
                  </div>
                  
                  <div class="upload-zone" (click)="fileInput.click()" [class.has-preview]="!!imagePreview">
                    <input type="file" #fileInput (change)="onFileSelected($event)" accept="image/*" hidden>
                    
                    <div class="upload-placeholder" *ngIf="!imagePreview">
                      <div class="upload-icon">📸</div>
                      <div class="upload-text">
                        <strong>Cliquez pour charger une photo</strong>
                        <span>JPG, PNG ou WEBP (Max. 5MB)</span>
                      </div>
                    </div>

                    <div class="preview-container" *ngIf="imagePreview">
                      <img [src]="imagePreview" alt="Aperçu">
                      <button type="button" class="remove-img" (click)="removeImage($event)">&times;</button>
                      <div class="change-overlay">Cliquer pour changer de photo</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          <div class="form-footer">
            <p class="disclaimer">En publiant, vous acceptez nos conditions d'utilisation et la politique de visibilité.</p>
            <div class="form-actions">
              <button type="button" class="btn-cancel" (click)="router.navigate(['/my-ads'])" *ngIf="isEditing">Annuler</button>
              <button type="submit" class="btn-submit" [disabled]="loading">
                <div class="spinner-mini" *ngIf="loading"></div>
                <span>{{ loading ? (isEditing ? 'Mise à jour...' : 'Soumission...') : (isEditing ? 'Mettre à jour mon annonce' : 'Publier mon annonce') }}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #4db6ac;
      --primary-dark: #00897b;
      --accent: #e0f2f1;
      --bg: #f8fafc;
      --white: #ffffff;
      --text: #1e293b;
      --text-light: #64748b;
      --border: #e2e8f0;
      --shadow: 0 10px 25px rgba(0, 137, 123, 0.08);
      --danger: #ef4444;
      --success: #10b981;
    }

    .submission-page {
      background: var(--bg);
      min-height: 100vh;
      padding-bottom: 80px;
    }

    .hero-section {
      background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%);
      padding: 40px 20px;
      text-align: center;
      color: white;
      clip-path: ellipse(150% 100% at 50% 0%);
    }

    .hero-content h1 {
      font-size: 2rem;
      font-weight: 900;
      margin-bottom: 8px;
    }

    .hero-content h1 span {
      background: rgba(255, 255, 255, 0.2);
      padding: 0 15px;
      border-radius: 12px;
    }

    .hero-content p {
      font-size: 1.1rem;
      opacity: 0.9;
      max-width: 600px;
      margin: 0 auto;
    }

    .main-container {
      max-width: 900px;
      margin: -60px auto 0;
      padding: 0 20px;
    }

    .premium-card {
      background: white;
      border-radius: 32px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.08);
      border: 1px solid rgba(255,255,255,0.5);
      overflow: hidden;
    }

    .card-header {
      padding: 30px 40px;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .card-header h3 {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text);
      margin: 0;
    }

    .header-divider {
      height: 4px;
      width: 60px;
      background: var(--primary);
      border-radius: 2px;
    }

    .form-body {
      padding: 20px 40px;
    }

    .form-section {
      margin-bottom: 40px;
    }

    .section-label {
      display: block;
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text-light);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 20px;
    }

    .type-selector {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .type-card {
      background: #f1f5f9;
      padding: 24px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 15px;
      cursor: pointer;
      transition: 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      border: 2px solid transparent;
    }

    .type-card:hover {
      background: white;
      box-shadow: 0 10px 20px rgba(0,0,0,0.05);
      transform: translateY(-2px);
    }

    .type-card.active {
      background: var(--accent);
      border-color: var(--primary);
    }

    .type-icon {
      font-size: 2rem;
    }

    .type-info {
      display: flex;
      flex-direction: column;
    }

    .type-info strong {
      font-size: 1rem;
      color: var(--text);
    }

    .type-info span {
      font-size: 0.8rem;
      color: var(--text-light);
    }

    .check-mark {
      position: absolute;
      top: 15px;
      right: 15px;
      width: 24px;
      height: 24px;
      background: var(--primary);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      opacity: 0;
      transform: scale(0.5);
      transition: 0.3s;
    }

    .type-card.active .check-mark {
      opacity: 1;
      transform: scale(1);
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 25px 35px;
      padding-top: 20px;
      border-top: 1px solid #f1f5f9;
    }

    .full-width {
      grid-column: span 2;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .label-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .field label {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text);
    }

    .status {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 12px;
      text-transform: uppercase;
    }

    .status.ok { color: var(--success); background: #ecfdf5; }
    .status.err { color: var(--danger); background: #fff1f2; }

    input, select, textarea {
      padding: 14px 20px;
      border-radius: 16px;
      border: 1.5px solid var(--border);
      background: #fafdfd;
      font-size: 0.95rem;
      transition: 0.2s;
      width: 100%;
    }

    input:focus, select:focus, textarea:focus {
      border-color: var(--primary);
      outline: none;
      background: white;
      box-shadow: 0 4px 12px rgba(77, 182, 172, 0.1);
    }

    input.invalid, select.invalid, textarea.invalid {
      border-color: var(--danger);
      background: #fffafa;
    }

    .price-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .price-input-wrapper input {
      padding-right: 60px;
    }

    .currency {
      position: absolute;
      right: 20px;
      font-weight: 900;
      color: var(--primary-dark);
      pointer-events: none;
    }

    .form-footer {
      padding: 40px;
      background: #fafdfd;
      border-top: 1px solid #f1f5f9;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }

    .disclaimer {
      font-size: 0.85rem;
      color: var(--text-light);
      text-align: center;
      max-width: 500px;
    }

    .btn-submit {
      background: var(--primary);
      color: white;
      border: none;
      padding: 16px 45px;
      border-radius: 20px;
      font-weight: 900;
      font-size: 1.05rem;
      cursor: pointer;
      transition: 0.3s;
      box-shadow: 0 10px 25px rgba(77, 182, 172, 0.3);
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .btn-submit:hover:not(:disabled) {
      transform: translateY(-3px);
      filter: brightness(1.1);
      box-shadow: 0 15px 35px rgba(77, 182, 172, 0.4);
    }

    .btn-submit:disabled {
      background: #cbd5e1;
      box-shadow: none;
      cursor: not-allowed;
    }

    /* Upload Zone */
    .upload-zone {
      border: 2px dashed var(--border);
      border-radius: 20px;
      padding: 40px;
      text-align: center;
      cursor: pointer;
      transition: 0.3s;
      background: #fafdfd;
      position: relative;
      overflow: hidden;
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .upload-zone:hover {
      border-color: var(--primary);
      background: #f0fdf9;
    }

    .upload-zone.has-preview {
      border-style: solid;
      padding: 0;
    }

    .upload-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
    }

    .upload-icon {
      font-size: 3rem;
    }

    .upload-text {
      display: flex;
      flex-direction: column;
    }

    .upload-text strong {
      color: var(--text);
      font-size: 1rem;
    }

    .upload-text span {
      color: var(--text-light);
      font-size: 0.8rem;
    }

    .preview-container {
      width: 100%;
      height: 300px;
      position: relative;
    }

    .preview-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .remove-img {
      position: absolute;
      top: 15px;
      right: 15px;
      width: 32px;
      height: 32px;
      background: rgba(0,0,0,0.6);
      color: white;
      border: none;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      cursor: pointer;
      z-index: 10;
      transition: 0.2s;
    }

    .remove-img:hover {
      background: var(--danger);
      transform: scale(1.1);
    }

    .change-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 137, 123, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 800;
      font-size: 0.9rem;
      opacity: 0;
      transition: 0.3s;
      backdrop-filter: blur(2px);
    }

    .preview-container:hover .change-overlay {
      opacity: 1;
    }

    /* Toasts */
    .toast-container {
      margin-bottom: 25px;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 16px 25px;
      border-radius: 20px;
      background: white;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      border-left: 6px solid;
      animation: slideDown 0.4s ease-out;
    }

    .toast.success { border-left-color: var(--success); }
    .toast.error { border-left-color: var(--danger); }

    .toast-icon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
    }

    .toast.success .toast-icon { background: var(--success); }
    .toast.error .toast-icon { background: var(--danger); }

    .toast-content {
      font-weight: 600;
      color: var(--text);
    }

    @keyframes slideDown {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 768px) {
      .form-grid { grid-template-columns: 1fr; }
      .full-width { grid-column: span 1; }
      .type-selector { grid-template-columns: 1fr; }
    }
  `]
})
export class ProductSubmissionComponent implements OnInit {
  private produitService = inject(ProduitService);
  private categorieService = inject(CategorieService);
  public router = inject(Router);
  private route = inject(ActivatedRoute);

  categories: any[] = [];
  loading = false;
  attemptedSubmit = false;
  message = '';
  isSuccess = false;

  product: any = {
    id: null,
    titreProduit: '',
    descriptionDetaillee: '',
    categorieId: null,
    typePrix: 'PRIX_FIXE',
    prixAfiche: null,
    villeLocalisation: '',
    typeAnnonce: 'PRODUIT_PHYSIQUE',
    disponibilite: 'DISPONIBLE_IMMEDIATEMENT',
    imageUrl: ''
  };

  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  isEditing = false;
  loadingData = false;


  ngOnInit() {
    this.categorieService.getAllActive().subscribe(data => this.categories = data);

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.loadingData = true;
      this.produitService.getById(Number(id)).subscribe({
        next: (data) => {
          this.product = {
            ...data,
            categorieId: data.categorie?.id || null
          };
          if (data.imageUrl) {
            this.imagePreview = data.imageUrl;
          }
          this.loadingData = false;
        },
        error: () => this.loadingData = false
      });
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(event: Event) {
    event.stopPropagation();
    this.selectedFile = null;
    this.imagePreview = null;
  }

  onSubmit() {
    this.attemptedSubmit = true;

    if (!this.validateForm()) {
      this.showToast("Veuillez remplir correctement tous les champs obligatoires.", false);
      return;
    }

    this.loading = true;

    if (this.selectedFile) {
      this.produitService.uploadImage(this.selectedFile).subscribe({
        next: (res) => {
          this.product.imageUrl = res.url;
          this.saveProduct();
        },
        error: () => {
          this.showToast("Erreur lors du chargement de l'image.", false);
          this.loading = false;
        }
      });
    } else {
      this.saveProduct();
    }
  }

  saveProduct() {
    const payload = {
      ...this.product,
      categorie: { id: this.product.categorieId }
    };

    const obs = this.isEditing
      ? this.produitService.update(this.product.id, payload)
      : this.produitService.submit(payload);

    obs.subscribe({
      next: () => {
        this.loading = false;
        this.showToast(this.isEditing ? "Annonce mise à jour !" : "Annonce soumise avec succès ! Elle sera validée par un administrateur.", true);
        setTimeout(() => this.router.navigate(['/my-ads']), 2000);
      },
      error: (err: any) => {
        console.error(err);
        this.showToast("Une erreur est survenue. Veuillez réessayer.", false);
        this.loading = false;
      }
    });
  }

  validateForm(): boolean {
    const p = this.product;
    if (!p.titreProduit || p.titreProduit.length < 5) return false;
    if (!p.descriptionDetaillee || p.descriptionDetaillee.length < 20) return false;
    if (!p.categorieId) return false;
    if (!p.villeLocalisation) return false;
    if (p.typePrix !== 'GRATUIT' && p.typePrix !== 'SUR_DEVIS' && (!p.prixAfiche || p.prixAfiche <= 0)) return false;
    return true;
  }

  showToast(msg: string, success: boolean) {
    this.message = msg;
    this.isSuccess = success;
    if (!success) {
      setTimeout(() => this.message = '', 5000);
    }
  }
}

