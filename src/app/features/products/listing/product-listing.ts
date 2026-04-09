import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { firstValueFrom, map, switchMap } from 'rxjs';
import { LucideIconsModule } from '../../../shared/lucide-icons.module';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { CategoryService } from '../../../core/services/category.service';
import {
  DEFAULT_PAGE,
  DEFAULT_SORT,
  PRODUCTS_PER_PAGE,
  SEARCH_DEBOUNCE_MS,
  SORT_OPTIONS,
} from '../../../core/constants/app.constants';
import {
  Category,
  PaginationMeta,
  Product,
  ProductQuery,
} from '../../../core/models';
import { ProductService } from '../../../core/services/product.service';
import { Loading } from '../../../shared/components/loading/loading';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { ProductCard } from '../../../shared/components/product-card/product-card';

interface ProductsState {
  products: Product[];
  meta: PaginationMeta;
}

@Component({
  selector: 'app-product-listing',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ProductCard,
    Pagination,
    Loading,
    LucideIconsModule,
  ],
  templateUrl: './product-listing.html',
  styleUrl: './product-listing.css',
})
export class ProductListing implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly sortOptions = SORT_OPTIONS;
  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly categories$ = this.categoryService
    .getCategories()
    .pipe(map((response) => response.data));

  readonly productsState$ = this.route.queryParams.pipe(
    switchMap((params) => {
      const query: ProductQuery = {
        page: Number(params['page']) || DEFAULT_PAGE,
        limit: PRODUCTS_PER_PAGE,
        sort: params['sort'] || DEFAULT_SORT,
        category: params['category'] || undefined,
        subcategory: params['subcategory'] || undefined,
        search: params['search'] || undefined,
      };

      const searchValue = params['search'] ?? '';
      if (this.searchControl.value !== searchValue) {
        this.searchControl.setValue(searchValue, { emitEvent: false });
      }

      return this.productService.getProducts(query).pipe(
        map((response) => ({
          products: response.products,
          meta: response.meta,
        })),
      );
    }),
  );

  isSidebarOpen = false;
  subcategoriesExpanded = true;

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => {
        this.updateQuery({ search: value || undefined, page: DEFAULT_PAGE });
      });
  }

  updateQuery(patch: Partial<ProductQuery>): void {
    const current = this.route.snapshot.queryParams;
    const merged = { ...current, ...patch };
    const cleaned: Record<string, string> = {};

    Object.entries(merged).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleaned[key] = String(value);
      }
    });

    void this.router.navigate([], { queryParams: cleaned });
  }

  setCategory(id?: string): void {
    this.subcategoriesExpanded = true;
    this.updateQuery({
      category: id,
      subcategory: undefined,
      page: DEFAULT_PAGE,
    });
  }

  setSubcategory(id?: string): void {
    this.subcategoriesExpanded = true;
    this.updateQuery({ subcategory: id, page: DEFAULT_PAGE });
  }

  setSort(event: Event): void {
    const sort = (event.target as HTMLSelectElement).value;
    this.updateQuery({ sort, page: DEFAULT_PAGE });
  }

  setPage(page: number): void {
    this.updateQuery({ page });
  }

  clearFilters(): void {
    this.searchControl.setValue('', { emitEvent: false });
    void this.router.navigate([], { queryParams: { sort: DEFAULT_SORT } });
  }

  async onAddToCart(product: Product): Promise<void> {
    if (!this.authService.isLoggedIn()) {
      this.cartService.addToGuestCart(product._id, 1);
      return;
    }

    await firstValueFrom(this.cartService.addItem(product._id, 1));
  }

  get hasFilters(): boolean {
    const params = this.route.snapshot.queryParams;
    return !!(params['category'] || params['subcategory'] || params['search']);
  }

  getSelectedCategory(categories: Category[]): Category | undefined {
    const id = this.route.snapshot.queryParams['category'];
    return categories.find((category) => category._id === id);
  }

  getCurrentParams(): Record<string, string> {
    return this.route.snapshot.queryParams;
  }

  toggleSubcategories(): void {
    this.subcategoriesExpanded = !this.subcategoriesExpanded;
  }
}
