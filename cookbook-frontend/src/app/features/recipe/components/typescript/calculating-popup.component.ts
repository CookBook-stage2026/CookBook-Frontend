import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-calculating-popup',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  template: `
    <div class="popup-overlay" role="dialog" aria-label="Calculating macros" aria-modal="true">
      <div class="popup-content">
        <div class="spinner"></div>
        <h3>Calculating Macros</h3>
        <p>Analyzing your recipe...</p>
      </div>
    </div>
  `,
  styles: [ `
    .popup-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    }

    .popup-content {
      background: var(--bg-surface);
      padding: 2rem;
      border-radius: var(--radius-md);
      text-align: center;
      min-width: 300px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--border-color);
      border-top-color: var(--element-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    h3 {
      margin: 0 0 0.5rem;
      font-size: 1.25rem;
      color: var(--text-main);
    }

    p {
      margin: 0;
      color: var(--text-muted);
    }
  ` ]
})
export class CalculatingPopupComponent {
}
