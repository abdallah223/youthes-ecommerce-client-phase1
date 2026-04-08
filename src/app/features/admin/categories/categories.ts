import { Component, inject, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { Observable, Subscription } from "rxjs";
import { AdminCategoryService } from "../../../core/services/admin-category.service";
import { Category } from "../../../core/models";
import { Loading } from "../../../shared/components/loading/loading";
import { LucideAngularModule } from "lucide-angular";

type ModalMode = "createCat" | "editCat" | "createSub" | "editSub" | null;

@Component({
  selector: "app-categories",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Loading, LucideAngularModule],
  templateUrl: "./categories.html",
  styleUrl: "./categories.css",
})
export class Categories implements OnInit, OnDestroy {
  private readonly categoryService = inject(AdminCategoryService);
  private readonly fb = inject(FormBuilder);

  private loadSubscription: Subscription | null = null;
  private actionSubscription: Subscription | null = null;

  categories: Category[] = [];
  isLoading = true;
  modalMode: ModalMode = null;
  isSaving = false;
  errorMessage = "";

  selectedCategoryId: string | null = null;
  selectedSubId: string | null = null;

  readonly nameForm = this.fb.group({
    name: ["", [Validators.required, Validators.minLength(2)]],
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.loadSubscription?.unsubscribe();
    this.loadSubscription = this.categoryService.getCategories().subscribe({
      next: (res) => {
        this.categories = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  openCreateCategory(): void {
    this.modalMode = "createCat";
    this.nameForm.reset();
    this.errorMessage = "";
  }

  openEditCategory(cat: Category): void {
    this.selectedCategoryId = cat._id;
    this.nameForm.patchValue({ name: cat.name });
    this.modalMode = "editCat";
    this.errorMessage = "";
  }

  openCreateSub(catId: string): void {
    this.selectedCategoryId = catId;
    this.nameForm.reset();
    this.modalMode = "createSub";
    this.errorMessage = "";
  }

  openEditSub(catId: string, sub: any): void {
    this.selectedCategoryId = catId;
    this.selectedSubId = sub._id;
    this.nameForm.patchValue({ name: sub.name });
    this.modalMode = "editSub";
    this.errorMessage = "";
  }

  closeModal(): void {
    this.modalMode = null;
  }

  save(): void {
    if (this.nameForm.invalid) {
      this.nameForm.markAllAsTouched();
      return;
    }
    const name = this.nameForm.value.name!;

    this.isSaving = true;
    this.errorMessage = "";

    let action: Observable<any>;

    if (this.modalMode === "createCat") {
      action = this.categoryService.createCategory(name);
    } else if (this.modalMode === "editCat") {
      action = this.categoryService.updateCategory(
        this.selectedCategoryId!,
        name,
      );
    } else if (this.modalMode === "createSub") {
      action = this.categoryService.createSubcategory(
        this.selectedCategoryId!,
        name,
      );
    } else {
      action = this.categoryService.updateSubcategory(
        this.selectedCategoryId!,
        this.selectedSubId!,
        name,
      );
    }

    this.actionSubscription = action.subscribe({
      next: () => {
        this.isSaving = false;
        this.closeModal();
        this.loadCategories();
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? "Failed to save.";
        this.isSaving = false;
      },
    });
  }

  deleteCategory(cat: Category): void {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    this.actionSubscription?.unsubscribe();
    this.actionSubscription = this.categoryService
      .deleteCategory(cat._id)
      .subscribe({
        next: () => {
          this.loadCategories();
        },
        error: (err) => {
          alert(err.error?.message ?? "Cannot delete category.");
        },
      });
  }

  deleteSubcategory(catId: string, subId: string, name: string): void {
    if (!confirm(`Delete subcategory "${name}"?`)) return;
    this.actionSubscription?.unsubscribe();
    this.actionSubscription = this.categoryService
      .deleteSubcategory(catId, subId)
      .subscribe({
        next: () => {
          this.loadCategories();
        },
        error: (err) => {
          alert(err.error?.message ?? "Cannot delete subcategory.");
        },
      });
  }

  get modalTitle(): string {
    const titles: Record<string, string> = {
      createCat: "New Category",
      editCat: "Edit Category",
      createSub: "New Subcategory",
      editSub: "Edit Subcategory",
    };
    return this.modalMode ? (titles[this.modalMode] ?? "") : "";
  }

  ngOnDestroy(): void {
    this.loadSubscription?.unsubscribe();
    this.actionSubscription?.unsubscribe();
  }
}
