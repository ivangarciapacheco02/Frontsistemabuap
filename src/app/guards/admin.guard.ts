import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { FacadeService } from '../services/facade.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private facadeService: FacadeService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    const userRole = this.facadeService.getUserGroup();
    
    if (userRole === 'administrador') {
      return true;
    } else {
      // Redirigir al home si no es administrador
      this.router.navigate(['/home']);
      return false;
    }
  }
}