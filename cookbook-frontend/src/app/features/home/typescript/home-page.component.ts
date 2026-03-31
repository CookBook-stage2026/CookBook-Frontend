import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: '../html/home-page.component.html',
  styleUrl: '../scss/home-page.component.scss'
})
export default class HomePageComponent {}
