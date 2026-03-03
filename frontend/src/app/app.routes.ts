import { Routes } from '@angular/router';
import { LoginComponent } from './components/login.component';
import { RegisterComponent } from './components/register.component';
import { HomeComponent } from './components/home.component';
import { ProductSubmissionComponent } from './components/product-submission.component';
import { NotificationsComponent } from './components/notifications.component';
import { ProductValidationComponent } from './components/admin/product-validation.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard.component';
import { AdminLogsComponent } from './components/admin/admin-logs.component';
import { UserManagementComponent } from './components/admin/user-management.component';
import { CategoryManagementComponent } from './components/admin/category-management.component';
import { ProductDetailComponent } from './components/product-detail.component';
import { PanierComponent } from './components/panier.component';
import { MesAnnoncesComponent } from './components/mes-annonces.component';
import { authGuard } from './guards/auth.guard';

import { roleGuard } from './guards/role.guard';
import { AdminLayoutComponent } from './components/admin/admin-layout.component';

import { VendeurLayoutComponent } from './components/vendeur/vendeur-layout.component';
import { VendeurDashboardComponent } from './components/vendeur/vendeur-dashboard.component';
import { VendeurProduitsComponent } from './components/vendeur/vendeur-produits.component';
import { VendeurCommandesComponent } from './components/vendeur/vendeur-commandes.component';
import { VendeurEtudeComponent } from './components/vendeur/vendeur-etude.component';
import { ServicesListComponent } from './components/services-list.component';
import { ServicePublishComponent } from './components/service-publish.component';
import { AdminServicesComponent } from './components/admin/admin-services.component';
import { ServiceDetailComponent } from './components/service-detail.component';
import { MessagesComponent } from './components/messages.component';
import { MesServicesComponent } from './components/mes-services.component';

// Marketplace components
import { MarketplaceComponent } from './components/marketplace/marketplace.component';
import { CategoryProductsComponent } from './components/category-products/category-products.component';
import { MarketProductDetailComponent } from './components/market-product-detail.component';
import { MarketProductSubmissionComponent } from './components/market-product-submission.component';

export const routes: Routes = [
    // Public routes
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'product/:id', component: ProductDetailComponent },          // Existing (Anonce detail)
    { path: 'marketplace', component: MarketplaceComponent },             // NEW: Marketplace
    { path: 'categories/:slug', component: CategoryProductsComponent },   // NEW: Category view
    { path: 'market-products/:id', component: MarketProductDetailComponent }, // NEW: Product detail
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'services', component: ServicesListComponent },
    { path: 'service/:id', component: ServiceDetailComponent },

    // Requires login
    {
        path: 'panier',
        component: PanierComponent,
        canActivate: [authGuard]
    },
    {
        path: 'submit-product',         // Existing (Anonce submission)
        component: ProductSubmissionComponent,
        canActivate: [authGuard]
    },
    {
        path: 'publish-service',
        component: ServicePublishComponent,
        canActivate: [authGuard]
    },
    {
        path: 'mes-annonces',
        component: MesAnnoncesComponent,
        canActivate: [authGuard]
    },
    {
        path: 'mes-services',
        component: MesServicesComponent,
        canActivate: [authGuard]
    },
    {
        path: 'notifications',
        component: NotificationsComponent,
        canActivate: [authGuard]
    },
    {
        path: 'messages',
        component: MessagesComponent,
        canActivate: [authGuard]
    },

    // Vendor routes
    {
        path: 'vendeur',
        component: VendeurLayoutComponent,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_AUTO_ENTREPRENEUR', 'ROLE_MAGASIN', 'ROLE_COOPERATIVE', 'ROLE_SARL', 'ROLE_ANNONCEUR'] },
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: VendeurDashboardComponent },
            { path: 'produits', component: VendeurProduitsComponent },
            { path: 'produits/nouveau', component: MarketProductSubmissionComponent },     // NEW
            { path: 'produits/:id/modifier', component: MarketProductSubmissionComponent }, // NEW
            { path: 'commandes', component: VendeurCommandesComponent },
            { path: 'etude', component: VendeurEtudeComponent }
        ]
    },

    // Admin-only routes (SUPERADMIN or ADJOINTADMIN)
    {
        path: 'admin',
        component: AdminLayoutComponent,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_SUPERADMIN', 'ROLE_ADJOINTADMIN'] },
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: AdminDashboardComponent },
            { path: 'products', component: ProductValidationComponent },
            { path: 'services', component: AdminServicesComponent },
            { path: 'users', component: UserManagementComponent },
            { path: 'categories', component: CategoryManagementComponent },
            { path: 'logs', component: AdminLogsComponent }
        ]
    },

    // Fallback
    { path: '**', redirectTo: '/home' }
];
