import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ThemeService } from '@core/services';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: '../html/top-bar.component.html',
  styleUrl: '../scss/top-bar.component.scss'
})
export class TopBarComponent {
  themeService = inject(ThemeService);
  private readonly router = inject(Router);

  logout(): void {
    localStorage.removeItem('jwt');

    this.router.navigate(['/login']);
  }
}
