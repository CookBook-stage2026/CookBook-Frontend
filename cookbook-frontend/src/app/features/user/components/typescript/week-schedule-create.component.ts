import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  output,
  input,
  effect,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { WeekScheduleService } from '@shared/services/week-schedule';
import {
  RecipeAutocompleteComponent,
  SKIP_DAY_VALUE,
} from './recipe-autocomplete.component';
import {
  CreateDayScheduleRequest,
  CreateWeekScheduleRequest,
  DAY_LABELS,
  DayOfWeek,
  DAYS_OF_WEEK,
  WeekScheduleResponse,
  UpdateWeekScheduleRequest,
} from '@shared/domain/week-schedule';
import { MatTooltip } from '@angular/material/tooltip';
import { RecipeSummary } from '@shared/domain/recipe';

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
    RecipeAutocompleteComponent,
    MatTooltip,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
  ],
})
export class WeekScheduleCreateComponent {
  readonly existingSchedule = input<WeekScheduleResponse | undefined>(undefined);
  readonly weekStartDate = input.required<Date>();
  readonly scheduleCreated = output<void>();
  readonly closeModal = output<void>();

  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly weekScheduleService = inject(WeekScheduleService);

  readonly daysOfWeek = DAYS_OF_WEEK;
  readonly dayLabels = DAY_LABELS;
  readonly isSubmitting = signal(false);
  readonly isEditMode = signal(false);

  readonly skippedDays = signal<ReadonlySet<DayOfWeek>>(new Set());

  readonly dayShortLabels: Record<DayOfWeek, string> = {
    MONDAY: 'MON',
    TUESDAY: 'TUE',
    WEDNESDAY: 'WED',
    THURSDAY: 'THU',
    FRIDAY: 'FRI',
    SATURDAY: 'SAT',
    SUNDAY: 'SUN',
  };

  readonly form = this.fb.group({
    weekStartDate: [new Date(), Validators.required],
    MONDAY: ['' as string | RecipeSummary, Validators.required],
    TUESDAY: ['' as string | RecipeSummary, Validators.required],
    WEDNESDAY: ['' as string | RecipeSummary, Validators.required],
    THURSDAY: ['' as string | RecipeSummary, Validators.required],
    FRIDAY: ['' as string | RecipeSummary, Validators.required],
    SATURDAY: ['' as string | RecipeSummary, Validators.required],
    SUNDAY: ['' as string | RecipeSummary, Validators.required],
  });

  constructor() {
    effect(() => {
      const existing = this.existingSchedule();
      if (existing) {
        this.isEditMode.set(true);
        this.form.patchValue({
          weekStartDate: new Date(existing.weekStartDate),
        });

        const skipped = new Set<DayOfWeek>();
        for (const day of this.daysOfWeek) {
          const dayData = existing.days.find(d => d.day === day);
          if (!dayData) {
            skipped.add(day);
            this.form.get(day)?.setValue(SKIP_DAY_VALUE, { emitEvent: false });
          }
        }
        this.skippedDays.set(skipped);
      } else {
        this.isEditMode.set(false);
        this.form.patchValue({
          weekStartDate: this.weekStartDate(),
        });
        for (const day of this.daysOfWeek) {
          this.form.get(day)?.setValue('', { emitEvent: false });
        }
        this.skippedDays.set(new Set());
      }
    });
  }

  getDailyControl(day: DayOfWeek): FormControl<string | RecipeSummary> {
    return this.form.get(day) as FormControl<string | RecipeSummary>;
  }

  isSkipped(day: DayOfWeek): boolean {
    return this.skippedDays().has(day);
  }

  toggleSkip(day: DayOfWeek): void {
    const control = this.getDailyControl(day);
    const currentlySkipped = this.skippedDays().has(day);

    this.skippedDays.update(prev => {
      const next = new Set(prev);
      if (currentlySkipped) {
        next.delete(day);
        control.setValue('');
      } else {
        next.add(day);
        control.setValue(SKIP_DAY_VALUE);
      }
      return next;
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    const formValue = this.form.getRawValue();

    const days: CreateDayScheduleRequest[] = [];
    for (const day of this.daysOfWeek) {
      const recipeValue = formValue[day];
      if (recipeValue && recipeValue !== SKIP_DAY_VALUE) {
        const recipeId = typeof recipeValue === 'string' ? recipeValue : recipeValue.id;
        days.push({ recipeId, day });
      }
    }

    if (this.isEditMode()) {
      const existing = this.existingSchedule();
      if (!existing) return;

      const request: UpdateWeekScheduleRequest = { days };
      this.weekScheduleService.updateSchedule(existing.id, request).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.scheduleCreated.emit();
          this.closeModal.emit();
        },
        error: () => {
          this.isSubmitting.set(false);
        },
      });
    } else {
      const request: CreateWeekScheduleRequest = {
        weekStartDate: formValue.weekStartDate.toISOString().split('T')[0],
        days,
      };

      this.weekScheduleService.createSchedule(request).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.scheduleCreated.emit();
          this.closeModal.emit();
        },
        error: () => {
          this.isSubmitting.set(false);
        },
      });
    }
  }

  getPreselectedRecipe(day: DayOfWeek): RecipeSummary | undefined {
    const existing = this.existingSchedule();
    if (!existing) return undefined;
    return existing.days.find(d => d.day === day)?.recipeSummary;
  }

  onClose(): void {
    this.closeModal.emit();
  }
}
