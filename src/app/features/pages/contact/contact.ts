import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { map } from "rxjs/operators";
import { StaticPagesService } from "../../../core/services/static-pages.service";
import { ContactUsContent } from "../../../core/models";
import { Loading } from "../../../shared/components/loading/loading";

@Component({
  selector: "app-contact",
  standalone: true,
  imports: [CommonModule, Loading],
  templateUrl: "./contact.html",
  styleUrl: "./contact.css",
})
export class Contact {
  private readonly staticPagesService = inject(StaticPagesService);

  readonly content$ = this.staticPagesService
    .getPage("contact_us")
    .pipe(map((res) => res.data.content as ContactUsContent));
}
