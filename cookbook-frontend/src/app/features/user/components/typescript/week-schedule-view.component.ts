import { Component, ChangeDetectionStrategy, inject, input, signal, effect, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { WeekScheduleService } from '@shared/services/week-schedule';
import { WeekScheduleResponse, DAYS_OF_WEEK, DAY_LABELS, DayOfWeek } from '@shared/domain/week-schedule';
import { DatePipe } from '@angular/common';
import { ToastService } from '@core/services';

@Component({
  selector: 'app-week-schedule-view',
  templateUrl: '../html/week-schedule-view.component.html',
  styleUrls: ['../scss/week-schedule-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    RouterLink,
    DatePipe
  ]
})
export class WeekScheduleViewComponent {
  readonly weekStartDate = input.required<Date>();
  readonly refreshTrigger = input(0, { transform: (value: number) => value });
  readonly editSchedule = output<WeekScheduleResponse>();
  readonly deleteSchedule = output<void>();

  private readonly toastService = inject(ToastService);
  private readonly scheduleService = inject(WeekScheduleService);

  readonly schedule = signal<WeekScheduleResponse | undefined>(undefined);
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly noSchedule = signal(false);
  readonly isDeleting = signal(false);

  constructor() {
    effect(() => {
      this.weekStartDate();
      this.refreshTrigger();
      this.fetchSchedule();
    });
  }

  public fetchSchedule(): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    this.noSchedule.set(false);

    const start = this.formatIso(this.weekStartDate());
    const end = this.formatIso(this.getEndOfWeek(this.weekStartDate()));

    this.scheduleService.getSchedules(start, end).subscribe({
      next: (data) => {
        this.isLoading.set(false);
        const matchingSchedule = data.length > 0 ? data[0] : undefined;
        if (matchingSchedule === undefined) {
          this.noSchedule.set(true);
          this.schedule.set(undefined);
        } else {
          this.schedule.set(matchingSchedule);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Could not load your schedule. Please try again.');
      }
    });
  }

  onEdit(): void {
    const s = this.schedule();
    if (s) {
      this.editSchedule.emit(s);
    }
  }

  getRecipeForDay(day: DayOfWeek) {
    const s = this.schedule();
    if (!s) return undefined;
    return s.days.find(d => d.day === day)?.recipeSummary;
  }

  onDelete(): void {
    const s = this.schedule();
    if (!s) return;

    this.isDeleting.set(true);

    this.scheduleService.deleteSchedule(s.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.toastService.show("Household successfully deleted!", "success");
        this.schedule.set(undefined);
        this.noSchedule.set(true);
        this.deleteSchedule.emit();
      },
      error: () => {
        this.isDeleting.set(false);
        this.toastService.show('Failed to delete a household.', 'error');
      }
    });
  }

  readonly daysOfWeek = DAYS_OF_WEEK;
  readonly dayLabels = DAY_LABELS;

  private formatIso(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private getEndOfWeek(start: Date): Date {
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return end;
  }
}
