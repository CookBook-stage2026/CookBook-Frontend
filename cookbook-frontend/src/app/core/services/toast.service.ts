import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

// Service to manage succes and error states across different features
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  readonly toasts = signal<Toast[]>([]);

  show(message: string, type: ToastType): void {
    const id = this.nextId++;
    this.toasts.update(current => [...current, { id, message, type }]);

    setTimeout(() => {
      this.dismiss(id);
    }, 5000);
  }

  dismiss(id: number): void {
    this.toasts.update(current => current.filter(toast => toast.id !== id));
  }
}
