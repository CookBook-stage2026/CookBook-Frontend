import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { WeekScheduleCreateComponent } from './components/typescript/week-schedule-create.component';
import { WeekScheduleViewComponent } from './components/typescript/week-schedule-view.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { WeekScheduleResponse } from '@shared/domain/week-schedule';
import { WeekScheduleService } from '@shared/services/week-schedule';

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
  readonly isCreateModalOpen = signal(false);
  readonly refreshSignal = signal(0);
  readonly selectedWeekStart = signal<Date>(this.getMonday(new Date()));
  readonly editingSchedule = signal<WeekScheduleResponse | undefined>(undefined);
  private readonly weekScheduleService = inject(WeekScheduleService);
  readonly existingSchedules = signal<WeekScheduleResponse[]>([]);

  readonly weekRangeLabel = computed(() => {
    const start = this.selectedWeekStart();
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${this.formatDate(start)} – ${this.formatDate(end)}`;
  });

  constructor() {
    this.loadSchedules();
  }

  private loadSchedules(): void {
    this.weekScheduleService.getSchedules().subscribe(schedules => {
      this.existingSchedules.set(schedules);
    });
  }

  openCreateModal(): void {
    this.editingSchedule.set(undefined);
    this.selectedWeekStart.set(this.findNextAvailableMonday());
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
    this.loadSchedules();
  }

  previousWeek(): void {
    this.selectedWeekStart.update(date => {
      const d = new Date(date);
      d.setDate(d.getDate() - 7);
      return d;
    });
  }

  nextWeek(): void {
    this.selectedWeekStart.update(date => {
      const d = new Date(date);
      d.setDate(d.getDate() + 7);
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

  private findNextAvailableMonday(): Date {
    const today = new Date();
    const nextMonday = this.getMonday(today);
    if (nextMonday <= today) {
      nextMonday.setDate(nextMonday.getDate() + 7);
    }

    const scheduledMondays = new Set(
      this.existingSchedules().map(s => s.weekStartDate)
    );

    while (scheduledMondays.has(this.toLocalDateString(nextMonday))) {
      nextMonday.setDate(nextMonday.getDate() + 7);
    }

    return nextMonday;
  }
}
