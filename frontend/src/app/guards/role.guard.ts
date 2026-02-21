import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
        return router.createUrlTree(['/login']);
    }

    const allowedRoles: string[] = route.data['roles'] ?? [];
    if (allowedRoles.length === 0) return true;

    const userRoles = authService.getRoles();
    const hasAccess = allowedRoles.some(r => userRoles.includes(r));

    if (hasAccess) return true;

    // Redirect based on user role
    const primary = authService.getPrimaryRole();
    if (primary === 'SUPERADMIN' || primary === 'ADJOINTADMIN') {
        return router.createUrlTree(['/admin/dashboard']);
    }
    return router.createUrlTree(['/home']);
};
