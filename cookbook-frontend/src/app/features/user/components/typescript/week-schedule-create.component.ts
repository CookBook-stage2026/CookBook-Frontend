import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal, } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { WeekScheduleService } from '@shared/services/week-schedule';
import { RecipeAutocompleteComponent, SKIP_DAY_VALUE } from './recipe-autocomplete.component';
import {
  CreateDayScheduleRequest,
  CreateWeekScheduleRequest,
  DAY_LABELS,
  DayOfWeek,
  DAYS_OF_WEEK,
  UpdateWeekScheduleRequest,
  WeekScheduleResponse,
} from '@shared/domain/week-schedule';
import { MatTooltip } from '@angular/material/tooltip';
import { RecipeSummary } from '@shared/domain/recipe';
import { ToastService } from '@core/services';

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
  readonly suggestedSchedule = input<WeekScheduleResponse | undefined>(undefined);
  readonly weekStartDate = input.required<Date>();
  readonly todayIsoDate = input<string>('');
  readonly scheduleCreated = output<void>();
  readonly closeModal = output<void>();
  readonly weekStartDateChanged = output<Date>();

  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly weekScheduleService = inject(WeekScheduleService);
  private readonly toastService = inject(ToastService);

  readonly daysOfWeek = DAYS_OF_WEEK;
  readonly dayLabels = DAY_LABELS;
  readonly isSubmitting = signal(false);
  readonly isEditMode = signal(false);
  readonly existingSchedules = input<WeekScheduleResponse[]>([]);

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
    // Watch for datepicker changes
    this.form.get('weekStartDate')?.valueChanges.subscribe(date => {
      if (date instanceof Date) {
        this.weekStartDateChanged.emit(date);
      }
    });

    effect(() => {
      const existing = this.existingSchedule();
      const suggested = this.suggestedSchedule();

      if (existing) {
        this.isEditMode.set(true);
        this.patchSchedule(existing);
      } else if (suggested) {
        this.isEditMode.set(false);
        this.patchSchedule(suggested);
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

  private patchSchedule(schedule: WeekScheduleResponse): void {
    this.form.patchValue({
      weekStartDate: new Date(schedule.weekStartDate),
    });

    const skipped = new Set<DayOfWeek>();
    for (const day of this.daysOfWeek) {
      const dayData = schedule.days.find(d => d.day === day);
      if (dayData) {
        this.form.get(day)?.setValue(dayData.recipeSummary, { emitEvent: false });
      } else {
        skipped.add(day);
        this.form.get(day)?.setValue(SKIP_DAY_VALUE, { emitEvent: false });
      }
    }
    this.skippedDays.set(skipped);
  }

  getDailyControl(day: DayOfWeek): FormControl<string | RecipeSummary> {
    return this.form.get(day) as FormControl<string | RecipeSummary>;
  }

  isSkipped(day: DayOfWeek): boolean {
    return this.skippedDays().has(day);
  }

  isToday(day: DayOfWeek): boolean {
    const todayIso = this.todayIsoDate();
    if (!todayIso) return false;

    const formDate = this.form.get('weekStartDate')?.value;
    const start = formDate instanceof Date ? new Date(formDate) : new Date(this.weekStartDate());

    const dayIndex = this.daysOfWeek.indexOf(day);
    start.setDate(start.getDate() + dayIndex);

    const year = start.getFullYear();
    const month = String(start.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(start.getDate()).padStart(2, '0');
    const dayIso = `${year}-${month}-${dayOfMonth}`;

    return dayIso === todayIso;
  }

  myDateFilter = (date: Date | null): boolean => {
    if (!date) return false;
    if (date.getDay() !== 1) return false;

    const dateString = this.formatDateToString(date);

    const existing = this.existingSchedule();
    const suggested = this.suggestedSchedule();
    const currentWeek = existing?.weekStartDate ?? suggested?.weekStartDate;

    if (dateString === currentWeek) return true;

    return !this.existingSchedules().some(s => s.weekStartDate === dateString);
  };

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
          this.toastService.show('Schedule updated successfully.', 'success');
        },
        error: () => {
          this.isSubmitting.set(false);
          this.toastService.show('Failed to update the schedule.', 'error');
        },
      });
    } else {
      const request: CreateWeekScheduleRequest = {
        weekStartDate: this.formatDateToString(formValue.weekStartDate),
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
    if (existing) {
      return existing.days.find(d => d.day === day)?.recipeSummary;
    }
    const suggested = this.suggestedSchedule();
    if (suggested) {
      return suggested.days.find(d => d.day === day)?.recipeSummary;
    }
    return undefined;
  }

  onClose(): void {
    this.closeModal.emit();
  }

  private formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
