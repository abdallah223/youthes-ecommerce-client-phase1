import { Component, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdminOrderService } from '../../../../core/services/admin-order.service';
import { ProductService } from '../../../../core/services/product.service';
import { Order, OrderStatus } from '../../../../core/models';
import { Loading } from '../../../../shared/components/loading/loading';
import {
  ADMIN_STATUS_TRANSITIONS,
  CANCELLED_STATUSES,
  ORDER_PROGRESS_STEPS,
} from '../../../../core/constants/app.constants';
import { LucideIconsModule } from '../../../../shared/lucide-icons.module';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, Loading, LucideIconsModule],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.css',
})
export class OrderDetail implements OnInit, OnDestroy {
  @Input({ required: true }) id!: string;

  private readonly orderService   = inject(AdminOrderService);
  readonly productService         = inject(ProductService);
  private readonly fb             = inject(FormBuilder);

  private updateSubscription: Subscription | null = null;

  order$: Observable<Order> | null = null;

  updatedOrder:  Order | null = null;
  isUpdating     = false;
  updateError    = '';
  updateSuccess  = '';
  showStatusForm = false;

  readonly progressSteps = ORDER_PROGRESS_STEPS;

  readonly statusForm = this.fb.group({
    status: ['', Validators.required],
    note:   [''],
  });

  ngOnInit(): void {
    this.order$ = this.orderService.getOrderById(this.id).pipe(map(res => res.data));
  }

  getStatusLabel(s: string): string { return this.orderService.getStatusLabel(s); }
  getStatusClass(s: string): string { return this.orderService.getStatusClass(s); }

  getDisplayOrder(async: Order): Order { return this.updatedOrder ?? async; }

  getNextStatuses(current: OrderStatus): OrderStatus[] {
    return ADMIN_STATUS_TRANSITIONS[current] ?? [];
  }

  isStepComplete(step: string, current: string): boolean {
    const si = this.progressSteps.indexOf(step as OrderStatus);
    const ci = this.progressSteps.indexOf(current as OrderStatus);
    return si !== -1 && ci >= si;
  }

  isCancelled(status: string): boolean {
    return CANCELLED_STATUSES.includes(status as OrderStatus);
  }

  getItemsSubtotal(order: Order): number {
    return order.totalAmount - order.shippingFee;
  }

  openStatusForm(current: OrderStatus): void {
    const next = this.getNextStatuses(current);
    if (!next.length) return;
    this.statusForm.patchValue({ status: next[0], note: '' });
    this.showStatusForm = true;
    this.updateError    = '';
    this.updateSuccess  = '';
  }

  submitStatus(): void {
    if (this.statusForm.invalid) return;

    this.isUpdating  = true;
    this.updateError = '';

    this.updateSubscription?.unsubscribe();
    this.updateSubscription = this.orderService.updateStatus(this.id, {
      status: this.statusForm.value.status as OrderStatus,
      note:   this.statusForm.value.note   ?? undefined,
    }).subscribe({
      next: res => {
        this.updatedOrder   = res.data;
        this.isUpdating     = false;
        this.showStatusForm = false;
        this.updateSuccess  = `Status updated to "${this.getStatusLabel(res.data.status)}"`;
      },
      error: err => {
        this.updateError = err.error?.message ?? 'Failed to update status.';
        this.isUpdating  = false;
      },
    });
  }

  ngOnDestroy(): void { this.updateSubscription?.unsubscribe(); }
}


