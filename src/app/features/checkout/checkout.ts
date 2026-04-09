import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideIconsModule } from '../../shared/lucide-icons.module';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { ProductService } from '../../core/services/product.service';
import { Loading } from '../../shared/components/loading/loading';

const EGYPTIAN_PHONE_PATTERN = /^(\+20|0)?1[0125][0-9]{8}$/;
const MIN_ADDRESS_LENGTH = 10;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, Loading, LucideIconsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly productService = inject(ProductService);
  readonly cart$ = this.cartService.cart$;

  isLoading = true;
  isPlacing = false;
  errorMessage = '';

  readonly form = this.fb.nonNullable.group({
    deliveryPhone: ['', [Validators.required, Validators.pattern(EGYPTIAN_PHONE_PATTERN)]],
    deliveryAddress: ['', [Validators.required, Validators.minLength(MIN_ADDRESS_LENGTH)]],
  });

  get f() {
    return this.form.controls;
  }

  async ngOnInit(): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (user?.phone) {
      this.f.deliveryPhone.setValue(user.phone);
    }

    if (user?.address) {
      this.f.deliveryAddress.setValue(user.address);
    }

    try {
      const response = await firstValueFrom(this.cartService.loadCart());

      if (!response.data.items.length) {
        await this.router.navigate(['/cart']);
        return;
      }

      this.isLoading = false;
    } catch {
      await this.router.navigate(['/cart']);
    }
  }

  async placeOrder(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isPlacing = true;
    this.errorMessage = '';

    try {
      const response = await firstValueFrom(
        this.orderService.createOrder({
          deliveryPhone: this.f.deliveryPhone.value,
          deliveryAddress: this.f.deliveryAddress.value,
        })
      );

      await this.router.navigate(['/orders', response.data._id]);
    } catch (error) {
      this.errorMessage =
        (error as HttpErrorResponse).error?.message ?? 'Failed to place order. Please try again.';
      this.isPlacing = false;
    }
  }
}
