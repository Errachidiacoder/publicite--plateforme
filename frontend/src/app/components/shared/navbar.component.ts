import { Component, OnInit, inject, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CategorieService } from '../../services/category.service';
import { NotificationService } from '../../services/notification.service';
import { PanierService } from '../../services/panier.service';
import { ThemeToggleComponent } from './theme-toggle.component';
import { MiniCartComponent } from './mini-cart/mini-cart.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ThemeToggleComponent, CommonModule, MiniCartComponent],
  template: `
    <nav class="navbar" (click)="onNavClick($event)">
      <!-- TOP NAV -->
      <div class="nav-top">
        <div class="nav-container">
          <!-- Logo -->
          <a routerLink="/home" class="nav-logo">
            <span class="logo-icon">
              <!-- Pro Logo: Abstract shopping bag with mesh/detail -->
              <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="12" width="24" height="22" rx="4" stroke="#1aafa5" stroke-width="2.5"/>
                <path d="M14 14V10C14 6.68629 16.6863 4 20 4C23.3137 4 26 6.68629 26 10V14" stroke="#1aafa5" stroke-width="2.5" stroke-linecap="round"/>
                <circle cx="20" cy="22" r="3" fill="#1aafa5" opacity="0.3"/>
                <path d="M14 22H26" stroke="#1aafa5" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
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
              <!-- Notification Bell Dropdown -->
              <div class="notif-wrapper" (click)="$event.stopPropagation()">
                <button class="icon-box notif-bell" title="Notifications" (click)="toggleNotifPanel()">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="currentColor" fill-opacity="0.8"/>
                  </svg>
                  @if (unreadCount > 0) {
                    <span class="badge-count-notif">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
                  } @else {
                    <span class="badge-dot" style="background: #1aafa5;"></span>
                  }
                </button>

                @if (notifPanelOpen) {
                  <div class="notif-dropdown">
                    <div class="notif-dropdown-header">
                      <span class="notif-dropdown-title">Notifications</span>
                      @if (unreadCount > 0) {
                        <span class="notif-dropdown-count">{{ unreadCount }} non lue{{ unreadCount > 1 ? 's' : '' }}</span>
                      }
                    </div>

                    @if (notifications.length === 0) {
                      <div class="notif-dropdown-empty">
                        <span>🔔</span>
                        <p>Aucune notification</p>
                      </div>
                    } @else {
                      <div class="notif-dropdown-list">
                        @for (n of notifications.slice(0, 5); track n.id) {
                          <div class="nd-item" [class.nd-unread]="!n.notificationLue" (click)="markRead(n)">
                            <span class="nd-emoji">{{ getNotifEmoji(n.typeEvenement) }}</span>
                            <div class="nd-body">
                              <p class="nd-subject">{{ n.sujetNotification }}</p>
                              <p class="nd-msg">{{ n.corpsMessage }}</p>
                            </div>
                          </div>
                        }
                      </div>
                    }

                    <a routerLink="/notifications" class="notif-dropdown-footer" (click)="notifPanelOpen = false">
                      Voir toutes les notifications
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </a>
                  </div>
                }
              </div>

              <!-- Cart -->
              <button class="icon-box" title="Mon panier" (click)="miniCartOpen = !miniCartOpen; $event.stopPropagation()">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                @if (cartCount > 0) {
                  <span class="badge-count">{{ cartCount > 9 ? '9+' : cartCount }}</span>
                }
              </button>

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
                    <a routerLink="/mes-commandes" class="dropdown-item">
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
          <div class="nav-categories-btn" (click)="toggleMegaMenu($event)" [class.mega-active]="megaOpen">
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
                  <p class="mega-right-desc">{{ activeMegaCat.descriptionCategorie || 'Explorez toutes les annonces dans cette catégorie' }}</p>
                  <a routerLink="/marketplace" [queryParams]="{categorieId: activeMegaCat.id}" class="mega-browse-btn" (click)="megaOpen = false">
                    Voir tous les produits
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </a>
                  <div class="mega-sub-grid">
                    @if (activeMegaCat.sousCategories?.length) {
                      @for (sub of activeMegaCat.sousCategories; track sub.id) {
                        <a routerLink="/marketplace" [queryParams]="{categorieId: sub.id}" class="mega-sub-item" (click)="megaOpen = false">{{ sub.nomCategorie }}</a>
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
            <a routerLink="/marketplace" routerLinkActive="active-link" class="nav-link">Marketplace</a>
            <a routerLink="/home" [queryParams]="{cat: 'Automobile'}" routerLinkActive="active-link" class="nav-link">Véhicules</a>
            <a routerLink="/home" [queryParams]="{cat: 'Immobilier'}" routerLinkActive="active-link" class="nav-link">Immobilier</a>
            <a routerLink="/home" [queryParams]="{cat: 'Emploi'}" routerLinkActive="active-link" class="nav-link">Emploi</a>
            <a routerLink="/services" routerLinkActive="active-link" class="nav-link">Services</a>
            <a routerLink="/home" [queryParams]="{cat: 'Informatique'}" routerLinkActive="active-link" class="nav-link">Informatique</a>
            <a routerLink="/home" [queryParams]="{cat: 'Mode'}" routerLinkActive="active-link" class="nav-link">Mode</a>
          </div>

          <a routerLink="/publish-service" class="btn-insert">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Publier un service
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
      <!-- TOAST NOTIFICATION -->
      @if (activeToast) {
        <div class="toast-container" (click)="goToNotifications(); closeToast()">
          <div class="toast-icon">{{ getNotifEmoji(activeToast.typeEvenement) }}</div>
          <div class="toast-content">
            <h4>{{ activeToast.sujetNotification }}</h4>
            <p>{{ activeToast.corpsMessage }}</p>
          </div>
          <button class="toast-close" (click)="$event.stopPropagation(); closeToast()">✕</button>
        </div>
      }
    </nav>
    <app-mini-cart [isOpen]="miniCartOpen" (close)="miniCartOpen = false" />
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
    .nav-bottom { height: 46px; background: #ffffff; border-bottom: 1px solid var(--sb-border-light); position: relative; }
    .nav-categories-btn { display: flex; align-items: center; gap: 8px; background: transparent; color: var(--sb-text); padding: 0 16px; height: 100%; font-weight: 700; font-size: 0.82rem; cursor: pointer; transition: background 0.2s; white-space: nowrap; flex-shrink: 0; user-select: none; border-right: 1px solid var(--sb-border-light); }
    .nav-categories-btn:hover, .nav-categories-btn.mega-active { background: var(--sb-primary); color: white; }
    .nav-links { display: flex; align-items: center; gap: 20px; flex: 1; overflow: hidden; margin-left: 20px; }
    .nav-link { text-decoration: none; color: #334155; font-weight: 600; font-size: 0.82rem; transition: color 0.2s; white-space: nowrap; opacity: 1; }
    .nav-link:hover { color: var(--sb-primary); }
    .nav-link.active-link {
      color: white;
      background: var(--sb-primary);
      padding: 6px 14px;
      border-radius: 6px;
      font-weight: 700;
    }
    .btn-insert { display: flex; align-items: center; gap: 6px; border: 1.5px solid var(--sb-primary); color: var(--sb-primary); padding: 6px 12px; border-radius: 8px; font-weight: 700; font-size: 0.8rem; text-decoration: none; transition: var(--sb-transition); white-space: nowrap; flex-shrink: 0; }
    .btn-insert:hover { background: var(--sb-primary); color: white; }

    /* MEGA MENU */
    .mega-menu {
      position: absolute; top: 46px; left: 0;
      width: 700px; max-width: 100vw;
      background: var(--sb-bg-elevated); border: 1px solid var(--sb-border);
      border-radius: 0 0 16px 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
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

    .badge-count-notif { position: absolute; top: -5px; right: -5px; background: #ef4444; color: white; font-size: 0.6rem; font-weight: 800; min-width: 18px; height: 18px; border-radius: 9px; display: flex; align-items: center; justify-content: center; padding: 0 4px; border: 2px solid var(--sb-bg-elevated); animation: notif-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes notif-pop { from { transform: scale(0); } to { transform: scale(1); } }

    /* NOTIFICATION DROPDOWN */
    .notif-wrapper { position: relative; display: flex; }
    .notif-dropdown {
      position: absolute; top: calc(100% + 12px); right: -8px;
      width: 360px;
      background: var(--sb-bg-elevated);
      border: 1px solid var(--sb-border);
      border-radius: var(--sb-radius-lg);
      box-shadow: 0 20px 60px rgba(0,0,0,0.18);
      z-index: 2000;
      overflow: hidden;
      animation: dropdownIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes dropdownIn { from { opacity: 0; transform: translateY(-8px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
    .notif-dropdown::before {
      content: '';
      position: absolute; top: -6px; right: 16px;
      width: 12px; height: 12px;
      background: var(--sb-bg-elevated);
      border-left: 1px solid var(--sb-border);
      border-top: 1px solid var(--sb-border);
      transform: rotate(45deg);
      z-index: 1;
    }
    .notif-dropdown-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px 12px; border-bottom: 1px solid var(--sb-border-light); }
    .notif-dropdown-title { font-weight: 800; font-size: 0.95rem; color: var(--sb-text); }
    .notif-dropdown-count { font-size: 0.72rem; font-weight: 700; background: rgba(239,68,68,0.1); color: #ef4444; padding: 2px 10px; border-radius: 100px; }
    .notif-dropdown-empty { text-align: center; padding: 32px 20px; color: var(--sb-text-muted); font-size: 0.88rem; }
    .notif-dropdown-empty span { font-size: 2rem; display: block; margin-bottom: 8px; }
    .notif-dropdown-list { max-height: 320px; overflow-y: auto; }
    .nd-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 20px; cursor: pointer; transition: background 0.15s; border-bottom: 1px solid var(--sb-border-light); }
    .nd-item:hover { background: var(--sb-bg-alt); }
    .nd-item:last-child { border-bottom: none; }
    .nd-unread { background: rgba(26,175,165,0.04); }
    .nd-emoji { font-size: 1.2rem; line-height: 1; flex-shrink: 0; margin-top: 1px; }
    .nd-body { flex: 1; min-width: 0; }
    .nd-subject { font-weight: 700; font-size: 0.83rem; color: var(--sb-text); margin: 0 0 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .nd-msg { font-size: 0.77rem; color: var(--sb-text-secondary); margin: 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .notif-dropdown-footer { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 12px 20px; background: var(--sb-bg-alt); border-top: 1px solid var(--sb-border-light); text-decoration: none; color: var(--sb-primary); font-weight: 700; font-size: 0.82rem; transition: background 0.15s; }
    .notif-dropdown-footer:hover { background: var(--sb-primary-light); }

    .notif-dropdown-footer:hover { background: var(--sb-primary-light); }

    /* TOAST */
    .toast-container {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      background: var(--sb-bg-elevated); border: 1px solid var(--sb-border);
      border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.15);
      padding: 16px; display: flex; align-items: flex-start; gap: 12px;
      width: 320px; max-width: calc(100vw - 48px);
      cursor: pointer; transition: transform 0.2s;
      animation: slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .toast-container:hover { transform: translateY(-4px); border-color: var(--sb-primary); }
    @keyframes slideInUp { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .toast-icon { font-size: 1.5rem; line-height: 1; margin-top: 2px; }
    .toast-content { flex: 1; }
    .toast-content h4 { margin: 0 0 4px; font-size: 0.9rem; font-weight: 700; color: var(--sb-text); }
    .toast-content p { margin: 0; font-size: 0.8rem; color: var(--sb-text-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .toast-close { background: none; border: none; color: var(--sb-text-muted); font-size: 1.1rem; cursor: pointer; padding: 0; margin-left: 8px; line-height: 1; transition: 0.2s; }
    .toast-close:hover { color: var(--sb-danger, #ef4444); }

    @media (max-width: 992px) { .nav-links { display: none; } }
    @media (max-width: 768px) {
      .nav-search-wrapper { display: none; }
      .nav-actions .user-name-text { display: none; }
      .mobile-toggle { display: flex; align-items: center; }
      .nav-bottom { display: none; }
      .toast-container { bottom: 20px; right: 20px; left: 20px; width: auto; max-width: none; }
    }
  `]
})
export class NavbarComponent implements OnInit {
  auth = inject(AuthService);
  private catService = inject(CategorieService);
  private notifService = inject(NotificationService);
  private panierService = inject(PanierService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private elRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);

  menuOpen = false;
  mobileOpen = false;
  megaOpen = false;
  notifPanelOpen = false;
  miniCartOpen = false;
  cartCount = 0;
  megaCategories: any[] = [];
  activeMegaCat: any = null;
  unreadCount = 0;
  notifications: any[] = [];
  activeToast: any = null;
  toastTimeout: any = null;

  ngOnInit() {
    this.catService.getAllActive().subscribe({
      next: (cats) => {
        this.megaCategories = cats;
        if (cats.length > 0) this.activeMegaCat = cats[0];
      },
      error: () => { }
    });
    this.notifService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
    this.notifService.notifications$.subscribe(notifs => {
      this.notifications = notifs;
    });
    this.notifService.newNotification$.subscribe(notif => {
      this.showToast(notif);
    });
    // Cart count
    this.panierService.cartCount$.subscribe(count => {
      this.cartCount = count;
      this.cdr.detectChanges();
    });
    if (this.auth.isLoggedIn()) {
      this.panierService.init();
    }
  }

  showToast(notif: any) {
    this.activeToast = notif;
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastTimeout = setTimeout(() => {
      this.closeToast();
    }, 5000);
  }

  closeToast() {
    this.activeToast = null;
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
      this.notifPanelOpen = false;
    }
  }

  onNavClick(event: MouseEvent) { /* allow propagation to document */ }

  toggleNotifPanel() {
    this.notifPanelOpen = !this.notifPanelOpen;
    this.megaOpen = false;
    this.menuOpen = false;
  }

  markRead(notif: any) {
    if (!notif.notificationLue) {
      this.notifService.markAsRead(notif.id).subscribe();
    }
  }

  getNotifEmoji(type: string): string {
    switch (type) {
      case 'VALIDATION': case 'VALIDATION_PAIEMENT': return '✅';
      case 'ACTIVATION': return '🚀';
      case 'REFUS': return '❌';
      case 'NOUVELLE_ANNONCE': return '📢';
      default: return '🔔';
    }
  }

  goToNotifications() {
    this.router.navigate(['/notifications']);
  }

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
      'Automobile': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>',
      'Véhicules': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>',
      'Immobilier': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3"/><path d="M19 21V11"/><path d="M5 21V11"/><path d="M14 21v-4a2 2 0 1 0-4 0v4"/></svg>',
      'Emploi': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M12 12v4"/><path d="M10 14h4"/></svg>',
      'Services': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22 12 12"/><path d="M11 7 8 4"/><path d="m18 5 3 3"/><path d="m5 11 3 3"/><path d="m11 13 3 3"/><circle cx="12" cy="12" r="10"/></svg>',
      'Informatique': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
      'Électronique': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/><path d="M15 13v4"/><path d="M11 15h4"/></svg>',
      'Mode': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 20 3-1.5 3 1.5M12 2v16.5"/></svg>',
      'Maison': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
      'Sport': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 14.14 14.14"/><path d="m14.14 4.93-9.21 9.21"/></svg>',
      'Alimentation': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>',
      'Artisanat': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>',
      'Animaux': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-2.73 9.29-1.32 1.32-3.08 2.05-4.8 2.3A12.78 12.78 0 0 1 12 15c-.3 0-.58-.02-.87-.05-1.72-.25-3.48-.98-4.8-2.3C4 10.36 2.18 3.94 3.58 3.36c1.39-.58 4.64.26 6.42 2.26.65-.17 1.33-.26 2-.26Z"/><path d="M12 15v5a2 2 0 0 1-2 2H9l3-3"/><path d="M12 15v5a2 2 0 0 0 2 2h1l-3-3"/><path d="M15.3 5.4c-1-1.1-2.9-2-4.1-1.1"/><path d="M8.7 5.4c1-1.1 2.9-2 4.1-1.1"/></svg>',
    };
    return this.sanitizer.bypassSecurityTrustHtml(
      icons[name] ?? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
    );
  }
}
