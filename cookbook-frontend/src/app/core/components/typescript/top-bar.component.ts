import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '@core/services';
import { UserService } from '@shared/services/user';
import { toSignal } from '@angular/core/rxjs-interop';

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
  private readonly userService = inject(UserService);
  readonly currentUser = toSignal(this.userService.getCurrentUser());

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
