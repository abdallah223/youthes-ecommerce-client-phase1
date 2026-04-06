import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AdminOrderService } from '../../../core/services/admin-order.service';
import { SalesReport } from '../../../core/models';
import { Loading } from '../../../shared/components/loading/loading';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Loading],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class Reports implements OnInit, OnDestroy {
  private readonly orderService = inject(AdminOrderService);
  private readonly fb           = inject(FormBuilder);

  private reportSubscription: Subscription | null = null;

  report:     SalesReport | null = null;
  isLoading   = false;
  errorMessage = '';

  readonly form = this.fb.group({
    dateFrom: [this.getFirstOfMonth(), Validators.required],
    dateTo:   [this.getToday(),        Validators.required],
  });

  ngOnInit(): void { this.loadReport(); }

  private getFirstOfMonth(): string {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  }

  private getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  loadReport(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.isLoading    = true;
    this.errorMessage = '';

    this.reportSubscription?.unsubscribe();
    this.reportSubscription = this.orderService.getSalesReport(
      this.form.value.dateFrom!,
      this.form.value.dateTo!
    ).subscribe({
      next:  res => { this.report = res.data; this.isLoading = false; },
      error: err => { this.errorMessage = err.error?.message ?? 'Failed to load report.'; this.isLoading = false; },
    });
  }

  ngOnDestroy(): void { this.reportSubscription?.unsubscribe(); }
}


