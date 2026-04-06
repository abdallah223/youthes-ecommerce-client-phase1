import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { StaticPage, FaqItem, ContactUsContent, ApiResponse } from "../models";

@Injectable({ providedIn: "root" })
export class AdminPagesService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/pages`;

  getPage(
    key: "about_us" | "faq" | "contact_us",
  ): Observable<ApiResponse<StaticPage>> {
    return this.http.get<ApiResponse<StaticPage>>(`${this.api}/${key}`);
  }

  updateAboutUs(
    title: string,
    body: string,
  ): Observable<ApiResponse<StaticPage>> {
    return this.http.put<ApiResponse<StaticPage>>(
      `${this.api}/admin/about_us`,
      { title, body },
    );
  }

  updateFaq(items: FaqItem[]): Observable<ApiResponse<StaticPage>> {
    return this.http.put<ApiResponse<StaticPage>>(`${this.api}/admin/faq`, {
      items,
    });
  }

  updateContactUs(
    content: ContactUsContent,
  ): Observable<ApiResponse<StaticPage>> {
    return this.http.put<ApiResponse<StaticPage>>(
      `${this.api}/admin/contact_us`,
      content,
    );
  }
}
