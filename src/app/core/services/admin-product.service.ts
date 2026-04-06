import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ADMIN_PRODUCTS_PER_PAGE } from "../constants/app.constants";
import {
  Product,
  ApiResponse,
  AdminProductQuery,
  AdminProductsResponse,
} from "../models";

@Injectable({ providedIn: "root" })
export class AdminProductService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/products`;

  getProducts(
    query: AdminProductQuery = {},
  ): Observable<AdminProductsResponse> {
    let params = new HttpParams().set("limit", ADMIN_PRODUCTS_PER_PAGE);
    if (query.page) params = params.set("page", query.page);
    if (query.category) params = params.set("category", query.category);
    if (query.search) params = params.set("search", query.search);
    return this.http.get<AdminProductsResponse>(`${this.api}/admin/all`, {
      params,
    });
  }

  createProduct(formData: FormData): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(this.api, formData);
  }

  updateProduct(
    id: string,
    formData: FormData,
  ): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.api}/${id}`, formData);
  }

  deleteProduct(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.api}/${id}`);
  }

  getImageUrl(filename: string): string {
    if (!filename) return "assets/placeholder.png";
    if (filename.startsWith("http")) return filename;
    return `${environment.uploadsUrl}/products/${filename}`;
  }
}
