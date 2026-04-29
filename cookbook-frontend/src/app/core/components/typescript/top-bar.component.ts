import { Component, computed, ChangeDetectionStrategy, inject } from '@angular/core';
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

  isDarkMode = computed(() => {
    const theme = this.themeService.currentTheme();
    if (theme === 'system') {
      return globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return theme === 'dark';
  });

  logout(): void {
    localStorage.removeItem('jwt');
    this.router.navigate(['/login']);
  }
}
