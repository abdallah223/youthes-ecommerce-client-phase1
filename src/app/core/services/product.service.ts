import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import {
  Product,
  ProductsResponse,
  ProductQuery,
  ApiResponse,
} from "../models";

@Injectable({ providedIn: "root" })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/products`;

  getProducts(query: ProductQuery = {}): Observable<ProductsResponse> {
    const params = this.buildParams(query);
    return this.http.get<ProductsResponse>(this.api, { params });
  }

  getProductBySlug(slug: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.api}/${slug}`);
  }

  getImageUrl(filename: string): string {
    if (!filename) return "assets/placeholder.png";
    if (filename.startsWith("http")) return filename;
    return `${environment.uploadsUrl}/products/${filename}`;
  }

  private buildParams(query: ProductQuery): HttpParams {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params = params.set(key, String(value));
      }
    });
    return params;
  }
}
