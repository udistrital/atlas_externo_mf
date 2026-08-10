import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    @if (loading) {
      <div class="loading"><mat-spinner diameter="34"></mat-spinner><span>{{ label }}</span></div>
    }
  `,
  styles: [`
    .loading { display: flex; align-items: center; gap: 12px; padding: 18px; color: var(--color-muted); }
  `]
})
export class LoadingStateComponent {
  @Input() loading = false;
  @Input() label = 'Cargando información...';
}
