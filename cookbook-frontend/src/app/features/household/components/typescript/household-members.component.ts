import { ChangeDetectionStrategy, Component, computed, inject, input, output, } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HouseholdService } from '@shared/services/household/household.service';
import { User } from '@shared/domain/user';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { filter, switchMap } from 'rxjs';
import { ConfirmDeleteComponent } from '@shared/components/confirm-delete-component';

@Component({
  selector: 'app-household-members',
  templateUrl: '../html/household-members.component.html',
  styleUrl: '../scss/household-members.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIcon,
    MatIconButton
  ]
})
export class HouseholdMembersComponent {
  private readonly householdService = inject(HouseholdService);
  private readonly dialog = inject(MatDialog);

  readonly householdId = input.required<string>();
  readonly currentUser = input.required<User>();

  readonly closeModal = output();

  readonly householdResource = rxResource({
    params: () => this.householdId(),
    stream: ({ params }) =>
      this.householdService.getHouseholdById(params)
  });

  readonly isCreator = computed(() => {
    const household = this.householdResource.value();

    if (!household) {
      return false;
    }

    return household.creator.userId === this.currentUser().userId;
  });

  removeMember(userId: string): void {
    this.dialog
      .open(ConfirmDeleteComponent, {
        data: {
          message: 'Remove this member from the household?',
        },
      })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap(() =>
          this.householdService.removeMember(
            this.householdId(),
            userId,
          ),
        ),
      )
      .subscribe(() => {
        this.householdResource.reload();
      });
  }

  deleteHousehold(event: MouseEvent): void {
    event.stopPropagation();

    this.dialog
      .open(ConfirmDeleteComponent, {
        data: {
          message: 'Delete this household permanently?',
        },
      })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap(() =>
          this.householdService.deleteHousehold(this.householdId()),
        ),
      )
      .subscribe(() => {
        this.closeModal.emit();
      });
  }
}
