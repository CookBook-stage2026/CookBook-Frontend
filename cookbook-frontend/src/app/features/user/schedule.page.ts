import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { WeekScheduleCreateComponent } from './components/typescript/week-schedule-create.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {ToastComponent} from '@shared/components/toast/toast.component';

@Component({
  selector: 'app-schedule-page',
  template: `
    <app-toast></app-toast>
    <div class="schedule-container">
      <h2>Your Week Schedule</h2>
      <p>This is a placeholder!</p>

      <button mat-flat-button color="primary" (click)="openCreateModal()">
        <mat-icon>add</mat-icon> Create New Schedule
      </button>
    </div>

    @if (isCreateModalOpen()) {
      <app-week-schedule-create
        (closeModal)="closeCreateModal()"
        (scheduleCreated)="onScheduleCreated()"
      />
    }
  `,
  styles: [`
    .schedule-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    h2 { margin-bottom: 1rem; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, WeekScheduleCreateComponent, ToastComponent]
})
export default class SchedulePage {
  readonly isCreateModalOpen = signal(false);

  openCreateModal(): void {
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  onScheduleCreated(): void {
  }
}
