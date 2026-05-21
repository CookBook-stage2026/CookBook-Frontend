import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { WeekScheduleCreateComponent } from './components/typescript/week-schedule-create.component';
import { WeekScheduleViewComponent } from './components/typescript/week-schedule-view.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { DAY_LABELS, DayOfWeek, WeekScheduleResponse } from '@shared/domain/week-schedule';
import { WeekScheduleService } from '@shared/services/week-schedule';
import { ActivatedRoute, Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { RecipeSummary } from '@shared/domain/recipe';
import { ConfirmDeleteComponent } from '@shared/components/confirm-delete-component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ToastService } from '@core/services';

@Component({
  selector: 'app-schedule-page',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    WeekScheduleCreateComponent,
    WeekScheduleViewComponent,
    ToastComponent,
    MatProgressSpinner
  ]
})
export default class SchedulePage {
  private readonly weekScheduleService = inject(WeekScheduleService);
  private readonly toastService = inject(ToastService);
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  readonly dialog = inject(MatDialog);

  readonly isCreateModalOpen = signal(false);
  readonly refreshSignal = signal(0);
  readonly selectedWeekStart = signal<Date>(this.getMonday(new Date()));
  readonly editingSchedule = signal<WeekScheduleResponse | undefined>(undefined);
  readonly modalWeekStart = signal<Date>(this.getMonday(new Date()));
  readonly isSuggestingWeek = signal(false);
  readonly suggestedSchedule = signal<WeekScheduleResponse | undefined>(undefined);

  readonly schedulesResource = rxResource({
    params: () => ({ refresh: this.refreshSignal() }),
    stream: () => this.weekScheduleService.getSchedules()
  });

  readonly existingSchedules = computed(() => this.schedulesResource.value() ?? []);

  readonly weekRangeLabel = computed(() => {
    const start = this.selectedWeekStart();
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${this.formatDate(start)} – ${this.formatDate(end)}`;
  });

  readonly todayIsoDate = computed(() => {
    return this.toLocalDateString(new Date());
  });

  readonly todayDayOfWeek = signal<DayOfWeek>(this.getCurrentDayOfWeek());
  readonly todayWeekStartIso = computed(() => this.toLocalDateString(this.getMonday(new Date())));
  readonly todayLabel = computed(() => DAY_LABELS[this.todayDayOfWeek()]);

  readonly currentWeekSchedule = computed(() => {
    const schedules = this.existingSchedules();
    return schedules.find(s => s.weekStartDate === this.todayWeekStartIso());
  });

  readonly todayDaySchedule = computed(() => {
    const schedule = this.currentWeekSchedule();
    if (!schedule) return undefined;
    return schedule.days.find(d => d.day === this.todayDayOfWeek());
  });

  readonly todayRecipe = computed<RecipeSummary | undefined>(() => {
    return this.todayDaySchedule()?.recipeSummary;
  });

  readonly hasTodayRecipe = computed(() => !!this.todayRecipe());

  constructor() {
    const weekParam = this.route.snapshot.queryParamMap.get('week');
    if (weekParam) {
      this.selectedWeekStart.set(this.getMonday(new Date(weekParam)));
    }
  }

  openCreateModal(): void {
    this.editingSchedule.set(undefined);
    this.modalWeekStart.set(this.selectedWeekStart());
    this.isCreateModalOpen.set(true);
  }

  openEditModal(schedule: WeekScheduleResponse): void {
    this.editingSchedule.set(schedule);
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
    this.editingSchedule.set(undefined);
    this.suggestedSchedule.set(undefined);
  }

  onScheduleCreated(): void {
    this.closeCreateModal();
    this.refreshSignal.update(v => v + 1);
    this.schedulesResource.reload();
  }

  onScheduleDeleted(): void {
    this.refreshSignal.update(v => v + 1);
    this.schedulesResource.reload();
  }

  previousWeek(): void {
    this.selectedWeekStart.update(date => {
      const d = new Date(date);
      d.setDate(d.getDate() - 7);
      this.updateRouteParam(d);
      return d;
    });
  }

  nextWeek(): void {
    this.selectedWeekStart.update(date => {
      const d = new Date(date);
      d.setDate(d.getDate() + 7);
      this.updateRouteParam(d);
      return d;
    });
  }

  startCookingToday(): void {
    const recipe = this.todayRecipe();
    if (!recipe) return;
    this.router.navigate([ '/recipes', recipe.id ], {
      queryParams: { mode: 'cooking' }
    });
  }

  planToday(): void {
    this.modalWeekStart.set(this.getMonday(new Date()));
    this.isCreateModalOpen.set(true);
  }

  onWeekStartDateChanged(date: Date): void {
    this.selectedWeekStart.set(date);

    this.refreshSignal.update(v => v + 1);
    this.schedulesResource.reload();

    this.updateRouteParam(date);
  }

  private getCurrentDayOfWeek(): DayOfWeek {
    const jsDay = new Date().getDay();
    const mapping: Record<number, DayOfWeek> = {
      0: 'SUNDAY',
      1: 'MONDAY',
      2: 'TUESDAY',
      3: 'WEDNESDAY',
      4: 'THURSDAY',
      5: 'FRIDAY',
      6: 'SATURDAY'
    };
    return mapping[jsDay];
  }

  openSuggestWeek(): void {
    const weekStart = this.toLocalDateString(this.selectedWeekStart());
    const weekLabel = this.weekRangeLabel();

    const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      data: {
        message: `Generate a suggested schedule for ${weekLabel}? You can edit it before saving.`
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.isSuggestingWeek.set(true);
      this.weekScheduleService.suggestWeekSchedule(weekStart).subscribe({
        next: (suggested) => {
          this.isSuggestingWeek.set(false);
          this.suggestedSchedule.set(suggested);
          this.modalWeekStart.set(this.selectedWeekStart());
          this.isCreateModalOpen.set(true);
        },
        error: (err) => {
          this.isSuggestingWeek.set(false);
          let message = 'Failed to import recipe.';
          if (err.status === 502 || err.status === 503) {
            message = 'AI processing failed. Please try again later.';
            this.toastService.show(message, 'error');
          }
          this.toastService.show(message, 'error');
        }
      });
    });
  }

  private getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  private toLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private updateRouteParam(date: Date): void {
    this.router.navigate([], {
      queryParams: { week: this.toLocalDateString(date) },
      replaceUrl: true
    });
  }
}
