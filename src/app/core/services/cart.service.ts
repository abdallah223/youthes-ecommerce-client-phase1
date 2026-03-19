import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  BehaviorSubject,
  catchError,
  distinctUntilChanged,
  Observable,
  of,
  switchMap,
} from "rxjs";
import { tap } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { STORAGE_KEYS } from "../constants/app.constants";
import { Cart, ApiResponse, GuestCartItem } from "../models";
import { AuthService } from "./auth.service";

@Injectable({ providedIn: "root" })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly api = `${environment.apiUrl}/cart`;

  private readonly cartSubject = new BehaviorSubject<Cart | null>(null);
  private readonly itemCountSubject = new BehaviorSubject<number>(
    this.getGuestCart().reduce((sum, i) => sum + i.quantity, 0),
  );

  readonly cart$: Observable<Cart | null> = this.cartSubject.asObservable();
  readonly itemCount$: Observable<number> =
    this.itemCountSubject.asObservable();

  constructor() {
    this.authService.isLoggedIn$
      .pipe(
        distinctUntilChanged(),
        switchMap((isLoggedIn) => {
          if (!isLoggedIn) {
            this.cartSubject.next(null);
            this.itemCountSubject.next(this.getGuestItemCount());
            return of(null);
          }

          return this.loadCart().pipe(
            catchError(() => {
              this.cartSubject.next(null);
              this.itemCountSubject.next(0);
              return of(null);
            }),
          );
        }),
      )
      .subscribe();
  }

  /* ── Server cart ─────────────────────────────────────── */

  loadCart(): Observable<ApiResponse<Cart>> {
    return this.http
      .get<ApiResponse<Cart>>(this.api)
      .pipe(tap((res) => this.setServerCart(res.data)));
  }

  addItem(productId: string, quantity: number): Observable<ApiResponse<Cart>> {
    return this.http
      .post<ApiResponse<Cart>>(`${this.api}/items`, { productId, quantity })
      .pipe(tap((res) => this.setServerCart(res.data)));
  }

  updateItem(
    productId: string,
    quantity: number,
  ): Observable<ApiResponse<Cart>> {
    return this.http
      .put<ApiResponse<Cart>>(`${this.api}/items/${productId}`, { quantity })
      .pipe(tap((res) => this.setServerCart(res.data)));
  }

  removeItem(productId: string): Observable<ApiResponse<Cart>> {
    return this.http
      .delete<ApiResponse<Cart>>(`${this.api}/items/${productId}`)
      .pipe(tap((res) => this.setServerCart(res.data)));
  }

  clearServerCart(): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(this.api).pipe(
      tap(() => {
        this.cartSubject.next(null);
        this.itemCountSubject.next(0);
      }),
    );
  }

  mergeGuestCart(items: GuestCartItem[]): Observable<ApiResponse<Cart>> {
    return this.http
      .post<ApiResponse<Cart>>(`${this.api}/merge`, { items })
      .pipe(
        tap((res) => {
          this.setServerCart(res.data);
          this.clearGuestCart();
        }),
      );
  }

  confirmPriceChange(productId: string | "all"): Observable<ApiResponse<Cart>> {
    return this.http
      .patch<ApiResponse<Cart>>(`${this.api}/confirm-price/${productId}`, {})
      .pipe(tap((res) => this.setServerCart(res.data)));
  }

  /* ── Guest cart (localStorage) ───────────────────────── */

  getGuestCart(): GuestCartItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.GUEST_CART);
      return raw ? (JSON.parse(raw) as GuestCartItem[]) : [];
    } catch {
      return [];
    }
  }

  addToGuestCart(productId: string, quantity: number): void {
    const items = this.getGuestCart();
    const index = items.findIndex((i) => i.productId === productId);
    if (index >= 0) items[index].quantity += quantity;
    else items.push({ productId, quantity });
    this.saveGuestCart(items);
  }

  updateGuestCartItem(productId: string, quantity: number): void {
    const items = this.getGuestCart().map((i) =>
      i.productId === productId ? { ...i, quantity } : i,
    );
    this.saveGuestCart(items);
  }

  removeFromGuestCart(productId: string): void {
    const items = this.getGuestCart().filter((i) => i.productId !== productId);
    this.saveGuestCart(items);
  }

  clearGuestCart(): void {
    localStorage.removeItem(STORAGE_KEYS.GUEST_CART);
    this.itemCountSubject.next(0);
  }

  hasGuestCart(): boolean {
    return this.getGuestCart().length > 0;
  }

  /* ── Private helpers ─────────────────────────────────── */

  private setServerCart(cart: Cart): void {
    this.cartSubject.next(cart);
    this.itemCountSubject.next(cart.itemCount);
  }

  private saveGuestCart(items: GuestCartItem[]): void {
    localStorage.setItem(STORAGE_KEYS.GUEST_CART, JSON.stringify(items));
    const total = items.reduce((sum, i) => sum + i.quantity, 0);
    this.itemCountSubject.next(total);
  }

  private getGuestItemCount(): number {
    return this.getGuestCart().reduce((sum, i) => sum + i.quantity, 0);
  }
}
