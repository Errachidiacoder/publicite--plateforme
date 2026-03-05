import { Component, OnInit, inject, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [RouterLink, RouterLinkActive, ThemeToggleComponent, CommonModule, MiniCartComponent, FormsModule],
  template: `
    <nav class="navbar" (click)="onNavClick($event)">

      <!-- ══ TOP ROW ══ -->
      <div class="nav-top">
        <div class="nav-container">

          <!-- Logo -->
          <a routerLink="/home" class="nav-logo">
            <span class="logo-mark">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
            </span>
            <span class="logo-text-wrap">
              <span class="logo-en">Souq<span class="logo-accent">Bladi</span></span>
              <span class="logo-ar">سوق بلادي</span>
            </span>
          </a>

          <!-- Search Bar -->
          <div class="nav-search-wrapper">
            <div class="nav-search">
              <button class="search-cat">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
                Catégories
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <input type="text" placeholder="Rechercher un produit, service ou annonce…" class="search-input" [(ngModel)]="searchQuery" (keyup.enter)="onSearch()"/>
              <button class="search-btn" (click)="onSearch()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                Recherche
              </button>
            </div>
          </div>

          <!-- Actions : seulement theme + notif + panier + avatar -->
          <div class="nav-actions">

            <!-- Theme toggle -->
            <app-theme-toggle class="action-item"/>

            @if (auth.isLoggedIn()) {

              <!-- Notification Bell -->
              <div class="notif-wrapper" (click)="$event.stopPropagation()">
                <button class="icon-btn" title="Notifications" (click)="toggleNotifPanel()">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 01-3.46 0"/>
                  </svg>
                  @if (unreadCount > 0) {
                    <span class="notif-badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
                  }
                </button>

                @if (notifPanelOpen) {
                  <div class="notif-dropdown">
                    <div class="notif-header">
                      <span class="notif-title">Notifications</span>
                      @if (unreadCount > 0) {
                        <span class="notif-count">{{ unreadCount }} non lue{{ unreadCount > 1 ? 's' : '' }}</span>
                      }
                    </div>
                    @if (notifications.length === 0) {
                      <div class="notif-empty">
                        <span>🔔</span>
                        <p>Aucune notification</p>
                      </div>
                    } @else {
                      <div class="notif-list">
                        @for (n of notifications.slice(0, 5); track n.id) {
                          <div class="nd-item" [class.nd-unread]="!n.notificationLue" (click)="markRead(n)">
                            <div class="nd-icon-wrap" [ngClass]="getTypeClass(n.typeEvenement)">
                              <span class="nd-svg" [innerHTML]="getTypeSvg(n.typeEvenement)"></span>
                            </div>
                            <div class="nd-body">
                              <p class="nd-subject">{{ n.sujetNotification }}</p>
                              <p class="nd-msg">{{ n.corpsMessage }}</p>
                            </div>
                          </div>
                        }
                      </div>
                    }
                    <a routerLink="/notifications" class="notif-footer" (click)="notifPanelOpen = false">
                      Voir toutes les notifications
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                    </a>
                  </div>
                }
              </div>

              <!-- Panier -->
              <button class="icon-btn" title="Mon panier" (click)="miniCartOpen = !miniCartOpen; $event.stopPropagation()">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.97-1.67L23 6H6"/>
                </svg>
                @if (cartCount > 0) {
                  <span class="notif-badge">{{ cartCount > 9 ? '9+' : cartCount }}</span>
                }
              </button>

              <!-- User Profile -->
              <div class="user-profile" (click)="menuOpen = !menuOpen">
                <div class="user-avatar">{{ getInitials() }}</div>
                <span class="user-name">{{ auth.getNomComplet() }}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="user-chevron"><polyline points="6 9 12 15 18 9"/></svg>

                @if (menuOpen) {
                  <div class="user-dropdown" (click)="$event.stopPropagation()">
                    <div class="dropdown-header">
                      <strong>{{ auth.getNomComplet() }}</strong>
                      <span class="user-role">{{ auth.getPrimaryRole() }}</span>
                    </div>
                    <div class="dropdown-divider"></div>
                    <a routerLink="/profil" class="dropdown-item">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      Mon profil
                    </a>
                    <a routerLink="/mes-commandes" class="dropdown-item">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
                      Mes commandes
                    </a>
                    @if (isVendeur()) {
                      <a routerLink="/vendeur" class="dropdown-item">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                        Ma boutique
                      </a>
                    }
                    @if (auth.isAdmin()) {
                      <a routerLink="/admin" class="dropdown-item">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 00-14.14 14.14"/><path d="M4.93 4.93a10 10 0 0014.14 14.14"/></svg>
                        Administration
                      </a>
                    }
                    <div class="dropdown-divider"></div>
                    <button class="dropdown-item logout" (click)="logout()">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Déconnexion
                    </button>
                  </div>
                }
              </div>

            } @else {
              <a routerLink="/login"    class="btn-login">Connexion</a>
              <a routerLink="/register" class="btn-register">S'inscrire</a>
            }
          </div>

          <!-- Mobile toggle -->
          <button class="mobile-toggle" (click)="mobileOpen = !mobileOpen">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
      </div>

      <!-- ══ BOTTOM ROW ══ -->
      <div class="nav-bottom">
        <div class="nav-container">

          <!-- Mega Menu Trigger -->
          <div class="nav-categories-btn" (click)="toggleMegaMenu($event)" [class.mega-active]="megaOpen">
            @if (megaOpen) {
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            } @else {
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            }
            Toutes les catégories
          </div>

          <!-- Mega Menu Dropdown -->
          @if (megaOpen) {
            <div class="mega-menu" (click)="$event.stopPropagation()">
              <div class="mega-left">
                @for (cat of megaCategories; track cat.id) {
                  <div class="mega-cat-item" [class.active]="activeMegaCat?.id === cat.id"
                       (click)="activeMegaCat = cat" (mouseenter)="activeMegaCat = cat">
                    <span class="mega-cat-icon" [innerHTML]="getCatIcon(cat.nomCategorie)"></span>
                    <span class="mega-cat-name">{{ cat.nomCategorie }}</span>
                    <svg class="mega-chevron" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                }
              </div>
              @if (activeMegaCat) {
                <div class="mega-right">
                  <h3 class="mega-right-title">{{ activeMegaCat.nomCategorie }}</h3>
                  <p class="mega-right-desc">{{ activeMegaCat.descriptionCategorie || 'Explorez toutes les annonces dans cette catégorie' }}</p>
                  <a routerLink="/marketplace" [queryParams]="{categorieId: activeMegaCat.id}" class="mega-browse-btn" (click)="megaOpen = false">
                    Voir tous les produits
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </a>
                  <div class="mega-sub-grid">
                    @if (activeMegaCat.sousCategories?.length) {
                      @for (sub of activeMegaCat.sousCategories; track sub.id) {
                        <a routerLink="/marketplace" [queryParams]="{categorieId: sub.id}" class="mega-sub-item" (click)="megaOpen = false">
                          {{ sub.nomCategorie }}
                        </a>
                      }
                    } @else {
                      <span class="mega-empty">Aucune sous-catégorie</span>
                    }
                  </div>
                </div>
              }
            </div>
          }

          <!-- Nav Links -->
          <div class="nav-links">
            <a routerLink="/home"        routerLinkActive="active-link" [routerLinkActiveOptions]="{exact:true}" class="nav-link">Accueil</a>
            <a routerLink="/marketplace" routerLinkActive="active-link" class="nav-link">Marketplace</a>
            <a routerLink="/services"    routerLinkActive="active-link" class="nav-link">Services</a>
            <a routerLink="/annonces"    routerLinkActive="active-link" class="nav-link">Annonces</a>
        
          </div>

        </div>
      </div>

      <!-- ══ MOBILE NAV ══ -->
      @if (mobileOpen) {
        <div class="mobile-nav">
          <div class="mobile-search">
            <input type="text" placeholder="Rechercher…" class="search-input"/>
          </div>
          <a routerLink="/home"        class="mobile-link" (click)="mobileOpen = false">Accueil</a>
          <a routerLink="/marketplace" class="mobile-link" (click)="mobileOpen = false">Marketplace</a>
          @if (auth.isLoggedIn()) {
            <a routerLink="/panier"  class="mobile-link" (click)="mobileOpen = false">Mon panier</a>
            <a routerLink="/profil"  class="mobile-link" (click)="mobileOpen = false">Mon profil</a>
            @if (auth.isAdmin()) {
              <a routerLink="/admin" class="mobile-link" (click)="mobileOpen = false">Administration</a>
            }
            <button class="mobile-link logout" (click)="logout()">Déconnexion</button>
          } @else {
            <a routerLink="/login"    class="mobile-link" (click)="mobileOpen = false">Connexion</a>
            <a routerLink="/register" class="mobile-link" (click)="mobileOpen = false">Inscription</a>
          }
        </div>
      }

      <!-- ══ TOAST ══ -->
      @if (activeToast) {
        <div class="toast-container" (click)="markRead(activeToast); closeToast()">
          <div class="toast-icon">{{ getNotifEmoji(activeToast.typeEvenement) }}</div>
          <div class="toast-content">
            <h4>{{ activeToast.sujetNotification }}</h4>
            <p>{{ activeToast.corpsMessage }}</p>
          </div>
          <button class="toast-close" (click)="$event.stopPropagation(); closeToast()">✕</button>
        </div>
      }

    </nav>
    <app-mini-cart [isOpen]="miniCartOpen" (close)="miniCartOpen = false"/>
  `,
  styles: [`
    /* ════════════════════════════════════════
       SOUQBLADI NAVBAR — Design Redesign
       Palette : emerald #00b894 · cobalt #2c3e6b · saffron #f39c12
    ════════════════════════════════════════ */

    .navbar {
      position: sticky; top: 0; z-index: 1000;
      background: var(--sb-bg-elevated);
    }

    /* ── Container ── */
    .nav-container {
      max-width: 1400px; margin: 0 auto; padding: 0 48px;
      display: flex; align-items: center; gap: 18px; height: 100%;
    }

    /* ══ TOP ROW ══ */
    .nav-top {
      height: 70px;
      border-bottom: 1.5px solid var(--sb-border);
      background: var(--sb-bg-elevated);
      box-shadow: 0 2px 16px rgba(0,0,0,0.05);
    }

    /* ── Logo ── */
    .nav-logo { display: flex; align-items: center; gap: 11px; text-decoration: none; flex-shrink: 0; }
    .logo-mark {
      width: 44px; height: 44px;
      background: linear-gradient(135deg, #00b894, #00826b);
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 14px rgba(0,184,148,0.35);
      flex-shrink: 0;
    }
    .logo-text-wrap { display: flex; flex-direction: column; line-height: 1; }
    .logo-en { font-size: 19px; font-weight: 800; color: var(--sb-text); letter-spacing: -0.5px; white-space: nowrap; }
    .logo-accent { color: #00b894; }
    .logo-ar { font-size: 11px; color: var(--sb-text-muted); font-weight: 600; margin-top: 2px; }

    /* ── Search ── */
    .nav-search-wrapper { flex: 1; display: flex; justify-content: center; }
    .nav-search {
      width: 100%; max-width: 600px; display: flex;
      border: 2px solid var(--sb-border); border-radius: 12px;
      overflow: hidden; background: var(--sb-bg-elevated);
      transition: border-color 0.25s, box-shadow 0.25s;
    }
    .nav-search:focus-within {
      border-color: #00b894;
      box-shadow: 0 0 0 4px rgba(0,184,148,0.12);
    }
    .search-cat {
      padding: 0 14px; border-right: 1.5px solid var(--sb-border);
      font-size: 13px; font-weight: 600; color: var(--sb-text-secondary);
      background: var(--sb-bg); border-top: none; border-bottom: none; border-left: none;
      font-family: inherit; cursor: pointer;
      display: flex; align-items: center; gap: 6px;
      white-space: nowrap; outline: none; transition: color 0.2s;
    }
    .search-cat:hover { color: #00b894; }
    .search-input {
      flex: 1; padding: 11px 16px; border: none; background: transparent;
      color: var(--sb-text); outline: none; font-size: 14px; font-family: inherit;
    }
    .search-input::placeholder { color: var(--sb-text-muted); }
    .search-btn {
      background: #00b894; color: white; border: none;
      padding: 11px 22px; font-family: inherit; font-size: 14px; font-weight: 700;
      cursor: pointer; display: flex; align-items: center; gap: 7px;
      transition: background 0.2s; flex-shrink: 0; white-space: nowrap;
    }
    .search-btn:hover { background: #00826b; }

    /* ── Actions ── */
    .nav-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; margin-left: auto; }
    .action-item { display: flex; align-items: center; }

    /* ── Icon buttons — cercles avec border ── */
    .icon-btn {
      width: 42px; height: 42px;
      border: 1.5px solid var(--sb-border); border-radius: 50%;
      color: var(--sb-text-secondary); position: relative;
      transition: all 0.2s; display: flex; align-items: center;
      justify-content: center; background: var(--sb-bg-elevated); cursor: pointer;
    }
    .icon-btn:hover {
      border-color: #00b894;
      background: rgba(0,184,148,0.08);
      color: #00b894;
    }

    /* ── Badge notification ── */
    .notif-badge {
      position: absolute; top: -4px; right: -4px;
      background: #e74c3c; color: white;
      font-size: 10px; font-weight: 800;
      min-width: 18px; height: 18px; border-radius: 9px; padding: 0 4px;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid var(--sb-bg-elevated);
      animation: notif-pop 0.3s cubic-bezier(0.16,1,0.3,1);
    }
    @keyframes notif-pop { from { transform: scale(0); } to { transform: scale(1); } }

    /* ── User profile ── */
    .user-profile {
      display: flex; align-items: center; gap: 8px;
      cursor: pointer; position: relative; padding: 4px 8px;
      border-radius: 10px; transition: background 0.2s;
    }
    .user-profile:hover { background: rgba(0,184,148,0.07); }
    .user-avatar {
      width: 38px; height: 38px; background: linear-gradient(135deg, #00b894, #00826b);
      border-radius: 50%; display: flex; align-items: center;
      justify-content: center; color: white; font-weight: 800;
      font-size: 13px; flex-shrink: 0;
    }
    .user-name {
      font-size: 13px; font-weight: 600; color: var(--sb-text);
      white-space: nowrap; max-width: 110px;
      overflow: hidden; text-overflow: ellipsis;
    }
    .user-chevron { color: var(--sb-text-muted); flex-shrink: 0; transition: transform 0.2s; }
    .user-profile:hover .user-chevron { transform: rotate(180deg); }

    /* ── Auth buttons ── */
    .btn-login {
      font-weight: 700; color: var(--sb-text); text-decoration: none;
      font-size: 13px; padding: 8px 16px; border-radius: 10px;
      border: 1.5px solid var(--sb-border); transition: all 0.2s;
    }
    .btn-login:hover { border-color: #00b894; color: #00b894; background: rgba(0,184,148,0.06); }
    .btn-register {
      background: linear-gradient(135deg, #00b894, #00826b);
      color: white; border: none; padding: 8px 18px; border-radius: 10px;
      font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit;
      transition: all 0.2s; text-decoration: none;
      display: inline-flex; align-items: center;
      box-shadow: 0 3px 12px rgba(0,184,148,0.3);
    }
    .btn-register:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(0,184,148,0.4); }

    /* ── User dropdown ── */
    .user-dropdown {
      position: absolute; top: calc(100% + 8px); right: 0;
      min-width: 220px; background: var(--sb-bg-elevated);
      border: 1.5px solid var(--sb-border); border-radius: 16px;
      box-shadow: 0 16px 48px rgba(0,0,0,0.12);
      overflow: hidden; z-index: 500;
      animation: dropdownIn 0.18s cubic-bezier(0.16,1,0.3,1);
    }
    @keyframes dropdownIn {
      from { opacity: 0; transform: translateY(-6px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .dropdown-header {
      padding: 14px 16px; display: flex; flex-direction: column; gap: 3px;
      background: rgba(0,184,148,0.04); border-bottom: 1px solid var(--sb-border);
    }
    .dropdown-header strong { font-size: 14px; color: var(--sb-text); }
    .user-role { font-size: 10px; color: #00b894; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; }
    .dropdown-divider { height: 1px; background: var(--sb-border); }
    .dropdown-item {
      display: flex; align-items: center; gap: 10px; width: 100%;
      padding: 11px 16px; font-size: 13px; color: var(--sb-text);
      text-align: left; text-decoration: none; border: none;
      background: none; cursor: pointer; font-family: inherit; transition: 0.15s;
    }
    .dropdown-item:hover { background: rgba(0,184,148,0.06); color: #00b894; }
    .dropdown-item svg { flex-shrink: 0; }
    .dropdown-item.logout { color: #e74c3c; }
    .dropdown-item.logout:hover { background: rgba(231,76,60,0.06); }

    /* ── Mobile toggle ── */
    .mobile-toggle {
      display: none; padding: 8px; border-radius: 10px;
      border: 1.5px solid var(--sb-border); background: none;
      color: var(--sb-text); cursor: pointer; margin-left: auto;
    }

    /* ══ BOTTOM ROW ══ */
    .nav-bottom {
      height: 48px;
      border-bottom: 1.5px solid var(--sb-border);
      background: var(--sb-bg-elevated);
      position: relative;
    }

    /* Toutes les catégories */
    .nav-categories-btn {
      display: flex; align-items: center; gap: 8px;
      background: transparent; color: var(--sb-text);
      padding: 0 18px; height: 100%; font-weight: 700; font-size: 14px;
      cursor: pointer; transition: color 0.2s; white-space: nowrap;
      flex-shrink: 0; border: none; font-family: inherit;
      border-right: 1.5px solid var(--sb-border);
    }
    .nav-categories-btn:hover, .nav-categories-btn.mega-active { color: #00b894; }

    /* Nav links */
    .nav-links {
      display: flex; align-items: center; flex: 1;
      overflow-x: auto; scrollbar-width: none;
    }
    .nav-links::-webkit-scrollbar { display: none; }
    .nav-link {
      padding: 13px 14px; font-size: 13.5px; color: var(--sb-text-secondary);
      text-decoration: none; font-weight: 500; transition: color 0.2s;
      white-space: nowrap; display: flex; align-items: center; gap: 5px;
      border-bottom: 2.5px solid transparent; font-family: inherit;
    }
    .nav-link:hover { color: #00b894; }
    .nav-link.active-link {
      color: #00b894; border-bottom-color: #00b894; font-weight: 700;
    }
    .deals-link { color: #f39c12 !important; font-weight: 700; }
    .deals-link.active-link { border-bottom-color: #f39c12; }

    /* ══ MEGA MENU ══ */
    .mega-menu {
      position: absolute; top: 48px; left: 0;
      width: 700px; max-width: 100vw;
      background: var(--sb-bg-elevated);
      border: 1.5px solid var(--sb-border);
      border-radius: 0 0 18px 18px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.13);
      display: flex; z-index: 500; overflow: hidden;
      animation: slideDown 0.18s ease;
    }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

    .mega-left {
      width: 220px; flex-shrink: 0;
      background: rgba(0,184,148,0.03);
      border-right: 1.5px solid var(--sb-border);
      padding: 8px 0; max-height: 420px; overflow-y: auto;
    }
    .mega-cat-item {
      display: flex; align-items: center; gap: 10px; padding: 11px 16px;
      cursor: pointer; transition: 0.15s; color: var(--sb-text);
    }
    .mega-cat-item:hover, .mega-cat-item.active {
      background: var(--sb-bg-elevated); color: #00b894;
    }
    .mega-cat-icon { width: 20px; height: 20px; flex-shrink: 0; display: flex; align-items: center; }
    .mega-cat-icon ::ng-deep svg { width: 18px; height: 18px; stroke: currentColor; }
    .mega-cat-name { flex: 1; font-size: 13px; font-weight: 600; }
    .mega-chevron { flex-shrink: 0; opacity: 0.4; }
    .mega-cat-item.active .mega-chevron, .mega-cat-item:hover .mega-chevron { opacity: 1; }

    .mega-right { flex: 1; padding: 20px 24px; max-height: 420px; overflow-y: auto; }
    .mega-right-title { font-size: 16px; font-weight: 800; color: var(--sb-text); margin-bottom: 6px; }
    .mega-right-desc { font-size: 13px; color: var(--sb-text-muted); margin-bottom: 14px; line-height: 1.5; }
    .mega-browse-btn {
      display: inline-flex; align-items: center; gap: 4px;
      color: #00b894; font-weight: 700; font-size: 13px;
      text-decoration: none; margin-bottom: 16px;
    }
    .mega-browse-btn:hover { text-decoration: underline; }
    .mega-sub-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
    .mega-sub-item { font-size: 13px; color: var(--sb-text-secondary); text-decoration: none; padding: 4px 0; transition: color 0.15s; }
    .mega-sub-item:hover { color: #00b894; }
    .mega-empty { font-size: 13px; color: var(--sb-text-muted); font-style: italic; }

    /* ══ NOTIFICATION DROPDOWN ══ */
    .notif-wrapper { position: relative; display: flex; }
    .notif-dropdown {
      position: absolute; top: calc(100% + 12px); right: -8px;
      width: 360px; background: var(--sb-bg-elevated);
      border: 1.5px solid var(--sb-border); border-radius: 18px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.13);
      z-index: 2000; overflow: hidden;
      animation: dropdownIn 0.2s cubic-bezier(0.16,1,0.3,1);
    }
    .notif-dropdown::before {
      content: ''; position: absolute; top: -6px; right: 16px;
      width: 12px; height: 12px; background: var(--sb-bg-elevated);
      border-left: 1.5px solid var(--sb-border);
      border-top: 1.5px solid var(--sb-border);
      transform: rotate(45deg); z-index: 1;
    }
    .notif-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 20px 12px; border-bottom: 1px solid var(--sb-border);
    }
    .notif-title { font-weight: 800; font-size: 15px; color: var(--sb-text); }
    .notif-count {
      font-size: 11px; font-weight: 700;
      background: rgba(231,76,60,0.1); color: #e74c3c;
      padding: 2px 10px; border-radius: 100px;
    }
    .notif-empty { text-align: center; padding: 32px 20px; color: var(--sb-text-muted); }
    .notif-empty span { font-size: 2rem; display: block; margin-bottom: 8px; }
    .notif-list { max-height: 320px; overflow-y: auto; }
    .nd-item {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 12px 20px; cursor: pointer; transition: background 0.15s;
      border-bottom: 1px solid var(--sb-border);
    }
    .nd-item:hover { background: rgba(0,184,148,0.04); }
    .nd-item:last-child { border-bottom: none; }
    .nd-unread { background: rgba(0,184,148,0.02); }
    .nd-icon-wrap {
      width: 32px; height: 32px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; margin-top: 2px;
    }
    .nd-icon-wrap.type-success { background: rgba(16,185,129,0.1); color: #10b981; }
    .nd-icon-wrap.type-danger { background: rgba(239,68,68,0.1); color: #ef4444; }
    .nd-icon-wrap.type-primary { background: rgba(26,175,165,0.1); color: #1aafa5; }
    .nd-icon-wrap.type-info { background: rgba(59,130,246,0.1); color: #3b82f6; }
    .nd-svg { display: flex; align-items: center; justify-content: center; }
    .nd-svg ::ng-deep svg { width: 16px; height: 16px; stroke: currentColor; }
    
    .nd-body { flex: 1; min-width: 0; }
    .nd-subject { font-weight: 700; font-size: 13px; color: var(--sb-text); margin: 0 0 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .nd-msg { font-size: 12px; color: var(--sb-text-secondary); margin: 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .notif-footer {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 12px 20px; background: rgba(0,184,148,0.04);
      border-top: 1px solid var(--sb-border);
      text-decoration: none; color: #00b894;
      font-weight: 700; font-size: 13px; transition: background 0.15s;
    }
    .notif-footer:hover { background: rgba(0,184,148,0.1); }

    /* ══ MOBILE ══ */
    .mobile-nav {
      position: fixed; top: 118px; left: 0; right: 0; bottom: 0;
      background: var(--sb-bg-elevated); padding: 20px;
      z-index: 999; display: flex; flex-direction: column;
      gap: 4px; overflow-y: auto;
      border-top: 1.5px solid var(--sb-border);
    }
    .mobile-search { margin-bottom: 10px; }
    .mobile-link {
      padding: 14px 12px; text-decoration: none; color: var(--sb-text);
      font-weight: 600; display: flex; align-items: center; gap: 10px;
      font-size: 15px; border: none; background: none; width: 100%;
      text-align: left; font-family: inherit; cursor: pointer;
      border-radius: 10px; transition: 0.15s;
    }
    .mobile-link:hover { background: rgba(0,184,148,0.08); color: #00b894; }
    .mobile-link.logout { color: #e74c3c; }

    /* ══ TOAST ══ */
    .toast-container {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      background: var(--sb-bg-elevated); border: 1.5px solid var(--sb-border);
      border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.12);
      padding: 16px; display: flex; align-items: flex-start; gap: 12px;
      width: 320px; max-width: calc(100vw - 48px);
      cursor: pointer; transition: all 0.2s;
      animation: slideInUp 0.3s cubic-bezier(0.16,1,0.3,1);
    }
    .toast-container:hover { transform: translateY(-4px); border-color: #00b894; }
    @keyframes slideInUp { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .toast-icon { font-size: 1.5rem; line-height: 1; margin-top: 2px; }
    .toast-content { flex: 1; }
    .toast-content h4 { margin: 0 0 4px; font-size: 14px; font-weight: 700; color: var(--sb-text); }
    .toast-content p { margin: 0; font-size: 12px; color: var(--sb-text-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .toast-close { background: none; border: none; color: var(--sb-text-muted); font-size: 1.1rem; cursor: pointer; padding: 0; transition: 0.2s; }
    .toast-close:hover { color: #e74c3c; }

    /* ══ RESPONSIVE ══ */
    @media (max-width: 1024px) {
      .nav-container { padding: 0 24px; }
      .nav-search { max-width: 380px; }
      .search-cat { display: none; }
    }
    @media (max-width: 992px) { .nav-links { display: none; } }
    @media (max-width: 768px) {
      .nav-search-wrapper { display: none; }
      .user-name, .user-chevron { display: none; }
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
  searchQuery = '';
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
        this.cdr.detectChanges();
      },
      error: () => { }
    });
    this.notifService.unreadCount$.subscribe(count => { this.unreadCount = count; });
    this.notifService.notifications$.subscribe(notifs => { this.notifications = notifs; });
    this.notifService.newNotification$.subscribe(notif => { this.showToast(notif); });
    this.panierService.cartCount$.subscribe(count => { this.cartCount = count; this.cdr.detectChanges(); });
    if (this.auth.isLoggedIn()) { this.panierService.init(); }
  }

  showToast(notif: any) {
    this.activeToast = notif;
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => this.closeToast(), 5000);
  }
  closeToast() { this.activeToast = null; }

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

  onNavClick(event: MouseEvent) { }

  toggleNotifPanel() {
    this.notifPanelOpen = !this.notifPanelOpen;
    this.megaOpen = false;
    this.menuOpen = false;
  }

  markRead(notif: any) {
    if (!notif.notificationLue) this.notifService.markAsRead(notif.id).subscribe();
    this.handleRedirection(notif);
  }

  private handleRedirection(notif: any) {
    this.notifPanelOpen = false;

    // If there's a specific link, use it
    if (notif.lienAction) {
      this.router.navigate([notif.lienAction]);
      return;
    }

    // Otherwise, deduce based on notification content or type
    const sujet = notif.sujetNotification?.toLowerCase() || '';
    const msg = notif.corpsMessage?.toLowerCase() || '';

    if (sujet.includes('service') || msg.includes('service')) {
      this.router.navigate(['/vendeur/produits'], { queryParams: { tab: 'services' } });
    } else if (sujet.includes('produit') || msg.includes('produit')) {
      this.router.navigate(['/vendeur/produits'], { queryParams: { tab: 'market' } });
    } else if (sujet.includes('annonce') || msg.includes('annonce')) {
      this.router.navigate(['/vendeur/produits'], { queryParams: { tab: 'annonces' } });
    } else {
      // Default fallback
      this.router.navigate(['/notifications']);
    }
  }

  goToNotifications() { this.router.navigate(['/notifications']); }

  getInitials(): string {
    const nom = this.auth.getNomComplet();
    if (!nom) return '?';
    return nom.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
  }

  isVendeur(): boolean {
    const role = this.auth.getPrimaryRole();
    return ['AUTO_ENTREPRENEUR', 'MAGASIN', 'COOPERATIVE', 'SARL'].includes(role);
  }

  logout() { this.menuOpen = false; this.mobileOpen = false; this.auth.logout(); }

  onSearch() {
    const q = this.searchQuery?.trim();
    if (q) {
      this.router.navigate(['/annonces'], { queryParams: { q: q } });
      this.searchQuery = '';
    }
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'VALIDATION':
      case 'ACTIVATION':
      case 'VALIDATION_PAIEMENT': return 'type-success';
      case 'REFUS': return 'type-danger';
      case 'NOUVELLE_ANNONCE': return 'type-info';
      default: return 'type-primary';
    }
  }

  getTypeSvg(type: string): SafeHtml {
    const svgs: Record<string, string> = {
      'VALIDATION': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
      'VALIDATION_PAIEMENT': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
      'ACTIVATION': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/><path d="m12 14 1.5 5.5"/><path d="m12 14-1.5 5.5"/></svg>`,
      'REFUS': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
      'NOUVELLE_ANNONCE': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
    };
    const fallback = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(svgs[type] ?? fallback);
  }

  getNotifEmoji(type: string): string {
    const map: Record<string, string> = {
      'VALIDATION': '✅', 'VALIDATION_PAIEMENT': '✅', 'ACTIVATION': '🚀',
      'REFUS': '❌', 'NOUVELLE_ANNONCE': '📢', 'COMMANDE_PLACEE': '🛍️',
      'COMMANDE_CONFIRMEE': '✅', 'COMMANDE_EN_PREPARATION': '📦',
      'COMMANDE_EXPEDIEE': '🚚', 'COMMANDE_LIVREE': '🎉',
      'COMMANDE_ANNULEE': '❌', 'PAIEMENT_CONFIRME_VENDEUR': '💰'
    };
    return map[type] ?? '🔔';
  }

  getCatIcon(name: string): SafeHtml {
    const icons: Record<string, string> = {
      'Marketplace': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`,
      'Automobile': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
      'Véhicules': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
      'Immobilier': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
      'Emploi': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>`,
      'Services': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>`,
      'Informatique': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
      'Électronique': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
      'Mode': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/></svg>`,
      'Maison': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
      'Sport': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l4.24 4.24M14.83 9.17l4.24-4.24M14.83 14.83l4.24 4.24M9.17 14.83l-4.24 4.24"/></svg>`,
      'Alimentation': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      'Artisanat': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
    };
    return this.sanitizer.bypassSecurityTrustHtml(
      icons[name] ?? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/></svg>`
    );
  }
}