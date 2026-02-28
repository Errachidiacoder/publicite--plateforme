import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page-container">
      <div class="admin-compact-wrapper">
        <div style="height: 20px;"></div>

      <!-- Floating Toasts -->
      <div class="toast-container">
        <div class="toast success" *ngIf="successMessage" (click)="successMessage = ''">
          <div class="toast-icon">✓</div>
          <div class="toast-content">
            <span class="toast-title">Succès</span>
            <span class="toast-text">{{ successMessage }}</span>
          </div>
        </div>
        <div class="toast error" *ngIf="errorMessage" (click)="errorMessage = ''">
          <div class="toast-icon">✕</div>
          <div class="toast-content">
            <span class="toast-title">Erreur</span>
            <span class="toast-text">{{ errorMessage }}</span>
          </div>
        </div>
      </div>

      <!-- FORMS -->
      <div class="card form-card" *ngIf="showCreateForm">
        <header class="card-header">
           <h3>{{ isEditing || isEditingRole ? "Modifier l'entrée" : 'Créer une nouvelle entrée' }}</h3>
        </header>
        
        <!-- User Form -->
        <form *ngIf="view === 'users'" (ngSubmit)="onSaveUser()" class="premium-form">
          <div class="form-grid">
            <div class="field">
              <div class="label-row">
                <label>Nom et prénom</label>
                <!-- Vert: contenu ET valide -->
                <span class="field-status ok" *ngIf="newUser.nomComplet && isValidName(newUser.nomComplet)">&#10003;</span>
                <!-- Rouge: saisi mais format invalide (temps réel) -->
                <span class="field-status err" *ngIf="newUser.nomComplet && !isValidName(newUser.nomComplet)">Lettres uniquement</span>
                <!-- Rouge: vide après tentative -->
                <span class="field-status err" *ngIf="attemptedSave && !newUser.nomComplet">Requis</span>
              </div>
              <input type="text" [(ngModel)]="newUser.nomComplet" name="nomComplet"
                     (keydown)="onNameKeyDown($event)"
                     [class.invalid]="(newUser.nomComplet && !isValidName(newUser.nomComplet)) || (attemptedSave && !newUser.nomComplet)"
                     placeholder="Ex: Jean Dupont" required>
            </div>
            <div class="field">
              <div class="label-row">
                <label>Email</label>
                <span class="field-status ok"  *ngIf="newUser.email && isValidEmail(newUser.email)">&#10003;</span>
                <span class="field-status err" *ngIf="newUser.email && !isValidEmail(newUser.email)">Format invalide</span>
                <span class="field-status err" *ngIf="attemptedSave && !newUser.email">Requis</span>
              </div>
              <input type="email" [(ngModel)]="newUser.email" name="email" autocomplete="off"
                     [class.invalid]="(newUser.email && !isValidEmail(newUser.email)) || (attemptedSave && !newUser.email)"
                     placeholder="jean@exemple.com" required>
            </div>

            <div class="field">
              <div class="label-row">
                <label>Tél</label>
                <span class="field-status ok" *ngIf="newUser.telephone && isValidPhone(newUser.telephone)">&#10003;</span>
                <span class="field-status err" *ngIf="newUser.telephone && !isValidPhone(newUser.telephone)">Format invalide</span>
                <span class="field-status err" *ngIf="attemptedSave && !newUser.telephone">Requis</span>
              </div>
              <input type="text" [(ngModel)]="newUser.telephone" name="telephone"
                     [class.invalid]="(newUser.telephone && !isValidPhone(newUser.telephone)) || (attemptedSave && !newUser.telephone)"
                     placeholder="+212 ...">
            </div>

            <div class="field" *ngIf="!isEditing">
              <div class="label-row">
                <label>Mot de passe</label>
                <span class="field-status ok"  *ngIf="newUser.password && newUser.password.length >= 10">&#10003;</span>
                <span class="field-status err" *ngIf="newUser.password && newUser.password.length < 10">{{ newUser.password.length }}/10 car. min</span>
                <span class="field-status err" *ngIf="attemptedSave && !newUser.password">Requis</span>
              </div>
              <input type="password" [(ngModel)]="newUser.password" name="password" autocomplete="new-password"
                     [class.invalid]="(newUser.password && newUser.password.length < 10) || (attemptedSave && !newUser.password)"
                     placeholder="••••••••••" required>
            </div>
            
            <div class="field span-2">
              <div class="label-row">
                <label>Rôles</label>
                <span class="field-status ok" *ngIf="newUser.roles.length > 0">&#10003;</span>
                <span class="field-status err" *ngIf="attemptedSave && newUser.roles.length === 0">Au moins 1 rôle requis</span>
              </div>
              <div class="role-selector-grid" [class.invalid-block]="attemptedSave && newUser.roles.length === 0">
                <div *ngFor="let role of rolesList" class="role-checkbox">
                  <input type="checkbox" [id]="'role-' + role.id"
                         [checked]="isRoleSelected(role.name)"
                         (change)="toggleRole(role.name)">
                  <label [for]="'role-' + role.id">{{ role.name.replace('ROLE_', '') }}</label>
                </div>
              </div>
            </div>

            <div class="field span-2">
              <label>Compte</label>
              <div class="premium-switches">
                <div class="switch-item">
                  <span class="switch-label">Actif</span>
                  <div class="status-toggle" [class.active]="newUser.compteActif" (click)="newUser.compteActif = !newUser.compteActif">
                    <div class="toggle-track"><div class="toggle-thumb"></div></div>
                  </div>
                </div>
                <div class="switch-item">
                  <span class="switch-label">Vérifié</span>
                  <div class="status-toggle" [class.active]="newUser.emailVerifie" (click)="newUser.emailVerifie = !newUser.emailVerifie">
                    <div class="toggle-track"><div class="toggle-thumb"></div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="form-footer">
            <button type="submit" class="btn-primary" [disabled]="loading">
               <div class="spinner" *ngIf="loading"></div>
               <span>{{ loading ? 'Traitement...' : (isEditing ? 'Mettre à jour' : 'Enregistrer') }}</span>
            </button>
          </div>
        </form>

        <!-- Role Form -->
        <form *ngIf="view === 'roles'" (ngSubmit)="onSaveRole()" class="premium-form">
            <div class="form-grid">
              <div class="field">
                <div class="label-row">
                  <label>Nom du Rôle (Format technique)</label>
                  <span class="field-status ok" *ngIf="newRole.name && newRole.name.length >= 4">&#10003;</span>
                  <span class="field-status err" *ngIf="newRole.name && newRole.name.length < 4">{{ newRole.name.length }}/4 car. min</span>
                  <span class="field-status err" *ngIf="attemptedRoleSave && !newRole.name">Requis</span>
                </div>
                <input type="text" [(ngModel)]="newRole.name" name="roleName"
                       [class.invalid]="(newRole.name && newRole.name.length < 4) || (attemptedRoleSave && !newRole.name)"
                       placeholder="Ex: ROLE_MODERATOR" required>
              </div>
              <div class="field">
                <div class="label-row">
                  <label>Description du Rôle</label>
                  <span class="field-status ok" *ngIf="newRole.description && newRole.description.length >= 10">&#10003;</span>
                  <span class="field-status err" *ngIf="newRole.description && newRole.description.length < 10">{{ newRole.description.length }}/10 car. min</span>
                  <span class="field-status err" *ngIf="attemptedRoleSave && !newRole.description">Requise</span>
                </div>
                <input type="text" [(ngModel)]="newRole.description" name="roleDesc"
                       [class.invalid]="(newRole.description && newRole.description.length < 10) || (attemptedRoleSave && !newRole.description)"
                       placeholder="Description des permissions..." required>
              </div>
            </div>
            <div class="form-footer">
                <button type="submit" class="btn-primary" [disabled]="loading">
                   <div class="spinner" *ngIf="loading"></div>
                   <span>{{ loading ? 'Traitement...' : 'Sauvegarder le rôle' }}</span>
                </button>
            </div>
        </form>
      </div>

    <div class="admin-page-content" *ngIf="isView('users') && !showCreateForm">
      <div class="card table-card" style="padding: 30px;">
        <div class="table-header-row" style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 25px;">
            <div class="table-title-area">
                <h2 style="margin:0; font-size:1.4rem; font-weight:700; color:#1A202C;">Utilisateurs</h2>
            </div>
            <div class="table-tools" style="display:flex; align-items:center; gap:25px; margin-left: auto;">
                <!-- VIEW SWITCHER AS PREMIUM TABS -->
                <div class="premium-filter-tabs" style="margin-left: auto;">
                    <button [class.active]="isView('users')" (click)="setView('users')" class="filter-tab">Utilisateurs</button>
                    <button [class.active]="isView('roles')" (click)="setView('roles')" class="filter-tab">Rôles API</button>
                </div>
                <div class="search-input-wrapper">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7E7E7E" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input type="text" placeholder="Search">
                </div>
                <button class="btn-create-luxe" (click)="toggleForm()" style="padding: 10px 20px; font-size: 0.8rem; margin:0; border-radius:12px;">
                   {{ showCreateForm ? 'Annuler' : '✚ Nouveau' }}
                </button>
            </div>
        </div>

        <div class="table-responsive">
          <table class="premium-table">
            <thead>
              <tr>
                <th class="text-center">Utilisateur</th>
                <th class="text-center">Contact</th>
                <th class="text-center">Rôles</th>
                <th class="text-center">Annonces</th>
                <th class="text-center">Accès</th>
                <th class="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of users">
                <td class="text-center">
                  <div class="table-user-cell" style="justify-content:center;">
                    <div class="user-meta">
                      <span class="u-name">{{ user.nomComplet }}</span>
                    </div>
                  </div>
                </td>
                <td class="text-center">
                  <div class="user-info" style="display:flex; flex-direction:column; align-items:center; gap:2px;">
                    <span class="u-name" style="font-weight:500;">{{ user.email }}</span>
                    <span class="u-sub" style="font-size:0.65rem; color:#718096; font-weight:bold;">{{ user.telephone || 'Non renseigné' }}</span>
                  </div>
                </td>
                <td class="text-center">
                  <div class="roles-list" style="justify-content:center;">
                    <span *ngFor="let role of user.roles" class="tag-role" style="font-size:0.6rem; background:#F1F5F9; padding:2px 6px; border-radius:4px;">{{ role.replace('ROLE_', '') }}</span>
                  </div>
                </td>
                <td class="text-center">
                  <span class="count-chip" style="border:1.5px solid #e0f7ff; background:#e0f7ff; color:#007fb1; padding:2px 8px; border-radius:8px; font-weight:700; font-size:0.65rem;">{{ user.productsCount || 0 }}</span>
                </td>
                <td class="text-center">
                   <span class="status-pill-bordered" [ngClass]="{'active': user.compteActif, 'pending': !user.compteActif}" style="font-size:0.55rem; padding:2px 8px;">
                    {{ user.compteActif ? 'Actif' : 'Bloqué' }}
                   </span>
                </td>
                <td class="text-center">
                  <div class="action-row" style="justify-content:center; gap:10px;">
                    <button class="icon-btn-reference info" (click)="viewUserProducts(user)" title="Voir Annonces">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                    <button class="icon-btn-reference success" (click)="onEditUser(user)" title="Modifier">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="icon-btn-reference danger" (click)="onDelete(user.id)" title="Supprimer">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="admin-page-content" *ngIf="isView('roles') && !showCreateForm">
      <div class="card table-card roles-card" style="padding: 15px 25px;">
        <div class="table-header-row" style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 15px;">
            <div class="table-title-area">
                <h2 style="margin:0; font-size:1.2rem; font-weight:700; color:#1A202C;">Rôles</h2>
            </div>
            <div class="table-tools" style="display:flex; align-items:center; gap:25px; margin-left: auto;">
                <!-- VIEW SWITCHER AS PREMIUM TABS -->
                <div class="premium-filter-tabs" style="margin-left: auto;">
                    <button [class.active]="isView('users')" (click)="setView('users')" class="filter-tab">Utilisateurs</button>
                    <button [class.active]="isView('roles')" (click)="setView('roles')" class="filter-tab">Rôles API</button>
                </div>
                <div class="search-input-wrapper">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7E7E7E" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input type="text" placeholder="Search">
                </div>
                <button class="btn-create-luxe" (click)="toggleForm()" style="padding: 10px 20px; font-size: 0.8rem; margin:0; border-radius:12px;">
                   {{ showCreateForm ? 'Annuler' : '✚ Nouveau' }}
                </button>
            </div>
        </div>
          <div class="table-responsive">
            <table class="premium-table compact-table">
              <thead>
                <tr>
                  <th class="text-center">Nom du Rôle</th>
                  <th class="text-center">Description</th>
                  <th class="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let role of rolesList">
                  <td class="text-center"><span class="u-name" style="font-family:'JetBrains Mono', monospace; font-size:0.65rem;">{{ role.name.replace('ROLE_', '') }}</span></td>
                  <td class="text-center"><span style="color:#718096; font-size:0.75rem;">{{ role.description || 'Aucune description' }}</span></td>
                  <td class="text-center">
                    <div class="action-row" style="justify-content:center; gap:10px;">
                      <button class="icon-btn-reference success" (click)="onEditRoleItem(role)" title="Modifier">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button class="icon-btn-reference danger" (click)="onDeleteRoleItem(role.id)" title="Supprimer">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
      </div>
    </div>
    <div class="admin-compact-wrapper">
      <!-- Modal User Products -->
      <div *ngIf="selectedUserProducts" class="modal-overlay" (click)="selectedUserProducts = null">
        <div class="modal-premium-compact" (click)="$event.stopPropagation()">
          <header class="modal-header-compact">
            <div class="header-main">
                <h2>Annonces de <span>{{ selectedUser?.nomComplet }}</span></h2>
                <p>{{ selectedUserProducts.length }} publication(s) indexée(s)</p>
            </div>
            <button class="close-btn" (click)="selectedUserProducts = null">&times;</button>
          </header>
          <div class="modal-body scrollable">
            <div class="mini-prod-grid">
              <div *ngFor="let p of selectedUserProducts" class="mini-prod-card">
                  <div class="mini-header">
                      <span class="mini-status" [ngClass]="p.statutValidation.toLowerCase()">{{ p.statutValidation }}</span>
                      <span class="mini-price">{{ p.prixAfiche }} {{ p.typePrix }}</span>
                  </div>
                  <h4 class="mini-title">{{ p.titreProduit }}</h4>
                  <div class="mini-footer">
                      <span>{{ p.villeLocalisation }}</span>
                      <span>{{ p.compteurVues }} vues</span>
                  </div>
              </div>
            </div>
            <div *ngIf="selectedUserProducts.length === 0" class="empty-state">
               📭 Aucune annonce pour cet utilisateur.
            </div>
          </div>
        </div>
      </div>
      <!-- Custom Confirmation Modal -->
      <div *ngIf="confirmDialog.visible" class="modal-overlay" (click)="confirmDialog.visible = false">
        <div class="modal-premium confirm-modal" (click)="$event.stopPropagation()">
          <div class="modal-body text-center">
            <div class="confirm-icon">🗑️</div>
            <h3>Confirmation</h3>
            <p>{{ confirmDialog.message }}</p>
            <div class="confirm-actions">
              <button class="btn-secondary" (click)="confirmDialog.visible = false">Annuler</button>
              <button class="btn-danger" (click)="onConfirm()">Confirmer la suppression</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #00ccff;
      --primary-dark: #0099cc;
      --noir: #111827;
      --accent: #e0f7ff;
      --bg: #f8fafc;
      --white: #ffffff;
      --text: #1e293b;
      --text-light: #64748b;
      --border: #e2e8f0;
      --shadow: 0 10px 25px rgba(0, 137, 123, 0.08);
      --danger: #ef4444;
    }

    .admin-page-container { padding: 30px 20px; background: var(--bg); min-height: 100vh; }
    .admin-compact-wrapper { max-width: 1100px; margin: 0 auto; }
    
    .content-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .content-header h1 { font-size: 1.8rem; font-weight: 900; color: var(--text); margin: 0; }
    .content-header h1 span { color: var(--primary); }
    
    .header-actions { display: flex; gap: 15px; align-items: center; justify-content: flex-end; }
    
    .roles-card { max-width: 900px; margin: 0 auto; }
    .view-switcher { background: white; padding: 5px; border-radius: 12px; display: flex; box-shadow: var(--shadow); }
    .view-switcher button { border: none; background: transparent; padding: 8px 16px; border-radius: 8px; font-weight: 700; color: var(--text-light); cursor: pointer; transition: 0.3s; }
    .view-switcher button.active { background: var(--primary); color: white; }
    .btn-create { background: var(--text); color: white; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.3s; }
    .btn-create:hover { background: var(--primary); transform: translateY(-2px); }

    /* Pro Toasts */
    .toast-container { position: fixed; top: 30px; right: 30px; z-index: 9999; display: flex; flex-direction: column; gap: 15px; }
    .toast { display: flex; align-items: center; gap: 15px; background: white; padding: 16px 25px; border-radius: 20px; box-shadow: 0 15px 40px rgba(0,0,0,0.12); border-left: 6px solid; animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1); cursor: pointer; min-width: 320px; }
    .toast.success { border-left-color: #00ccff; }
    .toast.error { border-left-color: var(--danger); }
    .toast-icon { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; color: white; flex-shrink: 0; font-size: 1rem; }
    .toast.success .toast-icon { background: #00ccff; }
    .toast.error .toast-icon { background: var(--danger); }
    .toast-content { display: flex; flex-direction: column; }
    .toast-title { font-weight: 800; font-size: 0.9rem; color: var(--text); }
    .toast-text { font-size: 0.8rem; color: var(--text-light); }
    @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

    .card { background: white; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #EDF2F7; overflow: hidden; transition: 0.3s; }
    .table-card { border-radius: 24px !important; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02) !important; border: 1px solid #E2E8F0 !important; }
    
    .form-card { margin-bottom: 40px; animation: expand 0.4s ease; max-width: 850px; margin-left: auto; margin-right: auto; border: 1px solid rgba(77, 182, 172, 0.1); }
    @keyframes expand { from { transform: scale(0.98); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    
    .card-header { padding: 15px 25px; border-bottom: 1px solid var(--border); background: linear-gradient(to right, #fafdfd, white); }
    .card-header h3 { margin: 0; font-size: 1rem; font-weight: 1000; color: #1e293b; }

    .premium-form { padding: 20px 35px; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px 30px; }
    .span-3, .span-2 { grid-column: span 2; }
    @media (max-width: 800px) { .span-3, .span-2 { grid-column: span 1; } .form-grid { grid-template-columns: 1fr; } }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label { font-size: 0.65rem; font-weight: 1000; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0px; padding-left: 12px; }
    .field input { padding: 0 20px; border-radius: 30px; border: 1.5px solid var(--border); background: #fafdfd; font-size: 0.75rem; transition: 0.2s; width: 100%; border-right: 3px solid transparent; height: 42px; box-sizing: border-box; }
    .field input:focus { border-color: var(--primary); outline: none; background: white; border-right-color: var(--primary); box-shadow: 0 4px 10px rgba(77, 182, 172, 0.05); }
    .field input.invalid { border-color: #ef4444; background: #fffafb; border-right-color: #ef4444; box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.05); }
    .label-row { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
    .field-status { font-size: 0.58rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.3px; }
    .field-status.ok  { color: #0099cc; background: #e0f7ff; }
    .field-status.err { color: #ef4444; background: #fff1f2; }

    .role-pills-selector { display: flex; flex-wrap: wrap; gap: 10px; }
    .role-pills-selector button { padding: 8px 16px; border-radius: 50px; border: 1.5px solid var(--border); background: white; font-weight: 700; font-size: 0.8rem; cursor: pointer; transition: 0.3s; }
    .role-pills-selector button.selected { background: var(--accent); color: var(--primary-dark); border-color: var(--primary); }
    
    .form-footer { margin-top: 30px; padding: 20px 35px; background: #fafdfd; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; }
    .btn-primary { background: var(--primary); color: white; border: none; padding: 12px 35px; border-radius: 40px; font-weight: 900; font-size: 0.85rem; cursor: pointer; transition: 0.3s; box-shadow: 0 8px 20px rgba(0, 204, 255, 0.2); display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 1.5px; }
    .btn-primary:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); box-shadow: 0 12px 25px rgba(0, 204, 255, 0.3); }
    
    .spinner { width: 22px; height: 22px; border: 3px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: white; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .table-responsive { border-radius: 16px; overflow: hidden; border: 1px solid #EDF2F7; }
    .premium-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.7rem; }
    .premium-table th { background: #F8FAFC; padding: 14px 16px; text-align: center; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; color: #64748B; border-bottom: 1px solid #EDF2F7; }
    .premium-table td { padding: 12px 16px; border-bottom: 1px solid #F1F5F9; vertical-align: middle; text-align: center; background: white; transition: background 0.2s; }
    .premium-table tr:hover td { background: #F9FBFF; }
    .premium-table tr:last-child td { border-bottom: none; }
    .text-center { text-align: center !important; }
    .code-id { background: #f1f5f9; color: #475569; padding: 4px 8px; border-radius: 6px; font-weight: 700; font-size: 0.75rem; font-family: 'JetBrains Mono', monospace; }
    
    .user-profile { display: flex; align-items: center; gap: 12px; }
    .u-avatar { width: 38px; height: 38px; background: var(--accent); color: var(--primary-dark); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1rem; }
    .u-name { font-weight: 800; color: var(--text); font-size: 0.8rem; }
    .u-email { color: var(--text-light); font-weight: 500; font-size: 0.7rem; }
    
    .tag-cloud { display: flex; flex-wrap: wrap; gap: 6px; }
    .tag-role { background: #f1f5f9; color: #475569; padding: 3px 8px; border-radius: 6px; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
    
    .count-chip { border: 1.5px solid var(--accent); background: white; color: var(--primary-dark); padding: 5px 15px; border-radius: 20px; font-weight: 800; cursor: pointer; transition: 0.3s; }
    .count-chip:hover { background: var(--primary); color: white; border-color: var(--primary); }

    .status-toggle { display: flex; align-items: center; gap: 10px; cursor: pointer; }
    .toggle-track { width: 44px; height: 24px; background: #eaedf0; border-radius: 20px; position: relative; transition: 0.3s; border: 1px solid #ddd; }
    .toggle-thumb { width: 18px; height: 18px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 3px; transition: 0.3s; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    .active .toggle-track { background: var(--primary); border-color: var(--primary-dark); }
    .active .toggle-thumb { left: calc(100% - 21px); }
    .status-toggle span { font-size: 0.75rem; font-weight: 700; color: var(--text-light); }
    .active span { color: var(--primary-dark); }

    .action-row { display: flex; gap: 10px; justify-content: center; }
    .icon-btn-reference { background: transparent; border: none; padding: 2px; border-radius: 4px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
    .icon-btn-reference:hover { transform: scale(1.1); filter: brightness(0.8); }
    .icon-btn-reference.info { color: #5c6c7b; }
    .icon-btn-reference.success { color: #0099cc; }
    .icon-btn-reference.danger { color: #ef4444; }

    .role-badge-large { font-weight: 950; color: var(--primary-dark); font-size: 1rem; letter-spacing: 0.5px; text-transform: uppercase; }
    .role-info { display: flex; flex-direction: column; gap: 6px; padding: 5px 0; }
    .role-desc-text { margin: 0; font-size: 0.8rem; color: var(--text-light); line-height: 1.4; font-weight: 500; }

    .role-selector-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding: 12px 25px; background: #fafdfd; border-radius: 20px; border: 1.5px solid var(--border); }
    .role-selector-grid.invalid-block { border-color: #ef4444; background: #fffafb; box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.05); }
    .role-checkbox { display: flex; align-items: center; gap: 8px; font-size: 0.6rem; font-weight: 950; color: #334155; padding: 3px 8px; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px; transition: 0.2s; border-radius: 12px; }
    .role-checkbox:hover { background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
    .role-checkbox input { width: 14px; height: 14px; accent-color: var(--primary); cursor: pointer; }
    .role-checkbox label { cursor: pointer; text-transform: none; letter-spacing: normal; color: inherit; font-size: inherit; margin: 0; }

    .premium-switches { display: flex; gap: 20px; align-items: center; background: #fafdfd; border: 1.5px solid var(--border); padding: 0 25px; border-radius: 40px; height: 42px; width: 100%; box-sizing: border-box; }
    .switch-item { display: flex; align-items: center; gap: 12px; }
    .switch-label { font-size: 0.65rem; font-weight: 1000; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }

    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(38, 50, 56, 0.4); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
    .modal-premium { background: white; border-radius: 32px; width: 100%; max-width: 800px; box-shadow: 0 40px 80px rgba(0,0,0,0.25); overflow: hidden; animation: modalIn 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes modalIn { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    
    .modal-header { padding: 35px 40px; border-bottom: 1px solid #f1f1f1; display: flex; justify-content: space-between; align-items: center; }
    .header-main h2 { margin: 0; font-size: 1.6rem; font-weight: 900; }
    .header-main h2 span { color: var(--primary); }
    .header-main p { margin: 5px 0 0; color: var(--text-light); font-weight: 500; }
    .close-btn { background: #f5f5f5; border: none; width: 40px; height: 40px; border-radius: 50%; font-size: 1.8rem; cursor: pointer; transition: 0.3s; }
    .close-btn:hover { background: #eee; transform: rotate(90deg); }

    .modal-body { padding: 40px; max-height: 60vh; overflow-y: auto; }
    .mini-prod-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
    .mini-prod-card { border: 1.5px solid var(--border); padding: 20px; border-radius: 20px; background: #fafdfd; transition: 0.3s; }
    .mini-prod-card:hover { border-color: var(--primary); background: white; transform: translateY(-5px); }
    .mini-header { display: flex; justify-content: space-between; margin-bottom: 15px; }
    .mini-status { font-size: 0.65rem; font-weight: 900; text-transform: uppercase; padding: 4px 10px; border-radius: 8px; border: 1px solid transparent; }
    .mini-status.en_attente { color: #f9a825; border-color: #f9a825; background: #fffde7; }
    .mini-status.valide { color: #1976d2; border-color: #1976d2; background: #e3f2fd; }
    .mini-status.activee { color: #2e7d32; border-color: #2e7d32; background: #e8f5e9; }
    .mini-status.refuse { color: #c62828; border-color: #c62828; background: #ffebee; }
    .mini-price { font-weight: 900; color: var(--text); }
    .mini-title { font-weight: 800; font-size: 1.05rem; margin: 0 0 10px; color: var(--text); }
    .mini-footer { display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-light); border-top: 1px solid #f1f1f1; padding-top: 15px; }

    .empty-state { text-align: center; padding: 80px 0; color: rgba(0,0,0,0.3); font-size: 1.2rem; font-weight: 600; }

    /* Confirm Modal Specifics */
    .confirm-modal { max-width: 400px; }
    .confirm-icon { font-size: 3rem; margin-bottom: 20px; }
    .confirm-modal h3 { font-size: 1.5rem; font-weight: 900; margin-bottom: 10px; }
    .confirm-modal p { color: var(--text-light); margin-bottom: 30px; font-weight: 500; }
    .confirm-actions { display: flex; gap: 15px; justify-content: center; }
    .btn-secondary { background: #f1f5f9; color: #475569; border: none; padding: 12px 25px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; }
    .btn-secondary:hover { background: #e2e8f0; }
    .btn-danger { background: #fee2e2; color: #ef4444; border: 1px solid #fecaca; padding: 12px 25px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; }
    .btn-danger:hover { background: #ef4444; color: white; border-color: #ef4444; transform: translateY(-3px); }
    .text-center { text-align: center; }
    .content-header h1 span { color: var(--primary); font-weight: 900; }
    
    .view-switcher-premium { display: none; }
    
    .premium-filter-tabs {
        display: flex;
        gap: 2px;
        background: #F9FBFF;
        padding: 4px;
        border-radius: 12px;
        border: 1px solid #EEEEEE;
    }
    .filter-tab {
        border: none;
        background: transparent;
        font-size: 0.75rem;
        font-weight: 600;
        color: #9199AF;
        cursor: pointer;
        padding: 8px 16px;
        border-radius: 10px;
        transition: all 0.2s ease;
        white-space: nowrap;
    }
    .filter-tab:hover {
        color: #1A202C;
        background: rgba(255,255,255,0.5);
    }
    .filter-tab.active {
        background: white;
        color: #00ccff;
        box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    }
    
    .btn-create-luxe { background: var(--primary); color: white; border: none; padding: 10px 24px; border-radius: 12px; font-weight: 900; cursor: pointer; transition: 0.3s; box-shadow: 0 8px 20px rgba(0, 204, 255, 0.25); }
    .btn-create-luxe:hover { transform: translateY(-3px); background: var(--primary-dark); box-shadow: 0 12px 25px rgba(0, 204, 255, 0.35); }
    
    .compact-table { font-size: 0.75rem !important; }
    .compact-table th { padding: 8px 10px !important; font-size: 0.6rem !important; }
    .compact-table td { padding: 6px 10px !important; font-size: 0.75rem !important; }
  `]
})
export class UserManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);

  view: 'users' | 'roles' = 'users';
  users: any[] = [];
  rolesList: any[] = [];

  showCreateForm = false;
  isEditing = false;
  isEditingRole = false;
  loading = false;
  attemptedSave = false;
  attemptedRoleSave = false;

  successMessage = '';
  errorMessage = '';

  selectedUser: any = null;
  selectedUserProducts: any[] | null = null;

  newUser = {
    id: null as number | null,
    nomComplet: '',
    email: '',
    password: '',
    roles: [] as string[],
    telephone: '',
    compteActif: false,
    emailVerifie: false
  };

  newRole = {
    id: null as number | null,
    name: '',
    description: ''
  };

  confirmDialog = {
    visible: false,
    message: '',
    callback: () => { }
  };

  isView(v: string): boolean {
    return this.view === v;
  }

  setView(v: 'users' | 'roles') {
    this.view = v;
  }

  ngOnInit() {
    this.loadUsers();
    this.loadRoles();
  }

  ngOnDestroy() {
  }

  loadUsers() {
    this.adminService.getUsers().subscribe({
      next: (data) => {
        setTimeout(() => {
          this.users = data;
          this.cdr.detectChanges();
        }, 0);
      },
      error: () => this.showError("Erreur de chargement des utilisateurs.")
    });
  }

  loadRoles() {
    this.adminService.getRoles().subscribe({
      next: (data) => {
        setTimeout(() => {
          this.rolesList = data;
          this.cdr.detectChanges();
        }, 0);
      },
      error: () => this.showError("Erreur de chargement des rôles.")
    });
  }

  toggleForm() {
    this.showCreateForm = !this.showCreateForm;
    this.attemptedSave = false;
    if (!this.showCreateForm) this.resetForms();
  }

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /** Blocks numbers and special characters from being typed in the name field */
  onNameKeyDown(event: KeyboardEvent): void {
    // Allow: Backspace, Delete, Tab, Escape, Enter, arrow keys, Home, End
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (allowedKeys.includes(event.key)) return;
    // Allow Ctrl/Cmd combinations (copy, paste, etc.)
    if (event.ctrlKey || event.metaKey) return;
    // Allow only letters (a-z, A-Z) and accented characters (é, è, à, ê, ï, ô, û, etc.) and space
    const validChar = /^[a-zA-ZÀ-ÖØ-öø-ÿ\s\-']$/.test(event.key);
    if (!validChar) {
      event.preventDefault();
    }
  }

  isValidName(name: string): boolean {
    return /^[a-zA-ZÀ-ÖØ-öø-ÿ\s\-']+$/.test(name);
  }

  isValidPhone(phone: string): boolean {
    // Allows digits and the '+' prefix.
    return /^\+?[0-9\s]{8,15}$/.test(phone);
  }

  onSaveUser() {
    this.attemptedSave = true;

    const isNameValid = this.newUser.nomComplet && this.isValidName(this.newUser.nomComplet);
    const isEmailValid = this.newUser.email && this.isValidEmail(this.newUser.email);
    const isPhoneValid = this.newUser.telephone && this.isValidPhone(this.newUser.telephone);
    const isPassValid = this.isEditing || (this.newUser.password && this.newUser.password.length >= 10);
    const isRolesValid = this.newUser.roles.length > 0;

    if (!isNameValid || !isEmailValid || !isPhoneValid || !isPassValid || !isRolesValid) {
      this.showError("Veuillez corriger les erreurs avant d'enregistrer.");
      return;
    }

    this.loading = true;

    // Defensive timeout to prevent "stuck" state
    const timeout = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.showError("Le serveur met trop de temps à répondre. Veuillez réessayer.");
      }
    }, 10000);

    const action = this.isEditing && this.newUser.id
      ? this.adminService.updateUser(this.newUser.id, this.newUser)
      : this.adminService.createUser(this.newUser);

    action.subscribe({
      next: (res: any) => {
        clearTimeout(timeout);
        this.loading = false;
        this.attemptedSave = false;
        this.showSuccess(this.isEditing ? "L'utilisateur a été mis à jour avec succès." : "Le compte utilisateur a été créé avec succès.");
        this.resetForms();
        this.showCreateForm = false;
        this.loadUsers();
      },
      error: (err) => {
        clearTimeout(timeout);
        this.loading = false;
        this.showError(err.error?.error || err.error?.message || "Une erreur est survenue lors de l'enregistrement.");
      }
    });
  }

  onEditUser(user: any) {
    this.view = 'users';
    this.isEditing = true;
    this.showCreateForm = true;
    this.newUser = {
      id: user.id,
      nomComplet: user.nomComplet,
      email: user.email,
      password: '',
      roles: [...user.roles],
      telephone: user.telephone || '',
      compteActif: user.compteActif,
      emailVerifie: user.emailVerifie || false
    };
  }

  onToggleActive(id: number) {
    this.adminService.toggleUserActive(id).subscribe(() => {
      this.showSuccess("L'état du compte a été mis à jour.");
      this.loadUsers();
    });
  }

  onDelete(id: number) {
    this.confirmDialog = {
      visible: true,
      message: "Attention : supprimer définitivement cet utilisateur ? Cette action est irréversible.",
      callback: () => {
        this.adminService.deleteUser(id).subscribe(() => {
          this.showSuccess("L'utilisateur a été retiré de la plateforme.");
          this.loadUsers();
        });
      }
    };
  }

  onConfirm() {
    this.confirmDialog.callback();
    this.confirmDialog.visible = false;
  }

  viewUserProducts(user: any) {
    this.selectedUser = user;
    this.adminService.getUserProducts(user.id).subscribe(products => {
      this.selectedUserProducts = products;
    });
  }

  onSaveRole() {
    this.attemptedRoleSave = true;
    if (!this.newRole.name || this.newRole.name.length < 4) {
      this.showError("Le nom du rôle doit contenir au moins 4 caractères.");
      return;
    }
    if (!this.newRole.description || this.newRole.description.length < 10) {
      this.showError("La description doit contenir au moins 10 caractères.");
      return;
    }
    this.loading = true;

    const roleTimeout = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.showError("Le serveur ne répond pas assez vite pour la création du rôle.");
      }
    }, 10000);

    const action = this.isEditingRole && this.newRole.id
      ? this.adminService.updateRole(this.newRole.id, this.newRole)
      : this.adminService.createRole(this.newRole);

    action.subscribe({
      next: () => {
        clearTimeout(roleTimeout);
        this.loading = false;
        this.attemptedRoleSave = false;
        this.showSuccess("La configuration du rôle a été enregistrée avec succès.");
        this.resetForms();
        this.showCreateForm = false;
        this.loadRoles();
      },
      error: (err) => {
        clearTimeout(roleTimeout);
        this.loading = false;
        this.showError(err.error?.message || "Erreur lors de la sauvegarde du rôle technique.");
      }
    });
  }

  onEditRoleItem(role: any) {
    this.view = 'roles';
    this.isEditingRole = true;
    this.showCreateForm = true;
    this.newRole = { ...role };
  }

  onDeleteRoleItem(id: number) {
    this.confirmDialog = {
      visible: true,
      message: "Supprimer ce rôle technique ? Cela pourrait affecter les permissions des utilisateurs.",
      callback: () => {
        this.adminService.deleteRole(id).subscribe(() => {
          this.showSuccess("Le rôle a été supprimé.");
          this.loadRoles();
        });
      }
    };
  }

  // UTILS
  isRoleSelected(name: string): boolean {
    return this.newUser.roles.includes(name);
  }

  toggleRole(name: string) {
    const idx = this.newUser.roles.indexOf(name);
    if (idx > -1) this.newUser.roles.splice(idx, 1);
    else this.newUser.roles.push(name);
  }

  private showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 4000);
  }

  private showError(msg: string) {
    this.errorMessage = msg;
    setTimeout(() => this.errorMessage = '', 5000);
  }

  private resetForms() {
    this.loading = false;
    this.isEditing = false;
    this.isEditingRole = false;
    this.attemptedSave = false;
    this.attemptedRoleSave = false;
    this.newUser = { id: null, nomComplet: '', email: '', password: '', roles: [], telephone: '', compteActif: false, emailVerifie: false };
    this.newRole = { id: null, name: '', description: '' };
  }
}
