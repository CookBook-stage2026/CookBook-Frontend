import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {AuthService} from '@core/services/auth/auth.service';

@Component({
  selector: 'app-callback',
  template: `
    <div class="callback-wrapper" role="status" aria-live="polite" aria-label="Signing you in, please wait">
      <div class="spinner" aria-hidden="true"></div>
      <p>Signing you in…</p>
    </div>
  `,
  styles: [`
    .callback-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      gap: 16px;
      color: var(--text-muted);
      font-family: 'Inter', system-ui, sans-serif;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid var(--border-color);
      border-top-color: var(--element-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class CallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('code');
    if (!code) {
      this.router.navigate(['/login']);
      return;
    }

    this.auth.handleCallback(code).subscribe({
      next: () => this.router.navigate(['/recipes']),
      error: (err) => {
        console.error('Callback failed: ', err);
        this.router.navigate(['/login']);
      },
    });
  }
}
