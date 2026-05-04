import { Component, ChangeDetectionStrategy, inject, input, signal, effect } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { RouterLink } from '@angular/router';
import { WeekScheduleService } from '@shared/services/week-schedule';
import { WeekScheduleResponse, DAYS_OF_WEEK, DAY_LABELS, DayOfWeek } from '@shared/domain/week-schedule';

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
    MatChipsModule,
    RouterLink
  ]
})
export class WeekScheduleViewComponent {
  readonly refreshTrigger = input(0, { transform: (value: number) => value });

  private readonly scheduleService = inject(WeekScheduleService);

  readonly schedule = signal<WeekScheduleResponse | undefined>(undefined);
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly noSchedule = signal(false);

  constructor() {
    effect(() => {
      this.refreshTrigger();
      this.fetchSchedule();
    });
  }

  public fetchSchedule(): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    this.noSchedule.set(false);

    this.scheduleService.getSchedule().subscribe({
      next: (data) => {
        this.isLoading.set(false);
        if (data === undefined) {
          this.noSchedule.set(true);
          this.schedule.set(undefined);
        } else {
          this.schedule.set(data);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.loadError.set('Could not load your schedule. Please try again.');
      }
    });
  }

  getRecipeForDay(day: DayOfWeek) {
    const s = this.schedule();
    if (!s) return undefined;
    return s.days.find(d => d.day === day)?.recipeSummary;
  }

  readonly daysOfWeek = DAYS_OF_WEEK;
  readonly dayLabels = DAY_LABELS;
}
