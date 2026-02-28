import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [RouterLink],
    template: `
    <footer class="footer">
      <div class="footer-container">

        <div class="footer-grid">
          <!-- Brand -->
          <div class="footer-brand">
            <div class="footer-logo">
              <span class="logo-icon">🛍️</span>
              <span class="logo-text">Souq<span class="logo-accent">Bladi</span></span>
            </div>
            <p class="footer-desc">
              La première plateforme e-commerce 100% marocaine.
              Achetez et vendez en toute confiance sur SouqBladi.
            </p>
            <div class="footer-social">
              <a href="#" class="social-link">📘</a>
              <a href="#" class="social-link">📸</a>
              <a href="#" class="social-link">🐦</a>
              <a href="#" class="social-link">📺</a>
            </div>
          </div>

          <!-- Links -->
          <div class="footer-links">
            <h4 class="footer-title">Découvrir</h4>
            <a routerLink="/home" class="footer-link">Accueil</a>
            <a routerLink="/categories" class="footer-link">Catégories</a>
            <a routerLink="/boutiques" class="footer-link">Boutiques</a>
            <a routerLink="/promotions" class="footer-link">Promotions</a>
          </div>

          <div class="footer-links">
            <h4 class="footer-title">Vendeurs</h4>
            <a routerLink="/register" class="footer-link">Devenir vendeur</a>
            <a href="#" class="footer-link">Étude de marché</a>
            <a href="#" class="footer-link">Centre d'aide vendeurs</a>
            <a href="#" class="footer-link">Tarifs et commissions</a>
          </div>

          <div class="footer-links">
            <h4 class="footer-title">Aide</h4>
            <a href="#" class="footer-link">Contact</a>
            <a href="#" class="footer-link">FAQ</a>
            <a href="#" class="footer-link">Livraison</a>
            <a href="#" class="footer-link">Retours & Remboursements</a>
          </div>
        </div>

        <div class="footer-bottom">
          <p>© 2025 SouqBladi — سوق بلادي. Tous droits réservés.</p>
          <div class="footer-bottom-links">
            <a href="#">Conditions d'utilisation</a>
            <a href="#">Politique de confidentialité</a>
          </div>
        </div>

      </div>
    </footer>
  `,
    styles: [`
    .footer {
      background: var(--sb-bg-alt);
      border-top: 1px solid var(--sb-border);
      padding: 60px 0 0;
      margin-top: 80px;
    }
    .footer-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 24px;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr 1fr;
      gap: 48px;
    }
    .footer-brand {}
    .footer-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }
    .logo-icon { font-size: 1.4rem; }
    .logo-text {
      font-family: 'Outfit', sans-serif;
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--sb-text);
    }
    .logo-accent { color: var(--sb-primary); }
    .footer-desc {
      font-size: 0.88rem;
      color: var(--sb-text-secondary);
      line-height: 1.7;
      margin-bottom: 20px;
    }
    .footer-social {
      display: flex;
      gap: 10px;
    }
    .social-link {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      border: 1.5px solid var(--sb-border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      transition: var(--sb-transition);
      text-decoration: none;
    }
    .social-link:hover {
      border-color: var(--sb-primary);
      transform: translateY(-2px);
      box-shadow: var(--sb-shadow-sm);
    }

    .footer-title {
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--sb-text);
      margin-bottom: 16px;
    }
    .footer-links {
      display: flex;
      flex-direction: column;
    }
    .footer-link {
      font-size: 0.88rem;
      color: var(--sb-text-secondary);
      text-decoration: none;
      padding: 6px 0;
      transition: 0.2s;
    }
    .footer-link:hover {
      color: var(--sb-primary);
      padding-left: 4px;
    }

    .footer-bottom {
      margin-top: 48px;
      padding: 24px 0;
      border-top: 1px solid var(--sb-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.82rem;
      color: var(--sb-text-muted);
    }
    .footer-bottom-links {
      display: flex;
      gap: 24px;
    }
    .footer-bottom-links a {
      color: var(--sb-text-muted);
      text-decoration: none;
      transition: 0.2s;
    }
    .footer-bottom-links a:hover { color: var(--sb-primary); }

    @media (max-width: 768px) {
      .footer-grid {
        grid-template-columns: 1fr;
        gap: 32px;
      }
      .footer-bottom {
        flex-direction: column;
        gap: 12px;
        text-align: center;
      }
    }
  `]
})
export class FooterComponent {
}
