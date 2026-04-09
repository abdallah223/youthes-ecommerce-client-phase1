import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideIconsModule } from '../../shared/lucide-icons.module';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { SUCCESS_FLASH_MS } from '../../core/constants/app.constants';
import { UserService } from '../../core/services/user.service';

const EGYPTIAN_PHONE_PATTERN = /^(\+20|0)?1[0125][0-9]{8}$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
const MIN_PASSWORD_LENGTH = 8;

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideIconsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);

  readonly authService = inject(AuthService);

  private flashTimeout: ReturnType<typeof setTimeout> | null = null;
  private passFlashTimeout: ReturnType<typeof setTimeout> | null = null;

  isSavingProfile = false;
  profileSuccess = false;
  profileError = '';

  isSavingPassword = false;
  passwordSuccess = false;
  passwordError = '';
  showCurrentPass = false;
  showNewPass = false;

  readonly profileForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(EGYPTIAN_PHONE_PATTERN)]],
    address: [''],
  });

  readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required]],
    newPassword: [
      '',
      [
        Validators.required,
        Validators.minLength(MIN_PASSWORD_LENGTH),
        Validators.pattern(PASSWORD_PATTERN),
      ],
    ],
  });

  get pf() {
    return this.profileForm.controls;
  }

  get pwf() {
    return this.passwordForm.controls;
  }

  get userInitial(): string {
    return this.authService.getCurrentUser()?.fullName?.charAt(0)?.toUpperCase() ?? '?';
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }

    this.profileForm.patchValue({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      address: user.address ?? '',
    });
  }

  async saveProfile(): Promise<void> {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSavingProfile = true;
    this.profileError = '';
    this.profileSuccess = false;

    try {
      await firstValueFrom(this.userService.updateProfile(this.profileForm.getRawValue()));
      this.isSavingProfile = false;
      this.profileSuccess = true;

      if (this.flashTimeout) {
        clearTimeout(this.flashTimeout);
      }

      this.flashTimeout = setTimeout(() => {
        this.profileSuccess = false;
      }, SUCCESS_FLASH_MS);
    } catch (error) {
      this.isSavingProfile = false;
      this.profileError =
        (error as HttpErrorResponse).error?.message ?? 'Failed to update profile.';
    }
  }

  async changePassword(): Promise<void> {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isSavingPassword = true;
    this.passwordError = '';
    this.passwordSuccess = false;

    const { currentPassword, newPassword } = this.passwordForm.getRawValue();

    try {
      await firstValueFrom(this.userService.changePassword(currentPassword, newPassword));
      this.isSavingPassword = false;
      this.passwordSuccess = true;
      this.passwordForm.reset();

      if (this.passFlashTimeout) {
        clearTimeout(this.passFlashTimeout);
      }

      this.passFlashTimeout = setTimeout(() => {
        this.passwordSuccess = false;
      }, SUCCESS_FLASH_MS);
    } catch (error) {
      this.isSavingPassword = false;
      this.passwordError =
        (error as HttpErrorResponse).error?.message ?? 'Failed to change password.';
    }
  }

  ngOnDestroy(): void {
    if (this.flashTimeout) {
      clearTimeout(this.flashTimeout);
    }

    if (this.passFlashTimeout) {
      clearTimeout(this.passFlashTimeout);
    }
  }
}
