import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { LucideIconsModule } from '../../../shared/lucide-icons.module';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { NotificationCounts } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';
import { AdminOrderService } from '../../../core/services/admin-order.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
  { path: '/admin/orders', label: 'Orders', icon: 'package' },
  { path: '/admin/products', label: 'Products', icon: 'boxes' },
  { path: '/admin/categories', label: 'Categories', icon: 'tags' },
  { path: '/admin/users', label: 'Users', icon: 'users' },
  { path: '/admin/testimonials', label: 'Testimonials', icon: 'message-square-quote' },
  { path: '/admin/pages', label: 'Pages', icon: 'file-text' },
  { path: '/admin/reports', label: 'Reports', icon: 'chart-column' },
];

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideIconsModule,
  ],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly orderService = inject(AdminOrderService);
  private readonly router = inject(Router);

  private notificationSubscription: Subscription | null = null;
  private routerSubscription: Subscription | null = null;

  readonly navItems = NAV_ITEMS;

  notifications: NotificationCounts = { newOrders: 0, outOfStock: 0 };
  isSidebarOpen = false;
  currentPath = '';

  get adminName(): string {
    return this.authService.getCurrentUser()?.fullName ?? 'Admin';
  }

  get adminInitial(): string {
    return this.adminName.charAt(0).toUpperCase();
  }

  ngOnInit(): void {
    this.currentPath = this.router.url;

    this.routerSubscription = this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map((event) => (event as NavigationEnd).url),
      )
      .subscribe((url) => {
        this.currentPath = url;
        this.isSidebarOpen = false;
      });

    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationSubscription?.unsubscribe();
    this.notificationSubscription = this.orderService
      .getNotifications()
      .subscribe({
        next: (response) => {
          this.notifications = response.data;
        },
      });
  }

  isActive(path: string): boolean {
    return this.currentPath.startsWith(path);
  }

  logout(): void {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.notificationSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
  }
}
