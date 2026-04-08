import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';

@Component({
  selector: 'app-login-page',
  templateUrl: '../../html/auth/login.page.html',
  styleUrl: '../../scss/auth/login.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginPage {
  private readonly auth = inject(AuthService);

  rememberMe: boolean = false;

  toggleRememberMe(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.rememberMe = checkbox.checked;
  }

  loginWith(provider: 'google' | 'github' | 'microsoft'): void {
    this.auth.loginWith(provider, this.rememberMe);
  }
}
