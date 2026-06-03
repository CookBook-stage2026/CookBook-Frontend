import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { filter, switchMap } from 'rxjs';
import { HouseholdService } from '@shared/services/household/household.service';
import { UserService } from '@shared/services/user';
import { ToastService } from '@core/services';
import { HouseholdCardComponent } from '@features/household/components/typescript/household-card.component';
import { HouseholdModalComponent } from '@features/household/components/typescript/household-modal.component';
import { ManageInvitesComponent } from '@features/household/components/typescript/manage-invites.component';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { ConfirmDeleteComponent } from '@shared/components/confirm-delete-component';

@Component({
  selector: 'app-households-page',
  templateUrl: './household.page.html',
  styleUrls: ['./household.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    HouseholdCardComponent,
    HouseholdModalComponent,
    ManageInvitesComponent,
    ToastComponent,
  ],
})
export default class HouseholdsPageComponent implements OnInit {
  private readonly householdService = inject(HouseholdService);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);
  private readonly dialog = inject(MatDialog);

  readonly householdsResource = rxResource({
    stream: () => this.householdService.getHouseholds(),
  });

  readonly currentUser = toSignal(this.userService.getCurrentUser());

  readonly hasHouseholds = computed(
    () => (this.householdsResource.value()?.length ?? 0) > 0,
  );

  readonly isCentered = computed(
    () => !this.hasHouseholds() || this.householdsResource.isLoading(),
  );

  readonly isCreateModalOpen = signal(false);
  readonly selectedHouseholdId = signal<string | null>(null);
  readonly managingInvitesHouseholdId = signal<string | null>(null);

  readonly isManageInvitesModalOpen = computed(() => !!this.managingInvitesHouseholdId());

  ngOnInit(): void {
    if (!this.currentUser()) {
      this.userService.getCurrentUser().subscribe();
    }
  }

  openCreateModal(): void {
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  onHouseholdCreated(): void {
    this.closeCreateModal();
    this.householdsResource.reload();
  }

  openDetailModal(householdId: string): void {
    this.selectedHouseholdId.set(householdId);
  }

  closeDetailModal(): void {
    this.selectedHouseholdId.set(null);
  }

  onHouseholdUpdated(): void {
    this.householdsResource.reload();
  }

  openManageInvitesModal(householdId: string): void {
    this.managingInvitesHouseholdId.set(householdId);
  }

  closeManageInvitesModal(): void {
    this.managingInvitesHouseholdId.set(null);
  }

  onLeaveHousehold(householdId: string): void {
    const userId = this.currentUser()?.userId;
    if (!userId) return;

    this.dialog
      .open(ConfirmDeleteComponent, {
        data: { message: 'Leave this household?' },
      })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap(() => this.householdService.removeMember(householdId, userId)),
      )
      .subscribe({
        next: () => this.householdsResource.reload(),
        error: () => this.toastService.show('Failed to leave household.', 'error'),
      });
  }
}
