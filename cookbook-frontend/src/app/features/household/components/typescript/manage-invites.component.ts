import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastService } from '@core/services';
import { HouseholdInviteService } from '@shared/services/household-invite';
import { InviteHouseholdComponent } from '@features/household/components/typescript/invite-household.component';

@Component({
  selector: 'app-manage-invites',
  templateUrl: '../html/manage-invites.component.html',
  styleUrls: [ '../scss/manage-invites.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ MatButtonModule, MatIconModule, MatProgressSpinnerModule, DatePipe, InviteHouseholdComponent ],
})
export class ManageInvitesComponent {
  private readonly inviteService = inject(HouseholdInviteService);
  private readonly toastService = inject(ToastService);

  readonly householdId = input.required<string>();

  readonly closeModal = output<void>();

  readonly invitesResource = rxResource({
    stream: () => this.inviteService.getInvitesForHousehold(this.householdId()),
  });

  readonly sortedInvites = computed(() => {
    const invites = this.invitesResource.value();
    if (!invites) return null;
    return [ ...invites ].reverse();
  });

  readonly hasInvites = computed(() => (this.sortedInvites()?.length ?? 0) > 0);

  readonly isCreating = signal(false);
  readonly revokingInviteId = signal<string | null>(null);

  onCreateInvite(): void {
    this.isCreating.set(true);
  }

  onInviteCreated(): void {
    this.invitesResource.reload();
  }

  onInviteClosed(): void {
    this.isCreating.set(false);
  }

  onRevokeInvite(inviteId: string): void {
    if (this.revokingInviteId()) return;

    this.revokingInviteId.set(inviteId);
    this.inviteService.revokeInvite(this.householdId(), inviteId).subscribe({
      next: () => {
        this.revokingInviteId.set(null);
        this.invitesResource.reload();
        this.toastService.show('Invite revoked.', 'success');
      },
      error: () => {
        this.revokingInviteId.set(null);
        this.toastService.show('Failed to revoke invite.', 'error');
      },
    });
  }

  isRevoking(inviteId: string): boolean {
    return this.revokingInviteId() === inviteId;
  }

  onClose(): void {
    this.closeModal.emit();
  }
}
