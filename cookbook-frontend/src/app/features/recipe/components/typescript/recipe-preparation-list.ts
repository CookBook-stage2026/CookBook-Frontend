import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatList, MatListItem } from '@angular/material/list';

@Component({
  selector: 'app-recipe-preparation-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatList, MatListItem],
  styles: `
    .step-content {
      display: flex;
      gap: 1rem;
      align-items: baseline;
      white-space: normal;
    }

    .step-number {
      font-weight: bold;
      color: var(--mat-sys-primary);
    }
  `,
  template: `
    <h2>Preparation</h2>
    <mat-list aria-label="Preparation steps">
      @for (step of steps(); track $index) {
        <mat-list-item>
          <div class="step-content">
            <span class="step-number" aria-hidden="true">{{ $index + 1 }}.</span>
            <span>{{ step }}</span>
          </div>
        </mat-list-item>
      }
    </mat-list>
  `
})
export class RecipePreparationComponent {
  steps = input.required<string[]>();
}
