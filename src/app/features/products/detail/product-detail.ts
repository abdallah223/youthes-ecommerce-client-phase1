import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { firstValueFrom, map, Observable } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import {
  LOW_STOCK_THRESHOLD,
  SUCCESS_FLASH_MS,
} from '../../../core/constants/app.constants';
import { Product } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ProductService } from '../../../core/services/product.service';
import { Loading } from '../../../shared/components/loading/loading';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    Loading,
    LucideAngularModule,
  ],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit, OnDestroy {
  @Input({ required: true }) slug!: string;

  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);

  private flashTimeout: ReturnType<typeof setTimeout> | null = null;

  product$!: Observable<Product>;

  quantity = 1;
  isAdding = false;
  isAdded = false;
  errorMessage = '';

  readonly lowStockThreshold = LOW_STOCK_THRESHOLD;

  ngOnInit(): void {
    this.product$ = this.productService
      .getProductBySlug(this.slug)
      .pipe(map((response) => response.data));
  }

  increment(product: Product): void {
    if (this.quantity < product.stockCount) {
      this.quantity++;
    }
  }

  decrement(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  async onAddToCart(product: Product): Promise<void> {
    if (!this.authService.isLoggedIn()) {
      this.cartService.addToGuestCart(product._id, this.quantity);
      this.showAddedFlash();
      return;
    }

    this.isAdding = true;
    this.errorMessage = '';

    try {
      await firstValueFrom(this.cartService.addItem(product._id, this.quantity));
      this.isAdding = false;
      this.showAddedFlash();
    } catch (error) {
      this.isAdding = false;
      this.errorMessage =
        (error as HttpErrorResponse).error?.message ?? 'Failed to add item.';
    }
  }

  getImageUrl(filename: string): string {
    return this.productService.getImageUrl(filename);
  }

  isOutOfStock(product: Product): boolean {
    return product.stockCount === 0;
  }

  isLowStock(product: Product): boolean {
    return (
      product.stockCount > 0 && product.stockCount <= this.lowStockThreshold
    );
  }

  ngOnDestroy(): void {
    if (this.flashTimeout) {
      clearTimeout(this.flashTimeout);
    }
  }

  private showAddedFlash(): void {
    this.isAdded = true;

    if (this.flashTimeout) {
      clearTimeout(this.flashTimeout);
    }

    this.flashTimeout = setTimeout(() => {
      this.isAdded = false;
    }, SUCCESS_FLASH_MS);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.src.includes('assets/productplaceholder.webp')) return;
    img.src = 'assets/productplaceholder.webp';
  }
}
