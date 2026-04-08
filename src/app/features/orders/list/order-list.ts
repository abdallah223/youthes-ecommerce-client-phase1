import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { BehaviorSubject, map, switchMap } from 'rxjs';
import { DEFAULT_PAGE } from '../../../core/constants/app.constants';
import { Order, PaginationMeta } from '../../../core/models';
import { OrderService } from '../../../core/services/order.service';
import { Loading } from '../../../shared/components/loading/loading';
import { Pagination } from '../../../shared/components/pagination/pagination';

interface OrdersState {
  orders: Order[];
  meta: PaginationMeta;
}

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule, Loading, Pagination, LucideAngularModule],
  templateUrl: './order-list.html',
  styleUrl: './order-list.css',
})
export class OrderList {
  private readonly orderService = inject(OrderService);
  private readonly page$ = new BehaviorSubject(DEFAULT_PAGE);

  readonly ordersState$ = this.page$.pipe(
    switchMap((page) => this.orderService.getMyOrders(page)),
    map((response): OrdersState => ({
      orders: response.data,
      meta: response.meta,
    }))
  );

  onPageChange(page: number): void {
    this.page$.next(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getStatusLabel(status: string): string {
    return this.orderService.getStatusLabel(status);
  }

  getStatusClass(status: string): string {
    return this.orderService.getStatusClass(status);
  }

  trackByOrderId(_index: number, order: Order): string {
    return order._id;
  }
}
