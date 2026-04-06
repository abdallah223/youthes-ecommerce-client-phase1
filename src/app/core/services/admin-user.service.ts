import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ADMIN_USERS_PER_PAGE } from "../constants/app.constants";
import {
  User,
  ApiResponse,
  PaginatedResponse,
  AdminUserQuery,
} from "../models";

@Injectable({ providedIn: "root" })
export class AdminUserService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/users`;

  getUsers(query: AdminUserQuery = {}): Observable<PaginatedResponse<User>> {
    let params = new HttpParams().set("limit", ADMIN_USERS_PER_PAGE);
    if (query.page !== undefined) params = params.set("page", query.page);
    if (query.search) params = params.set("search", query.search);
    if (query.isActive !== undefined)
      params = params.set("isActive", String(query.isActive));
    return this.http.get<PaginatedResponse<User>>(this.api, { params });
  }

  toggleActive(id: string): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(`${this.api}/${id}/toggle`, {});
  }
}
