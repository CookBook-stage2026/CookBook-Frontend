import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { WeekScheduleCreateComponent } from './components/typescript/week-schedule-create.component';
import { WeekScheduleViewComponent } from './components/typescript/week-schedule-view.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { ToastComponent } from '@shared/components/toast/toast.component';

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

  openCreateModal(): void {
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  onScheduleCreated(): void {
    this.closeCreateModal();
    this.refreshSignal.update(v => v + 1);
  }
}
