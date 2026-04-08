import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { CartItem, Product } from '../../core/models';
import { ProductService } from '../../core/services/product.service';
import { Loading } from '../../shared/components/loading/loading';

export interface GuestCartDisplayItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, Loading, LucideAngularModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);

  readonly productService = inject(ProductService);
  readonly cart$ = this.cartService.cart$;

  guestItems: GuestCartDisplayItem[] = [];
  isLoading = true;
  updatingProductId: string | null = null;

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get guestSubtotal(): number {
    return this.guestItems.reduce((sum, item) => sum + item.subtotal, 0);
  }

  get guestItemCount(): number {
    return this.guestItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  async ngOnInit(): Promise<void> {
    if (this.isLoggedIn) {
      try {
        await firstValueFrom(this.cartService.loadCart());
      } finally {
        this.isLoading = false;
      }

      return;
    }

    await this.buildGuestDisplay();
    this.isLoading = false;
  }

  async onUpdateQuantity(item: CartItem, quantity: number): Promise<void> {
    if (quantity < 1) {
      return;
    }

    this.updatingProductId = item.product._id;

    try {
      await firstValueFrom(this.cartService.updateItem(item.product._id, quantity));
    } finally {
      this.updatingProductId = null;
    }
  }

  async onRemoveItem(item: CartItem): Promise<void> {
    this.updatingProductId = item.product._id;

    try {
      await firstValueFrom(this.cartService.removeItem(item.product._id));
    } finally {
      this.updatingProductId = null;
    }
  }

  async onConfirmAllPrices(): Promise<void> {
    await firstValueFrom(this.cartService.confirmPriceChange('all'));
  }

  onGuestUpdateQuantity(item: GuestCartDisplayItem, quantity: number): void {
    if (quantity < 1) {
      return;
    }

    this.cartService.updateGuestCartItem(item.product._id, quantity);
    item.quantity = quantity;
    item.subtotal = item.product.price * quantity;
  }

  onGuestRemoveItem(item: GuestCartDisplayItem): void {
    this.cartService.removeFromGuestCart(item.product._id);
    this.guestItems = this.guestItems.filter((entry) => entry.product._id !== item.product._id);
  }

  isItemUpdating(item: CartItem): boolean {
    return this.updatingProductId === item.product._id;
  }

  trackByProductId(_index: number, item: CartItem): string {
    return item.product._id;
  }

  private async buildGuestDisplay(): Promise<void> {
    const guestItems = this.cartService.getGuestCart();
    if (!guestItems.length) {
      this.guestItems = [];
      return;
    }

    const response = await firstValueFrom(this.productService.getProducts({ limit: 100 }));
    const productMap = new Map(response.products.map((product) => [product._id, product]));

    this.guestItems = guestItems
      .map((item) => {
        const product = productMap.get(item.productId);
        if (!product) {
          return null;
        }

        return {
          product,
          quantity: item.quantity,
          subtotal: product.price * item.quantity,
        };
      })
      .filter((item): item is GuestCartDisplayItem => item !== null);
  }
}
