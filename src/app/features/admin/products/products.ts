import { Component, inject, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { ReactiveFormsModule, FormBuilder } from "@angular/forms";
import { Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { AdminProductService } from "../../../core/services/admin-product.service";
import { AdminCategoryService } from "../../../core/services/admin-category.service";
import { Product, Category, PaginationMeta } from "../../../core/models";
import { Loading } from "../../../shared/components/loading/loading";
import {
  DEFAULT_PAGE,
  SEARCH_DEBOUNCE_MS,
  LOW_STOCK_THRESHOLD,
} from "../../../core/constants/app.constants";

@Component({
  selector: "app-products",
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, Loading],
  templateUrl: "./products.html",
  styleUrl: "./products.css",
})
export class Products implements OnInit, OnDestroy {
  private readonly productService = inject(AdminProductService);
  private readonly categoryService = inject(AdminCategoryService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  private loadSubscription: Subscription | null = null;
  private deleteSubscription: Subscription | null = null;
  private searchSubscription: Subscription | null = null;
  private categorySubscription: Subscription | null = null;

  readonly searchControl = this.fb.control("");
  readonly lowStockThreshold = LOW_STOCK_THRESHOLD;

  products: Product[] = [];
  categories: Category[] = [];
  meta: PaginationMeta | null = null;
  isLoading = true;
  currentPage = DEFAULT_PAGE;
  currentCategory = "";
  deletingId: string | null = null;

  ngOnInit(): void {
    this.categorySubscription = this.categoryService.getCategories().subscribe({
      next: (res) => {
        this.categories = res.data;
      },
    });

    this.loadProducts();

    this.searchSubscription = this.searchControl.valueChanges
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = DEFAULT_PAGE;
        this.loadProducts();
      });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.loadSubscription?.unsubscribe();

    this.loadSubscription = this.productService
      .getProducts({
        page: this.currentPage,
        category: this.currentCategory || undefined,
        search: this.searchControl.value ?? undefined,
      })
      .subscribe({
        next: (res) => {
          this.products = res.products;
          this.meta = res.meta;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  onCategoryChange(event: Event): void {
    this.currentCategory = (event.target as HTMLSelectElement).value;
    this.currentPage = DEFAULT_PAGE;
    this.loadProducts();
  }

  onEdit(product: Product): void {
    this.router.navigate(["/admin/products", product._id, "edit"], {
      state: { product },
    });
  }

  onDelete(product: Product): void {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;

    this.deletingId = product._id;
    this.deleteSubscription?.unsubscribe();

    this.deleteSubscription = this.productService
      .deleteProduct(product._id)
      .subscribe({
        next: () => {
          this.deletingId = null;
          this.loadProducts();
        },
        error: () => {
          this.deletingId = null;
        },
      });
  }

  setPage(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  getImageUrl(filename: string): string {
    return this.productService.getImageUrl(filename);
  }

  getPages(): number[] {
    if (!this.meta) return [];
    return Array.from({ length: this.meta.pages }, (_, i) => i + 1);
  }

  ngOnDestroy(): void {
    this.loadSubscription?.unsubscribe();
    this.deleteSubscription?.unsubscribe();
    this.searchSubscription?.unsubscribe();
    this.categorySubscription?.unsubscribe();
  }
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.src.includes("assets/productplaceholder.webp")) return;
    img.src = "assets/productplaceholder.webp";
  }
}
