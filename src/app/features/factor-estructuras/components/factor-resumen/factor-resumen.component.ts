
import {
  Component,
  Input,
  ChangeDetectionStrategy
} from '@angular/core';

import { MatIconModule } from '@angular/material/icon';

import {
  Factor
} from '../../../../core/models/domain.models';

@Component({
    selector: 'app-factor-resumen',
    imports: [
    MatIconModule
],
    templateUrl: './factor-resumen.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './factor-resumen.component.scss'
})
export class FactorResumenComponent {
  @Input({
    required: true
  })
  factor!: Factor;
}
