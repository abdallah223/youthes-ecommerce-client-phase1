import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, ApiResponse } from '../models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http        = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly api         = `${environment.apiUrl}/users`;

  getProfile(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.api}/me`);
  }

  updateProfile(
    data: Partial<Pick<User, 'fullName' | 'email' | 'phone' | 'address'>>
  ): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.api}/me`, data).pipe(
      tap(res => this.authService.updateCurrentUser(res.data))
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(
      `${this.api}/me/change-password`,
      { currentPassword, newPassword }
    );
  }
}


