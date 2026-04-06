import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AdminUserService } from '../../../core/services/admin-user.service';
import { User, PaginationMeta } from '../../../core/models';
import { Loading } from '../../../shared/components/loading/loading';
import { DEFAULT_PAGE, SEARCH_DEBOUNCE_MS } from '../../../core/constants/app.constants';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Loading],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit, OnDestroy {
  private readonly userService = inject(AdminUserService);
  private readonly fb          = inject(FormBuilder);

  private loadSubscription:   Subscription | null = null;
  private toggleSubscription: Subscription | null = null;
  private searchSubscription: Subscription | null = null;

  readonly searchControl    = this.fb.control('');
  readonly isActiveControl  = this.fb.control('');

  users:       User[]            = [];
  meta:        PaginationMeta | null = null;
  isLoading    = true;
  currentPage  = DEFAULT_PAGE;
  togglingId:  string | null = null;

  ngOnInit(): void {
    this.loadUsers();

    this.searchSubscription = this.searchControl.valueChanges.pipe(
      debounceTime(SEARCH_DEBOUNCE_MS),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = DEFAULT_PAGE;
      this.loadUsers();
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.loadSubscription?.unsubscribe();

    const isActiveVal = this.isActiveControl.value;
    const query: any  = {
      page:   this.currentPage,
      search: this.searchControl.value || undefined,
    };
    if (isActiveVal === 'true')  query.isActive = true;
    if (isActiveVal === 'false') query.isActive = false;

    this.loadSubscription = this.userService.getUsers(query).subscribe({
      next: res => { this.users = res.data; this.meta = res.meta; this.isLoading = false; },
      error: () => { this.isLoading = false; },
    });
  }

  onFilterChange(): void { this.currentPage = DEFAULT_PAGE; this.loadUsers(); }

  onToggle(user: User): void {
    const action = user.isActive ? 'deactivate' : 'activate';
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} "${user.fullName}"?`)) return;

    this.togglingId = user._id;
    this.toggleSubscription?.unsubscribe();
    this.toggleSubscription = this.userService.toggleActive(user._id).subscribe({
      next: res => {
        const idx = this.users.findIndex(u => u._id === user._id);
        if (idx >= 0) this.users[idx] = res.data;
        this.togglingId = null;
      },
      error: () => { this.togglingId = null; },
    });
  }

  setPage(page: number): void { this.currentPage = page; this.loadUsers(); }

  getPages(): number[] {
    if (!this.meta) return [];
    return Array.from({ length: this.meta.pages }, (_, i) => i + 1);
  }

  ngOnDestroy(): void {
    this.loadSubscription?.unsubscribe();
    this.toggleSubscription?.unsubscribe();
    this.searchSubscription?.unsubscribe();
  }
}


