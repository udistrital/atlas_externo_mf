

import {
  Component,
  Input,
  computed,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';

import { MatIconModule } from '@angular/material/icon';

import {
  Caracteristica
} from '../../../../core/models/domain.models';

import {
  AspectosListaComponent
} from '../aspectos-lista/aspectos-lista.component';

@Component({
    selector: 'app-caracteristicas-lista',
    imports: [
    MatIconModule,
    AspectosListaComponent
],
    templateUrl: './caracteristicas-lista.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './caracteristicas-lista.component.scss'
})
export class CaracteristicasListaComponent {
  private readonly items =
    signal<Caracteristica[]>([]);

  readonly caracteristicaAbiertaId =
    signal<string | null>(null);

  @Input({
    required: true
  })
  set caracteristicas(
    value: Caracteristica[]
  ) {
    this.items.set(value || []);
  }

  readonly caracteristicasOrdenadas =
    computed(() =>
      [...this.items()].sort((a, b) =>
        String(a.id ?? '').localeCompare(
          String(b.id ?? ''),
          undefined,
          {
            numeric: true,
            sensitivity: 'base'
          }
        )
      )
    );

  toggle(
    caracteristica: Caracteristica
  ): void {
    const key = this.key(
      caracteristica.id
    );

    if (!key) {
      return;
    }

    this.caracteristicaAbiertaId.set(
      this.caracteristicaAbiertaId() === key
        ? null
        : key
    );
  }

  estaAbierta(
    caracteristica: Caracteristica
  ): boolean {
    return (
      this.caracteristicaAbiertaId() ===
      this.key(caracteristica.id)
    );
  }

  private key(
    value:
      | string
      | number
      | null
      | undefined
  ): string {
    return value === null ||
      value === undefined
      ? ''
      : String(value);
  }
}
