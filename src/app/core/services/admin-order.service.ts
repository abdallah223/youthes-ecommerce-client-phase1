import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ADMIN_ORDERS_PER_PAGE } from '../constants/app.constants';
import {
  Order, ApiResponse, PaginatedResponse,
  AdminOrderQuery, UpdateOrderStatusPayload, SalesReport, NotificationCounts,
} from '../models';

@Injectable({ providedIn: 'root' })
export class AdminOrderService {
  private readonly http = inject(HttpClient);
  private readonly api  = `${environment.apiUrl}/orders`;

  getOrders(query: AdminOrderQuery = {}): Observable<PaginatedResponse<Order>> {
    let params = new HttpParams().set('limit', ADMIN_ORDERS_PER_PAGE);
    if (query.page)     params = params.set('page',     query.page);
    if (query.status)   params = params.set('status',   query.status);
    if (query.search)   params = params.set('search',   query.search);
    if (query.dateFrom) params = params.set('dateFrom', query.dateFrom);
    if (query.dateTo)   params = params.set('dateTo',   query.dateTo);
    return this.http.get<PaginatedResponse<Order>>(`${this.api}/admin`, { params });
  }

  getOrderById(id: string): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.api}/admin/${id}`);
  }

  updateStatus(id: string, payload: UpdateOrderStatusPayload): Observable<ApiResponse<Order>> {
    return this.http.patch<ApiResponse<Order>>(`${this.api}/admin/${id}/status`, payload);
  }

  getSalesReport(dateFrom: string, dateTo: string): Observable<ApiResponse<SalesReport>> {
    const params = new HttpParams().set('dateFrom', dateFrom).set('dateTo', dateTo);
    return this.http.get<ApiResponse<SalesReport>>(`${this.api}/admin/reports/sales`, { params });
  }

  getNotifications(): Observable<ApiResponse<NotificationCounts>> {
    return this.http.get<ApiResponse<NotificationCounts>>(`${this.api}/admin/notifications`);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      Pending: 'Pending', Prepared: 'Prepared', Shipped: 'Shipped',
      Delivered: 'Delivered', CancelledByUser: 'Cancelled by User',
      CancelledByAdmin: 'Cancelled by Admin', Rejected: 'Rejected',
    };
    return labels[status] ?? status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      Pending: 'badge--warning', Prepared: 'badge--info',
      Shipped: 'badge--accent',  Delivered: 'badge--success',
      CancelledByUser: 'badge--neutral', CancelledByAdmin: 'badge--neutral',
      Rejected: 'badge--error',
    };
    return classes[status] ?? 'badge--neutral';
  }
}


