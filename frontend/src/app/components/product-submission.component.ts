import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProduitService } from '../services/product.service';
import { CategorieService } from '../services/category.service';

@Component({
  selector: 'app-product-submission',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card" style="max-width: 800px;">
        <h2>Soumettre une Annonce</h2>
        <p class="section-subtitle">Garantissez la visibilité de votre produit sur notre plateforme</p>
        
        <form (ngSubmit)="onSubmit()" #productForm="ngForm" class="submission-form">
          <div class="form-grid">
            <div class="form-group full-width">
              <label>Titre de l'Annonce</label>
              <input type="text" [(ngModel)]="product.titreProduit" name="titre" required placeholder="Ex: iPhone 15 Pro Max">
            </div>

            <div class="form-group">
              <label>Catégorie</label>
              <select [(ngModel)]="product.categorieId" name="categorieId" required>
                <option [ngValue]="null" disabled selected>Choisir une catégorie...</option>
                <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.nomCategorie }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>Ville</label>
              <input type="text" [(ngModel)]="product.villeLocalisation" name="ville" required placeholder="Ex: Casablanca">
            </div>

            <div class="form-group">
              <label>Type de Prix</label>
              <select [(ngModel)]="product.typePrix" name="typePrix" required>
                <option value="FIXE">Prix Fixe</option>
                <option value="NEGOCIABLE">Négociable</option>
                <option value="SUR_DEVIS">Sur Devis</option>
              </select>
            </div>

            <div class="form-group" [style.visibility]="product.typePrix !== 'SUR_DEVIS' ? 'visible' : 'hidden'">
              <label>Prix (DH)</label>
              <input type="number" [(ngModel)]="product.prixAfiche" name="prix" [required]="product.typePrix !== 'SUR_DEVIS'">
            </div>

            <div class="form-group full-width">
              <label>Description Détaillée</label>
              <textarea [(ngModel)]="product.descriptionDetaillee" name="description" required rows="5" placeholder="Décrivez votre produit ou service en détail pour attirer plus de clients..."></textarea>
            </div>
          </div>

          <div class="form-footer">
            <button type="submit" class="btn-primary" [disabled]="!productForm.form.valid || loading">
              {{ loading ? 'Traitement en cours...' : 'Soumettre pour Validation' }}
            </button>
            <p class="form-hint">Votre annonce sera examinée par nos administrateurs avant publication.</p>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .section-subtitle {
      text-align: center;
      color: var(--text-secondary);
      margin-top: -24px;
      margin-bottom: 40px;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .full-width {
      grid-column: span 2;
    }
    .form-footer {
      margin-top: 40px;
      text-align: center;
    }
    .form-hint {
      margin-top: 16px;
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
    @media (max-width: 600px) {
      .form-grid { grid-template-columns: 1fr; }
      .full-width { grid-column: span 1; }
    }
  `]
})
export class ProductSubmissionComponent implements OnInit {
  public produitService: ProduitService = inject(ProduitService);
  public catService: CategorieService = inject(CategorieService);
  public router: Router = inject(Router);

  categories: any[] = [];
  loading = false;
  product: any = {
    titreProduit: '',
    descriptionDetaillee: '',
    categorieId: null,
    typePrix: 'FIXE',
    prixAfiche: null,
    villeLocalisation: '',
    typeAnnonce: 'PRODUIT', // Default
    disponibilite: 'EN_STOCK' // Default
  };

  ngOnInit() {
    this.catService.getAllActive().subscribe((cats: any[]) => {
      this.categories = cats;
    });
  }

  onSubmit() {
    this.loading = true;
    // Map categorieId to the expected object or handle it in backend
    // For now, let's assume backend accepts a flat structure or we transform it
    const payload = {
      ...this.product,
      categorie: { id: this.product.categorieId }
    };

    this.produitService.submit(payload).subscribe({
      next: () => {
        alert('Votre annonce a été soumise avec succès et est en attente de validation.');
        this.router.navigate(['/home']);
      },
      error: (err: any) => {
        console.error(err);
        alert('Erreur lors de la soumission.');
        this.loading = false;
      }
    });
  }
}
