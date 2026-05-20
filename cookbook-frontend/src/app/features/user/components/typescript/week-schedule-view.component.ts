import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { WeekScheduleService } from '@shared/services/week-schedule';
import { DAY_LABELS, DayOfWeek, DAYS_OF_WEEK, WeekScheduleResponse } from '@shared/domain/week-schedule';
import { DatePipe } from '@angular/common';
import { ToastService } from '@core/services';
import { MatDialog } from '@angular/material/dialog';
import { SuggestRecipeConfirmComponent } from '@features/user/components/typescript/suggest-recipe-confirm.component';
import { rxResource } from '@angular/core/rxjs-interop';
import { ConfirmDeleteComponent } from '@shared/components/confirm-delete-component';

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
  private readonly dialog = inject(MatDialog);

  readonly isDeleting = signal(false);
  readonly isSaving = signal(false);
  readonly suggestingDay = signal<string | null>(null);
  readonly isSuggesting = computed(() => this.suggestingDay() !== null);

  readonly daysOfWeek = DAYS_OF_WEEK;
  readonly dayLabels = DAY_LABELS;

  readonly scheduleResource = rxResource({
    params: () => ({
      start: this.formatIso(this.weekStartDate()),
      end: this.formatIso(this.getEndOfWeek(this.weekStartDate())),
      refresh: this.refreshTrigger()
    }),
    stream: ({ params }) => this.scheduleService.getSchedules(params.start, params.end)
  });

  readonly schedule = computed(() => {
    const data = this.scheduleResource.value();
    return data && data.length > 0 ? data[0] : undefined;
  });

  readonly isLoading = this.scheduleResource.isLoading;

  readonly loadError = computed(() => {
    return this.scheduleResource.error() ? 'Could not load your schedule. Please try again.' : null;
  });

  public fetchSchedule(): void {
    this.scheduleResource.reload();
  }

  onEdit(): void {
    const s = this.schedule();
    if (s) {
      this.editSchedule.emit(s);
    }
  }

  getRecipeForDay(day: DayOfWeek) {
    return this.schedule()?.days.find(d => d.day === day)?.recipeSummary;
  }

  getDayIsoDate(day: DayOfWeek): string {
    const start = new Date(this.weekStartDate());
    const dayIndex = DAYS_OF_WEEK.indexOf(day);
    start.setDate(start.getDate() + dayIndex);
    return this.formatIso(start);
  }

  onSuggest(day: DayOfWeek): void {
    const isoDate = this.getDayIsoDate(day);
    this.suggestingDay.set(isoDate);

    this.scheduleService.suggestRecipeForDay(isoDate).subscribe({
      next: (suggestedSchedule) => {
        this.suggestingDay.set(null);

        const suggestedRecipe = suggestedSchedule.days.find(d => d.day === day)?.recipeSummary;
        if (!suggestedRecipe) return;

        const dialogRef = this.dialog.open(SuggestRecipeConfirmComponent, {
          data: {
            recipeName: suggestedRecipe.name,
            day: this.dayLabels[day]
          }
        });

        dialogRef.afterClosed().subscribe((confirmed: boolean) => {
          if (!confirmed) return;

          this.isSaving.set(true);
          this.scheduleService
            .updateSchedule(suggestedSchedule.id, {
              days: suggestedSchedule.days.map(d => ({
                day: d.day,
                recipeId: d.recipeSummary.id
              }))
            })
            .subscribe({
              next: () => {
                this.isSaving.set(false);
                this.scheduleResource.reload();
                this.toastService.show('Recipe saved!', 'success');
              },
              error: () => {
                this.isSaving.set(false);
                this.toastService.show('Failed to save recipe.', 'error');
              }
            });
        });
      },
      error: () => {
        this.suggestingDay.set(null);
        this.toastService.show('Failed to suggest a recipe.', 'error');
      }
    });
  }

  onDelete(): void {
    const s = this.schedule();
    if (!s) return;

    const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      data: { message: 'Are you sure you want to delete this schedule? This cannot be undone.' }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.isDeleting.set(true);
      this.scheduleService.deleteSchedule(s.id).subscribe({
        next: () => {
          this.isDeleting.set(false);
          this.toastService.show('Schedule successfully deleted!', 'success');
          this.scheduleResource.reload();
          this.deleteSchedule.emit();
        },
        error: () => {
          this.isDeleting.set(false);
          this.toastService.show('Failed to delete schedule.', 'error');
        }
      });
    });
  }

  private formatIso(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private getEndOfWeek(start: Date): Date {
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return end;
  }
}
