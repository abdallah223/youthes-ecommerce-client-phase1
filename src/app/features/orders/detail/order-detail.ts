import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { firstValueFrom, map, Observable } from 'rxjs';
import { CANCELLED_STATUSES, ORDER_PROGRESS_STEPS } from '../../../core/constants/app.constants';
import { Order } from '../../../core/models';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { Loading } from '../../../shared/components/loading/loading';
import { LucideIconsModule } from '../../../shared/lucide-icons.module';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, Loading, LucideIconsModule],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.css',
})
export class OrderDetail implements OnInit {
  @Input({ required: true }) id!: string;

  private readonly orderService = inject(OrderService);

  readonly productService = inject(ProductService);
  readonly progressSteps = ORDER_PROGRESS_STEPS;

  order$: Observable<Order> | null = null;

  isCancelling = false;
  cancelError = '';
  cancelledOrder: Order | null = null;

  ngOnInit(): void {
    this.order$ = this.orderService.getMyOrderById(this.id).pipe(map((response) => response.data));
  }

  getStatusLabel(status: string): string {
    return this.orderService.getStatusLabel(status);
  }

  getStatusClass(status: string): string {
    return this.orderService.getStatusClass(status);
  }

  isStepComplete(step: string, currentStatus: string): boolean {
    const stepIndex = this.progressSteps.indexOf(step as never);
    const currentIndex = this.progressSteps.indexOf(currentStatus as never);
    return currentIndex >= stepIndex && stepIndex !== -1;
  }

  isCancelledStatus(status: string): boolean {
    return CANCELLED_STATUSES.includes(status as never);
  }

  getItemsSubtotal(order: Order): number {
    return order.totalAmount - order.shippingFee;
  }

  async onCancelOrder(order: Order): Promise<void> {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    this.isCancelling = true;
    this.cancelError = '';

    try {
      const response = await firstValueFrom(
        this.orderService.cancelOrder(order._id, 'Cancelled by customer')
      );

      this.cancelledOrder = response.data;
      this.isCancelling = false;
    } catch (error) {
      this.cancelError =
        (error as HttpErrorResponse).error?.message ?? 'Failed to cancel order.';
      this.isCancelling = false;
    }
  }

  getDisplayOrder(asyncOrder: Order): Order {
    return this.cancelledOrder ?? asyncOrder;
  }
}
