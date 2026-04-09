import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { StaticPagesService } from "../../../core/services/static-pages.service";
import { FaqItem } from "../../../core/models";
import { Loading } from "../../../shared/components/loading/loading";
import { LucideIconsModule } from "../../../shared/lucide-icons.module";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-faq",
  standalone: true,
  imports: [[CommonModule, RouterModule, LucideIconsModule, Loading]],
  templateUrl: "./faq.html",
  styleUrl: "./faq.css",
})
export class Faq {
  private readonly staticPagesService = inject(StaticPagesService);

  readonly items$: Observable<FaqItem[]> = this.staticPagesService
    .getPage("faq")
    .pipe(map((res) => res.data.content as FaqItem[]));

  openIndex: number | null = null;

  toggle(index: number): void {
    this.openIndex = this.openIndex === index ? null : index;
  }

  isOpen(index: number): boolean {
    return this.openIndex === index;
  }
}
