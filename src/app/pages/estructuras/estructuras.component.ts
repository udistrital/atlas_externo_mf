

import {
  Component,
  OnInit,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  Caracteristica,
  Factor
} from '../../core/models/domain.models';

import {
  NavigationStateService
} from '../../core/state/navigation-state.service';

import {
  CaracteristicasListaComponent
} from '../../features/factor-estructuras/components/caracteristicas-lista/caracteristicas-lista.component';

import {
  FactorResumenComponent
} from '../../features/factor-estructuras/components/factor-resumen/factor-resumen.component';

import {
  FactorEstructurasFacade
} from '../../features/factor-estructuras/data-access/factor-estructuras.facade';

import {
  LoadingStateComponent
} from '../../shared/loading-state/loading-state.component';

@Component({
    selector: 'app-estructuras',
    imports: [
    MatButtonModule,
    MatIconModule,
    LoadingStateComponent,
    FactorResumenComponent,
    CaracteristicasListaComponent
],
    templateUrl: './estructuras.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './estructuras.component.scss'
})
export class EstructurasComponent
  implements OnInit
{
  readonly factor =
    signal<Factor | null>(null);

  readonly caracteristicas =
    signal<Caracteristica[]>([]);

  readonly loading =
    signal(false);

  readonly error =
    signal('');

  constructor(
    private readonly route:
      ActivatedRoute,

    private readonly router:
      Router,

    private readonly facade:
      FactorEstructurasFacade,

    private readonly state:
      NavigationStateService
  ) {}

  ngOnInit(): void {
    const factorId =
      this.route.snapshot.paramMap.get(
        'factor_id'
      );

    if (!factorId) {
      this.error.set(
        'No se encontró el identificador del factor.'
      );

      return;
    }

    this.loading.set(true);

    this.facade
      .cargarFactor(factorId)
      .subscribe({
        next: ({
          factor,
          caracteristicas
        }) => {
          this.factor.set(factor);

          this.caracteristicas.set(
            caracteristicas
          );

          this.state.setFactor(factor);

          this.loading.set(false);
        },

        error: (error) => {
          console.error(
            'Error cargando factor:',
            error
          );

          this.error.set(
            'No fue posible cargar la información del factor.'
          );

          this.loading.set(false);
        }
      });
  }

  volver(): void {
    void this.router.navigate([
      '/procesos'
    ]);
  }
}
