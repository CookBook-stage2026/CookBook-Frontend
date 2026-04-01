import { Component, ChangeDetectionStrategy, input, output, inject } from '@angular/core';
import { ReactiveFormsModule, FormArray, FormControl, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-recipe-steps',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: '../html/recipe-steps.component.html',
  styleUrl: '../scss/recipe-create-modal.component.scss'
})
export class RecipeStepsComponent {
  private fb = inject(FormBuilder);

  steps = input.required<FormArray<FormControl>>();
  isSubmitting = input.required<boolean>();
  addStep = output<void>();
  removeStep = output<number>();

  add() {
    this.addStep.emit();
  }

  remove(index: number) {
    this.removeStep.emit(index);
  }

  createStepControl() {
    return this.fb.control('', Validators.required);
  }
}
