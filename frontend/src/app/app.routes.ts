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
import { PaymentComponent } from './components/payment.component';
import { MyAdsComponent } from './components/my-ads.component';
import { UserProfileComponent } from './components/user-profile.component';
import { WishlistComponent } from './components/wishlist.component';
import { authGuard } from './guards/auth.guard';


import { roleGuard } from './guards/role.guard';
import { AdminLayoutComponent } from './components/admin/admin-layout.component';

export const routes: Routes = [
    // Public routes
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'product/:id', component: ProductDetailComponent },
    { path: 'login', component: LoginComponent },

    { path: 'register', component: RegisterComponent },

    // Requires login (any authenticated user)
    {
        path: 'submit-product',
        component: ProductSubmissionComponent,
        canActivate: [authGuard]
    },
    {
        path: 'payment/:id',
        component: PaymentComponent,
        canActivate: [authGuard]
    },
    {
        path: 'my-ads',
        component: MyAdsComponent,
        canActivate: [authGuard]
    },
    {
        path: 'edit-product/:id',
        component: ProductSubmissionComponent,
        canActivate: [authGuard]
    },
    {
        path: 'profile',
        component: UserProfileComponent,
        canActivate: [authGuard]
    },
    {
        path: 'wishlist',
        component: WishlistComponent,
        canActivate: [authGuard]
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
            { path: 'logs', component: AdminLogsComponent },

        ]
    },



    // Fallback
    { path: '**', redirectTo: '/home' }
];
