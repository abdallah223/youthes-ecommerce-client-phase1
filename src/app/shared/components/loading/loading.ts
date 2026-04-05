import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="wrapperClass">
      <div [class]="spinnerClass"></div>
      @if (text) {
        <span class="loading-text">{{ text }}</span>
      }
    </div>
  `,
  styleUrl: './loading.css',
})
export class Loading {
  @Input() size:    'sm' | 'md' | 'lg' = 'md';
  @Input() overlay = false;
  @Input() text    = '';

  get wrapperClass(): string {
    return this.overlay ? 'loading-wrapper loading-wrapper--overlay' : 'loading-wrapper';
  }

  get spinnerClass(): string {
    return `spinner spinner--${this.size}`;
  }
}


