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

  loginWith(provider: 'google' | 'github' | 'microsoft'): void {
    this.auth.loginWith(provider);
  }
}
