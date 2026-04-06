import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { AdminOrderService } from '../../../core/services/admin-order.service';
import { NotificationCounts } from '../../../core/models';

interface NavItem {
  path:  string;
  label: string;
  icon:  string;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/admin/dashboard',    label: 'Dashboard',    icon: '⊞' },
  { path: '/admin/orders',       label: 'Orders',       icon: '📦' },
  { path: '/admin/products',     label: 'Products',     icon: '👕' },
  { path: '/admin/categories',   label: 'Categories',   icon: '🗂' },
  { path: '/admin/users',        label: 'Users',        icon: '👥' },
  { path: '/admin/testimonials', label: 'Testimonials', icon: '⭐' },
  { path: '/admin/pages',        label: 'Pages',        icon: '📄' },
  { path: '/admin/reports',      label: 'Reports',      icon: '📊' },
];

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout implements OnInit, OnDestroy {
  private readonly authService  = inject(AuthService);
  private readonly orderService = inject(AdminOrderService);
  private readonly router       = inject(Router);

  private notificationSubscription: Subscription | null = null;
  private routerSubscription:       Subscription | null = null;

  readonly navItems = NAV_ITEMS;

  notifications: NotificationCounts = { newOrders: 0, outOfStock: 0 };
  isSidebarOpen = false;
  currentPath   = '';

  get adminName(): string {
    return this.authService.getCurrentUser()?.fullName ?? 'Admin';
  }

  get adminInitial(): string {
    return this.adminName.charAt(0).toUpperCase();
  }

  ngOnInit(): void {
    this.currentPath = this.router.url;

    this.routerSubscription = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).url)
    ).subscribe(url => {
      this.currentPath  = url;
      this.isSidebarOpen = false;
    });

    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationSubscription?.unsubscribe();
    this.notificationSubscription = this.orderService.getNotifications().subscribe({
      next: res => { this.notifications = res.data; },
    });
  }

  isActive(path: string): boolean {
    return this.currentPath.startsWith(path);
  }

  logout(): void { this.authService.logout(); }

  ngOnDestroy(): void {
    this.notificationSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
  }
}


