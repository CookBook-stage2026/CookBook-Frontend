import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';

@Component({
  selector: 'app-login-page',
  templateUrl: '../../html/auth/login.page.html',
  styleUrl: '../../scss/auth/login.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  loginWith(provider: 'google' | 'github' | 'microsoft'): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/recipes';
    sessionStorage.setItem('loginReturnUrl', returnUrl);
    this.auth.loginWith(provider);
  }
}
