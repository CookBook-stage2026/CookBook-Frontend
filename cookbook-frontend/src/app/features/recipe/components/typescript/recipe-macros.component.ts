import { MacroDto } from '@shared/domain/recipe';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { EnumHelper } from '@shared/utils/enum-helper.service';

@Component({
  selector: 'app-recipe-macros',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [],
  template: `
    @if (macros(); as macroList) {
      <div class="macros-section">
        <h3 class="macros-title">Nutritional Information per serving</h3>
        <div class="macros-list">
          @for (macro of macroList; track macro.type) {
            <div class="macro-row">
              <span class="macro-label">{{ enumHelper.formatMacroType(macro.type) }}</span>
              <span class="macro-value">{{ enumHelper.formatMacroValue(macro.value, macro.type) }}</span>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [ `
    .macros-section {
      background-color: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1.25rem;
    }

    .macros-title {
      margin: 0 0 1rem 0;
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .macros-list {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .macro-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.6rem 0;
      border-bottom: 1px solid var(--border-color);

      &:last-child {
        border-bottom: none;
      }
    }

    .macro-label {
      font-weight: 500;
      color: var(--text-main);
      font-size: 0.9rem;
    }

    .macro-value {
      font-weight: 600;
      color: var(--element-primary);
      font-size: 0.9rem;
    }
  ` ]
})
export class RecipeMacrosComponent {
  readonly macros = input.required<MacroDto[]>();
  readonly enumHelper = inject(EnumHelper);
}
