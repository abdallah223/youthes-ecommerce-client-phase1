import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideIconsModule } from '../../lucide-icons.module';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    RouterModule,
    AsyncPipe,
    LucideIconsModule,
  ],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  readonly currentYear = new Date().getFullYear();
  readonly isLoggedIn$ = inject(AuthService).isLoggedIn$;
}
