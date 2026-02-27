import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UserDto } from '../services/user.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-page">
      <div class="hero-section">
        <h1>Mon <span>Profil</span></h1>
        <p>Gérez vos informations personnelles et votre compte.</p>
      </div>

      <div class="content-grid">
        <!-- Personal Info Section -->
        <div class="profile-card info-card">
          <div class="card-header">
            <div class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <h2>Informations Personnelles</h2>
          </div>
          
          <form (ngSubmit)="saveProfile()" #profileForm="ngForm">
            <div class="form-group">
              <label>Nom Complet</label>
              <input type="text" [(ngModel)]="profile.nomComplet" name="nomComplet" required>
            </div>
            
            <div class="form-group">
              <label>Email (Non modifiable)</label>
              <input type="email" [value]="profile.adresseEmail" disabled>
            </div>
            
            <div class="form-group">
              <label>Numéro de Téléphone</label>
              <input type="text" [(ngModel)]="profile.numeroDeTelephone" name="telephone">
            </div>

            <div class="form-footer">
              <button type="submit" class="btn-save" [disabled]="loading">
                {{ loading ? 'Enregistrement...' : 'Enregistrer les modifications' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Password Change Section -->
        <div class="profile-card password-card">
          <div class="card-header">
            <div class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <h2>Sécurité</h2>
          </div>
          <p class="subtitle">Changer votre mot de passe</p>

          <form (ngSubmit)="changePassword()" #passForm="ngForm">
            <div class="form-group">
              <label>Ancien mot de passe</label>
              <input type="password" [(ngModel)]="passwords.oldPassword" name="oldPassword" required>
            </div>
            
            <div class="form-group">
              <label>Nouveau mot de passe</label>
              <input type="password" [(ngModel)]="passwords.newPassword" name="newPassword" required minlength="6">
            </div>
            
            <div class="form-group">
              <label>Confirmer le nouveau mot de passe</label>
              <input type="password" [(ngModel)]="passwords.confirm" name="confirm" required>
            </div>

            <div class="form-footer">
              <button type="submit" class="btn-security" [disabled]="passLoading || !passForm.valid">
                {{ passLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe' }}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div class="success-toast" *ngIf="showSuccess">
        Modifications enregistrées avec succès !
      </div>
      <div class="error-toast" *ngIf="errorMsg">
        {{ errorMsg }}
      </div>
    </div>
  `,
  styles: [`
    .profile-page { padding: 40px; max-width: 1200px; margin: 0 auto; }
    
    .hero-section { margin-bottom: 40px; text-align: center; }
    .hero-section h1 { font-size: 2.5rem; font-weight: 900; color: #263238; }
    .hero-section h1 span { color: #4db6ac; }
    .hero-section p { color: #64748b; font-size: 1.1rem; }

    .content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }

    .profile-card { background: white; border-radius: 24px; padding: 30px; box-shadow: 0 10px 40px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
    .card-header { display: flex; align-items: center; gap: 15px; margin-bottom: 25px; }
    .card-header .icon { width: 45px; height: 45px; background: #e0f2f1; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
    .card-header h2 { font-size: 1.3rem; font-weight: 800; color: #263238; margin: 0; }

    .subtitle { color: #64748b; font-size: 0.9rem; margin-bottom: 20px; }

    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-weight: 700; font-size: 0.85rem; color: #475569; margin-bottom: 8px; }
    .form-group input { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1.5px solid #e2e8f0; font-size: 0.95rem; transition: 0.3s; box-sizing: border-box; }
    .form-group input:focus { outline: none; border-color: #4db6ac; box-shadow: 0 0 0 4px rgba(77, 182, 172, 0.1); }
    .form-group input:disabled { background: #f8fafc; color: #94a3b8; cursor: not-allowed; }

    .form-footer { margin-top: 30px; }
    .btn-save { width: 100%; background: #4db6ac; color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.3s; }
    .btn-save:hover:not(:disabled) { background: #00897b; transform: translateY(-2px); }
    
    .btn-security { width: 100%; background: #1e293b; color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.3s; }
    .btn-security:hover:not(:disabled) { background: #000; transform: translateY(-2px); }
    .btn-security:disabled { opacity: 0.5; cursor: not-allowed; }

    /* TOASTS */
    .success-toast { position: fixed; bottom: 30px; right: 30px; background: #059669; color: white; padding: 15px 25px; border-radius: 12px; font-weight: 700; animation: slideIn 0.3s ease-out; }
    .error-toast { position: fixed; bottom: 30px; right: 30px; background: #dc2626; color: white; padding: 15px 25px; border-radius: 12px; font-weight: 700; animation: slideIn 0.3s ease-out; }

    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

    @media (max-width: 900px) { .content-grid { grid-template-columns: 1fr; } }
  `]
})
export class UserProfileComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);

  profile: UserDto = { id: 0, nomComplet: '', adresseEmail: '', numeroDeTelephone: '', dateInscription: '' };
  passwords = { oldPassword: '', newPassword: '', confirm: '' };

  loading = false;
  passLoading = false;
  showSuccess = false;
  errorMsg = '';

  ngOnInit() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.userService.getProfile(userId).subscribe(p => this.profile = p);
    }
  }

  saveProfile() {
    this.loading = true;
    this.errorMsg = '';
    this.userService.updateProfile(this.profile.id, this.profile).subscribe({
      next: (updated) => {
        this.profile = updated;
        this.loading = false;
        this.triggerSuccess();
      },
      error: () => {
        this.loading = false;
        this.errorMsg = "Erreur lors de la mise à jour du profil.";
      }
    });
  }

  changePassword() {
    if (this.passwords.newPassword !== this.passwords.confirm) {
      this.errorMsg = "Les nouveaux mots de passe ne correspondent pas.";
      return;
    }

    this.passLoading = true;
    this.errorMsg = '';
    this.userService.changePassword(this.profile.id, this.passwords).subscribe({
      next: () => {
        this.passLoading = false;
        this.passwords = { oldPassword: '', newPassword: '', confirm: '' };
        this.triggerSuccess();
      },
      error: (err) => {
        this.passLoading = false;
        this.errorMsg = err.error?.message || "Erreur lors du changement de mot de passe.";
      }
    });
  }

  triggerSuccess() {
    this.showSuccess = true;
    setTimeout(() => this.showSuccess = false, 3000);
  }
}
