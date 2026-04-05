import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { StaticPage, ApiResponse } from "../models";

@Injectable({ providedIn: "root" })
export class StaticPagesService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/pages`;

  getPage(
    key: "about_us" | "faq" | "contact_us",
  ): Observable<ApiResponse<StaticPage>> {
    return this.http.get<ApiResponse<StaticPage>>(`${this.api}/${key}`);
  }
}
