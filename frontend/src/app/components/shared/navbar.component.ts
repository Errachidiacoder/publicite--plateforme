import { Component, OnInit, inject, ElementRef, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CategorieService } from '../../services/category.service';
import { ThemeToggleComponent } from './theme-toggle.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, ThemeToggleComponent],
  template: `
    <nav class="navbar" (click)="onNavClick($event)">
      <!-- TOP NAV -->
      <div class="nav-top">
        <div class="nav-container">
          <!-- Logo -->
          <a routerLink="/home" class="nav-logo">
            <span class="logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#1aafa5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </span>
            <span class="logo-text">Souq<span class="logo-accent">Bladi</span></span>
          </a>

          <!-- Search Bar -->
          <div class="nav-search-wrapper">
            <div class="nav-search">
              <input type="text" placeholder="Que recherchez-vous ?" class="search-input" />
              <button class="search-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                Recherche
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div class="nav-actions">
            <app-theme-toggle class="action-item" />

            @if (auth.isLoggedIn()) {
              <!-- Notification Bell -->
              <button class="icon-box" title="Notifications">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <span class="badge-dot"></span>
              </button>

              <!-- Cart -->
              <a routerLink="/panier" class="icon-box" title="Mon panier">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                <span class="badge-count">0</span>
              </a>

              <!-- User Profile -->
              <div class="action-item user-profile" (click)="menuOpen = !menuOpen">
                <div class="user-avatar-box">
                  <div class="user-avatar">{{ getInitials() }}</div>
                  <span class="user-name-text">{{ auth.getNomComplet() }}</span>
                </div>

                @if (menuOpen) {
                  <div class="user-dropdown" (click)="$event.stopPropagation()">
                    <div class="dropdown-header">
                      <strong>{{ auth.getNomComplet() }}</strong>
                      <span class="user-role">{{ auth.getPrimaryRole() }}</span>
                    </div>
                    <div class="dropdown-divider"></div>
                    <a routerLink="/profil" class="dropdown-item">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      Mon profil
                    </a>
                    <a routerLink="/commandes" class="dropdown-item">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                      Mes commandes
                    </a>
                    @if (isVendeur()) {
                      <a routerLink="/vendeur" class="dropdown-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                        Ma boutique
                      </a>
                    }
                    @if (auth.isAdmin()) {
                      <a routerLink="/admin" class="dropdown-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 0-14.14 14.14"/><path d="M4.93 4.93a10 10 0 0 0 14.14 14.14"/></svg>
                        Administration
                      </a>
                    }
                    <div class="dropdown-divider"></div>
                    <button class="dropdown-item logout" (click)="logout()">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Déconnexion
                    </button>
                  </div>
                }
              </div>
            } @else {
              <a routerLink="/login" class="btn-login">Connexion</a>
              <a routerLink="/register" class="btn btn-primary btn-sm">Inscription</a>
            }
          </div>

          <!-- Mobile toggle -->
          <button class="mobile-toggle" (click)="mobileOpen = !mobileOpen">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
      </div>

      <!-- BOTTOM NAV -->
      <div class="nav-bottom">
        <div class="nav-container">
          <!-- Mega Menu Trigger -->
          <div class="nav-categories-btn" (click)="toggleMegaMenu($event)">
            @if (megaOpen) {
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            }
            Toutes les catégories
          </div>

          <!-- Mega Menu Dropdown -->
          @if (megaOpen) {
            <div class="mega-menu" (click)="$event.stopPropagation()">
              <!-- Left: Category List -->
              <div class="mega-left">
                @for (cat of megaCategories; track cat.id) {
                  <div class="mega-cat-item" [class.active]="activeMegaCat?.id === cat.id" (click)="activeMegaCat = cat" (mouseenter)="activeMegaCat = cat">
                    <span class="mega-cat-icon" [innerHTML]="getCatIcon(cat.nomCategorie)"></span>
                    <span class="mega-cat-name">{{ cat.nomCategorie }}</span>
                    <svg class="mega-chevron" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                }
              </div>
              <!-- Right: Category Details -->
              @if (activeMegaCat) {
                <div class="mega-right">
                  <h3 class="mega-right-title">{{ activeMegaCat.nomCategorie }}</h3>
                  <p class="mega-right-desc">{{ activeMegaCat.description || 'Explorez toutes les annonces dans cette catégorie' }}</p>
                  <a routerLink="/home" [queryParams]="{cat: activeMegaCat.nomCategorie}" class="mega-browse-btn" (click)="megaOpen = false">
                    Voir toutes les annonces
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </a>
                  <div class="mega-sub-grid">
                    @if (activeMegaCat.sousCategories?.length) {
                      @for (sub of activeMegaCat.sousCategories; track sub.id) {
                        <a routerLink="/home" [queryParams]="{cat: sub.nomCategorie}" class="mega-sub-item" (click)="megaOpen = false">{{ sub.nomCategorie }}</a>
                      }
                    } @else {
                      <span class="mega-empty">Aucune sous-catégorie</span>
                    }
                  </div>
                </div>
              }
            </div>
          }

          <div class="nav-links">
            <a routerLink="/home" class="nav-link">Marketplace</a>
            <a routerLink="/home" [queryParams]="{cat: 'Automobile'}" class="nav-link">Véhicules</a>
            <a routerLink="/home" [queryParams]="{cat: 'Immobilier'}" class="nav-link">Immobilier</a>
            <a routerLink="/home" [queryParams]="{cat: 'Emploi'}" class="nav-link">Emploi</a>
            <a routerLink="/home" [queryParams]="{cat: 'Services'}" class="nav-link">Services</a>
            <a routerLink="/home" [queryParams]="{cat: 'Informatique'}" class="nav-link">Informatique</a>
            <a routerLink="/home" [queryParams]="{cat: 'Mode'}" class="nav-link">Mode</a>
          </div>

          <a routerLink="/submit-product" class="btn-insert">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Insérer une annonce
          </a>
        </div>
      </div>

      <!-- Mobile Nav -->
      @if (mobileOpen) {
        <div class="mobile-nav">
          <div class="mobile-search">
            <input type="text" placeholder="Rechercher..." class="search-input" />
          </div>
          <a routerLink="/home" class="mobile-link" (click)="mobileOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Accueil
          </a>
          <a routerLink="/home" class="mobile-link" (click)="mobileOpen = false">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            Catégories
          </a>
          @if (auth.isLoggedIn()) {
            <a routerLink="/panier" class="mobile-link" (click)="mobileOpen = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              Mon panier
            </a>
            <a routerLink="/profil" class="mobile-link" (click)="mobileOpen = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Mon profil
            </a>
            @if (auth.isAdmin()) {
              <a routerLink="/admin" class="mobile-link" (click)="mobileOpen = false">Administration</a>
            }
            <button class="mobile-link logout" (click)="logout()">Déconnexion</button>
          } @else {
            <a routerLink="/login" class="mobile-link" (click)="mobileOpen = false">Connexion</a>
            <a routerLink="/register" class="mobile-link" (click)="mobileOpen = false">Inscription</a>
          }
        </div>
      }
    </nav>
  `,
  styles: [`
    .navbar { position: sticky; top: 0; z-index: 1000; background: var(--sb-bg-elevated); box-shadow: var(--sb-shadow-sm); }

    /* CONTAINERS */
    .nav-container { max-width: 1280px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; gap: 16px; height: 100%; }

    /* TOP ROW */
    .nav-top { height: 68px; border-bottom: 1px solid var(--sb-border-light); }

    .nav-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; flex-shrink: 0; }
    .logo-icon { display: flex; align-items: center; }
    .logo-text { font-family: 'Outfit', sans-serif; font-size: 1.5rem; font-weight: 800; color: var(--sb-text); letter-spacing: -0.02em; }
    .logo-accent { color: var(--sb-primary); }

    .nav-search-wrapper { flex: 1; display: flex; justify-content: center; }
    .nav-search {
      width: 100%; max-width: 560px; display: flex;
      border: 1.5px solid var(--sb-border); border-radius: 10px;
      overflow: hidden; background: var(--sb-bg-alt); transition: var(--sb-transition);
    }
    .nav-search:focus-within { border-color: var(--sb-primary); box-shadow: 0 0 0 3px rgba(26,175,165,0.1); }
    .search-input { flex: 1; padding: 9px 14px; border: none; background: transparent; color: var(--sb-text); outline: none; font-size: 0.88rem; }
    .search-btn { background: var(--sb-primary); color: white; border: none; padding: 0 18px; font-weight: 700; cursor: pointer; font-size: 0.82rem; transition: background 0.2s; display: flex; align-items: center; gap: 6px; white-space: nowrap; }
    .search-btn:hover { background: #14928a; }

    .nav-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .action-item { display: flex; align-items: center; justify-content: center; cursor: pointer; }

    .icon-box {
      width: 40px; height: 40px; border: 1.5px solid var(--sb-border); border-radius: 10px;
      color: var(--sb-text); position: relative; transition: var(--sb-transition);
      text-decoration: none; display: flex; align-items: center; justify-content: center;
      background: transparent; cursor: pointer;
    }
    .icon-box:hover { border-color: var(--sb-primary); color: var(--sb-primary); transform: translateY(-2px); }
    .badge-count { position: absolute; top: -5px; right: -5px; background: var(--sb-danger, #ef4444); color: white; font-size: 0.6rem; padding: 1px 4px; border-radius: 8px; font-weight: 800; min-width: 16px; text-align: center; }
    .badge-dot { position: absolute; top: -3px; right: -3px; width: 8px; height: 8px; background: var(--sb-primary); border-radius: 50%; border: 2px solid var(--sb-bg-elevated); }

    .user-profile { padding: 4px 8px; border-radius: 10px; border: 1.5px solid var(--sb-border); transition: var(--sb-transition); position: relative; }
    .user-profile:hover { border-color: var(--sb-primary); }
    .user-avatar-box { display: flex; align-items: center; gap: 8px; }
    .user-avatar { width: 30px; height: 30px; background: var(--sb-primary-gradient); color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.72rem; }
    .user-name-text { font-size: 0.82rem; font-weight: 600; color: var(--sb-text); max-width: 100px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .btn-login { font-weight: 700; color: var(--sb-text); text-decoration: none; font-size: 0.88rem; }

    /* DROPDOWN */
    .user-dropdown { position: absolute; top: calc(100% + 10px); right: 0; min-width: 210px; background: var(--sb-bg-elevated); border: 1px solid var(--sb-border); border-radius: 14px; box-shadow: var(--sb-shadow-lg); overflow: hidden; z-index: 200; }
    .dropdown-header { padding: 14px; display: flex; flex-direction: column; gap: 2px; }
    .dropdown-header strong { font-size: 0.85rem; }
    .user-role { font-size: 0.65rem; color: var(--sb-primary); font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
    .dropdown-divider { height: 1px; background: var(--sb-border-light); }
    .dropdown-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 11px 14px; font-size: 0.84rem; color: var(--sb-text); text-align: left; text-decoration: none; border: none; background: none; cursor: pointer; font-family: inherit; transition: 0.15s; }
    .dropdown-item:hover { background: var(--sb-bg-alt); }
    .dropdown-item.logout { color: var(--sb-danger, #ef4444); }

    /* BOTTOM ROW */
    .nav-bottom { height: 46px; background: var(--sb-bg); border-bottom: 1px solid var(--sb-border-light); position: relative; }
    .nav-categories-btn { display: flex; align-items: center; gap: 8px; background: var(--sb-primary); color: white; padding: 0 16px; height: 100%; font-weight: 700; font-size: 0.82rem; cursor: pointer; transition: background 0.2s; white-space: nowrap; flex-shrink: 0; user-select: none; }
    .nav-categories-btn:hover { background: #14928a; }
    .nav-links { display: flex; align-items: center; gap: 20px; flex: 1; overflow: hidden; }
    .nav-link { text-decoration: none; color: var(--sb-text); font-weight: 600; font-size: 0.82rem; transition: color 0.2s; white-space: nowrap; }
    .nav-link:hover { color: var(--sb-primary); }
    .btn-insert { display: flex; align-items: center; gap: 6px; border: 1.5px solid var(--sb-primary); color: var(--sb-primary); padding: 6px 12px; border-radius: 8px; font-weight: 700; font-size: 0.8rem; text-decoration: none; transition: var(--sb-transition); white-space: nowrap; flex-shrink: 0; }
    .btn-insert:hover { background: var(--sb-primary); color: white; }

    /* MEGA MENU */
    .mega-menu {
      position: absolute; top: 46px; left: 0;
      width: 700px; max-width: 100vw;
      background: var(--sb-bg-elevated); border: 1px solid var(--sb-border);
      border-radius: 0 0 16px 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      display: flex; z-index: 500; overflow: hidden;
      animation: slideDown 0.18s ease;
    }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

    .mega-left { width: 220px; flex-shrink: 0; background: var(--sb-bg-alt); border-right: 1px solid var(--sb-border-light); padding: 8px 0; max-height: 420px; overflow-y: auto; }
    .mega-cat-item { display: flex; align-items: center; gap: 10px; padding: 10px 16px; cursor: pointer; transition: 0.15s; color: var(--sb-text); }
    .mega-cat-item:hover, .mega-cat-item.active { background: var(--sb-bg-elevated); color: var(--sb-primary); }
    .mega-cat-icon { width: 20px; height: 20px; flex-shrink: 0; display: flex; align-items: center; }
    .mega-cat-icon svg { width: 18px; height: 18px; stroke: currentColor; }
    .mega-cat-name { flex: 1; font-size: 0.85rem; font-weight: 600; }
    .mega-chevron { flex-shrink: 0; opacity: 0.5; }
    .mega-cat-item.active .mega-chevron { opacity: 1; }

    .mega-right { flex: 1; padding: 20px 24px; max-height: 420px; overflow-y: auto; }
    .mega-right-title { font-size: 1.1rem; font-weight: 800; color: var(--sb-text); margin-bottom: 6px; }
    .mega-right-desc { font-size: 0.82rem; color: var(--sb-text-muted); margin-bottom: 14px; line-height: 1.5; }
    .mega-browse-btn { display: inline-flex; align-items: center; gap: 4px; color: var(--sb-primary); font-weight: 700; font-size: 0.8rem; text-decoration: none; margin-bottom: 16px; }
    .mega-browse-btn:hover { text-decoration: underline; }
    .mega-sub-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
    .mega-sub-item { font-size: 0.8rem; color: var(--sb-text-secondary); text-decoration: none; padding: 4px 0; transition: color 0.15s; }
    .mega-sub-item:hover { color: var(--sb-primary); }
    .mega-empty { font-size: 0.8rem; color: var(--sb-text-muted); font-style: italic; }

    /* MOBILE */
    .mobile-toggle { display: none; padding: 8px; border-radius: 8px; border: 1.5px solid var(--sb-border); background: none; color: var(--sb-text); cursor: pointer; }
    .mobile-nav { position: fixed; top: 114px; left: 0; right: 0; bottom: 0; background: var(--sb-bg-elevated); padding: 20px; z-index: 999; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; }
    .mobile-search { margin-bottom: 10px; }
    .mobile-link { padding: 14px 12px; border-bottom: 1px solid var(--sb-border-light); text-decoration: none; color: var(--sb-text); font-weight: 600; display: flex; align-items: center; gap: 10px; font-size: 0.95rem; border: none; background: none; width: 100%; text-align: left; font-family: inherit; cursor: pointer; border-radius: 8px; transition: 0.15s; }
    .mobile-link:hover { background: var(--sb-bg-alt); color: var(--sb-primary); }
    .mobile-link.logout { color: var(--sb-danger, #ef4444); }

    @media (max-width: 992px) { .nav-links { display: none; } }
    @media (max-width: 768px) {
      .nav-search-wrapper { display: none; }
      .nav-actions .user-name-text { display: none; }
      .mobile-toggle { display: flex; align-items: center; }
      .nav-bottom { display: none; }
    }
  `]
})
export class NavbarComponent implements OnInit {
  auth = inject(AuthService);
  private catService = inject(CategorieService);
  private sanitizer = inject(DomSanitizer);
  private elRef = inject(ElementRef);

  menuOpen = false;
  mobileOpen = false;
  megaOpen = false;
  megaCategories: any[] = [];
  activeMegaCat: any = null;

  ngOnInit() {
    this.catService.getAllActive().subscribe({
      next: (cats) => {
        this.megaCategories = cats;
        if (cats.length > 0) this.activeMegaCat = cats[0];
      },
      error: () => { }
    });
  }

  toggleMegaMenu(event: Event) {
    event.stopPropagation();
    this.megaOpen = !this.megaOpen;
    this.menuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.megaOpen = false;
      this.menuOpen = false;
    }
  }

  onNavClick(event: MouseEvent) { /* allow propagation to document */ }

  getInitials(): string {
    const nom = this.auth.getNomComplet();
    if (!nom) return '?';
    return nom.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
  }

  isVendeur(): boolean {
    const role = this.auth.getPrimaryRole();
    return ['AUTO_ENTREPRENEUR', 'MAGASIN', 'COOPERATIVE', 'SARL'].includes(role);
  }

  logout() {
    this.menuOpen = false;
    this.mobileOpen = false;
    this.auth.logout();
  }

  getCatIcon(name: string): SafeHtml {
    const icons: Record<string, string> = {
      'Marketplace': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
      'Automobile': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
      'Immobilier': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
      'Emploi': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>',
      'Services': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
      'Informatique': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
      'Électronique': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
      'Mode': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
      'Maison': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
      'Sport': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93 19.07 19.07"/></svg>',
      'Alimentation': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>',
      'Artisanat': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
      'Animaux': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.1 2.344-1.828"/><path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.96-1.1-2.344-1.828"/><path d="M8 14v.5"/><path d="M16 14v.5"/></svg>',
      'Technologie': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
      'Santé': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    };
    return this.sanitizer.bypassSecurityTrustHtml(
      icons[name] ?? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
    );
  }
}
