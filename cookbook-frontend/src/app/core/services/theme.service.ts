import { Injectable, signal, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  readonly currentTheme = signal<Theme>('system');

  constructor() {
    effect(() => {
      const theme = this.currentTheme();
      const htmlEl = this.document.documentElement;

      if (theme === 'system') {
        delete htmlEl.dataset["theme"];
      } else {
        htmlEl.dataset["theme"] = theme;
      }
    });
  }

  toggleTheme(): void {
    this.currentTheme.update(theme => {
      if (theme === 'dark') return 'light';
      if (theme === 'light') return 'dark';

      const prefersDark = this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'light' : 'dark';
    });
  }
}
