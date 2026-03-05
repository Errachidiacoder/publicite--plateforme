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
              <div class="footer-logo-mark">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M4 21V10.5C4 9.12 4.84 7.9 6 7.34V5a1 1 0 011-1h10a1 1 0 011 1v2.34C19.16 7.9 20 9.12 20 10.5V21" stroke="white" stroke-width="1.7" stroke-linecap="round"/>
                  <path d="M9 21v-5a3 3 0 016 0v5" stroke="white" stroke-width="1.7" stroke-linecap="round"/>
                  <path d="M4 10.5C4 9.12 5.34 8 12 8s8 1.12 8 2.5" stroke="white" stroke-width="1.7" stroke-linecap="round"/>
                </svg>
              </div>
              <span class="footer-logo-name">Souq<span class="logo-accent">Bladi</span></span>
            </div>
            <p class="footer-desc">
              La marketplace marocaine qui connecte vendeurs et acheteurs partout au Maroc. سوق بلادي
            </p>
            <div class="footer-social">
              <a href="#" class="social-btn" title="Facebook">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
              </a>
              <a href="#" class="social-btn" title="Instagram">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke-width="2.5"/>
                </svg>
              </a>
              <a href="#" class="social-btn" title="Twitter / X">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                </svg>
              </a>
              <a href="#" class="social-btn" title="YouTube">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z"/>
                  <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Col 1 : Plateforme -->
          <div class="footer-col">
            <h4>Plateforme</h4>
            <a routerLink="/marketplace">Marketplace</a>
            <a routerLink="/services">Services</a>
            <a routerLink="/annonces">Annonces</a>
            <a routerLink="/emploi">Emploi</a>
            <a routerLink="/immobilier">Immobilier</a>
          </div>

          <!-- Col 2 : Vendeurs -->
          <div class="footer-col">
            <h4>Vendeurs</h4>
            <a routerLink="/register">Ouvrir ma boutique</a>
            <a href="#">Étude de marché</a>
            <a href="#">Tableau de bord</a>
            <a href="#">Livraison intégrée</a>
            <a href="#">Tarifs & commissions</a>
          </div>

          <!-- Col 3 : Support -->
          <div class="footer-col">
            <h4>Support</h4>
            <a href="#">Centre d'aide</a>
            <a href="#">Nous contacter</a>
            <a href="#">FAQ</a>
            <a href="#">CGU</a>
            <a href="#">Confidentialité</a>
          </div>

        </div>

        <!-- Bottom bar -->
        <div class="footer-bottom">
          <span class="footer-copy">© 2025 SouqBladi — سوق بلادي. Tous droits réservés.</span>
          <div class="footer-badges">
            <span class="footer-badge">🇲🇦 Fait au Maroc</span>
            <span class="footer-badge">🔒 SSL Sécurisé</span>
            <span class="footer-badge">💳 Paiement sécurisé</span>
          </div>
        </div>

      </div>
    </footer>
  `,
  styles: [`
    /* ════════════════════════════════════════
       SOUQBLADI FOOTER — Design Redesign
       Fond sombre (--text) · accent emerald
    ════════════════════════════════════════ */

    .footer {
      background: #0d1b2a;
      color: rgba(255,255,255,0.75);
      padding: 48px 0 0;
      margin-top: 80px;
    }

    .footer-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 48px;
    }

    /* ── Grid ── */
    .footer-grid {
      display: grid;
      grid-template-columns: 1.7fr 1fr 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
    }

    /* ── Brand ── */
    .footer-brand {}

    .footer-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 14px;
    }

    .footer-logo-mark {
      width: 36px; height: 36px;
      background: linear-gradient(135deg, #00b894, #00826b);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 14px rgba(0,184,148,0.35);
    }

    .footer-logo-name {
      font-size: 18px;
      font-weight: 800;
      color: white;
      letter-spacing: -0.3px;
    }

    .logo-accent { color: #00b894; }

    .footer-desc {
      font-size: 13px;
      line-height: 1.7;
      color: rgba(255,255,255,0.45);
      margin-bottom: 20px;
      max-width: 280px;
    }

    /* ── Social ── */
    .footer-social { display: flex; gap: 8px; }

    .social-btn {
      width: 34px; height: 34px;
      border-radius: 9px;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.1);
      display: flex; align-items: center; justify-content: center;
      color: rgba(255,255,255,0.55);
      cursor: pointer; transition: all 0.2s;
      text-decoration: none;
    }
    .social-btn:hover {
      background: #00b894;
      color: white;
      border-color: #00b894;
      transform: translateY(-2px);
    }

    /* ── Columns ── */
    .footer-col {}

    .footer-col h4 {
      font-size: 12px;
      font-weight: 800;
      color: white;
      margin-bottom: 16px;
      letter-spacing: 0.8px;
      text-transform: uppercase;
    }

    .footer-col a {
      display: block;
      font-size: 13px;
      color: rgba(255,255,255,0.48);
      text-decoration: none;
      margin-bottom: 9px;
      transition: all 0.2s;
      padding-left: 0;
    }
    .footer-col a:hover {
      color: #00d4a8;
      padding-left: 4px;
    }

    /* ── Bottom bar ── */
    .footer-bottom {
      border-top: 1px solid rgba(255,255,255,0.08);
      padding: 20px 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }

    .footer-copy {
      font-size: 12px;
      color: rgba(255,255,255,0.3);
    }

    .footer-badges {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .footer-badge {
      padding: 4px 10px;
      border-radius: 6px;
      background: rgba(255,255,255,0.06);
      font-size: 11px;
      color: rgba(255,255,255,0.4);
      border: 1px solid rgba(255,255,255,0.1);
    }

    /* ══ RESPONSIVE ══ */
    @media (max-width: 1024px) {
      .footer-container { padding: 0 28px; }
      .footer-grid { grid-template-columns: 1.4fr 1fr 1fr; gap: 32px; }
      .footer-brand { grid-column: 1 / -1; }
      .footer-grid { grid-template-columns: 1fr 1fr 1fr; }
    }
    @media (max-width: 768px) {
      .footer { padding: 36px 0 0; }
      .footer-container { padding: 0 20px; }
      .footer-grid { grid-template-columns: 1fr 1fr; gap: 28px; }
      .footer-brand { grid-column: 1 / -1; }
      .footer-desc { max-width: 100%; }
    }
    @media (max-width: 480px) {
      .footer-grid { grid-template-columns: 1fr; }
      .footer-bottom { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class FooterComponent {}