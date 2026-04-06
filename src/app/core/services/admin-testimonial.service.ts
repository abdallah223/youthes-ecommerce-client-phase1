import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ADMIN_TESTIMONIALS_PER_PAGE } from "../constants/app.constants";
import { Testimonial, ApiResponse, PaginatedResponse } from "../models";

@Injectable({ providedIn: "root" })
export class AdminTestimonialService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/testimonials`;

  getTestimonials(
    status?: string,
    page = 1,
  ): Observable<PaginatedResponse<Testimonial>> {
    let params = new HttpParams()
      .set("page", page)
      .set("limit", ADMIN_TESTIMONIALS_PER_PAGE);
    if (status) params = params.set("status", status);
    return this.http.get<PaginatedResponse<Testimonial>>(`${this.api}/admin`, {
      params,
    });
  }

  updateStatus(
    id: string,
    status: string,
  ): Observable<ApiResponse<Testimonial>> {
    return this.http.patch<ApiResponse<Testimonial>>(
      `${this.api}/admin/${id}`,
      { status },
    );
  }
}
