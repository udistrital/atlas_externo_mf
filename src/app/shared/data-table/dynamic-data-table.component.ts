import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dynamic-data-table',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './dynamic-data-table.component.html'
})
export class DynamicDataTableComponent {
  @Input() columns: string[] = [];
  @Input() rows: Record<string, unknown>[] = [];
  @Input() showFileAction = false;
  @Output() openFile = new EventEmitter<Record<string, unknown>>();

  value(row: Record<string, unknown>, column: string): string {
    const value = row[column];
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  trackByColumn(_: number, column: string): string { return column; }
}
