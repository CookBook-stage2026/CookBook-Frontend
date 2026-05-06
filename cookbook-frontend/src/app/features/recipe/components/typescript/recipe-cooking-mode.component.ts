import {ChangeDetectionStrategy, Component, computed, input, output, signal} from '@angular/core';
import {RecipeDto} from '@shared/domain/recipe';
import { MatButton, MatIconButton } from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatDivider} from '@angular/material/divider';

@Component({
  selector: 'app-recipe-cooking-mode',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ MatIconButton, MatIcon, MatDivider, MatButton ],
  templateUrl: '../html/recipe-cooking-mode.component.html',
  styleUrls: ['../scss/recipe-cooking-mode.component.scss']
})
export class RecipeCookingModeComponent {
  readonly recipe = input.required<RecipeDto>();
  readonly exit = output<void>();

  readonly currentStepIndex = signal(0);
  readonly isMobileIngredientsOpen = signal(false);

  readonly currentStepText = computed(() => this.recipe().steps[this.currentStepIndex()]);
  readonly totalSteps = computed(() => this.recipe().steps.length);
  readonly progressText = computed(() => `Step ${this.currentStepIndex() + 1} of ${this.totalSteps()}`);

  readonly isFirstStep = computed(() => this.currentStepIndex() === 0);
  readonly isLastStep = computed(() => this.currentStepIndex() === this.totalSteps() - 1);

  nextStep(): void {
    if (this.isLastStep()) {
      this.exit.emit();
    } else {
      this.currentStepIndex.update(i => i + 1);
    }
  }

  prevStep(): void {
    if (!this.isFirstStep()) {
      this.currentStepIndex.update(i => i - 1);
    }
  }

  toggleIngredients(): void {
    this.isMobileIngredientsOpen.update(val => !val);
  }
}
