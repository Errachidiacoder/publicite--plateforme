import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page-v2">
      <div class="login-box">
        <h2 class="title">LOGIN</h2>
        
        <div class="status-banner error" *ngIf="errorMsg">{{ errorMsg }}</div>
        <div class="status-banner success" *ngIf="successMsg">{{ successMsg }}</div>

        <form (ngSubmit)="onLogin()" #loginForm="ngForm">
          <div class="input-container">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <input type="email" [(ngModel)]="loginData.email" name="email" placeholder="Email" required [disabled]="loading">
          </div>
          
          <div class="input-container">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input type="password" [(ngModel)]="loginData.password" name="password" placeholder="••••••••" required [disabled]="loading">
          </div>

          <div class="options">
            <label class="checkbox-container">
              <input type="checkbox" name="remember">
              <span class="checkmark"></span>
              Remember me
            </label>
          </div>

          <button type="submit" class="btn-login" [disabled]="loading || !loginForm.form.valid">
            <span *ngIf="!loading">LOGIN</span>
            <span *ngIf="loading" class="spinner"></span>
          </button>
        </form>

        <div class="social-text">Or login with</div>
        
        <div class="social-btns">
          <button (click)="onSocialLogin('facebook')" class="social-btn fb">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Facebook
          </button>
          <button (click)="onSocialLogin('google')" class="social-btn google">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636C.732 21 0 20.268 0 19.364V5.457c0-.904.732-1.636 1.636-1.636h3.819l6.545 4.91 6.545-4.91h3.819c.904 0 1.636.732 1.636 1.636z"/></svg>
            Gmail
          </button>
        </div>

        <div class="footer">
          Not a member? <a routerLink="/register">Sign up now</a>
        </div>
      </div>
      <!-- Wave background -->
      <div class="wave-bg">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="rgba(255,255,255,0.15)" fill-opacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </div>
  `,
  styles: [`
    .auth-page-v2 {
      min-height: 100vh;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      background: linear-gradient(135deg, #00796b 0%, #4db6ac 100%);
      margin: -40px -24px;
      padding: 60px 20px 20px;
      position: relative;
      overflow: hidden;
    }
    .auth-page-v2::before {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: radial-gradient(#ffffff 1px, transparent 1px);
      background-size: 20px 20px;
      opacity: 0.1;
      z-index: 1;
    }
    .wave-bg {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      line-height: 0;
      z-index: 1;
    }
    .wave-bg svg {
      position: relative;
      display: block;
      width: calc(100% + 1.3px);
      height: 200px;
    }

    .login-box {
      z-index: 10;
      background: #fff;
      padding: 40px 30px;
      border-radius: 4px;
      box-shadow: 0 15px 40px rgba(0,0,0,0.25);
      width: 360px;
      max-width: 100%;
      text-align: center;
    }
    .title {
      font-size: 1.5rem;
      font-weight: 800;
      color: #333;
      margin-bottom: 30px;
      letter-spacing: 1px;
    }
    
    .input-container {
      background: #f2f2f2;
      border-radius: 2px;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      padding: 0 15px;
      transition: 0.3s;
    }
    .input-container .icon { width: 18px; color: #999; }
    .input-container input {
      background: transparent;
      border: none;
      padding: 15px 12px;
      width: 100%;
      font-size: 0.85rem;
      outline: none;
      color: #333;
    }

    .options {
      text-align: left;
      margin: 20px 0;
    }
    .checkbox-container {
      display: block;
      position: relative;
      padding-left: 25px;
      cursor: pointer;
      font-size: 0.85rem;
      color: #666;
      user-select: none;
    }
    .checkbox-container input { position: absolute; opacity: 0; cursor: pointer; height: 0; width: 0; }
    .checkmark {
      position: absolute;
      top: 2px;
      left: 0;
      height: 16px;
      width: 16px;
      background-color: #eee;
      border-radius: 2px;
    }
    .checkbox-container:hover input ~ .checkmark { background-color: #ccc; }
    .checkbox-container input:checked ~ .checkmark { background-color: #4db6ac; }
    .checkmark:after {
      content: "";
      position: absolute;
      display: none;
      left: 5px;
      top: 1px;
      width: 4px;
      height: 8px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
    .checkbox-container input:checked ~ .checkmark:after { display: block; }

    .btn-login {
      width: 100%;
      background: #4db6ac;
      color: #fff;
      border: none;
      padding: 14px;
      font-weight: 800;
      font-size: 0.85rem;
      border-radius: 2px;
      cursor: pointer;
      transition: 0.3s;
      letter-spacing: 1px;
      margin-bottom: 25px;
    }
    .btn-login:hover:not(:disabled) { background: #00796b; }
    .btn-login:disabled { opacity: 0.6; cursor: not-allowed; }

    .social-text {
      color: #999;
      font-size: 0.8rem;
      margin-bottom: 20px;
      position: relative;
    }
    .social-btns {
      display: flex;
      gap: 10px;
      margin-bottom: 40px;
    }
    .social-btn {
      flex: 1;
      padding: 12px;
      border: 1px solid #eee;
      background: #fff;
      font-size: 0.75rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #333;
      cursor: pointer;
      transition: 0.3s;
    }
    .social-btn:hover { background: #f9f9f9; border-color: #4db6ac; color: #4db6ac; }
    .social-btn.fb { color: #3b5998; }
    .social-btn.google { color: #db4437; }

    .footer { font-size: 0.8rem; color: #999; }
    .footer a { color: #4db6ac; text-decoration: none; font-weight: 700; }
    .footer a:hover { text-decoration: underline; }

    .status-banner { padding: 12px; border-radius: 2px; font-size: 0.8rem; font-weight: 600; margin-bottom: 20px; text-align: left; }
    .status-banner.error { background: #ffebee; color: #c62828; }
    .status-banner.success { background: #e8f5e9; color: #2e7d32; }

    .spinner {
      width: 18px;
      height: 18px;
      border: 3px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginData = { email: '', password: '' };
  loading = false;
  errorMsg = '';
  successMsg = '';

  ngOnInit() {
    // Check if redirecting back from social login
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        const authData = {
          token: params['token'],
          email: params['email'],
          nomComplet: params['name'],
          role: params['role'],
          id: +params['id']
        };
        // Use an internal method to save the session (simulating successful login)
        (this.authService as any).saveSession(authData);
        this.successMsg = 'Connexion sociale réussie ! Redirection...';
        setTimeout(() => this.router.navigate(['/home']), 1000);
      }
    });
  }

  onSocialLogin(provider: string) {
    // Redirect to backend social auth endpoint
    window.location.href = `http://localhost:8081/oauth2/authorization/${provider}`;
  }

  onLogin() {
    if (this.loading) return;
    this.errorMsg = '';
    this.successMsg = '';
    this.loading = true;

    this.authService.login(this.loginData).subscribe({
      next: () => {
        this.successMsg = 'Connexion réussie ! Redirection...';
        setTimeout(() => this.router.navigate(['/home']), 1000);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 0) {
          this.errorMsg = 'Impossible de contacter le serveur. Vérifiez que le backend est démarré.';
        } else if (err.status === 401 || err.status === 403) {
          this.errorMsg = 'Email ou mot de passe incorrect.';
        } else if (err.status === 404) {
          this.errorMsg = 'Aucun compte trouvé avec cet email.';
        } else {
          this.errorMsg = `Erreur lors de la connexion (${err.status}). Veuillez réessayer.`;
        }
      }
    });
  }
}
