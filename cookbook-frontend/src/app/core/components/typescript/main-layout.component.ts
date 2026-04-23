import {Component} from '@angular/core';
import {TopBarComponent} from '@core/components/typescript/top-bar.component';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: '../html/main-layout.component.html',
  imports: [
    TopBarComponent,
    RouterOutlet
  ]
})
export class MainLayoutComponent {}
