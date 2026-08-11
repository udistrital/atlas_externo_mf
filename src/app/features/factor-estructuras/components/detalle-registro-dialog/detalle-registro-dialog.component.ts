

import {
  Component,
  Inject
} from '@angular/core';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MAT_DIALOG_DATA,
  MatDialogModule
} from '@angular/material/dialog';

import {
  DetalleRegistroDialogData
} from '../../models/estructura-view.models';

@Component({
    selector: 'app-detalle-registro-dialog',
    imports: [
    MatButtonModule,
    MatDialogModule
],
    templateUrl: './detalle-registro-dialog.component.html',
    styleUrl: './detalle-registro-dialog.component.scss'
})
export class DetalleRegistroDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    readonly data:
      DetalleRegistroDialogData
  ) {}

  valor(columna: string): string {
    const value =
      this.data.fila[columna];

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return 'Sin información';
    }

    if (
      typeof value === 'boolean'
    ) {
      return value
        ? 'Sí'
        : 'No';
    }

    return typeof value === 'object'
      ? JSON.stringify(value)
      : String(value);
  }
}
