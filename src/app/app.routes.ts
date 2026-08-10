import { Routes } from '@angular/router';
import { ProcesosComponent } from './pages/procesos/procesos.component';
import { EstructurasComponent } from './pages/estructuras/estructuras.component';
import { CaracteristicaConsultaComponent } from './pages/caracteristica/caracteristica-consulta.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'procesos' },
  { path: 'procesos', component: ProcesosComponent },

  {
    path: 'procesos/:proceso_id/factores/:factor_id/estructuras',
    component: EstructurasComponent
  },

  {
    path: 'procesos/:proceso_id/factores/:factor_id/caracteristica/:estructura_id',
    component: CaracteristicaConsultaComponent
  },

  { path: 'procesos/:proceso_id/factores', redirectTo: 'procesos', pathMatch: 'full' },
  { path: 'espacios', redirectTo: 'procesos' },
  { path: '**', redirectTo: 'procesos' }
];
