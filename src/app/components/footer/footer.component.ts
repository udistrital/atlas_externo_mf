import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-footer',
    imports: [MatIconModule],
    templateUrl: './footer.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
    basePathAssets = environment.PRUEBAS_ASSETS;
}
