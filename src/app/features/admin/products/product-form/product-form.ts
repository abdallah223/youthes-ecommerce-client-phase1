import { Component, inject, Input, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { Observable, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { AdminProductService } from "../../../../core/services/admin-product.service";
import { AdminCategoryService } from "../../../../core/services/admin-category.service";
import { Category, Product } from "../../../../core/models";
import { Loading } from "../../../../shared/components/loading/loading";

const MAX_IMAGE_SIZE_MB = 2;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

@Component({
  selector: "app-product-form",
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, Loading],
  templateUrl: "./product-form.html",
  styleUrl: "./product-form.css",
})
export class ProductForm implements OnInit, OnDestroy {
  @Input() id?: string;

  private readonly productService = inject(AdminProductService);
  private readonly categoryService = inject(AdminCategoryService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  private submitSubscription: Subscription | null = null;

  readonly categories$: Observable<Category[]> = this.categoryService
    .getCategories()
    .pipe(map((res) => res.data));

  isLoading = false;
  errorMessage = "";
  imagePreview: string | null = null;
  imageFile: File | null = null;
  imageError = "";

  readonly form = this.fb.group({
    name: ["", [Validators.required, Validators.minLength(2)]],
    description: ["", [Validators.required, Validators.minLength(10)]],
    price: [null as number | null, [Validators.required, Validators.min(0)]],
    stockCount: [
      null as number | null,
      [Validators.required, Validators.min(0)],
    ],
    category: ["", [Validators.required]],
    subcategory: [""],
  });

  get f() {
    return this.form.controls;
  }
  get isEdit() {
    return !!this.id;
  }

  ngOnInit(): void {
    // Read product passed via router state (set by products list on Edit click)
    const product = history.state?.product as Product | undefined;

    if (product) {
      this.form.patchValue({
        name: product.name,
        description: product.description,
        price: product.price,
        stockCount: product.stockCount,
        category: product.category?._id ?? "",
        subcategory: product.subcategory?._id ?? "",
      });

      // Show current image as preview
      this.imagePreview = this.productService.getImageUrl(product.image);
    }
  }

  getSubcategories(categories: Category[]): any[] {
    const catId = this.f["category"].value;
    return categories.find((c) => c._id === catId)?.subcategories ?? [];
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.imageError = "";

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      this.imageError = "Only JPEG, PNG and WebP images are allowed.";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      this.imageError = `Image must be under ${MAX_IMAGE_SIZE_MB}MB.`;
      return;
    }

    this.imageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.isEdit && !this.imageFile) {
      this.imageError = "Product image is required.";
      return;
    }

    this.isLoading = true;
    this.errorMessage = "";

    const formData = new FormData();
    formData.append("name", this.f["name"].value!);
    formData.append("description", this.f["description"].value!);
    formData.append("price", String(this.f["price"].value!));
    formData.append("stockCount", String(this.f["stockCount"].value!));
    formData.append("category", this.f["category"].value!);

    const sub = this.f["subcategory"].value;
    if (sub) formData.append("subcategory", sub);

    if (this.imageFile) formData.append("image", this.imageFile);

    const request = this.isEdit
      ? this.productService.updateProduct(this.id!, formData)
      : this.productService.createProduct(formData);

    this.submitSubscription = request.subscribe({
      next: () => {
        this.router.navigate(["/admin/products"]);
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? "Failed to save product.";
        this.isLoading = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.submitSubscription?.unsubscribe();
  }
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.src.includes("assets/productplaceholder.webp")) return;
    img.src = "assets/productplaceholder.webp";
  }
}
