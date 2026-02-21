import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CategorieService } from '../services/category.service';
import { ProduitService } from '../services/product.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  template: `
    <!-- TOP UTILITY BAR (DARK) -->
    <div class="top-utility-bar">
      <div class="top-bar-content">
        <div class="top-left">
          <span>📢 Votre plateforme n°1 de publicité digitale</span>
        </div>
        <div class="top-right">
          <!-- ICONS FROM USER REQUEST -->
          <div class="icon-group">
            <a routerLink="/login" class="utility-item" title="Mon Compte">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </a>
            <div class="utility-item" title="Panier">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              <span class="count">0</span>
            </div>
            <div class="utility-item" title="Favoris">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              <span class="count">0</span>
            </div>
            <div class="utility-item" title="Support">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><circle cx="12" cy="10" r="2"/></svg>
            </div>
            <div class="utility-item" title="Langue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- HEADER -->
    <header class="main-header">
      <div class="header-content">
        <a routerLink="/home" class="logo">PUBLI<span>CITY</span></a>
        
        <div class="search-container">
          <input type="text" [(ngModel)]="searchQuery" (input)="onSearchChange()" placeholder="Chercher une annonce (Produits, Services, Immo...)">
          <button class="search-icon-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
        </div>

        <div class="user-controls">
          <a routerLink="/admin/dashboard" class="btn-admin" *ngIf="isLoggedIn() && isAdmin()">⚙ Dashboard Admin</a>
          <a routerLink="/submit-product" class="btn-publish">Publier une annonce ✚</a>
          <button class="u-logout" *ngIf="isLoggedIn()" (click)="logout()" title="Déconnexion">🔓 Se déconnecter</button>
        </div>
      </div>
    </header>

    <div class="page-container">

      <!-- PREMIUM HERO GRID (STYLE SHEIN EXACT) -->
      <section class="hero-grid">
        <!-- Left: 3 Small Cards -->
        <div class="hero-left">
          <div class="side-card" style="background-image: url('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&fit=crop')">
            <div class="card-overlay-modern">Best-sellers</div>
          </div>
          <div class="side-card" style="background-image: url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&fit=crop')">
            <div class="card-overlay-modern">Livraison rapide</div>
          </div>
          <div class="side-card" style="background-image: url('https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&fit=crop')">
            <div class="card-overlay-modern">Maison cosy</div>
          </div>
        </div>

        <!-- Center: Large Promo with Overlays -->
        <div class="hero-center">
          <div class="main-banner-shein">
            <div class="banner-text-content">
              <h3>OFFRES SPÉCIALES 2026</h3>
              <h1>VOTRE SUCCÈS <br>COMMENCE ICI</h1>
              <p>Des services de publicité qui vous attendent.</p>
              <button class="btn-buy-now">PUBLIER MAINTENANT</button>
            </div>
            
            <div class="banner-items-overlay">
              <div class="mini-product-card">
                <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&fit=crop" alt="P1">
                <div class="m-price">12<span>,99€</span></div>
              </div>
              <div class="mini-product-card">
                <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&fit=crop" alt="P2">
                <div class="m-price">8<span>,24€</span></div>
              </div>
            </div>
            <div class="banner-dots">
               <span class="dot active"></span>
               <span class="dot"></span>
               <span class="dot"></span>
            </div>
          </div>
        </div>

        <!-- Right: 3 Brand Banners -->
        <div class="hero-right">
          <div class="brand-panel-modern" style="background-image: url('https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&fit=crop')">
            <span>PRO ADS</span>
          </div>
          <div class="brand-panel-modern" style="background-image: url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&fit=crop')">
            <span>TECH MEDIA</span>
          </div>
          <div class="brand-panel-modern" style="background-image: url('https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&fit=crop')">
            <span>GLOBAL AD</span>
          </div>
        </div>
      </section>

      <!-- CATEGORIES SECTION -->
      <section class="circles-section">
        <div class="circle-item" *ngFor="let cat of (categories.length > 0 ? categories : mockCategories)" (click)="filterByCategory(cat.nomCategorie)">
          <div class="circle-wrapper" [class.active]="selectedCategory === cat.nomCategorie">
            <div class="circle-inner">
              <span class="icon" [innerHTML]="cat.svgIcon || cat.iconeCategorie || '📁'"></span>
            </div>
          </div>
          <span class="label">{{ cat.nomCategorie }}</span>
        </div>
      </section>

      <!-- FLASH SALE SECTION -->
      <section class="flash-sale">
        <div class="flash-header">
          <div class="flash-title">
            <span class="flash-icon">⚡</span>
            <h2>VENTES FLASH</h2>
            <div class="timer">
              <span>02</span>:<span>45</span>:<span>12</span>
            </div>
          </div>
          <a href="#" class="view-all">Tout voir ></a>
        </div>
      </section>

      <!-- MAIN CONTENT -->
      <section class="products-section">
        <div class="section-header">
          <h2>{{ selectedCategory ? 'Résultats pour ' + selectedCategory : 'Recommandé pour vous' }}</h2>
          <div class="filters">
            <span (click)="clearFilters()" *ngIf="selectedCategory || searchQuery">Réinitialiser ✕</span>
          </div>
        </div>

        <div class="products-grid">
          <div class="p-card" *ngFor="let p of filteredProducts">
            <div class="p-img-box" (click)="goToDetail(p.id)">
              <img [src]="p.img" [alt]="p.name">
              <div class="p-badge" *ngIf="p.badge">{{ p.badge }}</div>
              <button class="wishlist-btn" (click)="$event.stopPropagation()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              <div class="p-quick-view">Aperçu rapide</div>
            </div>
            <div class="p-info">
              <div class="p-rating">⭐⭐⭐⭐⭐ <span>(42)</span></div>
              <h3 class="p-title" (click)="goToDetail(p.id)">{{ p.name }}</h3>
              <div class="p-price-row">
                <span class="p-price">{{ p.price }}</span>
                <span class="p-old-price" *ngIf="p.badge">{{ +p.price.replace(' DH', '').replace(',', '.') * 1.2 | number:'1.2-2' }} DH</span>
              </div>
              <div class="p-location">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {{ p.location }}
              </div>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="filteredProducts.length === 0 && !loading">
          <p>Aucune annonce ne correspond à vos critères.</p>
          <button (click)="clearFilters()" class="btn-primary">Voir toutes les annonces</button>
        </div>
      </section>
    </div>

    <footer class="main-footer">
      <div class="f-grid">
        <div class="f-col">
          <h3>PUBLI<span>CITY</span></h3>
          <p>La solution complète pour vos besoins publicitaires.</p>
        </div>
        <div class="f-col">
          <h4>Liens utiles</h4>
          <a href="#">Aide & Contact</a>
          <a href="#">Conditions d'utilisation</a>
        </div>
        <div class="f-col">
          <h4>Suivez-nous</h4>
          <div class="socials">FB / TW / IG</div>
        </div>
      </div>
      <div class="f-bottom">© 2026 Publicity Platform - Design Cyan & White</div>
    </footer>
  `,
  styles: [`
    :host { 
      --teal: #4db6ac; 
      --cyan-light: #b2ebf2; 
      --white: #ffffff;
      --text: #263238;
      --border: #e0f7fa;
    }

    /* TOP UTILITY BAR */
    .top-utility-bar { background: #80cbc4; color: #263238; padding: 10px 40px; font-size: 0.8rem; border-bottom: 1px solid rgba(0,0,0,0.05); }
    .top-bar-content { max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
    .top-left span { font-weight: 700; opacity: 0.9; }
    
    .icon-group { display: flex; align-items: center; gap: 20px; }
    .utility-item { display: flex; align-items: center; gap: 5px; cursor: pointer; color: #263238; text-decoration: none; position: relative; transition: 0.3s; }
    .utility-item:hover { opacity: 0.6; transform: scale(1.1); }
    .utility-item svg { width: 18px; height: 18px; }
    .utility-item .count { font-weight: 800; font-size: 0.75rem; }

    /* HEADER */
    .main-header { background: var(--white); padding: 15px 40px; border-bottom: 2px solid var(--border); position: sticky; top: 0; z-index: 1000; }
    .header-content { max-width: 1400px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 30px; }
    
    .logo { font-size: 1.8rem; font-weight: 900; color: var(--text); text-decoration: none; letter-spacing: -1px; }
    .logo span { color: var(--teal); }

    .search-container { flex: 1; max-width: 500px; display: flex; align-items: center; background: #f5fcfd; border: 2px solid var(--border); border-radius: 50px; padding: 4px 6px; transition: 0.3s; }
    .search-container:focus-within { border-color: var(--teal); box-shadow: 0 0 0 4px rgba(77, 182, 172, 0.1); }
    .search-container input { flex: 1; border: none; background: transparent; padding: 8px 15px; font-size: 0.9rem; color: var(--text); outline: none; }
    .search-icon-btn { background: var(--teal); color: white; border: none; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }

    .user-controls { display: flex; gap: 15px; align-items: center; }
    .btn-publish { background: var(--text); color: white; padding: 8px 18px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 0.85rem; transition: 0.3s; }
    .btn-publish:hover { background: var(--primary); transform: translateY(-2px); }
    .btn-admin { background: white; color: var(--teal); border: 2px solid var(--teal); padding: 8px 18px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 0.85rem; transition: 0.3s; }
    .btn-admin:hover { background: var(--teal); color: white; transform: translateY(-2px); }
    .u-logout { background: transparent; border: 1px solid var(--border); color: var(--text); padding: 8px 15px; border-radius: 8px; cursor: pointer; font-size: 0.8rem; font-weight: 600; }


    /* PREMIUM HERO GRID (STYLE SHEIN EXACT) */
    .hero-grid { display: grid; grid-template-columns: 240px 1fr 240px; gap: 15px; margin-bottom: 40px; align-items: stretch; }
    
    .hero-left { display: flex; flex-direction: column; gap: 12px; }
    .side-card { height: 115px; border-radius: 8px; background-size: cover; background-position: center; position: relative; cursor: pointer; overflow: hidden; border: 1px solid var(--border); transition: 0.3s; }
    .card-overlay-modern { position: absolute; left: 0; bottom: 15px; background: rgba(0,0,0,0.7); color: white; padding: 6px 15px; font-weight: 800; font-size: 0.85rem; border-radius: 0 20px 20px 0; }
    .side-card:hover { transform: translateX(5px); border-color: var(--teal); }

    .hero-center { height: 370px; }
    .main-banner-shein { height: 100%; border-radius: 12px; background: linear-gradient(135deg, white, #80deea); position: relative; display: flex; padding: 30px; border: 1px solid var(--border); overflow: hidden; }
    
    .banner-text-content { z-index: 5; flex: 1; display: flex; flex-direction: column; justify-content: center; padding-left: 20px; }
    .banner-text-content h3 { color: var(--primary-dark); font-weight: 800; font-size: 1.2rem; letter-spacing: 2px; margin-bottom: 15px; }
    .banner-text-content h1 { font-size: 3rem; font-weight: 900; line-height: 1; margin: 0 0 15px; color: var(--text); }
    .banner-text-content p { font-size: 1.25rem; color: #455a64; margin-bottom: 30px; }
    
    .btn-buy-now { background: #263238; color: white; border: none; padding: 15px 30px; font-weight: 900; font-size: 0.9rem; border-radius: 4px; cursor: pointer; transition: 0.3s; width: fit-content; }
    .btn-buy-now:hover { background: #000; transform: scale(1.05); }

    .banner-items-overlay { display: flex; gap: 15px; align-items: flex-end; z-index: 4; }
    .mini-product-card { background: white; padding: 6px; border-radius: 8px; box-shadow: 0 10px 20px rgba(0,0,0,0.08); width: 140px; height: 180px; position: relative; transition: 0.3s; border: 1px solid var(--border); }
    .mini-product-card img { width: 100%; height: 100%; object-fit: cover; border-radius: 4px; }
    .mini-product-card .m-price { position: absolute; bottom: 10px; right: 10px; background: white; padding: 4px 10px; border-radius: 20px; font-weight: 900; font-size: 1.1rem; color: #263238; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
    .mini-product-card .m-price span { font-size: 0.8rem; }
    .mini-product-card:hover { transform: translateY(-10px); }

    .banner-dots { position: absolute; bottom: 15px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: white; opacity: 0.5; }
    .dot.active { background: #263238; opacity: 1; width: 25px; border-radius: 10px; }

    .hero-right { display: flex; flex-direction: column; gap: 12px; }
    .brand-panel-modern { height: 115px; border-radius: 8px; background-size: cover; background-position: center; position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; border: 1px solid var(--border); transition: 0.3s; }
    .brand-panel-modern span { z-index: 2; color: white; font-size: 1.8rem; font-weight: 800; letter-spacing: 6px; text-shadow: 0 4px 10px rgba(0,0,0,0.5); font-family: 'Times New Roman', serif; }
    .brand-panel-modern::after { content: ''; position: absolute; inset: 0; background: rgba(0,0,0,0.2); transition: 0.3s; }
    .brand-panel-modern:hover::after { background: rgba(0,0,0,0.1); }
    .brand-panel-modern:hover { transform: translateX(-5px); }

    @media (max-width: 1024px) {
      .hero-grid { grid-template-columns: 1fr; }
      .hero-left, .hero-right { display: grid; grid-template-columns: 1fr 1fr 1fr; }
    }

    /* CIRCLES SECTION */
    .circles-section { display: flex; gap: 30px; justify-content: center; margin-bottom: 60px; overflow-x: auto; padding: 20px 0; }
    .circle-item { display: flex; flex-direction: column; align-items: center; gap: 12px; cursor: pointer; transition: 0.3s; }
    .circle-wrapper { width: 90px; height: 90px; border-radius: 50%; padding: 4px; border: 3px solid transparent; background: var(--white); box-shadow: 0 4px 10px rgba(0,0,0,0.05); transition: 0.3s; }
    .circle-wrapper.active { border-color: var(--teal); transform: scale(1.1); }
    .circle-inner { width: 100%; height: 100%; border-radius: 50%; background: #f1fcfd; display: flex; align-items: center; justify-content: center; font-size: 2rem; }
    .circle-item .label { font-weight: 700; font-size: 0.9rem; color: var(--text); }
    .circle-item:hover .circle-wrapper { border-color: var(--cyan-light); transform: translateY(-5px); }

    /* FLASH SALE */
    .flash-sale { margin-bottom: 40px; background: #fff8f8; padding: 20px; border-radius: 12px; border: 1px solid #ffebee; }
    .flash-header { display: flex; justify-content: space-between; align-items: center; }
    .flash-title { display: flex; align-items: center; gap: 15px; }
    .flash-icon { font-size: 1.5rem; animation: pulse 1s infinite; }
    .flash-title h2 { font-weight: 900; font-size: 1.4rem; color: #d32f2f; margin: 0; }
    .timer { display: flex; gap: 5px; align-items: center; font-weight: 900; font-size: 1.1rem; }
    .timer span { background: #263238; color: white; padding: 4px 8px; border-radius: 4px; min-width: 35px; text-align: center; }
    .view-all { color: #d32f2f; text-decoration: none; font-weight: 700; font-size: 0.9rem; }
    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

    /* PRODUCTS SECTION */
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
    .section-header h2 { font-size: 1.6rem; font-weight: 900; color: var(--text); }
    .filters span { color: var(--teal); font-weight: 700; cursor: pointer; font-size: 0.9rem; }

    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 20px; }
    .p-card { background: white; border-radius: 12px; border: 1px solid var(--border); overflow: hidden; transition: 0.3s; position: relative; }
    
    .p-img-box { height: 260px; background: #fafafa; position: relative; cursor: pointer; }
    .p-img-box img { width: 100%; height: 100%; object-fit: cover; transition: 0.5s; }
    .p-card:hover img { transform: scale(1.08); }
    
    .p-badge { position: absolute; top: 10px; left: 10px; background: #f44336; color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.65rem; font-weight: 900; z-index: 2; }
    
    .wishlist-btn { position: absolute; top: 10px; right: 10px; background: rgba(255,255,255,0.8); border: none; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 2; transition: 0.3s; }
    .wishlist-btn svg { width: 18px; height: 18px; color: var(--text); }
    .wishlist-btn:hover { background: white; transform: scale(1.1); }
    .wishlist-btn:hover svg { fill: #f44336; color: #f44336; }

    .p-quick-view { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(255,255,255,0.9); padding: 10px; text-align: center; font-weight: 700; font-size: 0.8rem; transform: translateY(100%); transition: 0.3s; }
    .p-card:hover .p-quick-view { transform: translateY(0); }

    .p-info { padding: 12px; }
    .p-rating { font-size: 0.75rem; color: #ffa000; margin-bottom: 5px; }
    .p-rating span { color: #90a4ae; margin-left: 4px; }
    .p-title { font-size: 0.95rem; font-weight: 600; color: #455a64; margin-bottom: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; }
    .p-title:hover { color: var(--teal); }

    .p-price-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .p-price { font-size: 1.1rem; font-weight: 900; color: #212121; }
    .p-old-price { font-size: 0.85rem; color: #b0bec5; text-decoration: line-through; }

    .p-location { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: #78909c; }
    .p-card:hover { box-shadow: 0 10px 20px rgba(0,0,0,0.06); border-color: var(--teal); }

    .main-footer { background: #f5fcfd; padding: 80px 40px 40px; border-top: 1px solid var(--border); }
    .f-grid { max-width: 1300px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 60px; }
    .f-col h3 { font-size: 1.8rem; font-weight: 900; margin-bottom: 15px; }
    .f-col h3 span { color: var(--teal); }
    .f-col h4 { margin-bottom: 20px; font-size: 1.1rem; }
    .f-col a { display: block; color: var(--text); text-decoration: none; margin-bottom: 10px; font-weight: 500; opacity: 0.8; }
    .f-bottom { text-align: center; margin-top: 60px; padding-top: 20px; border-top: 1px solid rgba(0,0,0,0.05); font-size: 0.9rem; color: #78909c; }

    @media (max-width: 768px) {
      .hero-card { flex-direction: column; padding: 40px; text-align: center; }
      .hero-text h1 { font-size: 2.5rem; }
      .f-grid { grid-template-columns: 1fr; gap: 40px; }
    }
  `]
})
export class HomeComponent implements OnInit {

  private authService = inject(AuthService);
  private catService = inject(CategorieService);
  private produitService = inject(ProduitService);
  private router = inject(Router);

  searchQuery = '';
  selectedCategory = '';
  categories: any[] = [];
  allProducts: any[] = [];
  filteredProducts: any[] = [];
  loading = true;

  mockCategories = [
    { nomCategorie: 'Immobilier', svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
    { nomCategorie: 'Véhicules', svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polyline points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>' },
    { nomCategorie: 'Emploi', svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>' },
    { nomCategorie: 'Services', svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>' },
    { nomCategorie: 'High-Tech', svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>' },
    { nomCategorie: 'Loisirs', svgIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>' }
  ];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.catService.getAllActive().subscribe({
      next: (cats) => this.categories = cats,
      error: () => this.categories = []
    });

    this.produitService.getActive().subscribe({
      next: (prods) => {
        this.allProducts = prods.map(p => ({
          id: p.id,
          name: p.titreProduit,
          price: (p.prixAfiche || 0).toLocaleString() + ' DH',
          location: p.villeLocalisation,
          categorie: p.categorie?.nomCategorie || 'Divers',
          img: p.mediaProduits && p.mediaProduits.length > 0 ? p.mediaProduits[0].urlMedia : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&fit=crop',
          badge: p.annoncePremium ? 'TOP' : null
        }));
        this.filteredProducts = [...this.allProducts];
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  filterByCategory(catName: string) {
    this.selectedCategory = (this.selectedCategory === catName) ? '' : catName;
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

  isLoggedIn() { return this.authService.isLoggedIn(); }
  isAdmin() { return this.authService.isAdmin(); }
  getNomComplet() { return this.authService.getNomComplet(); }
  logout() { this.authService.logout(); }
}
