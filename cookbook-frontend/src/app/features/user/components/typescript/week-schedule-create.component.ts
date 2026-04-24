import { Component, ChangeDetectionStrategy, inject, signal, output, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WeekScheduleService } from '@shared/services/week-schedule';
import { RecipeAutocompleteComponent, SKIP_DAY_VALUE } from './recipe-autocomplete.component';
import {
  CreateDayScheduleRequest,
  CreateWeekScheduleRequest, DAY_LABELS,
  DayOfWeek,
  DAYS_OF_WEEK
} from '@shared/domain/week-schedule';

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
  private readonly weekScheduleService = inject(WeekScheduleService);

  readonly daysOfWeek = DAYS_OF_WEEK;
  readonly dayLabels = DAY_LABELS;
  readonly isSubmitting = signal(false);

  readonly firstRowDays = computed(() => this.daysOfWeek.slice(0, 4));
  readonly secondRowDays = computed(() => this.daysOfWeek.slice(4, 7).reverse());

  readonly form = this.fb.group({
    MONDAY: ['', Validators.required],
    TUESDAY: ['', Validators.required],
    WEDNESDAY: ['', Validators.required],
    THURSDAY: ['', Validators.required],
    FRIDAY: ['', Validators.required],
    SATURDAY: ['', Validators.required],
    SUNDAY: ['', Validators.required],
  });

  getDailyControl(day: DayOfWeek): FormControl<string> {
    return this.form.get(day) as FormControl<string>;
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    const formValue = this.form.getRawValue();

    const days: CreateDayScheduleRequest[] = [];
    for (const day of this.daysOfWeek) {
      const recipeId = formValue[day];
      if (recipeId && recipeId !== SKIP_DAY_VALUE) {
        days.push({ recipeId, day });
      }
    }

    const request: CreateWeekScheduleRequest = { days };

    this.weekScheduleService.createSchedule(request).subscribe({
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
