import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { firstValueFrom, map } from 'rxjs';
import { LucideIconsModule } from '../../shared/lucide-icons.module';
import {
  MAX_HOME_FEATURED,
  MAX_HOME_TESTIMONIALS,
} from '../../core/constants/app.constants';
import { Product } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { TestimonialService } from '../../core/services/testimonial.service';
import { Loading } from '../../shared/components/loading/loading';
import { ProductCard } from '../../shared/components/product-card/product-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProductCard,
    Loading,
    LucideIconsModule,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly productService = inject(ProductService);
  private readonly testimonialService = inject(TestimonialService);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);

  readonly featuredProducts$ = this.productService
    .getProducts({ limit: MAX_HOME_FEATURED, sort: 'newest' })
    .pipe(map((response) => response.products));

  readonly testimonials$ = this.testimonialService
    .getApproved()
    .pipe(map((response) => response.data.slice(0, MAX_HOME_TESTIMONIALS)));

  readonly starRange = Array.from({ length: 5 }, (_, index) => index + 1);

  async onAddToCart(product: Product): Promise<void> {
    if (!this.authService.isLoggedIn()) {
      this.cartService.addToGuestCart(product._id, 1);
      return;
    }

    await firstValueFrom(this.cartService.addItem(product._id, 1));
  }
}
