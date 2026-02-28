import { Routes } from '@angular/router';
import { LoginComponent } from './components/login.component';
import { RegisterComponent } from './components/register.component';
import { HomeComponent } from './components/home.component';
import { ProductSubmissionComponent } from './components/product-submission.component';
import { ProductValidationComponent } from './components/admin/product-validation.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard.component';
import { AdminLogsComponent } from './components/admin/admin-logs.component';
import { UserManagementComponent } from './components/admin/user-management.component';
import { CategoryManagementComponent } from './components/admin/category-management.component';
import { ProductDetailComponent } from './components/product-detail.component';
import { PanierComponent } from './components/panier.component';
import { authGuard } from './guards/auth.guard';

import { roleGuard } from './guards/role.guard';
import { AdminLayoutComponent } from './components/admin/admin-layout.component';

import { VendeurLayoutComponent } from './components/vendeur/vendeur-layout.component';
import { VendeurDashboardComponent } from './components/vendeur/vendeur-dashboard.component';
import { VendeurProduitsComponent } from './components/vendeur/vendeur-produits.component';
import { VendeurCommandesComponent } from './components/vendeur/vendeur-commandes.component';
import { VendeurEtudeComponent } from './components/vendeur/vendeur-etude.component';

export const routes: Routes = [
    // Public routes
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'product/:id', component: ProductDetailComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },

    // Requires login
    {
        path: 'panier',
        component: PanierComponent,
        canActivate: [authGuard]
    },
    {
        path: 'submit-product',
        component: ProductSubmissionComponent,
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
            { path: 'users', component: UserManagementComponent },
            { path: 'categories', component: CategoryManagementComponent },
            { path: 'logs', component: AdminLogsComponent }
        ]
    },

    // Fallback
    { path: '**', redirectTo: '/home' }
];
