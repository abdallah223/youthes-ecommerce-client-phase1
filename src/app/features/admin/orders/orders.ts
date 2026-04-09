import { Component, inject, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ReactiveFormsModule, FormBuilder } from "@angular/forms";
import { Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { AdminOrderService } from "../../../core/services/admin-order.service";
import {
  Order,
  PaginationMeta,
  AdminOrderQuery,
  OrderStatus,
} from "../../../core/models";
import { Loading } from "../../../shared/components/loading/loading";
import {
  DEFAULT_PAGE,
  SEARCH_DEBOUNCE_MS,
} from "../../../core/constants/app.constants";
import { LucideIconsModule } from "../../../shared/lucide-icons.module";

const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "Pending", label: "Pending" },
  { value: "Prepared", label: "Prepared" },
  { value: "Shipped", label: "Shipped" },
  { value: "Delivered", label: "Delivered" },
  { value: "CancelledByUser", label: "Cancelled by User" },
  { value: "CancelledByAdmin", label: "Cancelled by Admin" },
  { value: "Rejected", label: "Rejected" },
];

@Component({
  selector: "app-orders",
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, Loading, LucideIconsModule],
  templateUrl: "./orders.html",
  styleUrl: "./orders.css",
})
export class Orders implements OnInit, OnDestroy {
  private readonly orderService = inject(AdminOrderService);
  private readonly fb = inject(FormBuilder);

  private loadSubscription: Subscription | null = null;
  private searchSubscription: Subscription | null = null;

  readonly statusOptions = STATUS_FILTER_OPTIONS;

  orders: Order[] = [];
  meta: PaginationMeta | null = null;
  isLoading = true;
  currentPage = DEFAULT_PAGE;
  currentStatus = "";
  currentSearch = "";

  readonly searchControl = this.fb.control("");

  ngOnInit(): void {
    this.loadOrders();

    this.searchSubscription = this.searchControl.valueChanges
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), distinctUntilChanged())
      .subscribe((value) => {
        this.currentSearch = value ?? "";
        this.currentPage = DEFAULT_PAGE;
        this.loadOrders();
      });
  }

  loadOrders(): void {
    this.isLoading = true;
    this.loadSubscription?.unsubscribe();

    const query: AdminOrderQuery = { page: this.currentPage };
    if (this.currentStatus) query.status = this.currentStatus as OrderStatus;
    if (this.currentSearch) query.search = this.currentSearch;

    this.loadSubscription = this.orderService.getOrders(query).subscribe({
      next: (res) => {
        this.orders = res.data;
        this.meta = res.meta;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  onStatusChange(event: Event): void {
    this.currentStatus = (event.target as HTMLSelectElement).value;
    this.currentPage = DEFAULT_PAGE;
    this.loadOrders();
  }

  setPage(page: number): void {
    this.currentPage = page;
    this.loadOrders();
  }

  getStatusLabel(status: string): string {
    return this.orderService.getStatusLabel(status);
  }
  getStatusClass(status: string): string {
    return this.orderService.getStatusClass(status);
  }

  getPages(): number[] {
    if (!this.meta) return [];
    return Array.from({ length: this.meta.pages }, (_, i) => i + 1);
  }

  ngOnDestroy(): void {
    this.loadSubscription?.unsubscribe();
    this.searchSubscription?.unsubscribe();
  }
}
