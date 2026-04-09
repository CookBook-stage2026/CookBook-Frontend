import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';

@Component({
  selector: 'app-recipe-steps',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: '../html/recipe-steps.component.html',
  styleUrl: '../scss/recipe-create-modal.component.scss'
})
export class RecipeStepsComponent {
  readonly steps = input.required<FormArray<FormControl>>();
  readonly isSubmitting = input.required<boolean>();
  readonly addStep = output<void>();
  readonly removeStep = output<number>();

  add(): void {
    this.addStep.emit();
  }

  remove(index: number): void {
    this.removeStep.emit(index);
  }
}
