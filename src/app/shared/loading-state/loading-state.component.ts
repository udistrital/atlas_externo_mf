import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-loading-state',
    imports: [MatProgressSpinnerModule],
    template: `
    @if (loading) {
      <div class="loading"><mat-spinner diameter="34"></mat-spinner><span>{{ label }}</span></div>
    }
  `,
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: [`
    .loading { display: flex; align-items: center; gap: 12px; padding: 18px; color: var(--color-muted); }
  `]
})
export class LoadingStateComponent {
  @Input() loading = false;
  @Input() label = 'Cargando información...';
}
