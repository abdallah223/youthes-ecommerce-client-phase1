import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { Testimonial, ApiResponse } from "../models";

@Injectable({ providedIn: "root" })
export class TestimonialService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/testimonials`;

  getApproved(): Observable<ApiResponse<Testimonial[]>> {
    return this.http.get<ApiResponse<Testimonial[]>>(`${this.api}/approved`);
  }

  submit(
    reviewText: string,
    rating: number,
  ): Observable<ApiResponse<Testimonial>> {
    return this.http.post<ApiResponse<Testimonial>>(this.api, {
      reviewText,
      rating,
    });
  }
}
