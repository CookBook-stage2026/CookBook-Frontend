import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal, } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HouseholdInviteService } from '@shared/services/household-invite/household-invite.service';
import { AuthService } from '@core/services/auth/auth.service';
import { rxResource } from '@angular/core/rxjs-interop';

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

  readonly acceptState = signal<AcceptState>('idle');

  private readonly token = signal<string>(
    this.route.snapshot.paramMap.get('token') ?? '',
  );

  private readonly autoAccept = signal<boolean>(
    this.route.snapshot.queryParamMap.get('autoAccept') === 'true',
  );

  readonly inviteResource = rxResource({
    stream: () => this.inviteService.getInvite(this.token()),
  });

  readonly displayState = computed(() => {
    if (this.inviteResource.isLoading()) {
      return 'loading' as const;
    }
    if (this.inviteResource.error() || this.inviteResource.value()?.revoked) {
      return 'error' as const;
    }
    return this.acceptState();
  });

  constructor() {
    effect(() => {
      if (
        !this.autoAccept() ||
        this.inviteResource.isLoading() ||
        this.inviteResource.error() ||
        this.inviteResource.value()?.revoked ||
        this.acceptState() !== 'idle'
      ) {
        return;
      }
      this.performAccept();
    });
  }

  ngOnInit(): void {
    if (!this.token()) {
      this.inviteResource.reload();
    }
  }

  acceptInvite(): void {
    if (!this.token() || this.acceptState() === 'loading') return;

    this.auth.isLoggedIn().pipe().subscribe((loggedIn) => {
      if (!loggedIn) {
        const returnUrl = `/invite/${this.token()}?autoAccept=true`;
        this.router.navigate(['/login'], { queryParams: { returnUrl } });
        return;
      }
      this.performAccept();
    });
  }

  private performAccept(): void {
    this.acceptState.set('loading');
    this.inviteService.acceptInvite(this.token()).subscribe({
      next: () => this.goToHouseholds(),
      error: () => this.acceptState.set('error'),
    });
  }

  goToHouseholds(): void {
    this.router.navigate(['/households']);
  }

  goToRecipes(): void {
    this.router.navigate([ '/recipes' ]);
  }
}
