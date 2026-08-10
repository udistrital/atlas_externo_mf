import { Injectable, signal } from '@angular/core';
import { EstructuraEvidencia, Factor, Proceso } from '../models/domain.models';

@Injectable({ providedIn: 'root' })
export class NavigationStateService {
  readonly proceso = signal<Proceso | null>(null);
  readonly factor = signal<Factor | null>(null);
  readonly estructura = signal<EstructuraEvidencia | null>(null);

  setProceso(data: Proceso): void { this.proceso.set(data); }
  setFactor(data: Factor): void { this.factor.set(data); }
  setEstructura(data: EstructuraEvidencia): void { this.estructura.set(data); }
}
