import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { WeekScheduleCreateComponent } from './components/typescript/week-schedule-create.component';
import { WeekScheduleViewComponent } from './components/typescript/week-schedule-view.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { DayOfWeek, ScheduleContext, WeekScheduleResponse } from '@shared/domain/week-schedule';
import { WeekScheduleService } from '@shared/services/week-schedule';
import { ActivatedRoute, Router } from '@angular/router';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RecipeSummary } from '@shared/domain/recipe';
import { ConfirmDeleteComponent } from '@shared/components/confirm-delete-component';
import { ToastService } from '@core/services';
import { HouseholdService } from '@shared/services/household';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

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
    ToastComponent
    ToastComponent,
    MatProgressSpinner
  ]
})
export default class SchedulePage {
  private readonly weekScheduleService = inject(WeekScheduleService);
  private readonly householdService = inject(HouseholdService);
  private readonly toastService = inject(ToastService);
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  readonly dialog = inject(MatDialog);

  readonly isCreateModalOpen = signal(false);
  readonly refreshSignal = signal(0);
  readonly selectedWeekStart = signal<Date>(this.getMonday(new Date()));
  readonly editingSchedule = signal<WeekScheduleResponse | undefined>(undefined);
  readonly modalWeekStart = signal<Date>(this.getMonday(new Date()));
  readonly isSuggestingWeekStart = signal<string | null>(null);
  readonly suggestedSchedule = signal<WeekScheduleResponse | undefined>(undefined);

  readonly contextId = signal<string>('personal');
  readonly selectedContextId = computed(() => this.contextId());
  readonly selectedContext = computed<ScheduleContext>(() => {
    const id = this.contextId();
    if (id === 'personal') {
      return { type: 'personal', label: 'Personal Schedule' };
    }
    const match = this.householdsResource.value()?.find(h => h.id === id);
    return {
      type: 'household',
      householdId: id,
      label: match ? `${match.name}'s Schedule` : 'Household Schedule'
    };
  });

  readonly householdsResource = rxResource({
    stream: () => this.householdService.getHouseholds()
  });

  readonly contexts = computed<ScheduleContext[]>(() => {
    const personal: ScheduleContext = { type: 'personal', label: 'Personal Schedule' };
    const households = this.householdsResource.value() ?? [];
    const householdContexts = households.map(h => ({
      type: 'household' as const,
      householdId: h.id,
      label: `${h.name}'s Schedule`
    }));
    return [personal, ...householdContexts];
  });

  readonly schedulesResource = rxResource({
    params: () => ({
      refresh: this.refreshSignal(),
      context: this.selectedContext()
    }),
    stream: ({ params }) =>
      this.weekScheduleService.getSchedules(params.context)
  });

  readonly existingSchedules = computed(() => this.schedulesResource.value() ?? []);

  readonly nextWeekStart = computed(() => {
    const d = new Date(this.selectedWeekStart());
    d.setDate(d.getDate() + 7);
    return d;
  });

  readonly isShowingCurrentWeekPair = computed(
    () => this.toLocalDateString(this.selectedWeekStart()) === this.toLocalDateString(this.getMonday(new Date()))
  );

  readonly firstWeekLabel = computed(() =>
    this.isShowingCurrentWeekPair()
      ? 'This Week'
      : `Week of ${this.formatDate(this.selectedWeekStart())}`
  );

  readonly secondWeekLabel = computed(() =>
    this.isShowingCurrentWeekPair()
      ? 'Next Week'
      : `Week of ${this.formatDate(this.nextWeekStart())}`
  );

  readonly currentWeekDateRange = computed(() => {
    const start = this.selectedWeekStart();
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${this.formatDate(start)} – ${this.formatDate(end)}`;
  });

  readonly nextWeekDateRange = computed(() => {
    const start = this.nextWeekStart();
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${this.formatDate(start)} – ${this.formatDate(end)}`;
  });

  readonly weekRangeLabel = computed(() => {
    const end = new Date(this.nextWeekStart());
    end.setDate(end.getDate() + 6);
    return `${this.formatDate(this.selectedWeekStart())} – ${this.formatDate(end)}`;
  });

  readonly isSuggestingCurrentWeek = computed(
    () => this.isSuggestingWeekStart() === this.toLocalDateString(this.selectedWeekStart())
  );

  readonly isSuggestingNextWeek = computed(
    () => this.isSuggestingWeekStart() === this.toLocalDateString(this.nextWeekStart())
  );

  readonly isSuggestingAnyWeek = computed(() => this.isSuggestingWeekStart() !== null);

  readonly hasCurrentWeekSchedule = computed(() => {
    const iso = this.toLocalDateString(this.selectedWeekStart());
    return this.existingSchedules().some(s => s.weekStartDate === iso);
  });

  readonly hasNextWeekSchedule = computed(() => {
    const iso = this.toLocalDateString(this.nextWeekStart());
    return this.existingSchedules().some(s => s.weekStartDate === iso);
  });

  readonly todayIsoDate = computed(() => this.toLocalDateString(new Date()));
  readonly todayDayOfWeek = signal<DayOfWeek>(this.getCurrentDayOfWeek());
  readonly todayWeekStartIso = computed(() => this.toLocalDateString(this.getMonday(new Date())));

  readonly currentWeekSchedule = computed(() =>
    this.existingSchedules().find(s => s.weekStartDate === this.todayWeekStartIso())
  );

  readonly todayDaySchedule = computed(() => {
    const schedule = this.currentWeekSchedule();
    return schedule?.days.find(d => d.day === this.todayDayOfWeek());
  });

  readonly todayRecipe = computed<RecipeSummary | undefined>(
    () => this.todayDaySchedule()?.recipeSummary
  );

  readonly hasTodayRecipe = computed(() => !!this.todayRecipe());

  constructor() {
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe(params => {
      const weekParam = params['week'];
      if (weekParam) {
        const parsedDate = new Date(weekParam);
        if (!Number.isNaN(parsedDate.getTime())) {
          this.selectedWeekStart.set(this.getMonday(parsedDate));
        }
      }

      const contextParam = params['context'];
      if (contextParam) {
        this.contextId.set(contextParam);
      }
    });
  }

  onContextChange(value: string): void {
    this.contextId.set(value);
    this.updateRouteParams(this.selectedWeekStart(), value);
  }

  openCreateModal(weekStart?: Date): void {
    this.editingSchedule.set(undefined);
    this.modalWeekStart.set(weekStart ?? this.selectedWeekStart());
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
      d.setDate(d.getDate() - 14);
      this.updateRouteParams(d, this.contextId());
      return d;
    });
  }

  nextWeek(): void {
    this.selectedWeekStart.update(date => {
      const d = new Date(date);
      d.setDate(d.getDate() + 14);
      this.updateRouteParams(d, this.contextId());
      return d;
    });
  }

  goToCurrentWeekPair(): void {
    const today = this.getMonday(new Date());
    this.selectedWeekStart.set(today);
    this.updateRouteParam(today);
  }

  startCookingToday(): void {
    const recipe = this.todayRecipe();
    if (!recipe) return;
    this.router.navigate([ '/recipes', recipe.id ], { queryParams: { mode: 'cooking' } });
  }

  planToday(): void {
    this.modalWeekStart.set(this.getMonday(new Date()));
    this.isCreateModalOpen.set(true);
  }

  onWeekStartDateChanged(_date: Date): void {
    this.refreshSignal.update(v => v + 1);
    this.schedulesResource.reload();
    this.updateRouteParams(date, this.contextId());
  }

  openSuggestWeek(weekStart: Date): void {
    const weekStartIso = this.toLocalDateString(weekStart);
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    const weekLabel = `${this.formatDate(weekStart)} – ${this.formatDate(end)}`;

    const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      data: { message: `Generate a suggested schedule for ${weekLabel}? You can edit it before saving.` }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.isSuggestingWeekStart.set(weekStartIso);
      this.weekScheduleService.suggestWeekSchedule(this.selectedContext(), weekStartIso).subscribe({
        next: (suggested) => {
          this.isSuggestingWeekStart.set(null);
          this.suggestedSchedule.set(suggested);
          this.modalWeekStart.set(weekStart);
          this.isCreateModalOpen.set(true);
        },
        error: (err) => {
          this.isSuggestingWeekStart.set(null);
          let message = 'Failed to generate suggested schedule.';
          if (err.status === 502 || err.status === 503) {
            message = 'AI processing failed. Please try again later.';
          }
          this.toastService.show(message, 'error');
        }
      });
    });
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

  private updateRouteParams(date: Date, contextId: string): void {
    this.router.navigate([], {
      queryParams: {
        week: this.toLocalDateString(date),
        context: contextId
      },
      replaceUrl: true
    });
  }
}
