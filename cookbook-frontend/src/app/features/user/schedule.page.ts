import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { WeekScheduleCreateComponent } from './components/typescript/week-schedule-create.component';
import { WeekScheduleViewComponent } from './components/typescript/week-schedule-view.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { WeekScheduleResponse } from '@shared/domain/week-schedule';
import { WeekScheduleService } from '@shared/services/week-schedule';
import { ActivatedRoute, Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';

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
  ]
})
export default class SchedulePage {
  private readonly weekScheduleService = inject(WeekScheduleService);
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);

  readonly isCreateModalOpen = signal(false);
  readonly refreshSignal = signal(0);
  readonly selectedWeekStart = signal<Date>(this.getMonday(new Date()));
  readonly editingSchedule = signal<WeekScheduleResponse | undefined>(undefined);
  readonly modalWeekStart = signal<Date>(this.getMonday(new Date()));

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
  }

  onScheduleCreated(): void {
    this.closeCreateModal();
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
