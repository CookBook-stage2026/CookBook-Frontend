import { Component, ChangeDetectionStrategy, inject, signal, output, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastService } from '@core/services';
import { DAYS_OF_WEEK, DAY_LABELS, DayOfWeek, CreateWeekScheduleRequest } from '@shared/domain/user';
import { UserService } from '@shared/services/user';
import {RecipeAutocompleteComponent, SKIP_DAY_VALUE} from './recipe-autocomplete.component';

@Component({
  selector: 'app-week-schedule-create',
  templateUrl: '../html/week-schedule-create.component.html',
  styleUrls: ['../scss/week-schedule-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RecipeAutocompleteComponent
  ],
})
export class WeekScheduleCreateComponent {
  readonly scheduleCreated = output<void>();
  readonly closeModal = output<void>();

  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);

  readonly daysOfWeek = DAYS_OF_WEEK;
  readonly dayLabels = DAY_LABELS;
  readonly isSubmitting = signal(false);

  readonly firstRowDays = computed(() => this.daysOfWeek.slice(0, 4));
  readonly secondRowDays = computed(() => this.daysOfWeek.slice(4, 7).reverse());

  readonly form = this.fb.group({
    dailyRecipeIds: this.fb.group({
      MONDAY: ['', Validators.required],
      TUESDAY: ['', Validators.required],
      WEDNESDAY: ['', Validators.required],
      THURSDAY: ['', Validators.required],
      FRIDAY: ['', Validators.required],
      SATURDAY: ['', Validators.required],
      SUNDAY: ['', Validators.required],
    })
  });

  getDailyControl(day: DayOfWeek): FormControl<string | null> {
    return this.form.get('dailyRecipeIds')?.get(day) as FormControl<string | null>;
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    const formValue = this.form.getRawValue();

    const dailyRecipeIds: Partial<Record<DayOfWeek, string>> = {};
    for (const day of this.daysOfWeek) {
      const recipeId = formValue.dailyRecipeIds[day];
      if (recipeId && recipeId !== SKIP_DAY_VALUE) {
        dailyRecipeIds[day] = recipeId;
      }
    }

    const request: CreateWeekScheduleRequest = { dailyRecipeIds };

    this.userService.createSchedule(request).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.scheduleCreated.emit();
        this.closeModal.emit();
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  onClose(): void {
    this.closeModal.emit();
  }
}
