import { Component, inject } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AsyncPipe } from "@angular/common";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-footer",
  standalone: true,
  imports: [RouterModule, AsyncPipe],
  templateUrl: "./footer.html",
  styleUrl: "./footer.css",
})
export class Footer {
  readonly currentYear = new Date().getFullYear();
  readonly isLoggedIn$ = inject(AuthService).isLoggedIn$;
}
