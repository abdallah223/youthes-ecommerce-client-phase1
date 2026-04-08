import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AdminTestimonialService } from '../../../core/services/admin-testimonial.service';
import { Testimonial, PaginationMeta } from '../../../core/models';
import { Loading } from '../../../shared/components/loading/loading';
import { DEFAULT_PAGE, TESTIMONIAL_ACTION_OPTIONS } from '../../../core/constants/app.constants';
import { LucideAngularModule } from 'lucide-angular';

const STATUS_FILTER_OPTIONS = [
  { value: '',         label: 'All'      },
  { value: 'pending',  label: 'Pending'  },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'ignored',  label: 'Ignored'  },
];

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Loading, LucideAngularModule],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.css',
})
export class Testimonials implements OnInit, OnDestroy {
  private readonly testimonialService = inject(AdminTestimonialService);
  private readonly fb                 = inject(FormBuilder);

  private loadSubscription:   Subscription | null = null;
  private updateSubscription: Subscription | null = null;

  readonly statusFilterOptions  = STATUS_FILTER_OPTIONS;
  readonly actionOptions        = TESTIMONIAL_ACTION_OPTIONS;
  readonly statusFilterControl  = this.fb.control('pending');

  testimonials:   Testimonial[]      = [];
  meta:           PaginationMeta | null = null;
  isLoading       = true;
  currentPage     = DEFAULT_PAGE;
  updatingId:     string | null = null;

  ngOnInit(): void { this.loadTestimonials(); }

  loadTestimonials(): void {
    this.isLoading = true;
    this.loadSubscription?.unsubscribe();

    const status = this.statusFilterControl.value ?? '';

    this.loadSubscription = this.testimonialService
      .getTestimonials(status || undefined, this.currentPage)
      .subscribe({
        next: res => { this.testimonials = res.data; this.meta = res.meta; this.isLoading = false; },
        error: () => { this.isLoading = false; },
      });
  }

  onFilterChange(): void { this.currentPage = DEFAULT_PAGE; this.loadTestimonials(); }

  onStatusUpdate(testimonial: Testimonial, status: string): void {
    this.updatingId = testimonial._id;
    this.updateSubscription?.unsubscribe();
    this.updateSubscription = this.testimonialService.updateStatus(testimonial._id, status).subscribe({
      next: res => {
        const idx = this.testimonials.findIndex(t => t._id === testimonial._id);
        if (idx >= 0) this.testimonials[idx] = res.data;
        this.updatingId = null;
        this.loadTestimonials();
      },
      error: () => { this.updatingId = null; },
    });
  }

  setPage(page: number): void { this.currentPage = page; this.loadTestimonials(); }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'badge--warning', approved: 'badge--success',
      rejected: 'badge--error',  ignored: 'badge--neutral',
    };
    return classes[status] ?? 'badge--neutral';
  }

  getPages(): number[] {
    if (!this.meta) return [];
    return Array.from({ length: this.meta.pages }, (_, i) => i + 1);
  }

  ngOnDestroy(): void {
    this.loadSubscription?.unsubscribe();
    this.updateSubscription?.unsubscribe();
  }
}


