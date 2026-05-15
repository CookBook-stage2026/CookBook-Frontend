import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal, } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HouseholdService } from '@shared/services/household/household.service';
import { CreateHouseholdComponent } from '@features/household/components/typescript/create-household.component';
import { HouseholdCardComponent } from '@features/household/components/typescript/household-card.component';
import { InviteHouseholdComponent } from '@features/household/components/typescript/invite-household.component';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { UserService } from '@shared/services/user';

@Component({
  selector: 'app-households-page',
  templateUrl: './household.page.html',
  styleUrls: ['./household.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    CreateHouseholdComponent,
    HouseholdCardComponent,
    InviteHouseholdComponent,
    ToastComponent,
  ],
})
export default class HouseholdsPageComponent implements OnInit {
  private readonly householdService = inject(HouseholdService);
  private readonly userService = inject(UserService);

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

  readonly isInviteModalOpen = computed(() => !!this.selectedHouseholdId());

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

  openInviteModal(householdId: string): void {
    this.selectedHouseholdId.set(householdId);
  }

  closeInviteModal(): void {
    this.selectedHouseholdId.set(null);
  }
}
