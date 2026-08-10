import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { forkJoin } from 'rxjs';
import { Factor, Proceso } from '../../core/models/domain.models';
import { ObservatoriosReadService } from '../../core/http/observatorios-read.service';
import { NavigationStateService } from '../../core/state/navigation-state.service';
import { LoadingStateComponent } from '../../shared/loading-state/loading-state.component';

@Component({
  selector: 'app-proceso-factores',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, LoadingStateComponent],
  templateUrl: './proceso-factores.component.html'
})
export class ProcesoFactoresComponent implements OnInit {
  readonly proceso = signal<Proceso | null>(null);
  readonly factores = signal<Factor[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  search = '';

  readonly factoresFiltrados = computed(() => {
    const query = this.search.trim().toLowerCase();
    if (!query) return this.factores();
    return this.factores().filter((factor) => [factor.nombre, factor.descripcion, factor.factor_id, factor.id]
      .some((value) => String(value ?? '').toLowerCase().includes(query)));
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly service: ObservatoriosReadService,
    private readonly state: NavigationStateService
  ) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    const procesoId = this.route.snapshot.paramMap.get('proceso_id');
    if (!procesoId) return;

    this.loading.set(true);
    this.error.set('');
    forkJoin({ proceso: this.service.obtenerProceso(procesoId), factores: this.service.listarFactoresPorProceso(procesoId) }).subscribe({
      next: ({ proceso, factores }) => {
        this.proceso.set(proceso);
        this.state.setProceso(proceso);
        this.factores.set(factores);
        this.loading.set(false);
      },
      error: () => { this.error.set('No fue posible cargar los factores del proceso.'); this.loading.set(false); }
    });
  }

  abrir(factor: Factor): void {
    const procesoId = this.route.snapshot.paramMap.get('proceso_id');
    const factorId = factor.factor_id ?? factor.id;
    if (!procesoId || !factorId) return;
    this.state.setFactor(factor);
    void this.router.navigate(['/procesos', procesoId, 'factores', factorId, 'estructuras']);
  }

  volver(): void { void this.router.navigate(['/procesos']); }
}
