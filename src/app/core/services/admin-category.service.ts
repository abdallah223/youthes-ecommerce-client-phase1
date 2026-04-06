import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category, Subcategory, ApiResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class AdminCategoryService {
  private readonly http = inject(HttpClient);
  private readonly api  = `${environment.apiUrl}/categories`;

  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${this.api}/admin`);
  }

  createCategory(name: string, isActive = true): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(this.api, { name, isActive });
  }

  updateCategory(id: string, name: string): Observable<ApiResponse<Category>> {
    return this.http.put<ApiResponse<Category>>(`${this.api}/${id}`, { name });
  }

  deleteCategory(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.api}/${id}`);
  }

  createSubcategory(categoryId: string, name: string, isActive = true): Observable<ApiResponse<Subcategory>> {
    return this.http.post<ApiResponse<Subcategory>>(
      `${this.api}/${categoryId}/subcategories`,
      { name, isActive }
    );
  }

  updateSubcategory(categoryId: string, subId: string, name: string): Observable<ApiResponse<Subcategory>> {
    return this.http.put<ApiResponse<Subcategory>>(
      `${this.api}/${categoryId}/subcategories/${subId}`,
      { name }
    );
  }

  deleteSubcategory(categoryId: string, subId: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      `${this.api}/${categoryId}/subcategories/${subId}`
    );
  }
}


