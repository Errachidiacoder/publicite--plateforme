import { Component, OnInit, inject, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../services/auth.service';
import { CategorieService } from '../services/category.service';
import { AnonceService } from '../services/anonce.service';
import { MarketProductService } from '../services/market-product.service';
import { ServiceOffreService } from '../services/service-offre.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `

    <!-- ══ HERO ══ -->
    <section class="hero">
      <div class="hero-left">
        <h1 class="hero-title">Trouvez tout ce que vous cherchez, <span>au bon prix</span></h1>
        <p class="hero-subtitle">Le marketplace de confiance pour acheter, vendre et offrir des services partout au Maroc.</p>
        <div class="hero-actions">
          <a routerLink="/annonces" class="btn btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 8px;"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            Parcourir les annonces
          </a>
          <a routerLink="/submit-product" class="btn btn-outline-hero">Insérer une annonce</a>
        </div>
      </div>

      <div class="hero-right">
        <div class="hero-right-label">Annonces récentes</div>
        <div class="hero-cards-grid">
          @for (a of annoncesHero; track a.id) {
            <a class="h-card" [routerLink]="['/product', a.id]">
              <div class="h-card-ico">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" stroke-width="1.8">
                  <path d="M20 7h-9"/><path d="M14 17H5"/>
                  <circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>
                </svg>
              </div>
              <div class="h-card-body">
                <div class="h-card-title">{{ a.titre }}</div>
                <div class="h-card-cat">{{ a.categorie }}</div>
                <div class="h-card-price">{{ a.prix }}</div>
                <div class="h-card-loc">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {{ a.ville }}
                </div>
              </div>
            </a>
          }
          @if (annoncesHero.length === 0) {
            <div class="h-card-skeleton"></div>
            <div class="h-card-skeleton"></div>
            <div class="h-card-skeleton"></div>
            <div class="h-card-skeleton"></div>
          }
          <a class="hero-see-all" routerLink="/annonces">Voir toutes →</a>
        </div>
      </div>
    </section>

    <!-- ══ CAT STRIP ══ -->
    <div class="cat-nav-wrapper">
      <div class="cat-nav-container">
        <button class="nav-arrow prev" (click)="scrollCats(-1)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="cat-nav-scroll" #catScroll>
          <div class="cat-nav-item" [class.active]="selectedCategory === 'Marketplace'" (click)="filterByCategory('Marketplace')">
            <div class="cat-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            </div>
            <span class="cat-label">Marketplace</span>
          </div>
          @for (cat of categories; track cat.id) {
            <div class="cat-nav-item" [class.active]="selectedCategory === cat.nomCategorie" (click)="filterByCategory(cat.nomCategorie)">
              <div class="cat-icon-box" [innerHTML]="getCatIcon(cat.nomCategorie)"></div>
              <span class="cat-label">{{ cat.nomCategorie }}</span>
            </div>
          }
        </div>
        <button class="nav-arrow next" (click)="scrollCats(1)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>

    <!-- ══ ANNONCES POPULAIRES + PRODUITS EN VEDETTE ══ -->
    <div class="main-section">

      <aside class="sidebar">
        <div class="sidebar-card">
          <div class="sidebar-head">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" stroke-width="2.2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Annonces populaires
          </div>
          @for (a of annoncesPopular.slice(0, 4); track a.id) {
            <a class="pop-item" [routerLink]="['/product', a.id]">
              <div class="pop-ico">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m3 11 18-5v12L3 14v-3z"></path>
                  <path d="M11.6 16.8 a3 3 0 1 1-5.8-0.8"></path>
                </svg>
              </div>
              <div class="pop-info">
                <div class="pop-name">{{ a.titre }}</div>
                <div class="pop-sub">{{ a.categorie }}</div>
                <div class="pop-price">{{ a.prix }}</div>
                <div class="pop-loc">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {{ a.ville }}
                </div>
              </div>
              <div class="pop-fav" (click)="$event.preventDefault()">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
              </div>
            </a>
          }
          @if (annoncesPopular.length === 0) {
            <div class="empty-small">Aucune annonce populaire</div>
          }
        </div>
      </aside>

      <div class="section-main">
        <div class="sec-head">
          <div class="sec-title">
            <div class="sec-title-dot"></div>
            Sélection Premium
          </div>
          <a class="see-all" routerLink="/marketplace">
            Tout voir
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </a>
        </div>
        <div class="products-grid">
          @for (p of produitsVedettes.slice(0, 6); track p.id) {
            <div class="prod-card" [routerLink]="['/market-products', p.id]">
              <div class="prod-img">
                <img [src]="p.image" [alt]="p.nom" loading="lazy">
                @if (p.badge) { <span class="prod-badge discount">{{ p.badge }}</span> }
                <div class="prod-fav-btn" (click)="$event.stopPropagation()">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                </div>
              </div>
              <div class="prod-body">
                <div class="prod-name">{{ p.nom }}</div>
                <div class="prod-cat">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {{ p.ville || 'Maroc' }}
                </div>
                <div class="prod-foot">
                  <span class="prod-price">{{ p.prix }}</span>
                  <span class="prod-stars">★★★★★</span>
                </div>
              </div>
            </div>
          }
          @if (produitsVedettes.length === 0 && !loading) {
            <div class="empty-small span-3">Aucun produit vedette pour le moment</div>
          }
        </div>
        <div class="center-btn">
          <button class="btn-outline" routerLink="/marketplace">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            Voir tous les produits
          </button>
        </div>
      </div>
    </div>

    <!-- ══ CTA BANNER ══ -->
      <section class="cta-banner">
        <div class="cta-card">
          <div class="cta-glass-glow"></div>
          <div class="cta-content">
            <div class="cta-badge-wrap">
              <span class="cta-badge">OFFRE PROFESSIONNELLE</span>
            </div>
            <h2 class="cta-title">Donnez une nouvelle dimension à <span>votre activité</span></h2>
            <p class="cta-text">Vendez partout au Maroc dès maintenant et touchez des milliers de clients potentiels.</p>
            
            <div class="cta-grid-actions">
              <button class="btn btn-cta-main" routerLink="/register">
                <div class="btn-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                </div>
                <span>Ouvrir ma boutique</span>
              </button>
              
              <div class="cta-side-actions">
                <a routerLink="/publish-service" class="btn btn-cta-outline-glass">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
                  Publier un service
                </a>
                <a routerLink="/submit-product" class="btn btn-cta-outline-glass">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                  Insérer une annonce
                </a>
              </div>
            </div>
          </div>
          <div class="cta-decoration">
            <div class="cta-blob-glow blob-1"></div>
            <div class="cta-blob-glow blob-2"></div>
            <div class="cta-pattern"></div>
          </div>
        </div>
      </section>

    <!-- ══ ANNONCES RÉCENTES + SERVICES DISPONIBLES ══ -->
    <div class="main-section" style="padding-top: 0;">

      <aside class="sidebar">
        <div class="sidebar-card">
          <div class="sidebar-head">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--saffron)" stroke-width="2.2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Annonces récentes
          </div>
          @for (a of annoncesPopular.slice(4, 8); track a.id) {
            <a class="pop-item" [routerLink]="['/product', a.id]">
              <div class="pop-ico">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m3 11 18-5v12L3 14v-3z"></path>
                  <path d="M11.6 16.8 a3 3 0 1 1-5.8-0.8"></path>
                </svg>
              </div>
              <div class="pop-info">
                <div class="pop-name">{{ a.titre }}</div>
                <div class="pop-sub">{{ a.categorie }}</div>
                <div class="pop-price">{{ a.prix }}</div>
                <div class="pop-loc">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {{ a.ville }}
                </div>
              </div>
              <div class="pop-fav" (click)="$event.preventDefault()">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
              </div>
            </a>
          }
          @if (annoncesPopular.length < 5) {
            <div class="empty-small">Aucune annonce récente</div>
          }
          <div class="sidebar-foot" style="margin-top: 15px; border-top: 1px solid var(--border); padding-top: 15px;">
            <a class="see-all" routerLink="/annonces" style="justify-content: center; width: 100%;">
              Voir tous les annonces
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </a>
          </div>
        </div>
      </aside>

      <div class="section-main">
        <div class="sec-head">
          <div class="sec-title">
            <div class="sec-title-dot" style="background: var(--saffron)"></div>
            Services disponibles
          </div>
          <a class="see-all" routerLink="/services">
            Tout voir
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </a>
        </div>
        <div class="services-grid">
          @for (s of services.slice(0, 6); track s.id) {
            <a class="svc-card" [routerLink]="['/service', s.id]">
              <div class="svc-icon-wrap">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              </div>
              <div class="svc-name">{{ s.titre }}</div>
              <div class="svc-desc">{{ s.ville }} — {{ s.typeContrat }}</div>
              <div class="svc-seller">
                <div class="svc-avatar">{{ (s.demandeurNom || s.titre)?.charAt(0)?.toUpperCase() }}</div>
                {{ s.demandeurNom || 'Utilisateur' }}
              </div>
              <div class="svc-foot">
                <span class="svc-price">Dès {{ s.prix }}</span>
                <span class="svc-tag" [class.onsite]="s.typeContrat === 'Sur site'" [class.hybrid]="s.typeContrat === 'Hybride'">
                  {{ s.typeContrat }}
                </span>
              </div>
            </a>
          }
          @if (services.length === 0) {
            <div class="empty-small span-3">Aucun service disponible pour le moment</div>
          }
        </div>
        <div class="center-btn">
          <button class="btn-outline" routerLink="/services">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            Voir tous les services
          </button>
        </div>
      </div>
    </div>



  `,
  styles: [`
    /* ════════════════════════════════════════
       SOUQBLADI HOME — Design Redesign
       Palette : emerald #00b894 · saffron #f39c12 · cobalt #2c3e6b
    ════════════════════════════════════════ */
    :host {
      --emerald:       #00b894;
      --emerald-deep:  #00826b;
      --emerald-glow:  #00d4a8;
      --emerald-soft:  #e6faf6;
      --emerald-mid:   #b2ede3;
      --saffron:       #f39c12;
      --saffron-light: #fff8e6;
      --rouge:         #e74c3c;
      --cobalt:        #2c3e6b;
      --cobalt-light:  #eef0f7;
      --turquoise:     #1abc9c; /* New turquoise variable */
      --text:          var(--sb-text,           #0d1b2a);
      --text-mid:      var(--sb-text-secondary, #4a5568);
      --text-light:    var(--sb-text-muted,     #8fa0b5);
      --bg:            var(--sb-bg,             #f7fbfa);
      --white:         var(--sb-bg-elevated,    #ffffff);
      --border:        var(--sb-border,         #dde8e5);
      --shadow-lg:     0 8px 40px rgba(0,184,148,0.13);
      --shadow-md:     0 4px 18px rgba(0,0,0,0.07);
      --radius-lg:     18px;
      --radius-md:     12px;
      display: block;
      background: var(--bg);
    }

    /* ══ HERO ══ */
    .hero {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      padding: 0 48px;
      gap: 40px;
      align-items: center;
      background: linear-gradient(150deg, #eafaf6 0%, #f7fbfa 50%, #fffbf0 100%);
      min-height: 380px;
      position: relative;
      overflow: hidden;
      z-index: 1; /* Ensure hero content is above pseudo-elements */
    }
    .hero::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300b894' fill-opacity='0.04'%3E%3Cpath d='M40 0l3.09 12.26L56 6.91l-6.91 9.18L62 20.27l-12.26 3.09L56 37.64l-9.18-6.91L40 44l-6.82-13.27L24 37.64l6.26-14.28L18 20.27l13.91-4.18L25 6.91z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 0; /* Ensure pattern is behind content */
    }
    .hero-left {
      padding: 40px 0;
      position: relative;
      z-index: 2;
    }
    .hero-title {
      font-family: 'Outfit', sans-serif;
      font-size: 2.8rem;
      font-weight: 800;
      color: #1e293b;
      line-height: 1.15;
      margin-bottom: 20px;
      letter-spacing: -0.02em;
    }
    .hero-title span {
      color: var(--emerald);
    }
    .hero-subtitle {
      font-size: 1.1rem;
      color: #64748b;
      margin-bottom: 32px;
      line-height: 1.6;
      max-width: 480px;
    }
    .hero-actions {
      display: flex;
      gap: 16px;
    }
    .btn {
      padding: 12px 24px;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .btn-primary {
      background: linear-gradient(135deg, var(--emerald), var(--emerald-deep));
      color: white;
      border: none;
      box-shadow: 0 4px 15px rgba(0, 184, 148, 0.3);
    }
    .btn-outline-hero {
      padding: 12px 28px;
      border: 2px solid var(--emerald);
      background: white;
      color: var(--emerald);
      border-radius: 12px;
      font-weight: 700;
      text-decoration: none;
      transition: 0.3s;
    }
    .btn-outline-hero:hover {
      background: var(--emerald-soft);
      transform: translateY(-2px);
    }
    .hero-right {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .hero-right-label {
      font-size: 13px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }
    .hero-cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .h-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px;
      text-decoration: none;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }
    .h-card:hover {
      border-color: var(--emerald);
      box-shadow: 0 8px 20px rgba(0,0,0,0.06);
      transform: translateY(-2px);
    }
    .h-card-ico {
      width: 40px; height: 40px;
      background: #f0fdf4;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .h-card-body { 
      min-width: 0;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .h-card-title { font-size: 13px; font-weight: 700; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .h-card-cat { font-size: 11px; color: #64748b; }
    .h-card-price { font-size: 13px; font-weight: 800; color: var(--emerald); margin-top: 2px; }
    .h-card-loc { font-size: 10px; color: #94a3b8; display: flex; align-items: center; gap: 4px; margin-top: 1px; }
    .h-card-skeleton {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      height: 60px;
      animation: skeleton-pulse 1.5s infinite ease-in-out;
    }
    @keyframes skeleton-pulse {
      0% { opacity: 0.5; }
      50% { opacity: 0.8; }
      100% { opacity: 0.5; }
    }
    .hero-see-all {
      grid-column: 1 / -1;
      text-align: center;
      padding: 10px;
      font-size: 12px;
      font-weight: 700;
      color: var(--emerald);
      border: 2px dashed #d1fae5;
      border-radius: 12px;
      background: #f0fdf4;
      text-decoration: none;
      transition: 0.2s;
    }
    .hero-see-all:hover {
      background: white;
      border-color: var(--emerald);
    }

    /* ══ CAT NAVIGATION ══ */
    .cat-nav-wrapper {
      background: var(--emerald);
      padding: 8px 0;
      position: relative;
      z-index: 10;
    }
    .cat-nav-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 40px;
      display: flex;
      align-items: center;
      position: relative;
    }
    .cat-nav-scroll {
      display: flex;
      overflow-x: auto;
      gap: 24px;
      padding: 4px 0;
      scrollbar-width: none;
      scroll-behavior: smooth;
      flex: 1;
    }
    .cat-nav-scroll::-webkit-scrollbar { display: none; }
    
    .cat-nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      flex-shrink: 0;
      color: white;
      transition: 0.3s;
      min-width: 70px;
    }
    .cat-nav-item:hover { transform: translateY(-2px); opacity: 1; }
    .cat-nav-item.active { opacity: 1; font-weight: 800; }

    .cat-icon-box {
      width: 22px; height: 22px;
      display: flex; align-items: center; justify-content: center;
      color: white;
      transition: 0.3s;
    }
    .cat-icon-box ::ng-deep svg { width: 22px; height: 22px; stroke: currentColor; stroke-width: 1.5; }
    
    .cat-label {
      font-size: 11px;
      font-weight: 600;
      color: white;
      text-align: center;
      white-space: nowrap;
    }

    .nav-arrow {
      position: absolute;
      top: 50%; transform: translateY(-50%);
      width: 32px; height: 32px;
      background: rgba(255,255,255,0.2);
      border: none;
      border-radius: 50%;
      color: white;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      z-index: 20;
      transition: 0.3s;
      backdrop-filter: blur(4px);
    }
    .nav-arrow:hover { background: rgba(255,255,255,0.4); }
    .nav-arrow.prev { left: 10px; }
    .nav-arrow.next { right: 10px; }

    /* ══ MAIN LAYOUT ══ */
    .main-section { padding: 40px 48px 32px; display: flex; gap: 32px; }
    .sidebar { width: 320px; flex-shrink: 0; }
    .section-main { flex: 1; min-width: 0; }

    .sidebar-card {
      background: var(--white); border: 1.5px solid var(--border);
      border-radius: var(--radius-lg); padding: 18px; margin-bottom: 20px;
      box-shadow: var(--shadow-md);
    }
    .sidebar-head {
      display: flex; align-items: center; gap: 8px;
      font-size: 14px; font-weight: 800; margin-bottom: 14px; color: var(--text);
    }
    .pop-item {
      display: flex; gap: 14px; align-items: center;
      padding: 12px 14px; border: 1.5px solid var(--border);
      border-radius: var(--radius-md); margin-bottom: 10px;
      cursor: pointer; transition: all 0.2s; background: var(--bg);
      text-decoration: none; color: inherit;
    }
    .pop-item:hover { border-color: var(--emerald); background: var(--emerald-soft); box-shadow: 0 2px 12px rgba(0,184,148,0.1); }
    .pop-ico {
      width: 48px; height: 48px; min-width: 48px;
      background: var(--emerald-soft); border-radius: 11px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .pop-info { min-width: 0; flex: 1; }
    .pop-name { font-size: 12px; font-weight: 700; margin-bottom: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .pop-sub { font-size: 10px; color: var(--text-light); margin-bottom: 3px; }
    .pop-price { font-size: 12px; font-weight: 800; color: var(--emerald); }
    .pop-loc { font-size: 9px; color: var(--text-light); display: flex; align-items: center; gap: 3px; margin-top: 1px; }
    .pop-fav { flex-shrink: 0; color: var(--text-light); cursor: pointer; transition: color 0.2s; }
    .pop-fav:hover { color: var(--rouge); }

    /* Section headers */
    .sec-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
    .sec-title { display: flex; align-items: center; gap: 9px; font-size: 17px; font-weight: 800; color: var(--text); }
    .sec-title-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--emerald); flex-shrink: 0; }
    .see-all { display: flex; align-items: center; gap: 5px; font-size: 13px; color: var(--emerald); font-weight: 700; text-decoration: none; transition: gap 0.2s; }
    .see-all:hover { gap: 8px; }

    /* Products */
    .products-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
    .prod-card {
      background: var(--white); border: 1.5px solid var(--border);
      border-radius: var(--radius-lg); overflow: hidden;
      cursor: pointer; transition: all 0.25s; box-shadow: var(--shadow-md);
      text-decoration: none; color: inherit; display: block;
    }
    .prod-card:hover { border-color: var(--emerald); transform: translateY(-3px); box-shadow: var(--shadow-lg); }
    .prod-img {
      height: 110px; display: flex; align-items: center; justify-content: center;
      position: relative; background: var(--emerald-soft); overflow: hidden;
    }
    .prod-img img { width: 100%; height: 100%; object-fit: cover; }
    .prod-badge {
      position: absolute; top: 10px; left: 10px;
      padding: 4px 9px; border-radius: 7px; font-size: 10px; font-weight: 800;
    }
    .prod-badge.discount { background: var(--rouge); color: white; }
    .prod-fav-btn {
      position: absolute; top: 8px; right: 8px;
      width: 32px; height: 32px; background: var(--white); border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12); cursor: pointer;
      color: var(--text-light); transition: color 0.2s;
    }
    .prod-fav-btn:hover { color: var(--rouge); }
    .prod-body { padding: 8px; }
    .prod-name { font-size: 11px; font-weight: 700; margin-bottom: 2px; line-height: 1.25; color: var(--text); }
    .prod-cat { font-size: 9px; color: var(--text-light); margin-bottom: 4px; display: flex; align-items: center; gap: 3px; }
    .prod-foot { display: flex; align-items: center; justify-content: space-between; }
    .prod-price { font-size: 13px; font-weight: 800; color: var(--emerald); }
    .prod-stars { font-size: 8px; color: var(--saffron); }

    .center-btn { text-align: center; margin-bottom: 12px; }
    .btn-outline {
      display: inline-flex; align-items: center; gap: 8px;
      background: var(--white); color: var(--emerald);
      border: 2px solid var(--emerald); padding: 12px 28px;
      border-radius: 12px; font-size: 14px; font-weight: 700;
      cursor: pointer; font-family: inherit; transition: all 0.2s;
    }
    .btn-outline:hover { background: var(--emerald); color: white; }

    /* ══ CTA BANNER (Attractive v3) ══ */
    .cta-banner { padding: 10px 48px 40px; }
    .cta-card {
      background: #00826b;
      background: linear-gradient(135deg, #00826b 0%, #00b894 100%);
      border-radius: 24px;
      padding: 30px 40px;
      text-align: center;
      color: white;
      position: relative;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0, 184, 148, 0.3);
      max-width: 800px;
      margin: 0 0 0 auto;
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .cta-card:hover { transform: translateY(-4px); }
    
    .cta-glass-glow {
      position: absolute; inset: 0;
      background: radial-gradient(circle at 10% 20%, rgba(255,255,255,0.1) 0%, transparent 40%),
                  radial-gradient(circle at 90% 80%, rgba(255,255,255,0.08) 0%, transparent 40%);
      z-index: 1;
    }
    .cta-content { position: relative; z-index: 3; }
    
    .cta-badge-wrap { margin-bottom: 12px; }
    .cta-badge {
      font-size: 9px; font-weight: 800; color: white;
      padding: 4px 10px; border-radius: 100px;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.25);
      letter-spacing: 1.2px; text-transform: uppercase;
      backdrop-filter: blur(4px);
    }

    .cta-title {
      font-size: 1.6rem;
      font-weight: 800;
      line-height: 1.25;
      margin-bottom: 8px;
    }
    .cta-title span { color: #ccfbf1; position: relative; }
    
    .cta-text {
      font-size: 0.95rem;
      color: rgba(255,255,255,0.9);
      margin-bottom: 22px;
      max-width: 540px;
      margin-left: auto; margin-right: auto;
      line-height: 1.4;
    }

    .cta-grid-actions { display: flex; flex-direction: column; align-items: center; gap: 16px; }
    
    .btn-cta-main {
      background: white; color: var(--emerald-deep);
      padding: 10px 28px; border-radius: 12px;
      font-size: 1rem; font-weight: 800;
      display: flex; align-items: center; gap: 10px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.12);
      transition: all 0.3s;
    }
    .btn-cta-main:hover { transform: scale(1.03); box-shadow: 0 10px 25px rgba(0,0,0,0.18); }
    .btn-icon { color: var(--emerald); display: flex; align-items: center; }

    .cta-side-actions { display: flex; gap: 10px; justify-content: center; }
    .btn-cta-outline-glass {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.2);
      color: white; padding: 6px 14px; border-radius: 9px;
      font-size: 11px; font-weight: 600; text-decoration: none;
      display: flex; align-items: center; gap: 6px;
      transition: 0.3s;
      backdrop-filter: blur(5px);
    }
    .btn-cta-outline-glass:hover { background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.35); transform: translateY(-2px); }

    .cta-decoration { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
    .cta-blob-glow {
      position: absolute; border-radius: 50%;
      filter: blur(60px); opacity: 0.3;
    }
    .blob-1 { width: 200px; height: 200px; background: #00d4a8; top: -50px; left: -50px; }
    .blob-2 { width: 180px; height: 180px; background: white; bottom: -40px; right: -30px; opacity: 0.1; }
    .cta-pattern {
      position: absolute; inset: 0; opacity: 0.05;
      background-image: radial-gradient(white 1px, transparent 1px);
      background-size: 20px 20px;
    }

    /* ══ SERVICES ══ */
    .services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
    .svc-card {
      background: var(--white); border: 1.5px solid var(--border);
      border-radius: var(--radius-lg); padding: 10px;
      cursor: pointer; transition: all 0.25s; box-shadow: var(--shadow-md);
      display: flex; flex-direction: column; gap: 4px;
      text-decoration: none; color: inherit;
    }
    .svc-card:hover { border-color: var(--emerald); transform: translateY(-2px); box-shadow: var(--shadow-lg); }
    .svc-icon-wrap {
      width: 36px; height: 36px; background: var(--emerald-soft);
      border-radius: 9px; display: flex; align-items: center;
      justify-content: center; margin-bottom: 1px;
    }
    .svc-name { font-size: 12px; font-weight: 700; color: var(--text); }
    .svc-desc { font-size: 10px; color: var(--text-mid); line-height: 1.3; }
    .svc-seller { display: flex; align-items: center; gap: 5px; font-size: 10px; color: var(--text-mid); }
    .svc-avatar {
      width: 18px; height: 18px; border-radius: 50%;
      background: var(--emerald); color: white;
      font-size: 7px; font-weight: 800;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .svc-foot {
      display: flex; align-items: center; justify-content: space-between;
      margin-top: auto; padding-top: 6px; border-top: 1px solid var(--border);
    }
    .svc-price { font-size: 11px; font-weight: 800; color: var(--emerald); }
    .svc-tag {
      font-size: 8px; font-weight: 700; padding: 2px 5px;
      border-radius: 4px; background: var(--emerald-soft); color: var(--emerald-deep);
    }
    .svc-tag.onsite { background: var(--cobalt-light); color: var(--cobalt); }
    .svc-tag.hybrid { background: var(--saffron-light); color: #a16207; }

    /* ══ RESPONSIVE ══ */
    @media (max-width: 1024px) {
      .hero { grid-template-columns: 1fr; padding: 32px 24px; min-height: auto; }
      .hero-left { padding: 24px 0 0; }
      .hero-left h1 { font-size: 32px; }
      .main-section { flex-direction: column; padding: 24px; }
      .sidebar { width: 100%; }
      .products-grid, .services-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 640px) {
      .hero { padding: 20px 16px; }
      .hero-cards-grid { grid-template-columns: 1fr; }
      .products-grid, .services-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private catService = inject(CategorieService);
  private anonceService = inject(AnonceService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private marketService = inject(MarketProductService);
  private serviceOffreService = inject(ServiceOffreService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('catScroll') catScrollEl?: ElementRef<HTMLDivElement>;

  searchQuery = '';
  selectedCategory = '';
  loading = true;

  categories: any[] = [];
  allProducts: any[] = [];
  filteredProducts: any[] = [];
  annoncesPopular: any[] = [];
  produitsVedettes: any[] = [];
  services: any[] = [];
  annoncesHero: any[] = [];

  ngOnInit() { this.loadData(); }

  loadData() {
    this.loading = true;

    this.catService.getAllActive().subscribe({
      next: (cats) => { if (cats?.length) this.categories = cats; this.cdr.detectChanges(); },
      error: () => { this.cdr.detectChanges(); }
    });

    this.anonceService.getActive().subscribe({
      next: (anonces) => {
        anonces = anonces || [];
        this.allProducts = anonces.map((a: any) => ({
          id: a.id,
          name: a.titreAnonce,
          price: (a.prixAfiche || 0).toLocaleString() + ' DH',
          location: a.villeLocalisation,
          categorie: a.categorie?.nomCategorie || 'Divers',
          img: a.imageUrl || '',
          badge: a.annoncePremium ? 'TOP' : null
        }));
        this.filteredProducts = [...this.allProducts];
        this.annoncesPopular = anonces.slice(0, 8).map((a: any) => ({
          id: a.id,
          titre: a.titreAnonce,
          ville: a.villeLocalisation || 'Maroc',
          categorie: a.categorie?.nomCategorie || 'Divers',
          prix: (a.prixAfiche || 0).toLocaleString() + ' DH'
        }));
        this.annoncesHero = this.annoncesPopular.slice(0, 4);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });

    this.marketService.getFeaturedProducts().subscribe({
      next: (prods: any[]) => {
        this.produitsVedettes = (prods || []).map((p: any) => ({
          id: p.id,
          nom: p.titreProduit || p.nom || 'Produit',
          prix: (p.prixAfiche || p.prix || 0).toLocaleString() + ' DH',
          ville: p.villeLocalisation || p.ville || 'Maroc',
          image: p.images?.[0]?.url || p.imageUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&fit=crop',
          badge: p.annoncePremium ? 'TOP' : null
        }));
        this.cdr.detectChanges();
      },
      error: () => { this.produitsVedettes = []; this.cdr.detectChanges(); }
    });

    this.serviceOffreService.search({}).subscribe({
      next: (sv: any[]) => {
        this.services = (sv || []).map((s: any) => ({
          id: s.id,
          titre: s.titreService,
          ville: s.villeLocalisation || 'Maroc',
          demandeurNom: s.demandeur?.nomComplet || null,
          typeContrat: s.typeContrat || 'Freelance',
          prix: (s.prixAfiche || 0).toLocaleString() + ' Dhs'
        }));
        this.cdr.detectChanges();
      },
      error: () => { this.services = []; this.cdr.detectChanges(); }
    });
  }

  filterByCategory(catName: string) {
    this.selectedCategory = this.selectedCategory === catName ? '' : catName;
    this.applyFilters();
  }

  onSearchChange() { this.applyFilters(); }

  applyFilters() {
    this.filteredProducts = this.allProducts.filter(p => {
      const matchCat = !this.selectedCategory || p.categorie === this.selectedCategory;
      const matchSearch = !this.searchQuery || p.name.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }

  clearFilters() {
    this.selectedCategory = '';
    this.searchQuery = '';
    this.filteredProducts = [...this.allProducts];
  }

  goToDetail(id: number) { this.router.navigate(['/product', id]); }

  scrollCats(dir: -1 | 1) {
    this.catScrollEl?.nativeElement.scrollBy({ left: dir * 240, behavior: 'smooth' });
  }

  isVendeur(): boolean {
    const role = this.authService.getPrimaryRole();
    return ['AUTO_ENTREPRENEUR', 'MAGASIN', 'COOPERATIVE', 'SARL'].includes(role);
  }

  getCatIcon(name: string): SafeHtml {
    const icons: Record<string, string> = {
      'Marketplace': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`,
      'Automobile': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
      'Véhicules': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
      'Auto': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
      'Immobilier': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
      'Emploi': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><path d="M12 12v4"/><path d="M10 14h4"/></svg>`,
      'Services': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>`,
      'Informatique': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
      'Électronique': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
      'Mode': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/></svg>`,
      'Maison': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
      'Beauté': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
      'Sport': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l4.24 4.24M14.83 9.17l4.24-4.24M14.83 14.83l4.24 4.24M9.17 14.83l-4.24 4.24"/><circle cx="12" cy="12" r="4"/></svg>`,
      'Alimentation': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      'Artisanat': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
      'Animaux': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-2.73 9.29-1.32 1.32-3.08 2.05-4.8 2.3A12.78 12.78 0 0 1 12 15c-.3 0-.58-.02-.87-.05-1.72-.25-3.48-.98-4.8-2.3C4 10.36 2.18 3.94 3.58 3.36c1.39-.58 4.64.26 6.42 2.26.65-.17 1.33-.26 2-.26Z"/></svg>`,
    };
    return this.sanitizer.bypassSecurityTrustHtml(
      icons[name] ?? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/></svg>`
    );
  }
}
