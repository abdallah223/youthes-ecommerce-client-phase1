import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import {
  BehaviorSubject,
  catchError,
  firstValueFrom,
  map,
  Observable,
  of,
  tap,
} from "rxjs";
import { environment } from "../../../environments/environment";
import { STORAGE_KEYS } from "../constants/app.constants";
import {
  User,
  LoginPayload,
  RegisterPayload,
  AuthResponse,
  ApiResponse,
} from "../models";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly api = `${environment.apiUrl}/auth`;

  private readonly currentUserSubject = new BehaviorSubject<User | null>(
    this.loadUserFromStorage(),
  );

  /* ── Observables for templates (async pipe) ────────────────── */
  readonly currentUser$: Observable<User | null> =
    this.currentUserSubject.asObservable();
  readonly isLoggedIn$: Observable<boolean> = this.currentUser$.pipe(
    map((u) => !!u),
  );

  /* ── Synchronous accessors for guards and interceptors ─────── */
  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }
  isAdmin(): boolean {
    return this.currentUserSubject.value?.role?.toLowerCase() === "admin";
  }
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /* ── Auth actions ──────────────────────────────────────────── */
  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.api}/login`, payload)
      .pipe(tap((res) => this.saveSession(res.data.token, res.data.user)));
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.api}/register`, payload)
      .pipe(tap((res) => this.saveSession(res.data.token, res.data.user)));
  }

  logout(): void {
    void firstValueFrom(
      this.http
        .post<ApiResponse<null>>(`${this.api}/logout`, {})
        .pipe(catchError(() => of(null))),
    ).finally(() => this.endSession());
  }

  updateCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  clearSession(): void {
    this.endSession();
  }

  /* ── Private helpers ───────────────────────────────────────── */
  private saveSession(token: string, user: User): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private endSession(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    this.currentUserSubject.next(null);
    this.router.navigate(["/"]);
  }

  private loadUserFromStorage(): User | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USER);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
