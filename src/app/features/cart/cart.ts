import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal, computed } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { RouterModule } from "@angular/router";
import { LucideIconsModule } from "../../shared/lucide-icons.module";
import { firstValueFrom } from "rxjs";
import { AuthService } from "../../core/services/auth.service";
import { CartService } from "../../core/services/cart.service";
import { CartItem, Product } from "../../core/models";
import { ProductService } from "../../core/services/product.service";
import { Loading } from "../../shared/components/loading/loading";

export interface GuestCartDisplayItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

@Component({
  selector: "app-cart",
  standalone: true,
  imports: [CommonModule, RouterModule, Loading, LucideIconsModule],
  templateUrl: "./cart.html",
  styleUrl: "./cart.css",
})
export class Cart implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  readonly productService = inject(ProductService);

  readonly cart = toSignal(this.cartService.cart$);
  readonly isLoading = signal(true);
  readonly updatingProductId = signal<string | null>(null);
  readonly guestItems = signal<GuestCartDisplayItem[]>([]);

  readonly guestSubtotal = computed(() =>
    this.guestItems().reduce((sum, item) => sum + item.subtotal, 0),
  );

  readonly guestItemCount = computed(() =>
    this.guestItems().reduce((sum, item) => sum + item.quantity, 0),
  );

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  async ngOnInit(): Promise<void> {
    if (this.isLoggedIn) {
      try {
        await firstValueFrom(this.cartService.loadCart());
      } finally {
        this.isLoading.set(false);
      }
      return;
    }

    await this.buildGuestDisplay();
    this.isLoading.set(false);
  }

  async onUpdateQuantity(item: CartItem, quantity: number): Promise<void> {
    if (quantity < 1) return;
    this.updatingProductId.set(item.product._id);
    try {
      await firstValueFrom(
        this.cartService.updateItem(item.product._id, quantity),
      );
    } finally {
      this.updatingProductId.set(null);
    }
  }

  async onRemoveItem(item: CartItem): Promise<void> {
    this.updatingProductId.set(item.product._id);
    try {
      await firstValueFrom(this.cartService.removeItem(item.product._id));
    } finally {
      this.updatingProductId.set(null);
    }
  }

  async onConfirmAllPrices(): Promise<void> {
    await firstValueFrom(this.cartService.confirmPriceChange("all"));
  }

  onGuestUpdateQuantity(item: GuestCartDisplayItem, quantity: number): void {
    if (quantity < 1) return;
    this.cartService.updateGuestCartItem(item.product._id, quantity);
    this.guestItems.update((items) =>
      items.map((entry) =>
        entry.product._id === item.product._id
          ? { ...entry, quantity, subtotal: entry.product.price * quantity }
          : entry,
      ),
    );
  }

  onGuestRemoveItem(item: GuestCartDisplayItem): void {
    this.cartService.removeFromGuestCart(item.product._id);
    this.guestItems.update((items) =>
      items.filter((entry) => entry.product._id !== item.product._id),
    );
  }

  isItemUpdating(item: CartItem): boolean {
    return this.updatingProductId() === item.product._id;
  }

  private async buildGuestDisplay(): Promise<void> {
    const guestItems = this.cartService.getGuestCart();
    if (!guestItems.length) return;

    const response = await firstValueFrom(
      this.productService.getProducts({ limit: 100 }),
    );
    const productMap = new Map(response.products.map((p) => [p._id, p]));

    this.guestItems.set(
      guestItems
        .map((item) => {
          const product = productMap.get(item.productId);
          if (!product) return null;
          return {
            product,
            quantity: item.quantity,
            subtotal: product.price * item.quantity,
          };
        })
        .filter((item): item is GuestCartDisplayItem => item !== null),
    );
  }
}
