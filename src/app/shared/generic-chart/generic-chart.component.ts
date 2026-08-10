import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ObservatoriosReadService } from '../../core/http/observatorios-read.service';

interface ChartPoint { label: string; value: number; width: number; }

@Component({
  selector: 'app-generic-chart',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './generic-chart.component.html',
  styleUrl: './generic-chart.component.scss'
})
export class GenericChartComponent implements OnChanges {
  @Input({ required: true }) dashboardId!: string | number;
  @Input({ required: true }) graficoId!: string | number;
  @Input() tipo = '';
  @Input() titulo = 'Gráfico';

  loading = false;
  error = '';
  raw: Record<string, unknown> | null = null;
  points: ChartPoint[] = [];

  constructor(private readonly service: ObservatoriosReadService) {}

  ngOnChanges(): void {
    if (!this.dashboardId || !this.graficoId) return;
    this.loading = true;
    this.error = '';
    this.service.construirGrafico(this.dashboardId, this.graficoId).subscribe({
      next: (data) => {
        this.raw = data;
        this.points = this.toPoints(data);
        this.loading = false;
      },
      error: () => {
        this.error = 'No fue posible construir la gráfica.';
        this.loading = false;
      }
    });
  }

  private toPoints(payload: Record<string, unknown>): ChartPoint[] {
    const data = payload['data'];
    if (!data || typeof data !== 'object') return [];

    const record = data as Record<string, unknown>;
    const etiquetasString = Array.isArray(record['etiquetas_as_string']) ? record['etiquetas_as_string'] : [];
    const etiquetas = etiquetasString.length > 0 ? etiquetasString : (Array.isArray(record['etiquetas']) ? record['etiquetas'] : []);
    const metrica = Array.isArray(record['metrica']) ? record['metrica'] : [];

    const numericValues = metrica.map((value) => Number(value)).filter((value) => Number.isFinite(value));
    const max = Math.max(...numericValues, 1);

    return numericValues.map((value, index) => ({
      label: String(etiquetas[index] ?? `Dato ${index + 1}`),
      value,
      width: Math.max(3, Math.round((value / max) * 100))
    }));
  }
}
