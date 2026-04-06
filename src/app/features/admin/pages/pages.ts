import { Component, inject, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormArray,
} from "@angular/forms";
import { firstValueFrom } from "rxjs";
import { AdminPagesService } from "../../../core/services/admin-pages.service";
import {
  AboutUsContent,
  FaqItem,
  ContactUsContent,
} from "../../../core/models";
import { Loading } from "../../../shared/components/loading/loading";
import { SUCCESS_FLASH_MS } from "../../../core/constants/app.constants";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: "app-pages",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Loading],
  templateUrl: "./pages.html",
  styleUrl: "./pages.css",
})
export class Pages implements OnInit, OnDestroy {
  private readonly pagesService = inject(AdminPagesService);
  private readonly fb = inject(FormBuilder);

  private flashTimeout: ReturnType<typeof setTimeout> | null = null;

  isLoadingAbout = true;
  isLoadingFaq = true;
  isLoadingContact = true;

  isSavingAbout = false;
  isSavingFaq = false;
  isSavingContact = false;

  aboutSuccess = false;
  faqSuccess = false;
  contactSuccess = false;

  aboutError = "";
  faqError = "";
  contactError = "";

  readonly aboutForm = this.fb.nonNullable.group({
    title: ["", [Validators.required]],
    body: ["", [Validators.required, Validators.minLength(10)]],
  });

  readonly faqForm = this.fb.group({
    items: this.fb.array([]),
  });

  readonly contactForm = this.fb.nonNullable.group({
    phone: ["", [Validators.required]],
    email: ["", [Validators.required, Validators.email]],
    address: ["", [Validators.required]],
    workingHours: ["", [Validators.required]],
  });

  get faqItems(): FormArray {
    return this.faqForm.get("items") as FormArray;
  }

  ngOnInit(): void {
    this.loadAbout();
    this.loadFaq();
    this.loadContact();
  }

  private async loadAbout(): Promise<void> {
    try {
      const res = await firstValueFrom(this.pagesService.getPage("about_us"));
      const content = res.data.content as AboutUsContent;
      this.aboutForm.patchValue({ title: content.title, body: content.body });
    } finally {
      this.isLoadingAbout = false;
    }
  }

  private async loadFaq(): Promise<void> {
    try {
      const res = await firstValueFrom(this.pagesService.getPage("faq"));
      const items = res.data.content as FaqItem[];
      this.faqItems.clear();
      items.forEach((item) => this.addFaqItem(item.question, item.answer));
    } finally {
      this.isLoadingFaq = false;
    }
  }

  private async loadContact(): Promise<void> {
    try {
      const res = await firstValueFrom(this.pagesService.getPage("contact_us"));
      const content = res.data.content as ContactUsContent;
      this.contactForm.patchValue({
        phone: content.phone,
        email: content.email,
        address: content.address,
        workingHours: content.workingHours,
      });
    } finally {
      this.isLoadingContact = false;
    }
  }

  addFaqItem(question = "", answer = ""): void {
    this.faqItems.push(
      this.fb.group({
        question: [question, Validators.required],
        answer: [answer, Validators.required],
      }),
    );
  }

  removeFaqItem(index: number): void {
    this.faqItems.removeAt(index);
  }

  async saveAbout(): Promise<void> {
    if (this.aboutForm.invalid) {
      this.aboutForm.markAllAsTouched();
      return;
    }
    this.isSavingAbout = true;
    this.aboutError = "";
    try {
      const { title, body } = this.aboutForm.getRawValue();
      await firstValueFrom(this.pagesService.updateAboutUs(title, body));
      this.isSavingAbout = false;
      this.showFlash("about");
    } catch (err) {
      this.aboutError =
        (err as HttpErrorResponse).error?.message ?? "Failed to save.";
      this.isSavingAbout = false;
    }
  }

  async saveFaq(): Promise<void> {
    if (this.faqForm.invalid) {
      this.faqForm.markAllAsTouched();
      return;
    }
    this.isSavingFaq = true;
    this.faqError = "";
    try {
      await firstValueFrom(this.pagesService.updateFaq(this.faqItems.value));
      this.isSavingFaq = false;
      this.showFlash("faq");
    } catch (err) {
      this.faqError =
        (err as HttpErrorResponse).error?.message ?? "Failed to save.";
      this.isSavingFaq = false;
    }
  }

  async saveContact(): Promise<void> {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
    this.isSavingContact = true;
    this.contactError = "";
    try {
      await firstValueFrom(
        this.pagesService.updateContactUs({
          ...this.contactForm.getRawValue(),
          socialLinks: [],
        }),
      );
      this.isSavingContact = false;
      this.showFlash("contact");
    } catch (err) {
      this.contactError =
        (err as HttpErrorResponse).error?.message ?? "Failed to save.";
      this.isSavingContact = false;
    }
  }

  private showFlash(section: "about" | "faq" | "contact"): void {
    if (section === "about") this.aboutSuccess = true;
    if (section === "faq") this.faqSuccess = true;
    if (section === "contact") this.contactSuccess = true;
    if (this.flashTimeout) clearTimeout(this.flashTimeout);
    this.flashTimeout = setTimeout(() => {
      this.aboutSuccess = this.faqSuccess = this.contactSuccess = false;
    }, SUCCESS_FLASH_MS);
  }

  ngOnDestroy(): void {
    if (this.flashTimeout) clearTimeout(this.flashTimeout);
  }
}
