import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CreateHouseholdComponent } from '@features/household/components/typescript/create-household.component';
import { ToastComponent } from '@shared/components/toast/toast.component';

@Component({
  selector: 'app-households-page',
  templateUrl: './household.page.html',
  styleUrls: ['./household.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatIconModule,
    CreateHouseholdComponent,
    ToastComponent,
  ],
})
export default class HouseholdsPageComponent {
  readonly isCreateModalOpen = signal(false);

  openCreateModal(): void {
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  onHouseholdCreated(): void {
    this.closeCreateModal();
  }
}
