import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideIconsModule } from '../../../shared/lucide-icons.module';
import { Subscription, forkJoin } from 'rxjs';
import { DEFAULT_PAGE } from '../../../core/constants/app.constants';
import { NotificationCounts, Order } from '../../../core/models';
import { AdminOrderService } from '../../../core/services/admin-order.service';
import { Loading } from '../../../shared/components/loading/loading';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    Loading,
    LucideIconsModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {
  private readonly orderService = inject(AdminOrderService);
  private subscription: Subscription | null = null;

  notifications: NotificationCounts = { newOrders: 0, outOfStock: 0 };
  recentOrders: Order[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.subscription = forkJoin({
      notifications: this.orderService.getNotifications(),
      orders: this.orderService.getOrders({
        page: DEFAULT_PAGE,
        limit: 5,
      } as any),
    }).subscribe({
      next: ({ notifications, orders }) => {
        this.notifications = notifications.data;
        this.recentOrders = orders.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  getStatusLabel(status: string): string {
    return this.orderService.getStatusLabel(status);
  }

  getStatusClass(status: string): string {
    return this.orderService.getStatusClass(status);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
