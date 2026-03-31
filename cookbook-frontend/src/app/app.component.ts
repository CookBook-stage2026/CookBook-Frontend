import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
  template: `
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <header class="app-header">
      <div class="header-content">
        <span class="logo" aria-hidden="true">🍳</span>
        <span class="app-title">Cookbook Pro</span>
      </div>
    </header>

    <main id="main-content" tabindex="-1">
      <router-outlet />
    </main>
  `,
  styles: [`
    .skip-link {
      position: absolute;
      top: -40px;
      left: 0;
      background: var(--element-primary);
      color: var(--element-primary-contrast);
      padding: 8px;
      z-index: 100;
      transition: top 0.2s;
    }
    .skip-link:focus {
      top: 0;
    }
    .app-header {
      background-color: var(--bg-surface);
      border-bottom: 1px solid var(--border-color);
      padding: 1rem 2rem;
    }
    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .logo {
      font-size: 1.5rem;
    }
    .app-title {
      font-weight: 700;
      font-size: 1.25rem;
      color: var(--text-main);
    }
    main {
      outline: none;
    }
  `]
})
export class AppComponent {}
