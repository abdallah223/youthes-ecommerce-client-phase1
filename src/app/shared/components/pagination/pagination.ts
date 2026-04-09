import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideIconsModule } from '../../lucide-icons.module';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [
    CommonModule,
    LucideIconsModule,
  ],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class Pagination {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Output() pageChange = new EventEmitter<number>();

  get pages(): (number | '...')[] {
    const total = this.totalPages;
    const cur = this.currentPage;

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | '...')[] = [1];

    if (cur > 3) pages.push('...');

    const start = Math.max(2, cur - 1);
    const end = Math.min(total - 1, cur + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (cur < total - 2) pages.push('...');

    pages.push(total);
    return pages;
  }

  goTo(page: number | '...'): void {
    if (typeof page !== 'number' || page === this.currentPage) return;
    this.pageChange.emit(page);
  }

  prev(): void {
    if (this.currentPage > 1) this.pageChange.emit(this.currentPage - 1);
  }

  next(): void {
    if (this.currentPage < this.totalPages) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }

  isNumber(page: number | '...'): boolean {
    return typeof page === 'number';
  }
}
