import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HouseholdInviteService } from '@shared/services/household-invite/household-invite.service';
import { AuthService } from '@core/services/auth/auth.service';
import { take } from 'rxjs';

type AcceptState = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-accept-invite-page',
  templateUrl: './accept-invite.page.html',
  styleUrls: ['./accept-invite.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
})
export default class AcceptInvitePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly inviteService = inject(HouseholdInviteService);
  private readonly auth = inject(AuthService);

  readonly state = signal<AcceptState>('idle');

  private get token(): string {
    return this.route.snapshot.paramMap.get('token') ?? '';
  }

  ngOnInit(): void {
    if (!this.token) {
      this.state.set('error');
      return;
    }

    this.auth.isLoggedIn().pipe(take(1)).subscribe((loggedIn) => {
      if (!loggedIn) {
        const returnUrl = `/invite/${this.token}`;
        this.router.navigate(['/login'], { queryParams: { returnUrl } });
      }
    });
  }

  acceptInvite(): void {
    if (!this.token || this.state() === 'loading') return;
    this.state.set('loading');

    this.inviteService.acceptInvite(this.token).subscribe({
      next: () => this.state.set('success'),
      error: () => this.state.set('error'),
    });
  }

  goToHouseholds(): void {
    this.router.navigate(['/households']);
  }
}
