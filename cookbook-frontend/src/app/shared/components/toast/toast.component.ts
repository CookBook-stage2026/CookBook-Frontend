import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ToastService } from '@core/services';

@Component({
  selector: 'app-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-container" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class]="'toast-' + toast.type" role="alert">
          <span>{{ toast.message }}</span>
          <button (click)="toastService.dismiss(toast.id)" aria-label="Close notification">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container { position: fixed; top: 1rem; right: 1rem; z-index: 50; display: flex; flex-direction: column; gap: 0.5rem; }
    .toast { padding: 1rem; border-radius: var(--radius-md); box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); display: flex; justify-content: space-between; align-items: center; min-width: 250px; background-color: var(--bg-surface); border: 1px solid var(--border-color); color: var(--text-main); }
    .toast-success { border-left: 4px solid #10b981; }
    .toast-error { border-left: 4px solid #ef4444; }
    button { background: none; border: none; font-size: 1.25rem; cursor: pointer; color: var(--text-muted); padding: 0 0.5rem; }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
