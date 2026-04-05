import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ORDERS_PER_PAGE } from '../constants/app.constants';
import { Order, CreateOrderPayload, ApiResponse, PaginatedResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly api  = `${environment.apiUrl}/orders`;

  createOrder(payload: CreateOrderPayload): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(this.api, payload);
  }

  getMyOrders(page: number): Observable<PaginatedResponse<Order>> {
    const params = new HttpParams().set('page', page).set('limit', ORDERS_PER_PAGE);
    return this.http.get<PaginatedResponse<Order>>(`${this.api}/my`, { params });
  }

  getMyOrderById(id: string): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.api}/my/${id}`);
  }

  cancelOrder(id: string, reason: string): Observable<ApiResponse<Order>> {
    return this.http.patch<ApiResponse<Order>>(`${this.api}/my/${id}/cancel`, { reason });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      Pending: 'Pending', Prepared: 'Prepared', Shipped: 'Shipped',
      Delivered: 'Delivered', CancelledByUser: 'Cancelled',
      CancelledByAdmin: 'Cancelled', Rejected: 'Rejected',
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


