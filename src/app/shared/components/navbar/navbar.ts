import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideIconsModule } from '../../lucide-icons.module';
import { User } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideIconsModule,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);

  readonly currentUser$ = this.authService.currentUser$;
  readonly itemCount$ = this.cartService.itemCount$;
  readonly userInitial = (user: User): string =>
    user.fullName.charAt(0).toUpperCase();
  readonly isAdminUser = (user: User): boolean =>
    user.role.toLowerCase() === 'admin';

  isScrolled = false;
  isMobileOpen = false;

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 24;
  }

  toggleMobile(): void {
    this.isMobileOpen = !this.isMobileOpen;
  }

  closeMobile(): void {
    this.isMobileOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.closeMobile();
  }

  get navbarClass(): string {
    return this.isScrolled ? 'navbar navbar--scrolled' : 'navbar';
  }
}
