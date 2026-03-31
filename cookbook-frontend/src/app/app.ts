import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {TopBarComponent} from './core/components/typescript/top-bar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopBarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('cookbook-frontend');
}
