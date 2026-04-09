import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideIconsModule } from '../../shared/lucide-icons.module';
import { catchError, EMPTY, exhaustMap, finalize, map, Subject, switchMap, tap, timer } from 'rxjs';
import { SUCCESS_FLASH_MS } from '../../core/constants/app.constants';
import { AuthService } from '../../core/services/auth.service';
import { TestimonialService } from '../../core/services/testimonial.service';
import { Loading } from '../../shared/components/loading/loading';

const MIN_REVIEW_LENGTH = 20;
const MAX_REVIEW_LENGTH = 500;
const MAX_RATING = 5;

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, Loading, LucideIconsModule],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Testimonials {
  private readonly testimonialService = inject(TestimonialService);
  readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  private readonly submitTrigger$ = new Subject<void>();
  private readonly successTrigger$ = new Subject<void>();

  readonly testimonials$ = this.testimonialService.getApproved().pipe(map((res) => res.data));
  readonly isLoggedIn$ = this.authService.isLoggedIn$;
  readonly starRange = Array.from({ length: MAX_RATING }, (_, i) => i + 1);

  isSubmitting = false;
  submitSuccess = false;
  submitError = '';
  hoveredStar = 0;

  readonly form = this.fb.nonNullable.group({
    reviewText: [
      '',
      [
        Validators.required,
        Validators.minLength(MIN_REVIEW_LENGTH),
        Validators.maxLength(MAX_REVIEW_LENGTH),
      ],
    ],
    rating: [0, [Validators.required, Validators.min(1)]],
  });

  get f() {
    return this.form.controls;
  }

  get currentRating() {
    return this.f.rating.value;
  }

  constructor() {
    this.submitTrigger$
      .pipe(
        tap(() => {
          if (this.form.invalid) {
            this.form.markAllAsTouched();
          }
        }),
        exhaustMap(() => {
          if (this.form.invalid) {
            return EMPTY;
          }

          this.isSubmitting = true;
          this.submitError = '';

          return this.testimonialService
            .submit(this.f.reviewText.value.trim(), this.f.rating.value)
            .pipe(
              tap(() => {
                this.submitSuccess = true;
                this.form.reset({ reviewText: '', rating: 0 });
                this.successTrigger$.next();
              }),
              catchError((error: unknown) => {
                this.submitError = this.extractErrorMessage(error);
                return EMPTY;
              }),
              finalize(() => {
                this.isSubmitting = false;
              }),
            );
        }),
        takeUntilDestroyed(),
      )
      .subscribe();

    this.successTrigger$
      .pipe(
        switchMap(() => timer(SUCCESS_FLASH_MS)),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.submitSuccess = false;
      });
  }

  setRating(star: number): void {
    this.f.rating.setValue(star);
  }

  getStarClass(star: number): string {
    const active = this.hoveredStar || this.currentRating;
    return star <= active ? 'star star--filled' : 'star';
  }

  submit(): void {
    this.submitTrigger$.next();
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message ?? 'Failed to submit review.';
    }

    return 'Failed to submit review.';
  }

}
