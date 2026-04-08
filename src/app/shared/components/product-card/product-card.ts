import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { LOW_STOCK_THRESHOLD } from '../../../core/constants/app.constants';
import { Product } from '../../../core/models';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
  ],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  @Input({ required: true }) product!: Product;
  @Output() addToCart = new EventEmitter<Product>();

  readonly productService = inject(ProductService);
  readonly lowStockThreshold = LOW_STOCK_THRESHOLD;

  get isOutOfStock(): boolean {
    return this.product.stockCount === 0;
  }

  get isLowStock(): boolean {
    return (
      this.product.stockCount > 0 &&
      this.product.stockCount <= this.lowStockThreshold
    );
  }

  get imageUrl(): string {
    return this.productService.getImageUrl(this.product.image);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.src.includes('assets/productplaceholder.webp')) return;
    img.src = 'assets/productplaceholder.webp';
  }
}
